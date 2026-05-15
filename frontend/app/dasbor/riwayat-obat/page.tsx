"use client";

import { useState } from 'react';

// --- DATA DUMMY (Nanti bisa diganti dengan data dari database/API backend Anda) ---
const riwayatPesanan = [
  {
    id: "APO-231024-001",
    tanggal: "24 Okt 2023",
    status: "Dikirim",
    total: 85000,
    produk: [
      { nama: "Paracetamol 500mg - Strip", jumlah: 2, harga: 15000 },
      { nama: "Vitamin C 1000mg - Botol", jumlah: 1, harga: 55000 }
    ]
  },
  {
    id: "APO-231018-042",
    tanggal: "18 Okt 2023",
    status: "Selesai",
    total: 120000,
    produk: [
      { nama: "Imboost Force - Strip", jumlah: 2, harga: 60000 }
    ]
  },
  {
    id: "APO-230905-112",
    tanggal: "05 Sep 2023",
    status: "Selesai",
    total: 45000,
    produk: [
      { nama: "Mylanta Sirup 50ml", jumlah: 1, harga: 45000 }
    ]
  },
  {
    id: "APO-230820-088",
    tanggal: "20 Agu 2023",
    status: "Dibatalkan",
    total: 25000,
    produk: [
      { nama: "Betadine Antiseptic 15ml", jumlah: 1, harga: 25000 }
    ]
  }
];

export default function PesananPage() {
  // State untuk filter tab aktif
  const [tabAktif, setTabAktif] = useState('Semua');

  // Fungsi untuk memformat angka menjadi Rupiah
  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
  };

  // Fungsi untuk menentukan warna badge status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Dikirim':
      case 'Diproses':
        return 'bg-apomacy-light-blue/50 text-apomacy-blue border-apomacy-light-blue';
      case 'Selesai':
        return 'bg-apomacy-teal/20 text-apomacy-teal border-apomacy-teal/30';
      case 'Dibatalkan':
        return 'bg-apomacy-danger/10 text-apomacy-danger border-apomacy-danger/20';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  // Memfilter data berdasarkan tab yang diklik
  const pesananDifilter = riwayatPesanan.filter(pesanan => {
    if (tabAktif === 'Semua') return true;
    if (tabAktif === 'Berlangsung') return pesanan.status === 'Dikirim' || pesanan.status === 'Diproses';
    return pesanan.status === tabAktif;
  });

  return (
    <div className="max-w-5xl mx-auto pb-10">
      
      {/* Header Halaman */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-apomacy-blue">Riwayat Pesanan Obat</h1>
        <p className="text-apomacy-muted-blue mt-1">Pantau status pengiriman dan lihat riwayat belanja obat Anda.</p>
      </div>

     {/* Tab Filter */}
      <div className="flex space-x-2 border-b border-apomacy-border mb-6 overflow-x-auto pb-px">
        {['Semua', 'Berlangsung', 'Selesai', 'Dibatalkan'].map((tab) => (
          <button
            key={tab}
            onClick={() => setTabAktif(tab)} // <-- BAGIAN INI YANG MEMBUATNYA BISA DIKLIK
            className={`px-5 py-3 font-medium text-sm transition-colors whitespace-nowrap border-b-2 ${
              tabAktif === tab
                ? 'border-apomacy-teal text-apomacy-teal'
                : 'border-transparent text-apomacy-muted-blue hover:text-apomacy-blue hover:border-apomacy-border'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Daftar Pesanan (Card) */}
      <div className="space-y-6">
        {pesananDifilter.length > 0 ? (
          pesananDifilter.map((pesanan) => (
            <div key={pesanan.id} className="bg-apomacy-white border border-apomacy-border rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition duration-200">
              
              {/* Card Header (No Invoice & Status) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-apomacy-border bg-gray-50/50">
                <div className="flex items-center gap-3 mb-3 sm:mb-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-apomacy-muted-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <div>
                    <span className="font-semibold text-apomacy-dark mr-2">{pesanan.id}</span>
                    <span className="text-sm text-apomacy-muted-blue">• {pesanan.tanggal}</span>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(pesanan.status)} inline-block self-start sm:self-auto`}>
                  {pesanan.status}
                </div>
              </div>

              {/* Card Body (Daftar Produk) */}
              <div className="p-5">
                {pesanan.produk.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2">
                    <div className="flex items-center gap-4">
                      {/* Placeholder Gambar Produk */}
                      <div className="w-12 h-12 bg-apomacy-light-blue/30 rounded-lg flex items-center justify-center text-apomacy-blue/50 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-apomacy-dark">{item.nama}</h4>
                        <p className="text-sm text-apomacy-muted-blue">{item.jumlah} x {formatRupiah(item.harga)}</p>
                      </div>
                    </div>
                    <div className="font-medium text-apomacy-dark">
                      {formatRupiah(item.jumlah * item.harga)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Card Footer (Total Harga & Tombol Aksi) */}
              <div className="flex flex-col sm:flex-row items-center justify-between p-5 border-t border-apomacy-border bg-gray-50/30 gap-4">
                <div>
                  <p className="text-sm text-apomacy-muted-blue">Total Belanja</p>
                  <p className="text-lg font-bold text-apomacy-blue">{formatRupiah(pesanan.total)}</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <button className="flex-1 sm:flex-none px-4 py-2 border border-apomacy-border text-apomacy-dark text-sm font-medium rounded-lg hover:bg-gray-100 transition">
                    Lihat Detail
                  </button>
                  {pesanan.status === 'Selesai' && (
                    <button className="flex-1 sm:flex-none px-4 py-2 bg-apomacy-teal text-white text-sm font-medium rounded-lg hover:bg-teal-600 transition shadow-sm">
                      Beli Lagi
                    </button>
                  )}
                  {pesanan.status === 'Dikirim' && (
                    <button className="flex-1 sm:flex-none px-4 py-2 bg-apomacy-blue text-white text-sm font-medium rounded-lg hover:bg-apomacy-dark transition shadow-sm">
                      Lacak Pesanan
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))
        ) : (
          /* Tampilan Jika Kosong */
          <div className="text-center py-16 bg-apomacy-white border border-apomacy-border rounded-2xl">
            <div className="w-20 h-20 bg-apomacy-light-blue/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-apomacy-blue/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-apomacy-dark">Belum ada pesanan</h3>
            <p className="text-apomacy-muted-blue mt-1">Anda belum memiliki riwayat pesanan dengan status ini.</p>
          </div>
        )}
      </div>

    </div>
  );
}