# Dimsum Kiosk - Laravel 11 + Inertia.js + React (PHP 8.2)

Aplikasi kiosk pemesanan dimsum: layar customer (pilih size, custom saus per piece, checkout cash/QRIS) + dashboard dapur/kasir (login PIN, antrian pesanan real-time, cetak struk via Bluetooth, notifikasi WhatsApp otomatis).

Ini adalah **proyek Laravel yang utuh** (skeleton resmi `laravel/laravel` 11.x + Inertia + React sudah terpasang), bukan file tempelan — tinggal install dependency dan jalankan.

## Cara Menjalankan

```bash
# 1. Install dependency PHP
composer install

# 2. Install dependency JS
npm install

# 3. Setup environment
cp .env.example .env
php artisan key:generate

# 4. Isi kredensial Midtrans & Fonnte di .env (lihat bagian "Kredensial" di bawah)

# 5. Migration + seeder (pakai SQLite bawaan, atau ganti ke MySQL di .env)
touch database/database.sqlite   # kalau pakai SQLite
php artisan migrate --seed
php artisan storage:link   # WAJIB — supaya gambar QRIS yang diupload bisa diakses publik

# 6. Jalankan (2 terminal)
php artisan serve        # terminal 1: backend
npm run dev               # terminal 2: Vite dev server
```

Lalu buka:
- `http://localhost:8000` → Kiosk customer
- `http://localhost:8000/kitchen/login` → Login dapur/kasir (username: `admin`, PIN: `1234`)

## Kredensial yang Dibutuhkan

**Midtrans (QRIS):**
1. Daftar akun sandbox gratis di https://dashboard.midtrans.com/register
2. Settings → Access Keys → salin Server Key & Client Key ke `.env`
3. Set Payment Notification URL di dashboard Midtrans ke: `https://domain-anda.com/webhooks/midtrans`
4. Untuk testing tanpa domain publik, pakai [ngrok](https://ngrok.com) supaya Midtrans bisa memanggil webhook ke localhost kamu.

**Fonnte (WhatsApp):**
1. Daftar di https://fonnte.com, scan QR untuk connect nomor WhatsApp toko
2. Salin token device ke `.env` sebagai `FONNTE_TOKEN`

## ⚠️ Printer Bluetooth — Penting Dibaca

Cetak struk pakai **Web Bluetooth API** (`resources/js/lib/thermalPrinter.ts`):
- ✅ Jalan di **Chrome/Edge Android** dan **Chrome/Edge Desktop**
- ❌ **TIDAK bisa di Safari/iOS** (keterbatasan Apple, bukan bug)
- Printer harus support Bluetooth Low Energy (BLE) dengan UUID serial generik (`000018f0-...`). Kalau printer yang kamu beli beda, cek UUID-nya pakai app **"nRF Connect"** di HP, lalu sesuaikan `PRINTER_SERVICE_UUID` di `thermalPrinter.ts`.
- Tombol cetak butuh 1x tap user (aturan keamanan browser untuk akses Bluetooth) — makanya di dashboard dapur ada tombol "🖨️ Cetak" manual per pesanan.

**Rekomendasi:** pakai tablet/HP kios dengan **Android + Chrome**.

## Struktur Halaman

| Route | Halaman | Keterangan |
|---|---|---|
| `/` | Kiosk customer | Pilih size, custom saus per piece, extra saus, checkout |
| `/order/{id}/success` | Sukses (cash) | Ditampilkan setelah pilih bayar tunai |
| `/kitchen/login` | Login dapur | Username + PIN |
| `/kitchen` | Dashboard dapur | Antrian order (polling 10 detik), update status, cetak struk |

## Alur Notifikasi WhatsApp Otomatis

Setiap kali status order berubah (`received` → `cooking` → `ready` → `completed`, atau `cancelled`), `app/Services/FonnteService.php` otomatis kirim WA ke nomor customer. Template pesan bisa disesuaikan di file tersebut.

## Fitur Admin Tambahan (di halaman /kitchen, panel kiri bawah printer)

- **Kelola Saus**: tambah/edit/hapus jenis saus baru, atur harga extra, pilih warna tema, dan toggle stok tersedia/habis. Perubahan langsung muncul di kiosk customer (sinkron tiap 15 detik).
- **Kelola QRIS**: upload gambar QRIS statis asli milik toko (dari QRIS BCA/OVO/GoPay Merchant/dll). Kalau diisi, layar QRIS di kiosk customer akan menampilkan gambar ini alih-alih QR simulasi bawaan.

## Login Default Dapur/Kasir

- PIN: `1234`

Ganti PIN di `resources/js/Pages/Kitchen/Dashboard.tsx`, field `merchantPin`.
