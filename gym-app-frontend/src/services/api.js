import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// NOT: TypeScript tip tanımları (ApiResponse, LoginRequest, vb.)
// JavaScript dosyasında kaldırılarak sadece işlevsellik bırakılmıştır.

/** Expo/Metro bağlandığı bilgisayarın IP'sini alır (telefon + emülatör için). */
function getDevServerHost() {
  try {
    const hostUri = Constants.expoConfig?.hostUri ?? Constants.manifest2?.extra?.expoGo?.debuggerHost;
    if (hostUri) {
      const uri = hostUri.startsWith('http') || hostUri.startsWith('exp') ? hostUri : `http://${hostUri}`;
      const host = new URL(uri).hostname;
      if (host && host !== 'localhost') return host;
    }
    const debuggerHost = Constants.manifest?.debuggerHost ?? Constants.manifest2?.debuggerHost;
    if (debuggerHost) {
      const host = debuggerHost.split(':')[0];
      if (host && host !== 'localhost') return host;
    }
    return null;
  } catch {
    return null;
  }
}

const FALLBACK_ANDROID = 'http://10.0.2.2:3000/api';
const FALLBACK_LOCALHOST = 'http://localhost:3000/api';

/** Her istekte güncel base URL (telefonda Constants bazen sonra hazır oluyor). */
function getBaseURL() {
  const envUrl = typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl;
  const host = getDevServerHost();
  if (host) return `http://${host}:3000/api`;
  return Platform.select({
    android: FALLBACK_ANDROID,
    ios: FALLBACK_LOCALHOST,
    web: FALLBACK_LOCALHOST,
    default: FALLBACK_LOCALHOST
  }) || FALLBACK_LOCALHOST;
}

class ApiService {
  /** @private @type {import('axios').AxiosInstance} */
  api;

  get baseURL() {
    return getBaseURL();
  }

  constructor() {
    const initialBaseURL = getBaseURL();
    console.log('API Service initialized with baseURL:', initialBaseURL);
    console.log('Platform:', Platform.OS);

    if (Platform.OS !== 'web' && initialBaseURL.includes('localhost') && !getDevServerHost()) {
      console.warn('⚠️  Telefonda backend için: Aynı Wi-Fi, "npx expo start", uygulamayı QR ile aç.');
    }

    this.api = axios.create({
      baseURL: initialBaseURL,
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Axios instance oluşturuldu - Timeout:', this.api.defaults.timeout, 'ms');

    // Request interceptor: her istekte güncel baseURL + auth
    this.api.interceptors.request.use(
      async (config) => {
        config.baseURL = getBaseURL();
        console.log('=== REQUEST INTERCEPTOR ===');
        console.log('Request URL:', config.url);
        console.log('Request method:', config.method);
        console.log('Request baseURL:', config.baseURL);
        console.log('Full URL:', `${config.baseURL}${config.url}`);
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          console.log('Token bulundu, header\'a ekleniyor');
          // Axios 1.x sonrası headers tipi değişimini desteklemek için esnek kullanım
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          console.log('Token bulunamadı');
        }
        console.log('Request config:', config);
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => {
        console.log('=== RESPONSE INTERCEPTOR (SUCCESS) ===');
        console.log('Response status:', response.status);
        console.log('Response data:', response.data);
        return response;
      },
      async (error) => {
        console.error('=== RESPONSE INTERCEPTOR (ERROR) ===');
        console.error('Error status:', error.response?.status);
        console.error('Error data:', error.response?.data);
        console.error('Error message:', error.message);
        if (error.response?.status === 401) {
          // Token expired or invalid, clear storage and redirect to login
          console.warn('401 Unauthorized: Clearing storage.');
          await AsyncStorage.removeItem('authToken');
          await AsyncStorage.removeItem('user');
          // Yönlendirme/Logout aksiyonu burada tetiklenebilir
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints

  /**
   * Kullanıcı girişi yapar ve token/kullanıcı verisini depolar.
   * @param {object} credentials - { email: string, password: string }
   * @returns {Promise<object>} API yanıt verisi
   */
  async login(credentials) {
    try {
      console.log('=== LOGIN API FONKSİYONU BAŞLADI ===');
      console.log('BaseURL:', this.baseURL);
      console.log('Full URL:', `${this.baseURL}/auth/login`);
      console.log('Credentials:', { ...credentials, password: '***' });
      console.log('Axios instance:', this.api);
      console.log('POST çağrısı yapılıyor...');
      
      const response = await this.api.post('/auth/login', credentials);
      
      console.log('=== POST ÇAĞRISI TAMAMLANDI ===');
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      
      const { data } = response;

      if (data.success && data.data) {
        console.log('Token kaydediliyor...');
        // Store token and user data
        await AsyncStorage.setItem('authToken', data.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.data.user));
        console.log('Token ve kullanıcı bilgileri kaydedildi');
      }
      
      return data;
    } catch (error) {
      console.error('=== LOGIN API HATASI ===');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      console.error('Error request:', error.request);
      console.error('Error config:', error.config);
      throw this.handleError(error);
    }
  }

  /**
   * Yeni kullanıcı kaydı yapar.
   * @param {object} userData - Kayıt için kullanıcı verileri
   * @returns {Promise<object>} API yanıt verisi
   */
  async register(userData) {
    try {
      const response = await this.api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Kullanıcı profilini getirir.
   * @returns {Promise<object>} API yanıt verisi
   */
  async getProfile() {
    try {
      const response = await this.api.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Kullanıcıyı uygulamadan çıkarır (Storage temizliği).
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
      console.log('Logout successful, storage cleared.');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // Health check
  /**
   * API servisinin durumunu kontrol eder.
   * @returns {Promise<object>} API yanıt verisi
   */
  async healthCheck() {
    try {
      // Health check endpoint'i /api prefix'i olmadan tanımlı
      const response = await axios.get(this.baseURL.replace('/api', '') + '/health');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handling
  /**
   * @private
   * Axios hatalarını daha okunabilir bir Hata (Error) nesnesine dönüştürür.
   * @param {import('axios').AxiosError} error - Axios hata nesnesi
   * @returns {Error} Özelleştirilmiş Hata nesnesi
   */
  handleError(error) {
    console.log('API Error Details:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      request: error.request,
      config: error.config,
      baseURL: this.baseURL
    });
    
    if (error.response) {
      // Sunucu hatası (4xx, 5xx)
      const message = error.response.data?.error?.message || error.response.data?.message || 'Server error';
      return new Error(`Server Error (${error.response.status}): ${message}`);
    } else if (error.request) {
      // Ağ hatası (Sunucuya ulaşılamadı)
      const url = error.config?.url ? `${this.baseURL}${error.config.url}` : this.baseURL;
      return new Error(`Network Error: Backend'e ulaşılamıyor. URL: ${url}. Backend'in çalıştığından emin olun.`);
    } else {
      // Diğer hatalar
      return new Error(`Error: ${error.message || 'An unexpected error occurred'}`);
    }
  }

  // Get stored user data
  /**
   * Depolanmış kullanıcı verisini getirir.
   * @returns {Promise<object | null>} Kullanıcı nesnesi veya null
   */
  async getStoredUser() {
    try {
      const userString = await AsyncStorage.getItem('user');
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      console.error('Error getting stored user:', error);
      return null;
    }
  }

  // Check if user is authenticated
  /**
   * Kullanıcının kimliği doğrulanmış mı kontrol eder.
   * @returns {Promise<boolean>}
   */
  async isAuthenticated() {
    try {
      const token = await AsyncStorage.getItem('authToken');
      return !!token;
    } catch (error) {
      return false;
    }
  }

  // User details endpoints

  /**
   * Ek kullanıcı detaylarını getirir.
   * @returns {Promise<object>} API yanıt verisi
   */
  async getUserDetails() {
    try {
      const response = await this.api.get('/auth/user-details');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Ek kullanıcı detaylarını günceller.
   * @param {object} details - { height: number, weight: number, injuries: string[] }
   * @returns {Promise<object>} API yanıt verisi
   */
  async updateUserDetails(details) {
    try {
      console.log('API updateUserDetails called with:', details);
      const response = await this.api.put('/auth/user-details', details);
      console.log('API updateUserDetails response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API updateUserDetails error:', error);
      throw this.handleError(error);
    }
  }

  // AI endpoints

  /**
   * AI ile beslenme sorusu sorar.
   * @param {string} question - Kullanıcının sorusu
   * @returns {Promise<object>} AI cevabı
   */
  async askNutritionQuestion(question) {
    try {
      console.log('AI soru gönderiliyor:', question);
      console.log('API BaseURL:', this.baseURL);
      console.log('Full URL:', `${this.baseURL}/ai/nutrition-question`);
      console.log('Timeout ayarı:', this.api.defaults.timeout, 'ms');
      
      // Timeout'u manuel olarak kontrol et ve ayarla
      const config = {
        timeout: 60000 // 60 saniye - AI istekleri için
      };
      
      const response = await this.api.post('/ai/nutrition-question', { question }, config);
      console.log('AI cevap alındı:', response.data);
      return response.data;
    } catch (error) {
      console.error('AI soru hatası detayları:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        request: error.request,
        baseURL: this.baseURL,
        timeout: this.api.defaults.timeout
      });
      throw this.handleError(error);
    }
  }

  /**
   * AI ile kişiselleştirilmiş haftalık beslenme planı oluşturur.
   * @returns {Promise<object>} Haftalık plan: { success, data: { summary: { dailyCalories, protein, carb, fat, recommendations }, week: { Pazartesi: { meals }, ... } } }
   */
  async generateAIPlan() {
    try {
      console.log('AI haftalık plan oluşturuluyor...');
      console.log('Timeout ayarı:', this.api.defaults.timeout, 'ms');
      
      const config = { timeout: 60000 };
      const response = await this.api.post('/ai/nutrition-plan', {}, config);
      console.log('AI haftalık plan alındı:', response.data);
      return response.data;
    } catch (error) {
      console.error('AI plan hatası detayları:', {
        message: error.message,
        code: error.code,
        timeout: this.api.defaults.timeout
      });
      throw this.handleError(error);
    }
  }

  /**
   * Haftalık beslenme planını kaydeder.
   * @param {object} plan - { summary: {...}, week: { Pazartesi: { meals }, ... } }
   * @param {string} [planName] - Plan adı (opsiyonel)
   * @returns {Promise<object>}
   */
  async saveNutritionPlan(plan, planName) {
    try {
      const response = await this.api.post('/ai/nutrition-plans', { plan, planName });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Kullanıcının kayıtlı beslenme planlarını listeler.
   * @param {number} [limit=10]
   * @param {number} [offset=0]
   * @returns {Promise<object>} { success, data: [{ id, planName, planData, createdAt, updatedAt }, ...] }
   */
  async getNutritionPlans(limit = 10, offset = 0) {
    try {
      const response = await this.api.get('/ai/nutrition-plans', { params: { limit, offset } });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * ID ile beslenme planı getirir.
   * @param {number} id - Plan ID
   * @returns {Promise<object>}
   */
  async getNutritionPlanById(id) {
    try {
      const response = await this.api.get(`/ai/nutrition-plans/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Beslenme planını günceller (düzenler).
   * @param {number} id - Plan ID
   * @param {object} plan - { summary, week }
   * @param {string} [planName]
   * @returns {Promise<object>}
   */
  async updateNutritionPlan(id, plan, planName) {
    try {
      const response = await this.api.put(`/ai/nutrition-plans/${id}`, { plan, planName });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Beslenme planını siler.
   * @param {number} id - Plan ID
   * @returns {Promise<object>}
   */
  async deleteNutritionPlan(id) {
    try {
      const response = await this.api.delete(`/ai/nutrition-plans/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * AI ile yemek önerileri alır.
   * @param {string} criteria - Öneri kriterleri
   * @returns {Promise<object>} Yemek önerileri
   */
  async getAIFoodSuggestions(criteria) {
    try {
      const response = await this.api.post('/ai/food-suggestions', { criteria });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * AI ile kişiselleştirilmiş egzersiz programı oluşturur.
   * @param {object} config - { difficulty: string, daysPerWeek: number }
   * @returns {Promise<object>} Egzersiz programı
   */
  async generateAIExerciseProgram(config = {}) {
    try {
      console.log('AI egzersiz programı oluşturuluyor...', config);
      console.log('Timeout ayarı:', this.api.defaults.timeout, 'ms');
      
      const response = await this.api.post('/ai/exercise-program', config, {
        timeout: 60000 // 60 saniye - AI istekleri için
      });
      console.log('AI egzersiz programı alındı:', response.data);
      return response.data;
    } catch (error) {
      console.error('AI egzersiz programı hatası detayları:', {
        message: error.message,
        code: error.code,
        timeout: this.api.defaults.timeout
      });
      throw this.handleError(error);
    }
  }

  /**
   * Egzersiz programını kaydeder.
   * @param {object} program - { weeklySchedule: object, weeklySummary?: string }
   * @param {string} programName - Plan adı
   * @returns {Promise<object>}
   */
  async saveExerciseProgram(program, programName) {
    try {
      const response = await this.api.post('/ai/exercise-programs', { program, programName });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Kayıtlı egzersiz programlarını listeler.
   * @param {number} limit
   * @param {number} offset
   * @returns {Promise<object>}
   */
  async getExercisePrograms(limit = 20, offset = 0) {
    try {
      const response = await this.api.get('/ai/exercise-programs', { params: { limit, offset } });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * ID ile egzersiz programı getirir.
   * @param {number} id
   * @returns {Promise<object>}
   */
  async getExerciseProgramById(id) {
    try {
      const response = await this.api.get(`/ai/exercise-programs/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Egzersiz programını günceller.
   * @param {number} id
   * @param {object} program
   * @param {string} programName
   * @returns {Promise<object>}
   */
  async updateExerciseProgram(id, program, programName) {
    try {
      const response = await this.api.put(`/ai/exercise-programs/${id}`, { program, programName });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Egzersiz programını siler.
   * @param {number} id
   * @returns {Promise<object>}
   */
  async deleteExerciseProgram(id) {
    try {
      const response = await this.api.delete(`/ai/exercise-programs/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

export default new ApiService();