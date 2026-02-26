const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('⚠️  GEMINI_API_KEY bulunamadı. AI özellikleri çalışmayacak.');
      this.genAI = null;
    } else {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }

    // Test sonucu: v1 API'de çalışan modeller (ListModels ile doğrulandı)
    // Öncelik sırası: Hız (Flash) -> Zeka (Pro)
    this.modelNames = [
      'gemini-2.5-flash',  // En hızlı ve ucuz model (TEST EDİLDİ - ÇALIŞIYOR ✅)
      'gemini-2.5-pro',    // Daha karmaşık işler için
      'gemini-2.0-flash',  // Yedek flash model
      'gemini-2.0-flash-001' // Alternatif
    ];
    
    // Çalışan modeli cache'le (performans için)
    this.cachedWorkingModel = null;
    this.cachedModelName = null;
  }

  /**
   * Yardımcı Metod: JSON stringini temizler
   */
  _cleanJsonString(text) {
    let cleaned = text.trim();
    // Markdown code block'larını temizle (```json ... ```)
    if (cleaned.includes('```')) {
      cleaned = cleaned.replace(/```json/g, '').replace(/```/g, '');
    }
    return cleaned.trim();
  }

  /**
   * Retry mekanizması ile API çağrısı yapar (optimize edilmiş - sadece network/503 hataları için)
   * @param {Function} apiCall - API çağrısı yapan fonksiyon
   * @param {number} maxRetries - Maksimum deneme sayısı (varsayılan: 2 - daha az retry)
   * @param {number} baseDelay - Başlangıç bekleme süresi (ms)
   */
  async _retryWithBackoff(apiCall, maxRetries = 2, baseDelay = 500) {
    let lastError = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await apiCall();
      } catch (error) {
        lastError = error;
        const isRetryable = this._isRetryableError(error);
        
        // Retry edilebilir değilse veya son denemeyse, hemen fırlat
        if (!isRetryable || attempt === maxRetries - 1) {
          throw error;
        }
        
        // Sadece network/503 hataları için kısa bir bekleme (500ms, 1s)
        const delay = baseDelay * Math.pow(2, attempt);
        // Sessiz retry - kullanıcıya gereksiz log gösterme
        await this._sleep(delay);
      }
    }
    
    throw lastError;
  }

  /**
   * Hatanın retry edilebilir olup olmadığını kontrol eder
   */
  _isRetryableError(error) {
    if (!error) return false;
    
    const errorMessage = error.message || '';
    const errorStatus = error.status || error.response?.status;
    
    // 503 (Service Unavailable), 429 (Rate Limit), 500 (Server Error) retry edilebilir
    if (errorStatus === 503 || errorStatus === 429 || errorStatus === 500) {
      return true;
    }
    
    // Timeout ve network hataları retry edilebilir
    if (errorMessage.includes('timeout') || 
        errorMessage.includes('ECONNRESET') || 
        errorMessage.includes('ETIMEDOUT') ||
        errorMessage.includes('overloaded') ||
        errorMessage.includes('network')) {
      return true;
    }
    
    return false;
  }

  /**
   * Bekleme fonksiyonu
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Kullanıcının beslenme sorusuna AI ile cevap verir
   */
  async answerNutritionQuestion(question, userContext = {}) {
    if (!this.genAI) throw new Error('Gemini API key yapılandırılmamış.');

    const systemPrompt = `Sen bir beslenme uzmanı ve fitness koçusun. Türkçe cevap ver.
    Kullanıcı: Cinsiyet: ${userContext.gender || '-'}, Yaş: ${userContext.age ?? '-'}, Hedef: ${userContext.goal || '-'}, Boy: ${userContext.height || '-'} cm, Kilo: ${userContext.weight || '-'} kg, Durum: ${userContext.injuries?.join(', ') || 'Yok'}
    Kurallar: Bilimsel, kişiselleştirilmiş, kısa (max 300 kelime) cevap ver. Cinsiyet ve yaş varsa kalori/makro önerilerinde dikkate al.`;

    // Önce cache'lenmiş çalışan modeli dene
    if (this.cachedWorkingModel && this.cachedModelName) {
      try {
        const result = await this._retryWithBackoff(async () => {
          return await this.cachedWorkingModel.generateContent(`${systemPrompt}\n\nSoru: ${question}`);
        }, 2, 500); // Sadece 2 retry, 500ms delay
        
        return result.response.text();
      } catch (error) {
        // Cache'lenmiş model başarısız oldu, cache'i temizle ve diğer modelleri dene
        console.warn(`⚠️  Cache'lenmiş model (${this.cachedModelName}) başarısız, diğer modeller deneniyor...`);
        this.cachedWorkingModel = null;
        this.cachedModelName = null;
      }
    }

    // Cache yoksa veya başarısız olduysa, modelleri sırayla dene
    let lastError = null;
    for (const modelName of this.modelNames) {
      try {
        const result = await this._retryWithBackoff(async () => {
          const model = this.genAI.getGenerativeModel({ model: modelName });
          return await model.generateContent(`${systemPrompt}\n\nSoru: ${question}`);
        }, 2, 500); // Sadece 2 retry, 500ms delay
        
        // Başarılı modeli cache'le
        this.cachedWorkingModel = this.genAI.getGenerativeModel({ model: modelName });
        this.cachedModelName = modelName;
        console.log(`✅ Model ${modelName} ile yanıt alındı (cache'lendi).`);
        return result.response.text();
      } catch (error) {
        lastError = error;
        // Sadece gerçekten kritik hatalar için log
        if (!this._isRetryableError(error)) {
          console.warn(`⚠️  Model ${modelName} başarısız: ${error.message}`);
        }
        continue;
      }
    }

    this._handleError(lastError);
  }

  /**
   * Kişiselleştirilmiş haftalık beslenme planı oluşturur.
   * Dönen format: { summary: { dailyCalories, protein, carb, fat, recommendations }, week: { Pazartesi: { meals }, ... } }
   */
  async generateNutritionPlan(userContext = {}) {
    if (!this.genAI) throw new Error('Gemini API key yapılandırılmamış.');

    const systemPrompt = `Sen bir diyetisyensin. Aşağıdaki kullanıcı için 7 günlük (haftalık) beslenme planı hazırla.
Kullanıcı bilgileri (cinsiyet, hedef, boy, kilo, sağlık durumu planı kişiselleştirmek için kullanılacak): ${JSON.stringify(userContext)}
Cinsiyet ve yaş varsa kalori ve makro dağılımını buna göre ayarla.

ZORUNLU KURALLAR:
1. Pazartesi, Salı, Çarşamba, Perşembe, Cuma, Cumartesi, Pazar olmak üzere 7 günün HEPSİNİ doldur.
2. HER GÜN için en az 3 öğün yaz: Kahvaltı, Öğle, Akşam. Her öğünde "items" dizisine somut yemek isimleri koy (ör: "Haşlanmış yumurta", "Bulgur pilavı"). Hiçbir günü boş bırakma, hiçbir öğünde items boş array olmasın.
3. Günlük kaloriyi summary.dailyCalories'e göre öğünlere böl (ör. 2200 kcal ise Kahvaltı ~500, Öğle ~700, Akşam ~600 gibi).
4. Çıktı SADECE aşağıdaki JSON olmalı, başka metin veya yorum yazma.

Örnek yapı (her gün böyle DOLU olmalı):
"Pazartesi": {
  "meals": [
    {"title": "Kahvaltı", "items": ["Haşlanmış yumurta 2 adet", "Beyaz peynir", "Domates salatalık", "Tam buğday ekmeği"], "calories": 480},
    {"title": "Öğle", "items": ["Izgara tavuk göğsü 150g", "Bulgur pilavı", "Yeşil salata"], "calories": 620},
    {"title": "Akşam", "items": ["Somon balığı", "Fırın sebze", "Mevsim salata"], "calories": 520}
  ]
}

Salı, Çarşamba, Perşembe, Cuma, Cumartesi, Pazar için de aynı şekilde HER BİRİNE farklı ama gerçek yemeklerle 3 öğün yaz. Öğünler Türkçe olsun, kaloriler summary.dailyCalories ile uyumlu olsun.

Döndürülecek JSON formatı:
{
  "summary": {
    "dailyCalories": (kullanıcı hedefine uygun sayı, örn 2200),
    "protein": "120g",
    "carb": "250g",
    "fat": "65g",
    "recommendations": "Kısa öneri metni."
  },
  "week": {
    "Pazartesi": { "meals": [ {"title": "Kahvaltı", "items": ["..."], "calories": sayı}, {"title": "Öğle", ...}, {"title": "Akşam", ...} ] },
    "Salı": { "meals": [ ... ] },
    "Çarşamba": { "meals": [ ... ] },
    "Perşembe": { "meals": [ ... ] },
    "Cuma": { "meals": [ ... ] },
    "Cumartesi": { "meals": [ ... ] },
    "Pazar": { "meals": [ ... ] }
  }
}`;

    // Önce cache'lenmiş çalışan modeli dene
    if (this.cachedWorkingModel && this.cachedModelName) {
      try {
        const result = await this._retryWithBackoff(async () => {
          return await this.cachedWorkingModel.generateContent(systemPrompt);
        }, 2, 500);
        
        const text = this._cleanJsonString(result.response.text());
        const parsed = JSON.parse(text);
        return this._normalizeWeeklyPlan(parsed);
      } catch (error) {
        // Cache'lenmiş model başarısız oldu, cache'i temizle
        this.cachedWorkingModel = null;
        this.cachedModelName = null;
      }
    }

    let lastError = null;
    for (const modelName of this.modelNames) {
      try {
        const result = await this._retryWithBackoff(async () => {
          const generationConfig = modelName.includes('1.5') ? { responseMimeType: "application/json" } : undefined;
          const model = this.genAI.getGenerativeModel({ 
              model: modelName,
              generationConfig: generationConfig
          });
          return await model.generateContent(systemPrompt);
        }, 2, 500);

        const text = this._cleanJsonString(result.response.text());
        const parsed = JSON.parse(text);
        
        // Başarılı modeli cache'le
        const generationConfig = modelName.includes('1.5') ? { responseMimeType: "application/json" } : undefined;
        this.cachedWorkingModel = this.genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: generationConfig
        });
        this.cachedModelName = modelName;
        console.log(`✅ Model ${modelName} ile haftalık plan oluşturuldu (cache'lendi).`);
        return this._normalizeWeeklyPlan(parsed);
      } catch (error) {
        lastError = error;
        if (!this._isRetryableError(error)) {
          console.warn(`⚠️  Model ${modelName} ile JSON hatası: ${error.message}`);
        }
        continue;
      }
    }

    this._handleError(lastError);
  }

  /**
   * AI yanıtını haftalık plan formatına normalize eder.
   * Eksik veya boş günleri: önce dolu bir günün öğünlerini kopyalar, yoksa boş meals bırakır.
   */
  _normalizeWeeklyPlan(parsed) {
    const dayNames = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
    const summary = parsed.summary || {
      dailyCalories: parsed.dailyCalories || 2000,
      protein: parsed.protein || '100g',
      carb: parsed.carb || '250g',
      fat: parsed.fat || '65g',
      recommendations: parsed.recommendations || ''
    };
    let week = parsed.week || {};

    // Dolu öğünlere sahip ilk günü bul (fallback için)
    let templateDay = null;
    for (const day of dayNames) {
      const meals = week[day]?.meals;
      if (Array.isArray(meals) && meals.length > 0 && meals.some(m => m.items?.length > 0)) {
        templateDay = { meals: meals.map(m => ({ ...m, items: [...(m.items || [])] })) };
        break;
      }
    }

    dayNames.forEach(day => {
      const meals = week[day]?.meals;
      const hasContent = Array.isArray(meals) && meals.length > 0 && meals.some(m => m.items?.length > 0);
      if (!hasContent && templateDay) {
        week[day] = { meals: templateDay.meals.map(m => ({ ...m, items: [...(m.items || [])] })) };
      } else if (!week[day] || !Array.isArray(week[day].meals)) {
        week[day] = { meals: [] };
      }
    });
    return { summary, week };
  }

  /**
   * Yemek önerileri getirir
   */
  async suggestFoods(criteria, userContext = {}) {
    if (!this.genAI) throw new Error('Gemini API key yapılandırılmamış.');

    const systemPrompt = `Kullanıcı için yemek önerisi ver. Kriter: ${criteria}.
    Kullanıcı: Cinsiyet: ${userContext.gender || '-'}, Yaş: ${userContext.age ?? '-'}, Hedef: ${userContext.goal || '-'}, Durum: ${userContext.injuries?.join(', ') || 'Yok'}
    
    SADECE şu JSON formatında cevap ver:
    {
      "foods": [{"name": "Yemek", "calories": 100, "protein": 10, "carb": 5, "fat": 2, "description": "Açıklama"}]
    }`;

    // Önce cache'lenmiş çalışan modeli dene
    if (this.cachedWorkingModel && this.cachedModelName) {
      try {
        const result = await this._retryWithBackoff(async () => {
          return await this.cachedWorkingModel.generateContent(systemPrompt);
        }, 2, 500);
        
        const text = this._cleanJsonString(result.response.text());
        const parsed = JSON.parse(text);
        return parsed.foods || [];
      } catch (error) {
        this.cachedWorkingModel = null;
        this.cachedModelName = null;
      }
    }

    let lastError = null;
    for (const modelName of this.modelNames) {
      try {
        const result = await this._retryWithBackoff(async () => {
          const generationConfig = modelName.includes('1.5') ? { responseMimeType: "application/json" } : undefined;
          const model = this.genAI.getGenerativeModel({ 
              model: modelName,
              generationConfig: generationConfig
          });
          return await model.generateContent(systemPrompt);
        }, 2, 500);

        const text = this._cleanJsonString(result.response.text());
        const parsed = JSON.parse(text);
        
        // Başarılı modeli cache'le
        const generationConfig = modelName.includes('1.5') ? { responseMimeType: "application/json" } : undefined;
        this.cachedWorkingModel = this.genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: generationConfig
        });
        this.cachedModelName = modelName;
        console.log(`✅ Model ${modelName} ile öneri alındı (cache'lendi).`);
        return parsed.foods || [];
      } catch (error) {
        lastError = error;
        if (!this._isRetryableError(error)) {
          console.warn(`⚠️  Model ${modelName} başarısız: ${error.message}`);
        }
        continue;
      }
    }

    this._handleError(lastError);
  }

  /**
   * AI ile kişiselleştirilmiş egzersiz programı oluşturur (profil + anket cevapları)
   */
  async generateExerciseProgram(userContext = {}, programConfig = {}) {
    if (!this.genAI) throw new Error('Gemini API key yapılandırılmamış.');

    const { difficulty = 'beginner', daysPerWeek = 3, survey = {} } = programConfig;
    const { height, weight, age, goal, injuries = [] } = userContext;

    const surveyLines = [
      survey.place ? `Antrenman yeri: ${survey.place}` : null,
      survey.equipment ? `Ekipman: ${survey.equipment}` : null,
      survey.focus ? `Odak hedefi: ${survey.focus}` : null,
      survey.duration ? `Tercih edilen süre: ${survey.duration}` : null,
    ].filter(Boolean);
    const surveyBlock = surveyLines.length > 0
      ? `Anket Cevapları:\n${surveyLines.join('\n')}`
      : 'Anket cevabı yok (varsayılan tercihlerle hazırla).';

    const systemPrompt = `Sen bir fitness antrenörüsün. Aşağıdaki kullanıcı ve anket cevaplarına göre haftalık egzersiz programı hazırla.

Kullanıcı Bilgileri (Profil):
- Cinsiyet: ${userContext.gender || 'Bilinmiyor'}
- Boy: ${height || 'Bilinmiyor'} cm
- Kilo: ${weight || 'Bilinmiyor'} kg
- Yaş: ${age || 'Bilinmiyor'}
- Hedef: ${goal || 'Genel Fitness'}
- Sağlık Durumu: ${injuries.length > 0 ? injuries.join(', ') : 'Yok'}

Seviye: ${difficulty}
Haftalık Antrenman Günü: ${daysPerWeek}

${surveyBlock}

Programı bu bilgileri ve anketi dikkate alarak hazırla. Sakatlık varsa o bölgelere uygun alternatifler ver. Ekipman/yer tercihine göre uygun egzersizleri seç.

Çıktı SADECE şu JSON formatında olmalı, yorum ekleme:
{
  "weeklySchedule": {
    "Pazartesi": [
      {"name": "Egzersiz Adı", "muscle_group": "Göğüs", "sets": 3, "reps": "10-12", "rest_time": 60, "notes": "Açıklama"}
    ],
    "Salı": [],
    "Çarşamba": [],
    "Perşembe": [],
    "Cuma": [],
    "Cumartesi": [],
    "Pazar": []
  },
  "weeklySummary": "Haftalık program özeti ve öneriler"
}

Önemli:
- Sadece ${daysPerWeek} gün doldur, diğerleri boş array olsun
- Egzersiz isimleri Türkçe veya İngilizce olabilir
- muscle_group: Göğüs, Sırt, Bacak, Omuz, Biceps, Triceps, Core, Kalça
- sets: sayı (örn: 3)
- reps: string (örn: "10-12" veya "8-10")
- rest_time: saniye cinsinden (örn: 60)
- notes: egzersiz hakkında kısa açıklama`;

    // Önce cache'lenmiş çalışan modeli dene
    if (this.cachedWorkingModel && this.cachedModelName) {
      try {
        const result = await this._retryWithBackoff(async () => {
          return await this.cachedWorkingModel.generateContent(systemPrompt);
        }, 2, 500);
        
        const text = this._cleanJsonString(result.response.text());
        return JSON.parse(text);
      } catch (error) {
        this.cachedWorkingModel = null;
        this.cachedModelName = null;
      }
    }

    let lastError = null;
    for (const modelName of this.modelNames) {
      try {
        const result = await this._retryWithBackoff(async () => {
          const generationConfig = modelName.includes('1.5') ? { responseMimeType: "application/json" } : undefined;
          const model = this.genAI.getGenerativeModel({ 
              model: modelName,
              generationConfig: generationConfig
          });
          return await model.generateContent(systemPrompt);
        }, 2, 500);

        const text = this._cleanJsonString(result.response.text());
        const parsed = JSON.parse(text);
        
        // Başarılı modeli cache'le
        const generationConfig = modelName.includes('1.5') ? { responseMimeType: "application/json" } : undefined;
        this.cachedWorkingModel = this.genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: generationConfig
        });
        this.cachedModelName = modelName;
        console.log(`✅ Model ${modelName} ile egzersiz programı oluşturuldu (cache'lendi).`);
        return parsed;
      } catch (error) {
        lastError = error;
        if (!this._isRetryableError(error)) {
          console.warn(`⚠️  Model ${modelName} başarısız: ${error.message}`);
        }
        continue;
      }
    }

    this._handleError(lastError);
  }

  /**
   * Video içeriğini analiz eder; egzersiz formu, beslenme vb. hakkında yorum döner.
   * @param {Buffer} videoBuffer - Video dosyası buffer
   * @param {string} mimeType - Örn. 'video/mp4', 'video/quicktime'
   * @param {string} userPrompt - Kullanıcının sorusu veya analiz talebi (örn. "Bu egzersizde formum nasıl?")
   * @returns {Promise<string>} AI yanıt metni
   */
  async analyzeVideo(videoBuffer, mimeType, userPrompt = '') {
    if (!this.genAI) throw new Error('Gemini API key yapılandırılmamış.');
    if (!videoBuffer || videoBuffer.length === 0) throw new Error('Video verisi boş.');

    const prompt = userPrompt && userPrompt.trim()
      ? userPrompt.trim()
      : 'Bu videoyu incele. Egzersiz / antrenman / beslenme veya genel içerik açısından kısa, yapıcı bir yorum ve öneriler yaz. Türkçe cevap ver.';

    const base64Video = videoBuffer.toString('base64');
    const parts = [
      {
        inlineData: {
          mimeType: mimeType || 'video/mp4',
          data: base64Video
        }
      },
      { text: prompt }
    ];

    const modelNamesForVideo = ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash-001'];
    let lastError = null;

    for (const modelName of modelNamesForVideo) {
      try {
        const model = this.genAI.getGenerativeModel({ model: modelName });
        const result = await this._retryWithBackoff(async () => {
          return await model.generateContent(parts);
        }, 2, 500);
        const text = result.response.text();
        if (text) {
          console.log(`✅ Video analizi tamamlandı (${modelName}).`);
          return text;
        }
      } catch (error) {
        lastError = error;
        if (!this._isRetryableError(error)) {
          console.warn(`⚠️ Model ${modelName} video analizinde başarısız: ${error.message}`);
        }
        continue;
      }
    }

    this._handleError(lastError);
  }

  /**
   * Hata yönetimi yardımcısı
   */
  _handleError(error) {
    console.error('Gemini API Kritik Hata:', error);
    
    if (error && (error.status === 429 || error.message?.includes('429'))) {
      throw new Error('Servis şu an çok yoğun, lütfen biraz bekleyip tekrar deneyin (Kota Aşıldı).');
    }
    if (error && (error.status === 503 || error.message?.includes('503') || error.message?.includes('overloaded'))) {
      throw new Error('AI servisi şu an aşırı yüklü. Lütfen birkaç saniye bekleyip tekrar deneyin.');
    }
    if (error && (error.status === 401 || error.status === 403)) {
      throw new Error('API Anahtarı hatası.');
    }
    if (error && (error.message?.includes('timeout') || error.message?.includes('ETIMEDOUT'))) {
      throw new Error('İstek zaman aşımına uğradı. Lütfen tekrar deneyin.');
    }
    if (error && (error.message?.includes('network') || error.message?.includes('ECONNRESET'))) {
      throw new Error('Ağ bağlantı hatası. İnternet bağlantınızı kontrol edin ve tekrar deneyin.');
    }
    throw new Error('AI servisi şu an yanıt veremiyor. Lütfen daha sonra tekrar deneyin.');
  }
}

module.exports = AIService;