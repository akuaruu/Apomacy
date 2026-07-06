<p align="center">
  <img src="docs/Apomacy.png" alt="Apomacy Logo" width="200" />
</p>

<h1 align="center">Apomacy</h1>
<p align="center">Platform Apotek Digital & Layanan Telemedisin Terintegrasi</p>

<p align="center">
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"/></a>
  <a href="https://go.dev/"><img src="https://img.shields.io/github/go-mod/go-version/akuaruu/Apomacy?filename=backend%2Fgo.mod" alt="Go Version"/></a>
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16.2.6-black?style=flat&logo=next.js" alt="Next.js Version"/></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-v4.0-blue?style=flat&logo=tailwind-css" alt="Tailwind CSS Version"/></a>
</p>

---

Apomacy adalah platform full-stack untuk operasional dan layanan apotek digital. Aplikasi mencakup katalog obat, keranjang dan checkout, pembayaran Midtrans, dasbor member, serta panel operasional kasir dan admin.

Proyek ini dibangun dengan standar industri, mengutamakan *skalabilitas*, *maintainability*, dan *Clean Architecture*.

---

## 📌 Daftar Isi

1. [Fitur Utama](#-fitur-utama)
2. [Arsitektur & Tech Stack](#-arsitektur--tech-stack)
3. [Struktur Monorepo](#-struktur-monorepo)
4. [Quick Start](#-quick-start)
5. [Dokumentasi Lengkap](#-dokumentasi-lengkap)
6. [Tim Pengembang](#-tim-pengembang)
7. [Lisensi](#-lisensi)

---

## 🌟 Fitur Utama

- **Katalog Obat** — Penjelajahan produk obat dengan sistem grid responsif, pencarian, dan filter kategori.
- **Sistem Keranjang & Checkout** — Alur pembelian produk terintegrasi dengan payment gateway Midtrans.
- **Dasbor Member** — Riwayat pembelian obat, FAQ, dan pengelolaan profil akun.
- **Panel Kasir & Admin** — Pengelolaan produk, member, supplier, restock, status pesanan, dan transaksi toko.

---

## 🛠️ Arsitektur & Tech Stack

Proyek ini menerapkan pemisahan *concern* yang jelas antara Frontend dan Backend.

| Layer | Teknologi |
|-------|-----------|
| **Frontend Framework** | Next.js 16.2.6 (App Router, TypeScript) |
| **Styling** | Tailwind CSS v4 |
| **HTTP Client** | Axios |
| **Backend Language** | Golang |
| **Backend Framework** | Gin Gonic |
| **Database Driver** | pgx v5 |
| **Database** | PostgreSQL (via Supabase) |
| **Authentication** | JWT + Bcrypt |
| **Payment Gateway** | Midtrans |
| **Architecture Pattern** | Clean Architecture (Domain-Driven Design) |

---

## 📁 Struktur Monorepo

```
Apomacy/
├── backend/          # Source code Backend (Golang) — lihat backend/README.md
├── frontend/         # Source code Frontend (Next.js) — lihat frontend/README.md
├── docs/             # Aset dokumentasi (ERD, Logo, OpenAPI spec)
├── LICENSE
└── README.md         # Dokumen ini
```

Untuk dokumentasi teknis masing-masing service, lihat:
- 📖 [Backend README](./backend/README.md)
- 📖 [Frontend README](./frontend/README.md)

---

## 🚀 Quick Start

### Prerequisites

Pastikan tools berikut sudah terinstal di sistem kamu:

- [Go](https://go.dev/dl/) (sesuai `backend/go.mod`: v1.25.0)
- [Node.js](https://nodejs.org/) (versi yang kompatibel dengan Next.js 16)
- [PostgreSQL](https://www.postgresql.org/) atau akses ke Supabase project

### Menjalankan Proyek Secara Lokal

**1. Clone repositori**
```bash
git clone https://github.com/akuaruu/Apomacy.git
cd Apomacy
```

**2. Setup dan jalankan Backend**
```bash
cd backend
cp .env.example .env
# Edit file .env dengan kredensial kamu
go mod tidy
go run cmd/api/main.go
```

**3. Setup dan jalankan Frontend** (di terminal baru)
```bash
cd frontend
# Buat .env.local dan isi NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
# Sesuaikan rewrite backend di next.config.ts untuk environment lokal
npm install
npm run dev
```

Aplikasi akan berjalan di:
- **Frontend:** `http://localhost:3000`
- **Backend API:** `http://localhost:8080`

> Untuk panduan setup lebih detail, lihat README di masing-masing direktori service.

---

## 📄 Dokumentasi Lengkap

| Dokumen | Lokasi |
|---------|--------|
| API Specification (OpenAPI/Swagger) | `backend/docs/swagger.yaml` dan `backend/docs/swagger.json` |
| Entity Relationship Diagram (ERD) | `docs/ERD.png` |
| Backend Setup Guide | `backend/README.md` |
| Frontend Setup Guide | `frontend/README.md` |

API documentation dapat dibuka secara interaktif melalui [Swagger Editor](https://editor.swagger.io/) dengan mengimpor file `backend/docs/swagger.yaml`. Ringkasan endpoint aktual juga tersedia di [Backend README](./backend/README.md#-api-documentation).

---

## 👥 Tim Pengembang

| GitHub |
|--------|
| [@akuaruu](https://github.com/akuaruu) |
| [@CupidStrom](https://github.com/CupidStrom) |
| [@dzulmanromiealfikrhi](https://github.com/dzulmanromiealfikrhi) |
| [@NakishiSelviar](https://github.com/NakishiSelviar) |
| [@RexZone01](https://github.com/RexZone01) |

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah **MIT License** — lihat file [LICENSE](LICENSE) untuk detailnya.
