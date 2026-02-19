# KANS - MOPRANG (Monitoring Pengiriman Barang)

<div align="center">

![KANS Logo](media/logo%20KANS.png)

**Sistem Terpadu Monitoring Pengiriman Barang**

Aplikasi web untuk melacak pengiriman barang dari supplier ke klien dengan sistem real-time yang komprehensif.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![Status: Active](https://img.shields.io/badge/Status-Active-brightgreen)

</div>

---

## 📋 Daftar Isi
- [Gambaran Umum](#gambaran-umum)
- [Fitur Utama](#fitur-utama)
- [Teknologi yang Digunakan](#teknologi-yang-digunakan)
- [Instalasi](#instalasi)
- [Konfigurasi](#konfigurasi)
- [Penggunaan](#penggunaan)
- [Struktur Proyek](#struktur-proyek)
- [Dokumentasi](#dokumentasi)
- [Kontribusi](#kontribusi)
- [Lisensi](#lisensi)

---

## 🎯 Gambaran Umum

KANS (MOPRANG) adalah sistem monitoring pengiriman barang terpadu yang memungkinkan pengguna untuk:
- **Memantau pengiriman** secara real-time dari supplier ke klien
- **Mengelola project** dengan berbagai area dan item
- **Melacak progress** pengiriman dengan persentase realisasi
- **Mencari informasi** shipment dengan cepat dan mudah
- **Mengelola profil** pengguna dengan foto profile

Sistem ini dirancang dengan arsitektur client-server yang aman dengan autentikasi berbasis JWT dan dukungan untuk HTTPS.

---

## ✨ Fitur Utama

### 👤 Autentikasi & Keamanan
- ✅ Registrasi dan login dengan email
- ✅ Password reset berbasis email dengan token aman
- ✅ JWT (JSON Web Token) untuk session management
- ✅ Enkripsi password dengan bcryptjs
- ✅ Dukungan Google OAuth 2.0
- ✅ Two-Factor Authentication (2FA/TOTP)
- ✅ Upload dan manajemen foto profil
- ✅ HTTPS support dengan sertifikat SSL/TLS

### 📦 Management Shipment
- ✅ Buat dan kelola project
- ✅ Tambah area per project
- ✅ Kelola item dengan volume dan realisasi pengiriman
- ✅ Tracking progress pengiriman (0-100%)
- ✅ Lihat detail lengkap shipment (vendor, user, project)
- ✅ Filter berdasarkan project dan area

### 🔍 Pencarian & Monitoring
- ✅ Pencarian real-time untuk shipment
- ✅ Dashboard dengan progress visualization
- ✅ History dan status tracking
- ✅ Perhitungan otomatis realisasi pengiriman

### 👨‍💼 User Management
- ✅ Profile pengguna dengan foto
- ✅ Manajemen role dan permission
- ✅ Admin dashboard untuk pengelolaan user
- ✅ Tracking user activity

---

## 🛠️ Teknologi yang Digunakan

### Frontend
- **HTML5** - Struktur halaman
- **CSS3** - Styling responsif dengan yellow theme
- **JavaScript (ES6+)** - Logika aplikasi frontend
- **LocalStorage** - Penyimpanan data di browser

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite3/Better-SQLite3** - Database relasional
- **JWT** - Authentication tokens
- **Bcryptjs** - Password hashing
- **Nodemailer** - Email sending untuk password reset
- **Passport.js** - OAuth support (Google)
- **Speakeasy & QRCode** - 2FA/TOTP implementation
- **Multer** - File upload handling

### Infrastructure
- **HTTPS/SSL** - Secure communication
- **CORS** - Cross-Origin Resource Sharing

---

## 🚀 Instalasi

### Prasyarat
- **Node.js** v14 atau lebih tinggi
- **npm** atau **yarn**
- Browser modern (Chrome, Firefox, Safari, Edge)
- Email account (untuk password reset feature) - opsional

### Step 1: Clone Repository
```bash
git clone https://github.com/yourusername/KANS.git
cd KANS
cd "Web Monitoring"
```

### Step 2: Instalasi Backend
```bash
cd backend
npm install
```

### Step 3: Konfigurasi Backend (Opsional)
Buat file `.env` di folder `backend/` jika diperlukan konfigurasi custom:
```env
PORT=3000
JWT_SECRET=your_secret_key_here
SMTP_SERVICE=gmail
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
USE_HTTPS=true
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Step 4: Mulai Backend Server
```bash
npm start
# atau untuk development dengan auto-reload:
npm run dev
```

Server akan berjalan di `https://localhost:3000` (HTTPS) atau `http://localhost:3000` (HTTP).

### Step 5: Buka Frontend
1. Navigasi ke folder root (Web Monitoring)
2. Buka file `Front.html` di browser
3. Atau host dengan web server (recommended untuk production)

---

## ⚙️ Konfigurasi

### Email untuk Password Reset
Jika menggunakan Gmail:
1. Enable "Less secure app access" atau gunakan **App Password**
2. Dapatkan 16-character App Password dari Google Account
3. Set di environment variable:
   ```
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_16_char_app_password
   ```

### HTTPS/SSL Certificate
Generate sertifikat SSL dengan script yang disediakan:

**Windows:**
```bash
cd backend
./generate-ssl.bat
```

**Linux/Mac:**
```bash
cd backend
bash generate-ssl.sh
```

### Google OAuth Setup
1. Buat project di [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Google OAuth 2.0 API
3. Buat credentials (OAuth 2.0 Client ID)
4. Set `GOOGLE_CLIENT_ID` dan `GOOGLE_CLIENT_SECRET` di `.env`

---

## 📖 Penggunaan

### Untuk End Users

#### 1. Register & Login
- Klik tombol "Daftar" atau gunakan form login di halaman utama
- Masukkan email dan password
- Verifikasi email jika diperlukan
- Login dengan kredensial Anda

#### 2. Kelola Project
- Buka tab "Daftar Project"
- Klik tombol (+) untuk membuat project baru
- Masukkan nama project dan periode
- Project akan muncul di dashboard

#### 3. Tambah Area & Item
- Buka detail project
- Tambah area baru
- Di setiap area, tambahkan item dengan:
  - Nama item
  - Vendor (supplier)
  - Penerima (user)
  - Volume (total unit)
  - Terkirim (unit yang sudah dikirim)

#### 4. Monitor Pengiriman
- Dashboard menampilkan semua project dan progress
- Lihat persentase realisasi pengiriman
- Gunakan pencarian untuk menemukan shipment tertentu
- Filter berdasarkan project atau area

#### 5. Profile & Pengaturan
- Buka Profile dari menu atas
- Edit informasi profil
- Upload foto profil
- Manage password dan security settings

### Untuk Admin

Admin dapat:
- Mengelola semua user di aplikasi
- Menghapus project atau area
- Reset password user
- Lihat activity log lengkap

Untuk login sebagai admin:
- Username: `admin` atau `admin2`
- Gunakan password yang sudah dikonfigurasi

---

## 📁 Struktur Proyek

```
KANS Web Monitoring/
├── Front.html                          # File HTML utama
├── script.js                           # Logika JavaScript utama (740+ lines)
├── styles.css                          # Styling CSS
├── login.html                          # Halaman login
├── area-detail.html                    # Detail area
├── project-detail.html                 # Detail project
├── setup-admin.html                    # Setup admin
├── test-profile-photo.js              # Test profile photo
│
├── backend/
│   ├── server.js                       # Express server utama (772+ lines)
│   ├── package.json                    # Dependencies
│   ├── kans.db                         # SQLite database
│   ├── users.json                      # User data
│   ├── generate-ssl.sh                 # Generate SSL certificate (Linux/Mac)
│   ├── generate-ssl.bat                # Generate SSL certificate (Windows)
│   ├── server.key                      # Private key SSL (generated)
│   ├── server.crt                      # Certificate SSL (generated)
│   └── README.md                       # Backend documentation
│
├── media/
│   ├── logo KANS.png                   # Logo aplikasi
│   └── [profile photos]/               # Folder untuk foto profil user
│
├── README.md                           # File ini
├── START_HERE.md                       # Quick start guide
├── SYSTEM_ARCHITECTURE.md              # Dokumentasi arsitektur
├── DOCUMENTATION_INDEX.md              # Index dokumentasi
└── [documentation files]/              # File-file dokumentasi lainnya
```

### File-File Penting

| File | Deskripsi |
|------|-----------|
| `Front.html` | Entry point frontend - halaman utama aplikasi |
| `script.js` | Semua logika client-side (rendering, event handling) |
| `styles.css` | Styling dengan theme kuning |
| `backend/server.js` | Server Express - API & authentication |
| `backend/package.json` | Dependencies backend |
| `backend/kans.db` | SQLite database (created automatically) |

---

## 📚 Dokumentasi

Dokumentasi lengkap tersedia di folder ini:

- **START_HERE.md** - Quick start guide (baca ini dulu!)
- **SYSTEM_ARCHITECTURE.md** - Arsitektur sistem lengkap
- **DOCUMENTATION_INDEX.md** - Index semua dokumentasi
- **PROFILE_PHOTO_FEATURE.md** - Panduan upload foto profil
- **EMAIL_PASSWORD_RESET_COMPLETE.md** - Setup password reset
- **HTTPS_SETUP_GUIDE.md** - Setup HTTPS/SSL
- **TESTING_CHECKLIST.md** - Testing scenarios
- **QUICK_TEST_EMAIL.md** - Test email functionality
- **DEVELOPER_REFERENCE.md** - Referensi untuk developer
- **backend/README.md** - Backend specific documentation

Baca `START_HERE.md` untuk memulai dalam 30 detik!

---

## 🔑 Key Features Deep Dive

### Data Flow
```
User Input (HTML Form)
    ↓
JavaScript Event Handler (script.js)
    ↓
API Call ke Backend (fetch)
    ↓
Express Server (server.js)
    ↓
Database Query (SQLite)
    ↓
Response JSON
    ↓
Update DOM (JavaScript)
    ↓
Visual Feedback (CSS animations)
```

### Authentication Flow
```
User Register/Login
    ↓
Backend verify credentials
    ↓
Generate JWT token
    ↓
Store token di localStorage
    ↓
All API requests include token di header
    ↓
Backend verify token → Process request
```

---

## 🐛 Troubleshooting

### Server tidak bisa start
- Pastikan port 3000 tidak dipakai aplikasi lain
- Check Node.js installed: `node --version`
- Install dependencies: `npm install`

### HTTPS error
- Generate ulang SSL certificate: `./generate-ssl.bat` (Windows) atau `bash generate-ssl.sh` (Linux/Mac)
- Untuk development, bisa gunakan HTTP: `USE_HTTPS=false npm start`

### Email tidak terkirim
- Check SMTP credentials di `.env`
- Untuk Gmail, pastikan menggunakan "App Password", bukan regular password
- Enable less secure apps di Google Account settings

### Data tidak tersimpan
- Check browser console untuk error messages
- Pastikan backend server berjalan
- Clear browser cache dan reload page

---

## 📈 Development & Contributing

### Setup Development Environment
```bash
# Clone repository
git clone <repository-url>

# Install dependencies
cd backend && npm install

# Install dev dependencies (nodemon untuk auto-reload)
npm install --save-dev nodemon

# Start development server
npm run dev
```

### Code Structure
- Frontend logic di `script.js` (organized by feature)
- Backend routes di `backend/server.js`
- Database models di `backend/kans.db` (SQLite)

### Making Changes
1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and test thoroughly
3. Commit: `git commit -m "Add your feature"`
4. Push: `git push origin feature/your-feature`
5. Create Pull Request

### Testing
1. Test di browser console: `console.log(shipments)` untuk inspect data
2. Check backend logs untuk debug API calls
3. Use `test-profile-photo.js` untuk test foto profil
4. Lihat `TESTING_CHECKLIST.md` untuk full test scenarios

---

## 🔐 Security Best Practices

- ✅ Gunakan HTTPS di production
- ✅ Set `JWT_SECRET` ke value yang strong dan random
- ✅ Jangan commit `.env` file ke repository
- ✅ Regular update dependencies: `npm audit fix`
- ✅ Validate semua user input di backend
- ✅ Use environment variables untuk sensitive data
- ✅ Enable 2FA untuk akun admin

---

## 📊 Performance Tips

- Data disimpan di SQLite untuk persistence
- LocalStorage digunakan untuk caching
- Lazy loading untuk project cards
- Optimized CSS animations
- Minimal dependencies untuk fast load time

---

## 🚢 Deployment

### Untuk Heroku/Cloud Services
1. Pastikan `Procfile` exists: `web: node backend/server.js`
2. Set environment variables di platform settings
3. Commit dan push ke production branch

### Untuk Self-Hosted Server
1. Install Node.js di server
2. Clone repository
3. `npm install` di `/backend`
4. Generate SSL certificates
5. Setup reverse proxy (nginx/Apache)
6. Use PM2 untuk process management: `pm2 start backend/server.js`

---

## 📞 Support & Contact

Jika ada pertanyaan atau issues:
1. Baca dokumentasi di folder ini
2. Check `TESTING_CHECKLIST.md` untuk common issues
3. Create issue di GitHub repository
4. Contact: [Tambahkan contact info Anda]

---

## 📝 Changelog

### Version 1.0.0 (Current)
- ✅ Core shipping monitoring system
- ✅ User authentication with JWT
- ✅ Project & area management
- ✅ Email-based password reset
- ✅ Google OAuth support
- ✅ 2FA/TOTP support
- ✅ Profile photo upload
- ✅ HTTPS/SSL support
- ✅ Comprehensive documentation
- ✅ Responsive UI design

---

## 📜 Lisensi

Project ini dilisensikan di bawah lisensi **MIT** - lihat file [LICENSE](LICENSE) untuk detail lengkap.

---

## 🙏 Acknowledgments

- Logo design dan UI inspiration
- Express.js & Node.js community
- SQLite untuk database solution yang lightweight
- Open source libraries yang digunakan

---

## 🌟 Stars & Support

Jika project ini membantu Anda, jangan lupa untuk:
- ⭐ Star repository ini
- 👁️ Watch untuk update terbaru
- 📢 Share dengan komunitas
- 🤝 Contribute dengan improvements

---

<div align="center">

**Made with ❤️ by KANS Team**

Last Updated: February 2026

</div>
