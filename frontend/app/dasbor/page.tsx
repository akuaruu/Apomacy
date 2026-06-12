"use client";

import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

// ============================================================
// DATA STATIS APOTEK
// ============================================================
const apotekStatis = [
  { id: 1, inisial: 'AK', nama: 'Apotek Kimia Farma', alamat: 'Jl. Ahmad Yani No. 12', kota: 'Magelang' },
  { id: 2, inisial: 'AS', nama: 'Apotek Sehat Sejahtera', alamat: 'Jl. Pemuda No. 45', kota: 'Magelang' },
  { id: 3, inisial: 'AM', nama: 'Apotek Mitra Husada', alamat: 'Jl. Tentara Pelajar No. 8', kota: 'Magelang' },
  { id: 4, inisial: 'AG', nama: 'Apotek Griya Sehat', alamat: 'Jl. Pahlawan No. 23', kota: 'Magelang' },
];

// ============================================================
// INTERFACES
// ============================================================
interface Transaksi {
  id_transaksi: number;
  no_transaksi: string;
  tanggal_transaksi: string;
  total_item: number;
  subtotal: number;
  total_bayar: number;
  metode_pembayaran: string;
  status: 'Selesai' | 'Pending' | 'Batal' | 'Menunggu Pembayaran';
}

interface UserProfile {
  id_user?: number;
  nama?: string;
  username?: string;
  email?: string;
  telepon?: string;
  alamat?: string;
  tanggalLahir?: string;
  fotoProfil?: string;
}

// ============================================================
// PROFILE COMPLETION HELPER
// ============================================================
// Disesuaikan dengan data yang ada di halaman profil
const PROFILE_FIELDS: (keyof UserProfile)[] = [
  'nama',
  'telepon',
  'alamat',
  'tanggalLahir',
  'fotoProfil',
];

const hitungKelengkapan = (profile: UserProfile): number => {
  const terisi = PROFILE_FIELDS.filter((field) => {
    const val = profile[field];
    return val !== null && val !== undefined && String(val).trim() !== '';
  }).length;
  return Math.round((terisi / PROFILE_FIELDS.length) * 100);
};

export default function DasborPage() {
  // STATE
  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);
  const [loadingTransaksi, setLoadingTransaksi] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // DERIVED VALUES
  // Disesuaikan dengan status backend (Pending, Selesai, Batal)
  const pesananAktif = transaksi.filter((t) => t.status === 'Pending' || t.status === 'Menunggu Pembayaran');
  const aktivitasTerakhir = transaksi.slice(0, 3);
  const persentaseProfil = profile ? hitungKelengkapan(profile) : null;

  // HELPER FUNCTIONS
  const formatTanggal = (iso: string) =>
    new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

  const formatRupiah = (angka: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);

  // FETCH DATA SAAT HALAMAN DIMUAT
  useEffect(() => {
    const fetchDashboardData = async () => {
      // 1. Ambil Token dengan nama kunci yang benar
      const token = Cookies.get('apomacy_token');
      if (!token) {
        setLoadingTransaksi(false);
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      try {
        // 2. Fetch Riwayat Transaksi (Persis seperti di Riwayat Obat)
        const resTx = await fetch('/api/transaksi', { method: 'GET', headers });
        if (resTx.ok) {
          const txData = await resTx.json();
          setTransaksi(txData.data || []);
        }

        // 3. Fetch Profil (Persis seperti di Edit Profil)
        const resProfile = await fetch('/api/users/profile', { method: 'GET', headers });
        if (resProfile.ok) {
          const profileData = await resProfile.json();
          setProfile(profileData.data);
        }
      } catch (error) {
        console.error('Gagal memuat data dasbor:', error);
      } finally {
        setLoadingTransaksi(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="max-w-5xl mx-auto pb-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-apomacy-blue">RINGKASAN DASBOR</h1>
        <p className="text-apomacy-muted-blue mt-1">Pantau aktivitas kesehatan dan pesanan obat Anda di sini.</p>
      </div>

      {/* Grid 2 Kolom untuk Kartu Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

        {/* Card 1: Pesanan Obat */}
        <div className="bg-apomacy-white p-6 rounded-xl shadow-sm border border-apomacy-border flex flex-col hover:border-apomacy-teal transition">
          <h3 className="text-apomacy-muted-blue text-sm font-medium">Pesanan Obat Aktif</h3>
          <p className="text-3xl font-bold text-apomacy-blue mt-2">
            {loadingTransaksi ? '...' : pesananAktif.length}
          </p>
          <a href="/dasbor/riwayat-obat" className="text-sm text-apomacy-teal font-medium hover:underline mt-4">
            Lihat detail pesanan &rarr;
          </a>
        </div>

        {/* Card 2: Kelengkapan Profil */}
        <div className="bg-apomacy-white p-6 rounded-xl shadow-sm border border-apomacy-border flex flex-col hover:border-apomacy-teal transition">
          <h3 className="text-apomacy-muted-blue text-sm font-medium">Kelengkapan Profil</h3>
          <p className="text-3xl font-bold text-apomacy-teal mt-2">
            {persentaseProfil === null ? '...' : `${persentaseProfil}%`}
          </p>
          {persentaseProfil !== null && persentaseProfil < 100 && (
            <p className="text-xs text-apomacy-muted-blue mt-1">
              {PROFILE_FIELDS.length - Math.round((persentaseProfil / 100) * PROFILE_FIELDS.length)} data belum diisi
            </p>
          )}
          <a href="/dasbor/profil" className="text-sm text-apomacy-muted-blue hover:text-apomacy-blue hover:underline mt-4">
            {persentaseProfil === 100 ? 'Lihat profil →' : 'Lengkapi profil →'}
          </a>
        </div>

      </div>

      {/* Aktivitas Terakhir (Dinamis dari Backend) */}
      <div className="bg-apomacy-white p-6 rounded-xl shadow-sm border border-apomacy-border mb-8">
        <h3 className="text-lg font-bold text-apomacy-blue mb-4">Aktivitas Terakhir</h3>

        {loadingTransaksi ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : aktivitasTerakhir.length === 0 ? (
          <p className="text-sm text-apomacy-muted-blue py-4 text-center">Belum ada aktivitas transaksi.</p>
        ) : (
          aktivitasTerakhir.map((trx) => (
            <div key={trx.id_transaksi} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
              <div>
                <p className="font-medium text-apomacy-dark">{trx.no_transaksi}</p>
                <p className="text-sm text-apomacy-muted-blue">
                  {formatTanggal(trx.tanggal_transaksi)} · {formatRupiah(trx.total_bayar)}
                </p>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${trx.status === 'Selesai'
                ? 'bg-apomacy-teal/20 text-apomacy-teal'
                : trx.status === 'Batal'
                  ? 'bg-red-50 text-red-500'
                  : 'bg-apomacy-light-blue/30 text-apomacy-blue'
                }`}>
                {trx.status}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Jaringan Apotek Mitra (Statis) */}
      <div className="bg-apomacy-white p-6 rounded-xl shadow-sm border border-apomacy-border">
        <h3 className="text-lg font-bold text-apomacy-blue border-l-4 border-apomacy-teal pl-2 mb-2">
          Jaringan Apotek Mitra Terdekat
        </h3>
        <p className="text-sm text-apomacy-muted-blue mb-6">
          Menampilkan apotek mitra terdekat di area Anda.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {apotekStatis.map((apotek) => (
            <div
              key={apotek.id}
              className="p-4 border border-apomacy-border rounded-xl hover:border-apomacy-teal hover:shadow-md transition duration-200 bg-gray-50/50 flex gap-3 items-start"
            >
              <div className="w-10 h-10 rounded-lg bg-apomacy-light-blue/50 flex items-center justify-center shrink-0">
                <span className="text-apomacy-blue font-bold">{apotek.inisial}</span>
              </div>
              <div className="overflow-hidden w-full">
                <h4 className="font-bold text-apomacy-dark text-sm truncate">{apotek.nama}</h4>
                <p className="text-xs text-apomacy-muted-blue mt-0.5 truncate">{apotek.alamat}, {apotek.kota}</p>
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-200/60">
                  <span className="text-xs font-medium text-apomacy-teal">Tersedia</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}