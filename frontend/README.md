# Apomacy — Frontend

Layanan frontend untuk platform Apomacy. Dibangun dengan **Next.js 15** (App Router) dan **TypeScript**, menggunakan **Tailwind CSS v4** untuk styling yang modern dan responsif.

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
| **Framework** | Next.js 15+ (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 (configuration-less) |
| **HTTP Client** | Axios |
| **Package Manager** | npm |

---

## ✅ Prerequisites

- **Node.js** versi 18.0 atau lebih baru → [Download Node.js](https://nodejs.org/)
- **npm** versi 9.0+ (sudah termasuk dalam instalasi Node.js)
- Backend API Apomacy yang sudah berjalan → lihat [backend/README.md](../backend/README.md)

---

## 📁 Struktur Folder

```
frontend/
├── src/
│   ├── app/                      # Routing & halaman (Next.js App Router)
│   │   ├── (auth)/               # Route group: halaman autentikasi
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── dashboard/            # Halaman dasbor pasien
│   │   ├── katalog/              # Halaman katalog & detail obat
│   │   │   └── [id]/             # Dynamic route: detail obat
│   │   ├── checkout/             # Halaman keranjang & proses checkout
│   │   ├── globals.css           # Gaya global (Tailwind v4 theme config)
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Halaman landing (/)
│   │
│   ├── components/               # Komponen UI yang dapat digunakan ulang
│   │   ├── ui/                   # Komponen dasar (Button, Input, Modal, Card)
│   │   └── shared/               # Komponen global (Navbar, Footer, Sidebar)
│   │
│   ├── lib/                      # Logika & utilitas murni (non-UI)
│   │   ├── api.ts                # Konfigurasi Axios instance & fungsi API call
│   │   └── utils.ts              # Fungsi helper (format Rupiah, format tanggal, dll)
│   │
│   └── types/                    # Definisi interface & type TypeScript
│       └── index.ts              # Export semua types
│
├── public/                       # Aset statis (gambar, icon, font)
├── next.config.ts                # Konfigurasi Next.js
├── package.json                  # Dependensi & npm scripts
└── tsconfig.json                 # Konfigurasi TypeScript
```

---

## ⚙️ Environment Configuration

Buat file `.env.local` di root direktori `frontend/` berdasarkan `.env.example`:

```env
# ── Backend API ───────────────────────────────────────────────
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api

# ── Midtrans (Client Key untuk Snap.js) ───────────────────────
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=
```

> ⚠️ Variabel yang diawali `NEXT_PUBLIC_` akan ter-expose ke browser. Jangan pernah menyimpan secret key di variabel ini — hanya untuk nilai yang aman diakses publik.

---

## 🚀 Getting Started

### 1. Masuk ke direktori frontend

```bash
cd frontend
```

### 2. Salin dan konfigurasi environment

```bash
cp .env.example .env.local
# Edit NEXT_PUBLIC_API_BASE_URL sesuai URL backend kamu
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
| Type Check | `npm run type-check` | Validasi TypeScript tanpa build |

---

## 🗺️ Struktur Halaman (Routes)

| Route | Deskripsi | Akses |
|-------|-----------|-------|
| `/` | Landing page / beranda | Publik |
| `/login` | Halaman login | Publik (redirect jika sudah login) |
| `/register` | Halaman registrasi | Publik (redirect jika sudah login) |
| `/katalog` | Katalog obat | Publik |
| `/katalog/[id]` | Detail produk obat | Publik |
| `/checkout` | Keranjang & checkout | Login diperlukan |
| `/dashboard` | Dasbor pasien (riwayat, profil) | Login diperlukan |

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

Semua pemanggilan API dilakukan melalui fungsi-fungsi yang terdefinisi di `src/lib/api.ts`. Jangan memanggil URL API secara langsung di komponen — gunakan fungsi wrapper yang sudah ada.

```typescript
// ✅ Benar
import { getObatList } from '@/lib/api';
const data = await getObatList();

// ❌ Hindari
const data = await axios.get('http://localhost:8080/api/obat');
```