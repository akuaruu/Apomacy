# Apomacy — Backend API

Layanan backend REST API untuk platform Apomacy. Dibangun dengan **Golang** menggunakan prinsip **Clean Architecture (Domain-Driven Design)** untuk memastikan basis kode yang modular, mudah diuji, dan skalabel.

---

## 📌 Daftar Isi

1. [Tech Stack](#-tech-stack)
2. [Prerequisites](#-prerequisites)
3. [Struktur Folder](#-struktur-folder)
4. [Environment Configuration](#-environment-configuration)
5. [Getting Started](#-getting-started)
6. [API Documentation](#-api-documentation)
7. [Database](#-database)

---

## 🛠️ Tech Stack

| Komponen | Teknologi |
|----------|-----------|
| **Language** | Go 1.25.0 |
| **Web Framework** | Gin Gonic |
| **Database Driver** | PGX (PostgreSQL) |
| **Database Access** | pgx v5 connection pool |
| **Authentication** | JWT + Bcrypt |
| **Payment Gateway** | Midtrans Go SDK |

---

## ✅ Prerequisites

Sebelum menjalankan aplikasi ini secara lokal, pastikan environment kamu telah memenuhi persyaratan berikut:

- **Go** versi 1.25.0 sesuai `go.mod` → [Download Go](https://go.dev/dl/)
- **PostgreSQL** aktif (lokal atau via Supabase)
- **Midtrans Account** dengan Server Key (Sandbox untuk development)

---

## 📁 Struktur Folder

Proyek mengadopsi variasi dari **Standard Go Project Layout** yang dipadukan dengan prinsip **Clean Architecture**.

```
backend/
├── cmd/
│   └── api/
│       └── main.go           # Entry point aplikasi
│
├── internal/                 # Kode internal (tidak bisa di-import eksternal)
│   ├── config/               # Konfigurasi app (Database, JWT, env loader)
│   ├── middleware/           # Middleware HTTP (JWT Auth, CORS, Logger)
│   │
│   ├── model/                # Entitas & DTO (structs) — inti domain
│   ├── repository/           # Lapisan akses data PostgreSQL melalui pgx
│   ├── usecase/              # Lapisan logika bisnis utama
│   └── handler/              # Lapisan HTTP/Transport (REST endpoint handlers)
│
├── pkg/                      # Database, response, storage, dan Midtrans
├── unit-test/                # Unit test repository/use case
├── docs/                     # Swagger (`swagger.yaml`, `swagger.json`)
├── .env.example              # Contoh variabel environment
├── go.mod                    # Definisi modul Go
└── go.sum                    # Checksum dependensi
```

### Alur Data (Clean Architecture)

```
HTTP Request → Handler → Usecase → Repository → Database
HTTP Response ← Handler ← Usecase ← Repository ←
```

Setiap lapisan hanya bergantung ke lapisan di dalamnya, tidak pernah ke luar.

---

## ⚙️ Environment Configuration

Buat file `.env` di root direktori `backend/` berdasarkan `.env.example`:

```env
# Database (Supabase / PostgreSQL) 
DB_HOST=
DB_PORT=5432
DB_USER=
DB_PASSWORD=
DB_NAME=

# Server
PORT=8080

# Authentication
JWT_SECRET=your_strong_secret_key_here

# Internal Service URL (untuk Docker/Server)
API_INTERNAL_URL=http://localhost:8080

# Midtrans Payment Gateway
MIDTRANS_SERVER_KEY=
MIDTRANS_IS_PRODUCTION=false

# Supabase Storage (foto profil dan migrasi gambar)
SUPABASE_URL=
SUPABASE_KEY=
SUPABASE_BUCKET=
```

> ⚠️ **Peringatan Keamanan:** File `.env` memuat informasi sensitif (credentials, secret keys). Pastikan file ini sudah masuk ke `.gitignore` dan **tidak pernah** di-commit ke repositori publik.

---

## 🚀 Getting Started

### 1. Masuk ke direktori backend

```bash
cd backend
```

### 2. Salin dan konfigurasi environment

```bash
cp .env.example .env
# Edit .env sesuai dengan kredensial kamu
```

### 3. Unduh dependensi

```bash
go mod tidy
```

### 4. Jalankan server

```bash
go run cmd/api/main.go
```

Server akan berjalan dan siap menerima request di **`http://localhost:8080`**.

### 5. Verifikasi server berjalan

```bash
curl http://localhost:8080/api/obat
# Seharusnya mengembalikan response JSON
```

---

## 📄 API Documentation

Spesifikasi lengkap seluruh endpoint API didokumentasikan menggunakan **OpenAPI 3.0** dan tersedia di:

```
backend/docs/swagger.yaml
```

### Cara Membuka Dokumentasi Secara Interaktif

**Opsi 1 — Swagger Editor (online):**
1. Buka [editor.swagger.io](https://editor.swagger.io/)
2. Import file `docs/swagger.yaml`

**Opsi 2 — Postman:**
1. Buka Postman → Import
2. Pilih file `docs/swagger.yaml`

### Ringkasan Endpoint dari `internal/handler/http/router.go`

Base URL lokal: `http://localhost:8080/api`. Endpoint bertanda **JWT** memerlukan header `Authorization: Bearer <token>`.

| Grup | Method | Endpoint | Akses | Deskripsi |
|------|--------|----------|-------|-----------|
| Auth | POST | `/api/users/register` | Publik | Registrasi user/member |
| Auth | POST | `/api/users/login` | Publik | Login dan memperoleh JWT |
| Profil | GET | `/api/users/profile` | JWT | Mengambil profil user aktif |
| Profil | PUT | `/api/users/profile` | JWT | Memperbarui profil user |
| Profil | PUT | `/api/users/foto` | JWT | Mengunggah foto profil |
| Obat | GET | `/api/obat` | Publik | Daftar seluruh obat |
| Obat | POST | `/api/obat` | Publik* | Membuat data obat |
| Obat | GET | `/api/obat/{id}` | Publik | Detail obat berdasarkan ID |
| Obat | PUT | `/api/obat/{id}` | Publik* | Memperbarui data obat |
| Obat | DELETE | `/api/obat/{id}` | Publik* | Menghapus data obat |
| Customer | GET | `/api/customer` | Publik* | Daftar customer |
| Customer | POST | `/api/customer` | Publik* | Membuat customer |
| Customer | GET | `/api/customer/{id}` | Publik* | Detail customer |
| Customer | PUT | `/api/customer/{id}` | Publik* | Memperbarui customer |
| Customer | DELETE | `/api/customer/{id}` | Publik* | Menghapus customer |
| Supplier | GET | `/api/supplier` | Publik* | Daftar supplier |
| Supplier | POST | `/api/supplier` | Publik* | Membuat supplier |
| Supplier | GET | `/api/supplier/{id}` | Publik* | Detail supplier |
| Supplier | PUT | `/api/supplier/{id}` | Publik* | Memperbarui supplier |
| Supplier | DELETE | `/api/supplier/{id}` | Publik* | Menghapus supplier |
| Transaksi | POST | `/api/transaksi` | JWT | Membuat transaksi/checkout |
| Transaksi | GET | `/api/transaksi` | JWT | Riwayat transaksi user aktif |
| Transaksi | GET | `/api/transaksi/{id}` | JWT | Detail transaksi |
| Transaksi | GET | `/api/transaksi/all` | Kasir/Admin | Seluruh transaksi |
| Transaksi | PUT | `/api/transaksi/{id}/batal` | Kasir/Admin | Membatalkan transaksi |
| Transaksi | PATCH | `/api/transaksi/{id}/status-pesanan` | Kasir/Admin | Memperbarui status pesanan |
| Payment | POST | `/api/checkout` | Publik* | Membuat token transaksi Midtrans Snap |
| Payment | POST | `/api/checkout/notification` | Midtrans webhook | Memproses notifikasi status Midtrans |
| Restock | POST | `/api/restock` | Publik* | Membuat restock obat |
| Migration | GET | `/api/migrate-images` | Publik* | Menjalankan migrasi gambar |

> **Catatan keamanan:** `Publik*` berarti route tersebut belum dipasangi middleware autentikasi pada `router.go`, bukan rekomendasi akses. Endpoint mutasi dan migrasi sebaiknya dilindungi sebelum deployment production.

---

## 🗄️ Database

- **Engine:** PostgreSQL
- **Hosting:** Supabase (cloud) atau lokal
- **Database access:** pgx v5 connection pool

Schema dan relasi antar tabel dapat dilihat di **Entity Relationship Diagram (ERD)** yang tersedia di:

```
../docs/ERD.png
```
