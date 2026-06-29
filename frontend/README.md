# Apomacy — Frontend

Layanan frontend untuk platform Apomacy. Dibangun dengan **Next.js 16.2.6** (App Router), **React 19**, dan **TypeScript**, menggunakan **Tailwind CSS v4**.

---

## 📌 Daftar Isi

1. [Tech Stack](#-tech-stack)
2. [Prerequisites](#-prerequisites)
3. [Struktur Folder](#-struktur-folder)
4. [Environment Configuration](#-environment-configuration)
5. [Getting Started](#-getting-started)
6. [Struktur Halaman (Routes)](#-struktur-halaman-routes)
7. [Konvensi Pengembangan](#-konvensi-pengembangan)

---

## 🛠️ Tech Stack

| Komponen | Teknologi |
|----------|-----------|
| **Framework** | Next.js 16.2.6 (App Router) |
| **UI Runtime** | React 19 |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 (configuration-less) |
| **HTTP Client** | Axios |
| **Package Manager** | npm |

---

## ✅ Prerequisites

- **Node.js** versi yang kompatibel dengan Next.js 16 → [Download Node.js](https://nodejs.org/)
- **npm** versi 9.0+ (sudah termasuk dalam instalasi Node.js)
- Backend API Apomacy yang sudah berjalan → lihat [backend/README.md](../backend/README.md)

---

## 📁 Struktur Folder

```
frontend/
├── app/                          # Routing & halaman Next.js App Router
│   ├── admin/                    # Dasbor dan operasional admin
│   ├── kasir/                    # Dasbor dan operasional kasir
│   ├── dasbor/                   # Dasbor member, profil, FAQ, riwayat
│   ├── katalog/                  # Katalog dan detail produk `[id]`
│   ├── keranjang/                # Keranjang dan checkout
│   ├── pembayaran/               # Status pembayaran sukses/pending
│   ├── login/ dan register/      # Autentikasi
│   ├── globals.css               # Gaya global dan tema Tailwind
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/                   # Komponen admin, kasir, client, shared, dan UI
├── context/                      # Context aplikasi, termasuk keranjang
├── lib/                          # Axios instance dan helper data
├── public/                       # Aset statis
├── middleware.ts                # Proteksi dan redirect route berbasis role
├── next.config.ts                # Konfigurasi Next.js
├── package.json                  # Dependensi & npm scripts
└── tsconfig.json                 # Konfigurasi TypeScript
```

---

## ⚙️ Environment Configuration

Buat file `.env.local` di root direktori `frontend/`:

```env
# ── Midtrans (Client Key untuk Snap.js) ───────────────────────
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=
```

> Axios saat ini memanggil path relatif `/api`, yang diteruskan ke backend melalui `rewrites()` di `next.config.ts`. Sesuaikan destination rewrite untuk environment lokal atau deployment. Variabel yang diawali `NEXT_PUBLIC_` terekspos ke browser; jangan menyimpan secret key di sana.

---

## 🚀 Getting Started

### 1. Masuk ke direktori frontend

```bash
cd frontend
```

### 2. Salin dan konfigurasi environment

```bash
touch .env.local
# Isi NEXT_PUBLIC_MIDTRANS_CLIENT_KEY dan konfigurasi publik lain yang diperlukan
```

### 3. Install dependensi

```bash
npm install
```

### 4. Jalankan development server

```bash
npm run dev
```

Aplikasi akan berjalan di **`http://localhost:3000`**.

### Scripts yang Tersedia

| Script | Perintah | Keterangan |
|--------|----------|------------|
| Development | `npm run dev` | Jalankan server dengan hot-reload |
| Build | `npm run build` | Build untuk production |
| Start | `npm start` | Jalankan hasil build production |
| Lint | `npm run lint` | Cek kode dengan ESLint |

---

## 🗺️ Struktur Halaman (Routes)

| Route | Deskripsi | Akses |
|-------|-----------|-------|
| `/` | Landing page / beranda | Publik |
| `/login` | Halaman login | Publik (redirect jika sudah login) |
| `/register` | Halaman registrasi | Publik (redirect jika sudah login) |
| `/katalog` | Katalog obat | Publik |
| `/katalog/[id]` | Detail produk obat | Publik |
| `/keranjang` | Keranjang belanja | Login diperlukan |
| `/keranjang/checkout` | Informasi pengiriman dan pembayaran | Login diperlukan |
| `/pembayaran/sukses` | Hasil pembayaran berhasil | Login diperlukan |
| `/pembayaran/pending` | Status/instruksi pembayaran tertunda | Login diperlukan |
| `/dasbor` | Dasbor member | Login diperlukan |
| `/dasbor/profil` | Profil member | Login diperlukan |
| `/dasbor/riwayat-obat` | Riwayat transaksi member | Login diperlukan |
| `/admin/*` | Operasional admin | Role Admin |
| `/kasir/*` | Operasional kasir | Role Kasir |

---

## 📐 Konvensi Pengembangan

### Penamaan File

- **Komponen React:** PascalCase → `ProductCard.tsx`
- **Utility/lib:** camelCase → `formatCurrency.ts`
- **Halaman (App Router):** lowercase sesuai konvensi Next.js → `page.tsx`, `layout.tsx`

### Komponen

- Setiap komponen di `/components/ui/` harus bersifat *reusable* dan tidak bergantung pada state global.
- Komponen yang bergantung pada konteks aplikasi (auth, cart) diletakkan di `/components/shared/`.

### API Call

Pemanggilan API utama menggunakan Axios instance di `lib/api.ts`. Instance tersebut memakai base URL `/api` dan menambahkan JWT dari cookie `apomacy_token` melalui request interceptor.

```typescript
// ✅ Benar
import api from '@/lib/api';
const { data } = await api.get('/obat');

// ❌ Hindari
const data = await axios.get('http://localhost:8080/api/obat');
```
