# Fitur Upload Foto Profil - KANS

## 📋 Deskripsi
Fitur ini memungkinkan pengguna untuk mengunggah dan menyimpan foto profil mereka pada halaman Profile. Foto disimpan di server backend dengan enkripsi nama file berdasarkan username dan timestamp.

## ✨ Fitur yang Ditambahkan

### Backend (server.js)
1. **Multer Integration**
   - Upload file dengan validasi ukuran (max 5MB)
   - Validasi tipe file (JPEG, PNG, GIF, WebP)
   - Penyimpanan file di folder `backend/uploads/profiles/`

2. **Database Update**
   - Kolom baru `profile_photo` di tabel `users`
   - Menyimpan path foto relatif ke public folder

3. **API Endpoints**
   - `GET /api/profile` - Ambil profil user termasuk foto
   - `POST /api/profile/photo` - Upload foto profil
   - `GET /uploads/profiles/*` - Serve file foto (static)

### Frontend (Front.html)
1. **Profile Page Enhancement**
   - Tampilan foto profil dengan avatar default (SVG)
   - Tombol untuk memilih foto baru
   - Status upload (loading, success, error)
   - Informasi username, email, dan timestamp

### JavaScript (script.js)
1. **loadProfile()**
   - Fetch data profil dari API backend
   - Menampilkan foto, username, dan email
   - Fallback ke localStorage jika API tidak tersedia

2. **setupProfilePhotoUpload()**
   - Handle file input change event
   - Preview lokal sebelum upload
   - Validasi file (ukuran dan tipe)
   - Upload ke server dengan JWT token
   - Feedback status upload kepada user

### CSS (styles.css)
1. **Profile Photo Styling**
   - `.profile-photo-section`: Container dengan background kuning
   - Foto bulat dengan border kuning (120x120px)
   - Hover effect (zoom + shadow)
   - Status message styling

## 🚀 Cara Menggunakan

### 1. Setup Backend
```bash
cd backend
npm install  # Install dependencies termasuk multer
npm start    # Jalankan server
```

### 2. Mengakses Profile Page
- Login ke aplikasi
- Klik link "Profile" di navbar
- Halaman profile akan menampilkan avatar default

### 3. Upload Foto Profil
- Klik tombol "📷 Pilih Foto"
- Pilih file gambar dari komputer
- Sistem akan:
  - Memvalidasi file (ukuran dan tipe)
  - Preview foto secara lokal
  - Upload ke server
  - Menampilkan status upload

### 4. Verifikasi Foto Tersimpan
- Foto akan langsung ditampilkan setelah upload berhasil
- Refresh halaman untuk verifikasi persisten
- Foto disimpan di database dan file system

## 📁 Struktur File

```
KANS/
├── backend/
│   ├── server.js              # (Modified) Multer setup + endpoints
│   ├── package.json           # (Modified) Added multer dependency
│   └── uploads/
│       └── profiles/          # (New) Folder untuk foto profil
├── Front.html                 # (Modified) Profile page dengan upload UI
├── script.js                  # (Modified) loadProfile() + setupProfilePhotoUpload()
├── styles.css                 # (Modified) Profile photo styling
└── PROFILE_PHOTO_FEATURE.md   # (New) Dokumentasi ini
```

## 🔐 Keamanan

1. **File Upload**
   - Validasi MIME type (hanya gambar)
   - Limit ukuran file (5MB max)
   - Nama file di-hash dengan timestamp (mencegah collision)

2. **Authentication**
   - Semua upload endpoint memerlukan JWT token valid
   - Verifikasi username dari token

3. **Storage**
   - File disimpan di folder khusus `backend/uploads/profiles/`
   - Akses via static route `/uploads`
   - Path disimpan di database, bukan binary data

## 🐛 Troubleshooting

### Foto tidak ter-upload
- **Solusi**: Pastikan backend server sudah berjalan di `http://localhost:3000`
- **Check**: Buka browser console untuk melihat error message

### "Hanya file gambar yang diperbolehkan"
- **Solusi**: Pilih file dengan format JPEG, PNG, GIF, atau WebP

### "File terlalu besar"
- **Solusi**: Kompresi foto atau pilih file berukuran < 5MB

### Foto tidak persist setelah refresh
- **Check**: Pastikan database sudah di-setup (better-sqlite3)
- **Fallback**: Sistem akan menampilkan avatar default jika tidak ada foto

## 🔄 API Reference

### GET /api/profile
Ambil profil user dengan foto

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "profile": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "profile_photo": "/uploads/profiles/admin_1234567890.jpg"
  }
}
```

### POST /api/profile/photo
Upload foto profil

**Headers:**
```
Authorization: Bearer <jwt_token>
(Content-Type: multipart/form-data - auto)
```

**Body:**
```
Form Data:
  photo: <File>
```

**Response:**
```json
{
  "success": true,
  "message": "Photo uploaded successfully",
  "photoPath": "/uploads/profiles/admin_1234567890.jpg"
}
```

## 📝 Catatan Teknis

1. **Database Migration**: Kolom `profile_photo` ditambahkan otomatis saat server startup via `addColumnIfMissing()`

2. **Folder Creation**: Folder `backend/uploads/profiles/` dibuat otomatis saat server startup

3. **Static Files**: Folder `uploads` di-serve sebagai static files, accessible via HTTP

4. **Fallback Avatar**: Default SVG avatar ditampilkan jika user belum upload foto

5. **Browser Compatibility**: Fitur memerlukan:
   - FileReader API
   - FormData API
   - Fetch API
   - File input accept attribute

## 🎯 Fitur Future (Optional)
- Crop/resize foto sebelum upload
- Beberapa foto profil (gallery)
- Download photo sebagai backup
- Delete photo option
- Image compression before upload
