# Item/PO Enhancement Documentation

## Overview
This enhancement adds comprehensive procurement item tracking with detailed information fields and document management capabilities.

## New Item Fields

### Required Fields:
1. **Nama Barang** - Item/product name
2. **Satuan** - Unit of measurement (pcs, box, kg, etc.)
3. **Supplier** - Supplier name
4. **Client** - Client/customer name

### Additional Fields:
5. **Volume** - Quantity ordered
6. **Tanggal Realisasi** - Realization/delivery date
7. **Spesifikasi** - Product specification details
8. **Documents** - Procurement documents

## Document Types Supported

Each item can have up to 6 types of procurement documents:

1. **PO** - Purchase Order
2. **Invoice** - Invoice from supplier
3. **Surat Jalan** - Delivery note/waybill
4. **BAST** - Berita Acara Serah Terima (Material Handover Report)
5. **BAPP** - Berita Acara Pemeriksaan Pemakaian (Asset Verification Report)
6. **BASTB** - Berita Acara Serah Terima Barang (Technical Item Handover Report)

## How to Use

### Adding a New Item/PO:
1. Click "Tambah Item" button
2. Fill in required fields: Nama Barang and Satuan
3. Optionally fill Volume and Satuan, then click "Tambah Item"
4. The item detail modal will automatically open
5. Complete all required fields (Supplier, Client) and optional fields
6. Upload procurement documents as needed
7. Click "Simpan" to save

### Editing Item Details:
1. Click the "Detail" button on any item in the list
2. Update any fields:
   - Item name and specifications
   - Supplier and client information
   - Realization date
   - Volume
3. Upload or manage documents:
   - Click file input for document type
   - Select file from your computer
   - Click "Upload" button
   - Document will be stored with base64 encoding
   - Click × to remove a document
4. Click "Simpan" to save all changes

### Managing Status:
- Each item shows current procurement status (PO dibuat → Selesai/komplain)
- Click "Next" button to advance to next stage
- Status cannot be edited from the detail modal (use "Next" button)

### Viewing Item List:
The main table now shows:
- Item name
- Supplier name
- Client name
- Volume
- Realisasi percentage
- Current procurement status

## Data Structure

### Item Object Schema:
```javascript
{
  name: "Laptop HP",           // Nama barang
  unit: "pcs",                 // Satuan
  volume: "5",                 // Kuantitas
  supplier: "PT ABC",          // Nama supplier
  client: "PT XYZ",            // Nama client
  spesifikasi: "...",          // Spesifikasi detail
  tanggal_realisasi: "2026-01-23",  // Tanggal realisasi
  terkirim: "3",               // Jumlah terkirim
  status: "Pengiriman",        // Status pengadaan
  documents: {
    "PO": {
      name: "PO-2026-001.pdf",
      type: "application/pdf",
      size: 123456,
      data: "data:application/pdf;base64,...",
      uploadedAt: "2026-01-23T10:30:00Z"
    },
    // ... other documents
  }
}
```

## Storage

- All data is stored in localStorage under key `kans_project_areas`
- Documents are stored as base64 encoded data within the item object
- No server backend is required (works offline)
- Optional server integration available for backend API calls

## Features

### ✓ Complete
- [x] Item detail modal with all required fields
- [x] Document upload for 6 document types
- [x] Document storage with base64 encoding
- [x] Document removal capability
- [x] Status progression tracking
- [x] Supplier and client information
- [x] Specification details
- [x] Realization date tracking
- [x] Data persistence in localStorage
- [x] Responsive design
- [x] Admin-only access controls

## Technical Details

### File Changes:
1. **area-detail.html**
   - Added Item Detail Modal (#item-detail-modal)
   - Document upload UI with 6 document type fields
   - Detail button replaces inline editor
   - Enhanced item creation flow

2. **script.js** (via area-detail.html)
   - setupItemDetailModal() function for modal handling
   - Document upload with base64 encoding
   - Document display and removal
   - Integration with existing item management

3. **styles.css**
   - Modal styling for item details
   - Document upload card styling
   - Form input styling
   - Button and action styling

## Notes

- Documents are stored as base64 within localStorage
- Maximum practical file size depends on browser localStorage limit (usually 5-10MB per domain)
- For large scale document management, consider implementing backend storage
- All documents are automatically associated with items and exported/saved with item data
- Document upload happens immediately upon clicking "Upload" button
