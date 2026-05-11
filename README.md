<p align="center">
  <img src="docs/Apomacy.png" alt="Apomacy Logo" width="200" />
</p>

# Apomacy - Platform Apotek Digital & Layanan Telemedisin Terintegrasi

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Go Version](https://img.shields.io/github/go-mod/go-version/akuaruu/Apomacy?filename=backend%2Fgo.mod)](https://go.dev/)
[![Next.js Version](https://img.shields.io/badge/Next.js-15.0+-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS Version](https://img.shields.io/badge/Tailwind_CSS-v4.0-blue?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

---

Apomacy adalah platform Fullstack Web yang dirancang sebagai solusi komprehensif untuk kebutuhan kesehatan masyarakat modern. Platform ini mengintegrasikan layanan e-commerce apotek (pembelian obat-obatan) dengan sistem booking telemedisin (konsultasi dokter online).

Proyek ini dibangun sebagai tugas skala menengah dengan standar industri, mengutamakan *skalabilitas*, *maintainability*, dan *Clean Architecture*.

## 📌 Daftar Isi

1. [Fitur Utama](#-fitur-utama)
2. [Arsitektur & Tech Stack](#-arsitektur--tech-stack)
3. [Struktur Folder (Clean Architecture)](#-struktur-folder-clean-architecture)
4. [Dokumentasi API & Database](#-dokumentasi-api--database)
5. [Kontribusi](#-kontribusi)
6. [Lisensi](#-lisensi)

---

## 🌟 Fitur Utama

- **Katalog Obat:** Penjelajahan produk obat dengan sistem grid yang responsif, pencarian, dan filter kategori.
- **Sistem Keranjang & Checkout:** Simulasi alur pembelian produk terintegrasi.
- **Telemedisin (Booking Dokter):** Pencarian profil dokter, filter berdasarkan spesialisasi, dan pemesanan jadwal konsultasi.
- **Dasbor Pasien:** Riwayat pembelian obat, riwayat konsultasi, dan pengelolaan profil akun.
- **Panel Admin:** Sistem CRUD (Create, Read, Update, Delete) untuk pengelolaan data produk obat dan pemantauan transaksi.

---

## 🛠️ Arsitektur & Tech Stack

Proyek ini menerapkan pemisahan *concern* yang jelas antara Frontend dan Backend untuk skalabilitas yang lebih baik.

### Frontend
- **Framework:** Next.js (App Router, TypeScript)
- **Styling:** Tailwind CSS (v4 - Configuration-less)
- **Data Fetching:** Axios

### Backend
- **Language:** Golang
- **Framework:** Gin Gonic
- **ORM:** GORM
- **Architecture Pattern:** Clean Architecture (Domain-Driven Design)

### Database
- **Database:** PostgreSQL (Supabase)

---

## 🤝 Kontribusi

Proyek ini bersifat terbuka untuk kontribusi pendidikan. Jika Anda ingin berkontribusi:

    Fork repositori ini.

    Buat branch fitur Anda.

    Commit perubahan Anda.

    Push ke branch tersebut.

    Buat Pull Request baru.

## 👥 Tim Pengembang (Maintained by)

    Member 1: [https://github.com/akuaruu](https://github.com/akuaruu)
    Member 2: [https://github.com/CupidStrom](https://github.com/CupidStrom)
    Member 3: [https://github.com/dzulmanromiealfikrhi](https://github.com/dzulmanromiealfikrhi)
    Member 4: [https://github.com/NakishiSelviar](https://github.com/NakishiSelviar)
    Member 5: [https://github.com/RexZone01](https://github.com/RexZone01)

## 📄 Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT - lihat file LICENSE untuk detailnya.