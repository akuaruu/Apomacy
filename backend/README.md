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
| **Language** | Golang (v1.22.0+) |
| **Web Framework** | Gin Gonic |
| **Database Driver** | PGX (PostgreSQL) |
| **ORM** | GORM |
| **Authentication** | JWT + Bcrypt |
| **Payment Gateway** | Midtrans Go SDK |

---

## ✅ Prerequisites

Sebelum menjalankan aplikasi ini secara lokal, pastikan environment kamu telah memenuhi persyaratan berikut:

- **Go** versi 1.22.0 atau lebih baru → [Download Go](https://go.dev/dl/)
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
│   ├── repository/           # Lapisan akses data (query SQL/GORM)
│   ├── usecase/              # Lapisan logika bisnis utama
│   └── handler/              # Lapisan HTTP/Transport (REST endpoint handlers)
│
├── pkg/                      # Utilitas yang bisa dipakai ulang (opsional)
├── docs/                     # Dokumentasi API (OpenAPI/Swagger spec)
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

### Ringkasan Endpoint

| Tag       | Method | Endpoint                     | Deskripsi                         |
|---------- |--------|------------------------------|-----------------------------------|
| Auth      | POST   | `/api/users/register`        | Registrasi user baru              |
| Auth      | POST   | `/api/users/login`           | Login dan mendapatkan JWT token   |
| Obat      | GET    | `/api/obat`                  | Ambil semua data obat             |
| Obat      | POST   | `/api/obat`                  | Tambah obat baru                  |
| Obat      | GET    | `/api/obat/{id}`             | Detail obat                       |
| Obat      | PUT    | `/api/obat/{id}`             | Update obat                       |
| Obat      | DELETE | `/api/obat/{id}`             | Hapus obat                        |
| Customer  | GET    | `/api/customer`              | Ambil semua pelanggan             |
| Customer  | POST   | `/api/customer`              | Daftarkan pelanggan baru          |
| Customer  | GET    | `/api/customer/{id}`         | Detail pelanggan                  |
| Customer  | PUT    | `/api/customer/{id}`         | Update pelanggan                  |
| Supplier  | GET    | `/api/supplier`              | Ambil semua supplier              |
| Supplier  | POST   | `/api/supplier`              | Tambah supplier baru              |
| Supplier  | GET    | `/api/supplier/{id}`         | Detail supplier                   |
| Supplier  | PUT    | `/api/supplier/{id}`         | Update supplier                   |
| Supplier  | DELETE | `/api/supplier/{id}`         | Hapus supplier                    |
| Transaksi | POST   | `/api/transaksi`             | Update pelanggan                  |
| Transaksi | GET    | `/api/transaksi/{id}`        | Ambil semua supplier              |
| Transaksi | PUT    | `/api/transaksi/{id}/batal`  | Tambah supplier baru              |
| Payment   | POST   | `/api/checkout`              | Payment & midtrans token          |
| Restock   | POST   | `/api/restock`               | Tambah data restock barang        |

---

## 🗄️ Database

- **Engine:** PostgreSQL
- **Hosting:** Supabase (cloud) atau lokal
- **ORM:** GORM dengan auto-migrate

Schema dan relasi antar tabel dapat dilihat di **Entity Relationship Diagram (ERD)** yang tersedia di:

```
../docs/ERD.png
```