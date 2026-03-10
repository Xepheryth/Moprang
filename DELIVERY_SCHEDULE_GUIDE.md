# KANS Delivery Schedule Feature - Testing & Usage Guide

## 📋 Fitur yang Ditambahkan

### 1. Tabel Jadwal Pengiriman di Halaman Beranda
- Menampilkan daftar jadwal pengiriman dengan informasi:
  - Tanggal Pengiriman
  - Supplier
  - Deskripsi Barang
  - Kuantitas
  - Status (Dijadwalkan, Dalam Pengiriman, Tiba di Gudang, Selesai)

### 2. Admin Controls (Hanya untuk User Admin)
- ✏️ **Tombol Edit**: Mengubah data jadwal pengiriman
- 🗑️ **Tombol Hapus**: Menghapus jadwal pengiriman
- ➕ **Tombol Tambah Jadwal**: Menambah jadwal pengiriman baru

### 3. User View (Untuk User Biasa)
- Hanya dapat melihat tabel jadwal
- Tidak ada tombol edit atau hapus
- Informasi read-only

---

## 🚀 Cara Testing

### Step 1: Buka Halaman Testing
Buka file `test-schedule.html` di browser:
```
file:///C:/Users/LENOVO/OneDrive/Documents/Rflysan/KANS/Web%20Monitoring/test-schedule.html
```

### Step 2: Tambah Data Testing
Klik tombol **"Tambah Data Testing"** untuk menambahkan 4 jadwal pengiriman sample:
1. PT Supplier Indonesia - Batu bara (Dijadwalkan)
2. CV Maju Jaya - Semen (Dalam Pengiriman)
3. PT Global Trading - Besi (Selesai)
4. PT Logistik Cepat - Kayu Lapis (Tiba di Gudang)

### Step 3: Ke Halaman Beranda
Klik tombol **"Ke Halaman Beranda"** atau akses:
```
file:///C:/Users/LENOVO/OneDrive/Documents/Rflysan/KANS/Web%20Monitoring/Front.html
```

### Step 4: Verifikasi Fitur
1. ✅ Tabel "Jadwal Pengiriman" muncul di halaman beranda
2. ✅ Data sample jelas terlihat dengan status badge berwarna
3. ✅ Tombol "Tambah Jadwal" hanya muncul jika login sebagai admin
4. ✅ Tombol Edit (✏️) dan Hapus (🗑️) hanya muncul untuk admin

---

## 📝 Cara Menggunakan (Admin)

### Tambah Jadwal Pengiriman Baru
1. Klik tombol **"+ Tambah Jadwal"** (hanya tampil untuk admin)
2. Isi form modal:
   - **Tanggal Pengiriman**: Pilih tanggal menggunakan date picker
   - **Supplier**: Masukkan nama supplier (contoh: PT ABC)
   - **Deskripsi Barang**: Jelaskan barang yang dikirim
   - **Kuantitas**: Masukkan jumlah dan unit (contoh: 500 TON, 100 BOX)
   - **Status**: Pilih status dari dropdown
3. Klik **"Simpan Jadwal"**

### Edit Jadwal Pengiriman
1. Klik tombol **"✏️ Edit"** pada jadwal yang ingin diubah
2. Form akan terbuka dengan data lama
3. Ubah data yang perlu diubah
4. Klik **"Simpan Jadwal"**

### Hapus Jadwal Pengiriman
1. Klik tombol **"🗑️ Hapus"** pada jadwal yang ingin dihapus
2. Konfirmasi penghapusan dengan klik "OK"
3. Data akan dihapus

---

## 🎨 Status Badge Colors

| Status | Warna | Keterangan |
|--------|-------|-----------|
| Dijadwalkan | Biru | Pengiriman sudah dijadwalkan |
| Dalam Pengiriman | Oranye | Sedang dalam proses pengiriman |
| Tiba di Gudang | Ungu | Sudah tiba di gudang penerima |
| Selesai | Hijau | Pengiriman selesai |

---

## 💾 Penyimpanan Data

Data jadwal pengiriman disimpan dalam **localStorage** browser:
- **Key**: `kans_delivery_schedules`
- **Format**: Array JSON
- **Persistence**: Data tersimpan sampai user menghapus browser cache

### Struktur Data:
```javascript
{
  date: "2025-03-15",
  supplier: "PT Supplier Indonesia",
  description: "Batu bara berkualitas tinggi",
  quantity: "500 TON",
  status: "Dijadwalkan",
  createdAt: "2025-03-10T10:30:00.000Z"
}
```

---

## 🔐 Authorization

### Admin Users
- Username: `admin` atau `admin2`
- Dapat melihat semua tombol aksi (Edit, Hapus, Tambah)
- Dapat mengelola jadwal pengiriman

### Regular Users
- Username apapun selain `admin` atau `admin2`
- Hanya dapat melihat tabel jadwal
- Tidak ada akses untuk Edit atau Hapus

---

## 🐛 Troubleshooting

### Tombol "Tambah Jadwal" tidak muncul
- Pastikan sudah login sebagai admin (username: admin)
- Refresh halaman browser (Ctrl+F5)

### Data tidak muncul setelah refresh
- Periksa localStorage: Buka DevTools (F12) → Application → LocalStorage
- Pastikan key `kans_delivery_schedules` ada

### Form tidak bisa disimpan
- Pastikan semua field diisi
- Pastikan Anda login sebagai admin

---

## 📂 File yang Dimodifikasi

1. **Front.html**
   - Menambahkan section jadwal pengiriman
   - Menambahkan modal form untuk add/edit

2. **styles.css**
   - Styling untuk tabel jadwal
   - Styling untuk status badge
   - Styling untuk form modal

3. **script.js**
   - Fungsi getDeliverySchedules()
   - Fungsi saveDeliverySchedules()
   - Fungsi renderDeliverySchedule()
   - Fungsi updateScheduleAdminControls()
   - Fungsi openAddScheduleModal()
   - Fungsi editDeliverySchedule()
   - Fungsi deleteDeliverySchedule()
   - Fungsi setupScheduleFormHandler()

4. **test-schedule.html** (baru)
   - File untuk testing dan populate sample data

---

## ✅ Checklist Testing

- [ ] Halaman beranda menampilkan tabel jadwal pengiriman
- [ ] Admin melihat tombol "Tambah Jadwal"
- [ ] Admin melihat tombol Edit dan Hapus pada setiap jadwal
- [ ] User biasa tidak melihat tombol aksi
- [ ] Tombol "Tambah Jadwal" membuka modal form
- [ ] Semua field form berfungsi dengan baik
- [ ] Data tersimpan di localStorage
- [ ] Status badge menampilkan warna yang sesuai
- [ ] Tabel responsive dan tampilannya bagus
- [ ] Edit dan hapus berfungsi dengan baik

---

## 📞 Support

Jika ada masalah atau pertanyaan, silakan buka DevTools (F12) dan lihat console untuk error messages.
