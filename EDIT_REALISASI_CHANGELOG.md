# Edit Realisasi - Perubahan Fitur

## Ringkasan
Menambahkan section **"Edit Realisasi"** di modal detail item/po untuk memudahkan pengguna dalam memasukkan dan melacak jumlah barang yang telah terkirim, dengan perhitungan persentase realisasi otomatis.

## Perubahan di `area-detail.html`

### 1. UI/HTML Changes (Lines 127-153)
- Menambahkan section baru **"📦 Edit Realisasi"** di dalam modal detail item/po
- Field baru:
  - **Jumlah Terkirim**: Input number untuk memasukkan jumlah barang yang sudah terkirim
  - **Realisasi (%)**: Display field yang menampilkan persentase realisasi secara otomatis

### 2. JavaScript Changes - openItemDetail Function
- Menambahkan inisialisasi field `detail-item-terkirim` saat membuka modal
- Menambahkan call ke `updateRealisasiDisplay()` untuk menampilkan realisasi saat modal dibuka

### 3. JavaScript Changes - New Function: updateRealisasiDisplay()
```javascript
function updateRealisasiDisplay()
```
- Fungsi baru untuk menghitung persentase realisasi secara real-time
- Formula: `(terkirim / volume) * 100`
- Diupdate setiap kali user mengubah nilai volume atau terkirim
- Menampilkan hasil perhitungan di elemen `#detail-realisasi-percent`

### 4. JavaScript Changes - Event Listeners
- Menambahkan event listener `input` pada:
  - `#detail-item-volume` → trigger `updateRealisasiDisplay()`
  - `#detail-item-terkirim` → trigger `updateRealisasiDisplay()`
- Memungkinkan perhitungan real-time saat user mengetik

### 5. JavaScript Changes - Form Submission Handler
- Menambahkan penanganan `detail-item-terkirim` saat form disubmit
- Otomatis menghitung dan menyimpan nilai `item.realisasi` sebagai persentase:
  ```javascript
  if(volume > 0){
    item.realisasi = Math.round((terkirim / volume) * 100) + '%';
  } else {
    item.realisasi = '0%';
  }
  ```

## Fitur yang Diimplementasikan

✅ **Edit Jumlah Terkirim** - User dapat memasukkan berapa jumlah barang yang sudah diterima
✅ **Perhitungan Realisasi Otomatis** - Sistem otomatis menghitung persentase (terkirim/volume*100)
✅ **Real-time Preview** - Persentase terupdate saat user mengetik, tanpa perlu submit
✅ **Penyimpanan Data** - Data terkirim dan realisasi disimpan ke localStorage saat form disubmit
✅ **Validasi Pembagian Nol** - Menangani kasus ketika volume = 0

## Data Structure
Data item di localStorage sudah mendukung:
```javascript
{
  name: "Nama Barang",
  volume: "100",
  unit: "pcs",
  terkirim: "50",          // ← Baru bisa diedit
  realisasi: "50%",        // ← Auto calculated
  supplier: "...",
  client: "...",
  status: "...",
  spesifikasi: "...",
  note: "..."
}
```

## Testing Checklist
- [ ] Buka area-detail.html
- [ ] Klik tombol edit pada salah satu item
- [ ] Modal detail item terbuka
- [ ] Masukkan Volume: 100
- [ ] Masukkan Jumlah Terkirim: 50
- [ ] Verifikasi Realisasi menampilkan 50%
- [ ] Ubah nilai terkirim menjadi 75 → Realisasi update ke 75%
- [ ] Klik Simpan
- [ ] Verifikasi data tersimpan dengan benar di localStorage

## File Modified
- `area-detail.html` - Seluruh perubahan

## Kompatibilitas
✅ Backward compatible dengan data lama (migration di line 230-234 sudah ada)
✅ Tidak mempengaruhi fitur lainnya
✅ Admin access check tetap berlaku
