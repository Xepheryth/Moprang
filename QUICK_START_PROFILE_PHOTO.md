# 🚀 Quick Start - Upload Foto Profil

## Setup (Pertama Kali)

### 1. Install Dependencies Backend
```bash
cd backend
npm install
```

### 2. Jalankan Server Backend
```bash
npm start
```
✅ Server berjalan di `http://localhost:3000`

### 3. Buka Aplikasi
- Buka `Front.html` di browser
- Atau akses via local server (jika sudah setup)

## Cara Menggunakan

### Step 1: Login
1. Jika belum login, klik "Register" atau "Login"
2. Gunakan credentials yang sudah terdaftar

### Step 2: Buka Profile
1. Setelah login, klik link "Profile" di navbar atas
2. Halaman profile akan dimuat dengan avatar default

### Step 3: Upload Foto
1. Klik tombol **"📷 Pilih Foto"**
2. Pilih file gambar dari komputer
3. Sistem akan otomatis:
   - Validasi file (JPEG, PNG, GIF, WebP)
   - Preview foto
   - Upload ke server
   - Simpan ke database

### Step 4: Verifikasi
- Tunggu pesan **"✅ Foto berhasil diupload"**
- Foto akan langsung tampil di profile
- Refresh halaman untuk verifikasi persisten

## Format File yang Didukung
- ✅ JPEG / JPG
- ✅ PNG
- ✅ GIF
- ✅ WebP

**Max Size**: 5MB

## Troubleshooting

### ❌ "Gagal upload foto. Periksa koneksi atau server."
**Solusi:**
- Pastikan backend server sudah running: `npm start`
- Pastikan di folder `backend/`
- Check browser console untuk detail error

### ❌ "Hanya file gambar yang diperbolehkan"
**Solusi:**
- Pilih file dengan format: JPEG, PNG, GIF, atau WebP
- Tidak support BMP, TIFF, atau format lainnya

### ❌ "File terlalu besar (maksimal 5MB)"
**Solusi:**
- Kompresi foto menggunakan:
  - Online: [TinyPNG](https://tinypng.com)
  - Tools: Photoshop, GIMP, Windows Photo Editor
- Atau ambil foto dengan resolusi lebih rendah

### ❌ Foto hilang setelah refresh
**Solusi:**
- Pastikan database sudah setup
- Check jika folder `backend/uploads/profiles/` ada
- Lihat browser console untuk error details

## File Storage

Foto disimpan di:
```
backend/uploads/profiles/
  └── username_timestamp.jpg
```

Contoh: `admin_1703352000123.jpg`

## Fitur Lain (Coming Soon)

- 📸 Crop/resize foto
- 🗂️ Multiple photos (gallery)
- 🗑️ Delete photo option
- 📦 Photo backup download

---

**Need Help?** Lihat dokumentasi lengkap di `PROFILE_PHOTO_FEATURE.md`
