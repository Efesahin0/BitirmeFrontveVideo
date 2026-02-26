# 🏋️ Gym App - Full Stack Mobile Application

Modern bir gym yönetim uygulaması. React Native (Expo) frontend, Node.js backend ve PostgreSQL veritabanı ile geliştirilmiştir. Takım çalışması için Git ve Docker Compose ile kolay kurulum sunar.

## 📋 İçindekiler

- [Özellikler](#-özellikler)
- [Teknolojiler](#-teknolojiler)
- [Gereksinimler](#-gereksinimler)
- [Git ile Başlama](#-git-ile-başlama)
- [Docker ile Hızlı Başlangıç](#-docker-ile-hızlı-başlangıç)
- [Frontend (Expo) Geliştirme](#-frontend-expo-geliştirme)
- [Backend (Opsiyonel) Manuel Çalıştırma](#-backend-opsiyonel-manuel-çalıştırma)
- [PgAdmin ve Veritabanı](#-pgadmin-ve-veritabanı)
- [AI Asistan (Google Gemini) Kurulumu](#-ai-asistan-google-gemini-kurulumu)
- [Veritabanı Migration ve Tablo Oluşturma](#-veritabanı-migration-ve-tablo-oluşturma)
- [Proje Yapısı](#-proje-yapısı)
- [Sorun Giderme](#-sorun-giderme)
- [Son Güncellemeler](#-son-güncellemeler-2025-11-07)
- [Katkıda Bulunma](#-katkıda-bulunma)

## ✨ Özellikler

- 🔐 Kullanıcı kaydı ve girişi
- 📱 React Native mobil uygulama
- 🚀 Node.js REST API
- 🗄️ PostgreSQL veritabanı
- 🐳 Docker containerization
- 🔒 JWT token authentication
- 📊 Clean Architecture (DDD)
- 🤖 AI Asistan - Beslenme önerileri ve soru-cevap
- 📅 Antrenman süresi takibi (kayıt tarihinden itibaren)

## 🛠️ Teknolojiler

### Frontend
- **React Native** - Mobil uygulama framework'ü
- **Expo** - Geliştirme ve deployment platformu
- **TypeScript** - Type-safe JavaScript
- **Axios** - HTTP client
- **AsyncStorage** - Local storage

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **PostgreSQL** - İlişkisel veritabanı
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing
- **Swagger** - API dokümantasyonu
- **Google Gemini API** - Yapay zeka entegrasyonu (gemini-2.5-flash, gemini-2.5-pro)

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

## 📋 Gereksinimler

### Sistem Gereksinimleri
- **Node.js** (v18+ önerilir)
- **npm** veya **yarn**
- **Docker Desktop** (Windows/Mac/Linux)
- **Git**

### Mobil Geliştirme
- **Expo CLI** (`npm install -g @expo/cli`)
- **Expo Go** uygulaması (Android/iOS)

## 🔧 Git ile Başlama

Takımınızla çalışmak için bu adımları izleyin (ilk kez kurulum yapan kişi için):

```bash
# 1) Yeni bir GitHub reposu oluşturun (boş, README olmadan)

# 2) Yerelde repo başlatın ve ilk commit'i yapın
git init
git add .
git commit -m "chore: initial project import"

# 3) Uzak repo adresini ekleyin ve gönderin
git remote add origin https://github.com/<org-or-username>/<repo-name>.git
git branch -M main
git push -u origin main

# 4) Takım arkadaşları repo'yu klonlar
git clone https://github.com/<org-or-username>/<repo-name>.git
cd <repo-name>
```

Branch akışı önerisi:
- `main`: kararlı sürüm
- `dev`: entegrasyon
- `feature/*`: özellik geliştirme dalları

### 5. Manuel Kurulum (Docker olmadan)

Eğer Docker kullanmak istemiyorsanız:

#### Backend
```bash
cd gym-app-backend
npm install
npm start
```

#### Frontend
```bash
cd gym-app-frontend/GymApp
npm install
npm start
```

#### Veritabanı
```bash
# PostgreSQL'i manuel olarak kurun ve çalıştırın
# Port: 5432, Database: gym_app_db, User: postgres, Password: postgres
```

## 🐳 Docker ile Hızlı Başlangıç

Proje kök dizininde (bu dosyanın bulunduğu yer):

```bash
# Servisleri arka planda başlatın
docker compose up -d

# (İlk kurulumda image build etmek için)
docker compose up -d --build

# Container durumunu görün
docker compose ps

# Belirli bir servisin loglarını takip edin (örn. backend)
docker compose logs -f backend

# Tüm servisleri durdurun ve kaldırın
docker compose down
```

**Önemli:** İlk kez `docker compose up -d` çalıştırdığınızda, veritabanı migration dosyaları otomatik olarak çalıştırılır ve tüm tablolar oluşturulur. Detaylar için [Veritabanı Migration](#-veritabanı-migration-ve-tablo-oluşturma) bölümüne bakın.

Erişim adresleri:
- **Backend API**: http://localhost:3000
- **PgAdmin**: http://localhost:5050 (kullanıcı: `admin@gymapp.com`, şifre: `admin123`)
- **Frontend (Expo)**: Terminalde çıkan QR kod ile Expo Go'dan açın

## 📱 Kullanım

### Backend API

Backend şu adreslerde çalışır:
- **API Base URL**: `http://localhost:3000/api`
- **Health Check**: `http://localhost:3000/health`
- **Swagger UI**: `http://localhost:3000/api-docs`

## 📱 Frontend (Expo) Geliştirme

```bash
cd gym-app-frontend
npm install
npx expo start
```

API tabanı `gym-app-frontend/src/services/api.ts` içinde ayarlanır. Gerçek cihazda test için bilgisayar IP'nizi kullanın:

```ts
// src/services/api.ts
// Geliştirme için örnek:
const baseURL = "http://YOUR_IP_ADDRESS:3000/api";
```

### API Test

Backend ayakta iken `http://localhost:3000/health` veya mevcut endpointleri kullanarak test edebilirsiniz. (Swagger entegrasyonu eklenirse burada belirtilecektir.)

## 🗄️ PgAdmin ve Veritabanı

PgAdmin ile veritabanını yönetebilirsiniz:
1. `http://localhost:5050` adresini açın
2. Giriş bilgileri: Email: `admin@gymapp.com`, Parola: `admin123`
3. Sol menüden Servers > Register > Server
4. General > Name: `gym-app-db`
5. Connection > Host: `postgres`, Port: `5432`, Username: `postgres`, Password: `postgres`

Not: `Host` alanında `postgres` kullanmamızın sebebi, Docker Compose ağında veritabanı servisi adının `postgres` olmasıdır.

## 🤖 AI Asistan (Google Gemini) Kurulumu

Projede beslenme önerileri ve soru-cevap için Google Gemini API entegrasyonu bulunmaktadır. Gemini API, OpenAI'ye göre daha uygun fiyatlı bir alternatiftir.

### 1. Google Gemini API Key Alma

1. **Google AI Studio hesabı oluşturun:**
   - https://aistudio.google.com/ adresine gidin
   - Google hesabınızla giriş yapın

2. **API Key oluşturun:**
   - Sol menüden "Get API key" veya "API Keys" seçeneğine tıklayın
   - "Create API key" butonuna tıklayın
   - Oluşturulan key'i kopyalayın (bir daha gösterilmeyecek!)

3. **Ücretsiz Kullanım:**
   - **Not:** Gemini API ücretsiz tier sunmaktadır (günlük limitlerle)
   - Ücretsiz kullanım için herhangi bir kredi kartı eklemenize gerek yok
   - Daha fazla kullanım için Google Cloud Console'dan billing ayarlayabilirsiniz

### 2. Proje Kök Dizinde .env Dosyası Oluşturma

**⚠️ ÖNEMLİ:** API key'ler artık kod dosyalarında hardcoded değil, güvenlik için `.env` dosyasında saklanıyor.

Proje kök dizininde (`BitirmeProjesiG-ncel/`) `.env` adında bir dosya oluşturun:

```env
# Google Gemini API Key
GEMINI_API_KEY=your-gemini-api-key-here
```

**Adımlar:**

1. **Proje kök dizininde `.env` dosyası oluşturun:**
   ```bash
   cd BitirmeProjesiG-ncel
   # Windows PowerShell'de:
   New-Item -Path ".env" -ItemType File
   ```

2. **Dosyayı açın ve API key'inizi ekleyin:**
   ```
   GEMINI_API_KEY=AIzaSy... (kendi key'inizi buraya yapıştırın)
   ```

3. **Dosyayı UTF-8 encoding ile kaydedin (BOM olmadan):**
   - VS Code/Cursor'da: Sağ alttaki encoding'i tıklayın → "Save with Encoding" → **"UTF-8"** seçin
   - Notepad'te: "Farklı Kaydet" → Encoding: **"UTF-8"** seçin

**⚠️ ÖNEMLİ GÜVENLİK NOTLARI:**
- `.env` dosyası `.gitignore`'da olduğu için Git'e commit edilmeyecek (güvenli)
- **ASLA** API key'leri kod dosyalarına hardcoded olarak yazmayın
- API key'inizi başkalarıyla paylaşmayın
- Eğer API key'iniz GitHub'a açığa çıkarsa, hemen Google AI Studio'dan revoke edin ve yeni bir key oluşturun

### 3. Docker Container'ları Başlatma

`.env` dosyasını oluşturduktan sonra Docker container'larını başlatın:

```bash
cd BitirmeProjesiG-ncel

# Container'ları başlatın (ilk kez build için)
docker compose up -d --build

# Veya sadece başlatmak için
docker compose up -d
```

**Not:** `docker-compose.yml` dosyası otomatik olarak `.env` dosyasını okur ve `GEMINI_API_KEY` değişkenini container'a aktarır.

### 4. Kullanılan Modeller

Proje, Google Gemini API'nin v1 endpoint'ini kullanır ve şu modelleri sırayla dener:

1. **gemini-2.5-flash** (Öncelikli) - En hızlı ve ucuz model
2. **gemini-2.5-pro** - Daha karmaşık işler için
3. **gemini-2.0-flash** - Yedek flash model
4. **gemini-2.0-flash-001** - Alternatif

Sistem otomatik olarak çalışan ilk modeli kullanır. Eğer bir model başarısız olursa, bir sonrakini dener.

**Önemli:** SDK otomatik olarak v1 API endpoint'ini kullanır. Eski v1beta API kullanılmaz.

### 5. AI Özelliklerini Kullanma

1. **Frontend'de Beslenme sayfasına gidin**
2. **"🤖 AI Asistan" sekmesine tıklayın**
3. **İki özellik kullanılabilir:**
   - **💬 Soru Sor:** Beslenme ile ilgili sorular sorabilirsiniz
   - **📋 Kişiselleştirilmiş Plan:** AI tarafından oluşturulan beslenme planı

### 6. Sorun Giderme

#### "Gemini API key yapılandırılmamış" Hatası

Bu hata, `.env` dosyasında `GEMINI_API_KEY` değerinin bulunamadığını gösterir. Çözüm:

1. **`.env` dosyasının varlığını kontrol edin:**
   ```bash
   cd BitirmeProjesiG-ncel
   # .env dosyasının var olduğundan emin olun
   ```

2. **`.env` dosyasının içeriğini kontrol edin:**
   - Dosyada `GEMINI_API_KEY=your-key-here` satırı olmalı
   - Key değeri boş olmamalı

3. **Dosya encoding'ini kontrol edin:**
   - `.env` dosyası UTF-8 (BOM olmadan) olmalı
   - Windows'ta Notepad ile kaydederseniz UTF-16 olabilir, bu hataya neden olur
   - VS Code/Cursor ile UTF-8 olarak kaydedin

4. **Container'ı yeniden başlatın:**
   ```bash
   docker compose restart backend
   ```

#### "404 Not Found - models/... is not found" Hatası

Bu hata, API key'in geçersiz olduğunu veya model adının yanlış olduğunu gösterir. Çözüm:

1. **API key'inizi kontrol edin:**
   - Google AI Studio'dan yeni bir API key oluşturun
   - `.env` dosyasındaki `GEMINI_API_KEY` değerini güncelleyin
   - Container'ı yeniden başlatın: `docker compose restart backend`

#### "Gemini API kotası aşıldı" Hatası
- Google AI Studio hesabınızda günlük limitinizi kontrol edin
- Ücretsiz tier'da günlük limitler vardır, ertesi gün sıfırlanır
- Daha fazla kullanım için Google Cloud Console'dan billing ayarlayın

#### "Gemini API anahtarı geçersiz" Hatası
- `.env` dosyasındaki `GEMINI_API_KEY` değerini kontrol edin
- API key'in doğru kopyalandığından emin olun (başında/sonunda boşluk olmamalı)
- API key'in Google AI Studio'dan oluşturulduğundan emin olun
- Eğer key revoke edildiyse, yeni bir key oluşturun
- Container'ı yeniden başlatın: `docker compose restart backend`

#### "Cannot find module '@google/generative-ai'" Hatası
- Container'ı yeniden build edin (yukarıdaki adım 4'e bakın)
- `npm install` komutunu backend klasöründe çalıştırın

#### "Tüm modeller başarısız" Hatası
- `.env` dosyasındaki `GEMINI_API_KEY` değerini kontrol edin
- Yeni bir API key oluşturmayı deneyin
- Google AI Studio'da API key'inizin aktif olduğundan emin olun
- Container loglarını kontrol edin: `docker compose logs -f backend`

### 7. AI Özelliklerini Devre Dışı Bırakma

Eğer Gemini API kullanmak istemiyorsanız:
- `.env` dosyasından `GEMINI_API_KEY` satırını kaldırın veya boş bırakın
- Uygulama çalışmaya devam eder, sadece AI özellikleri çalışmaz
- Backend loglarında "⚠️ GEMINI_API_KEY bulunamadı" uyarısı görünecektir

### 8. Firebase API Key (Opsiyonel - Frontend için)

Eğer Firebase kullanıyorsanız, frontend için de environment variable ekleyebilirsiniz:

**Frontend `.env` dosyası oluşturun** (`gym-app-frontend/.env`):
```env
EXPO_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key-here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

**Not:** Firebase API key'leri client-side'da kullanıldığı için public olabilir, ancak yine de environment variable kullanmak best practice'dir.

## 🗃️ Veritabanı Migration ve Tablo Oluşturma

### Otomatik Migration (İlk Kurulum)

Proje `docker-compose up` ile ilk kez çalıştırıldığında, `gym-app-backend/gym-app-database/` klasöründeki tüm SQL dosyaları **otomatik olarak** çalıştırılır ve tablolar oluşturulur.

**Yeni Kullanıcılar için:**
```bash
# İlk kez çalıştırma - Tüm tablolar otomatik oluşturulur!
docker-compose up -d
```

**Önemli Notlar:**
- Migration dosyaları sadece **ilk başlatmada** (veritabanı volume'u boşken) çalışır
- Eğer veritabanı daha önce oluşturulduysa, migration dosyaları tekrar çalışmaz
- Mevcut veritabanını sıfırlamak için (⚠️ TÜM VERİLER SİLİNİR):

```bash
# Veritabanını tamamen sıfırla
docker-compose down -v
docker-compose up -d
```

### Manuel Migration (Gerekirse)

Eğer migration dosyalarını manuel olarak çalıştırmak isterseniz:

```bash
# Docker container içinde SQL dosyasını çalıştır
docker-compose exec postgres psql -U postgres -d gym_app_db -f /docker-entrypoint-initdb.d/06_add_goal_to_user_details.sql

# Veya PgAdmin üzerinden SQL dosyasını açıp çalıştırın
```

### Yeni Migration Ekleme

Yeni bir migration eklemek için:
1. `gym-app-backend/gym-app-database/` klasörüne yeni bir SQL dosyası ekleyin
2. Dosya adını numara ile başlatın (örn: `07_add_new_column.sql`)
3. Dosyalar alfabetik sırayla çalıştırılır, numaralandırma önemlidir
4. Git'e commit ve push yapın
5. Takım arkadaşları `docker-compose down -v && docker-compose up -d` ile güncellemeleri alabilir

## 🔐 Örnek Auth İstekleri

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

## 🏗️ Proje Yapısı

```
gymAp/
├── gym-app-backend/           # Backend API
│   ├── src/
│   │   ├── application/       # Use cases & DTOs
│   │   ├── domain/            # Entities & Repositories
│   │   ├── infrastructure/    # Database & External services
│   │   └── presentation/      # Controllers & Routes
│   ├── gym-app-database/      # SQL init ve migration dosyaları
│   ├── docker-compose.yml     # Backend tarafı compose (opsiyonel)
│   └── package.json
├── gym-app-frontend/          # Mobile App (Expo)
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── services/
│   │   └── types/
│   ├── app.json
│   └── package.json
├── docker-compose.yml         # Kökten tüm servisleri başlatır
└── README.md
```

## 🔧 Sorun Giderme

### Backend Sorunları

#### Veritabanı Bağlantı Hatası
```bash
# Docker container'ları kontrol edin
docker compose ps

# Veritabanını yeniden başlatın
docker compose down
docker compose up -d
```

#### Port Zaten Kullanımda
```bash
# 3000 portunu kullanan process'i bulun
netstat -ano | findstr :3000

# Process'i sonlandırın
taskkill /PID <process_id> /F
```

### Frontend Sorunları

#### Metro Bundler Hatası
```bash
# Cache'i temizleyin
npx expo start --clear

# node_modules'ı yeniden yükleyin
rm -rf node_modules
npm install
```

#### Network Bağlantı Hatası
- Backend'in çalıştığından emin olun
- API URL'inin doğru olduğunu kontrol edin
- Firewall ayarlarını kontrol edin

### Docker Sorunları

#### Docker Desktop Çalışmıyor
- Docker Desktop'ı yeniden başlatın
- Windows'ta WSL2'nin etkin olduğundan emin olun

#### Container Başlamıyor
```bash
# Log'ları kontrol edin
docker compose logs

# Container'ları yeniden oluşturun
docker compose up --build -d
```

## 🌐 Network Konfigürasyonu

### Gerçek Cihaz İçin

1. **Bilgisayarınızın IP adresini öğrenin:**
```bash
ipconfig
```

2. **API URL'ini güncelleyin:**
```typescript
// src/services/api.ts
const baseURL = 'http://YOUR_IP:3000/api';
```

3. **Cihaz ve bilgisayarın aynı Wi-Fi ağında olduğundan emin olun**

### Emülatör İçin

```typescript
// Android Emulator için
const baseURL = 'http://10.0.2.2:3000/api';
```

## 🚀 Production Deployment

### Backend Deployment (Özet)

1. Environment değişkenlerini ayarlayın (DB bilgileri ve JWT)
2. Docker image oluşturun ve bir registry'e push edip orkestrasyon ortamında çalıştırın.

### Frontend Deployment (Özet)

1. Expo EAS ile build alın (`eas build -p android/ios`)
2. Mağazalara yükleyin veya dağıtın

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

- **Geliştirici**: Takımınız
- **Email**: 
- **GitHub**: 

---

## 📝 Son Güncellemeler

### 🆕 2025-11-25 - Gemini API Güncellemeleri

#### ✨ Yeni Özellikler

1. **🔒 Güvenlik İyileştirmeleri**
   - API key'ler artık kod dosyalarında hardcoded değil
   - Tüm API key'ler `.env` dosyasına taşındı
   - `.env` dosyası `.gitignore`'da (Git'e commit edilmiyor)
   - GitHub secret scanning uyarıları önlendi

2. **🔄 Model Fallback Mekanizması**
   - Birden fazla model sırayla denenir
   - İlk çalışan model otomatik kullanılır
   - Hata durumunda bir sonraki modele geçer
   - Tüm modeller başarısız olursa detaylı hata mesajı verir

3. **📊 Güncel Model Desteği**
   - `gemini-2.5-flash` (öncelikli, test edildi ✅)
   - `gemini-2.5-pro` (karmaşık işler için)
   - `gemini-2.0-flash` (yedek)
   - `gemini-2.0-flash-001` (alternatif)

#### 🔧 Teknik İyileştirmeler

- **API Versiyonu Sorunu Çözüldü:**
  - SDK artık v1 API endpoint'ini kullanıyor
  - v1beta API sorunları giderildi
  - ListModels API ile mevcut modeller kontrol ediliyor

- **Hata Yönetimi:**
  - Model bazlı hata yakalama eklendi
  - Her model denemesi loglanıyor
  - Başarılı model loglanıyor
  - Detaylı hata mesajları eklendi

- **Kod İyileştirmeleri:**
  - `AIService.js` refactor edildi
  - JSON temizleme yardımcı fonksiyonu eklendi
  - Hata yönetimi merkezileştirildi
  - Kod tekrarı azaltıldı

### 📅 2025-11-07 - İlk Gemini Entegrasyonu

#### ✨ Yeni Özellikler

1. **🤖 AI Asistan Entegrasyonu**
   - Beslenme sayfasına AI Asistan sekmesi eklendi
   - Kullanıcılar beslenme ile ilgili sorular sorabilir
   - AI tarafından kişiselleştirilmiş beslenme planları oluşturulabilir
   - Google Gemini API kullanılıyor (ücretsiz ve uygun fiyatlı)
   - Kullanıcı bilgilerine göre (hedef, boy, kilo, sağlık durumu) özelleştirilmiş öneriler

2. **📅 Antrenman Süresi Takibi**
   - Profil sayfasında kullanıcının kayıt tarihinden itibaren geçen gün sayısı gösteriliyor
   - "X gündür gym app ile antrenman yapıyorsunuz 💪" formatında mesaj
   - Otomatik hesaplama yapılıyor

#### 🔧 Teknik Değişiklikler

- **Backend:**
  - Google Gemini API paketi eklendi (`@google/generative-ai@^0.24.1`)
  - AI servisi oluşturuldu (`AIService.js`)
  - AI controller ve route'ları eklendi
  - Hata yönetimi iyileştirildi (quota, API key hataları için özel mesajlar)
  - OpenAI'den Gemini API'ye geçiş yapıldı (daha uygun fiyatlı alternatif)

- **Frontend:**
  - DietPage'e AI Asistan sekmesi eklendi
  - API servisine AI endpoint'leri eklendi
  - ProfilePage'de antrenman süresi hesaplama fonksiyonu eklendi

- **Docker:**
  - Backend servisi docker-compose.yml'e eklendi
  - `.env` dosyası volume olarak mount edildi

#### 📚 Dokümantasyon

- Google Gemini API kurulum ve kullanım kılavuzu eklendi
- Hata mesajları Türkçe'ye çevrildi
- Swagger UI'da authentication desteği eklendi
- API key test etme bölümü eklendi
- Sorun giderme bölümü genişletildi

## 🎯 Gelecek Özellikler

- [ ] Gym salonu yönetimi
- [ ] Antrenman takibi
- [ ] Üyelik yönetimi
- [ ] Push notifications
- [ ] Offline mode
- [ ] Social features
- [ ] AI ile antrenman programı önerileri
- [ ] AI ile ilerleme analizi

---

**Not**: Bu proje eğitim amaçlı geliştirilmiştir. Production kullanımı için ek güvenlik önlemleri alınması önerilir.