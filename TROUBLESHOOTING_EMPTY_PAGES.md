# 🔧 Cara Memperbaiki Halaman Kosong

Jika halaman "Daftar Area" dan "Profile" masih kosong, ikuti langkah berikut:

## Langkah 1: Clear Data Lama (PENTING!)

1. Buka halaman: `reset-data.html`
   - URL: `https://xepheryth.github.io/Moprang/reset-data.html`
   - Atau dari local: `http://localhost/Moprang/reset-data.html`

2. Klik tombol **"🗑️ Hapus SEMUA Data"**
   - Ini menghapus semua data lama yang mungkin corrupt

3. Klik tombol **"✅ Inisialisasi Data Test"**
   - Ini membuat data test baru untuk 3 projects dengan areas dan items

4. Klik tombol **"👤 Setup User Admin"**
   - Ini membuat user admin dengan profile

5. Klik **"← Kembali ke Front.html"** atau refresh halaman

## Langkah 2: Test Halaman

Setelah langkah 1, coba:

### 📦 Daftar Project
- Harus tampil 3 project cards:
  - Project A - Jakarta
  - Project B - Surabaya
  - Project C - Bandung

### 📍 Daftar Area
- Klik tab "Daftar Project" lalu dropdown area
- Harus tampil areas dan items dengan realisasi percentage

### 👤 Profile
- Klik tab "Profile"
- Harus tampil username "admin" dan profile info
- Tombol "Refresh Profile" harus berfungsi

## Jika Masih Kosong:

1. Buka **Browser DevTools** (F12)
2. Buka tab **Console**
3. Paste code berikut untuk manual initialization:

```javascript
// Clear all KANS data
Object.keys(localStorage).filter(k => k.startsWith('kans_')).forEach(k => localStorage.removeItem(k));

// Initialize test data
const testProjects = [
    { name: 'Project A - Jakarta', period: 'Jan - Mar 2026' },
    { name: 'Project B - Surabaya', period: 'Feb - Apr 2026' }
];
localStorage.setItem('kans_projects', JSON.stringify(testProjects));

// Initialize areas
const areasMap = {
    'Project A - Jakarta': [
        { name: 'Area Utara', items: [
            { name: 'Item 1', volume: 100, terkirim: 50 },
            { name: 'Item 2', volume: 200, terkirim: 150 }
        ]},
        { name: 'Area Timur', items: [
            { name: 'Item 3', volume: 150, terkirim: 100 }
        ]}
    ],
    'Project B - Surabaya': [
        { name: 'Area Pusat', items: [
            { name: 'Item A', volume: 80, terkirim: 60 }
        ]}
    ]
};
localStorage.setItem('kans_project_areas', JSON.stringify(areasMap));

// Initialize user
localStorage.setItem('kans_current', 'admin');
const users = [{ username: 'admin', password: 'admin123', email: 'admin@kans.com' }];
localStorage.setItem('kans_users', JSON.stringify(users));

// Reload
location.reload();
```

4. Tekan **Enter**
5. Halaman akan reload dengan data baru

## Troubleshooting:

### Halaman masih kosong setelah refresh?
- ✅ Pastikan sudah buka reset-data.html dan klik semua tombol
- ✅ Hard refresh: **Ctrl+Shift+Delete** lalu refresh tab
- ✅ Cek konsol (F12) untuk error messages

### Profile tidak tampil?
- User harus "admin" (sudah fix di reset-data.html)
- Pastikan localStorage[kans_current] = "admin"

### Area cards tidak tampil?
- Dropdown project harus ada minimal 1 project
- Area harus ada di kans_project_areas untuk project yang dipilih
- Cek konsol untuk debug messages

## Tentang Test Data:

Data yang di-initialize sudah include:
- ✅ 2-3 Projects dengan different periods
- ✅ 3-4 Areas per project
- ✅ Multiple items per area dengan volume dan terkirim data
- ✅ Delivery schedules dengan berbagai status
- ✅ User admin dengan email

Semua ini untuk testing UI tanpa bergantung pada manual input.
