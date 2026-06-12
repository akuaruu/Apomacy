"use client";

import { useState, useEffect } from 'react';
import Cookies from "js-cookie";

// --- INTERFACE DATA DARI API ---
interface Transaksi {
  id_transaksi: number;
  no_transaksi: string;
  tanggal_transaksi: string;
  total_item: number;
  total_bayar: number;
  status: string;
  metode_pembayaran: string;
}

export default function PesananPage() {
  const [riwayatPesanan, setRiwayatPesanan] = useState<Transaksi[]>([]);
  const [tabAktif, setTabAktif] = useState('Semua');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // =====================================================================
  // 1. FETCH DATA DARI API BACKEND
  // =====================================================================
  useEffect(() => {
    const fetchRiwayat = async () => {
      try {
        const token = Cookies.get('apomacy_token');
        if (!token) throw new Error("Anda belum login. Silakan login terlebih dahulu.");

        // Memanggil API GET /api/transaksi (Menggunakan rute GetRiwayatUser di backend)
        const res = await fetch('/api/transaksi', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!res.ok) {
          throw new Error("Gagal mengambil riwayat pesanan dari server.");
        }

        const responseData = await res.json();
        setRiwayatPesanan(responseData.data || []);
      } catch (error: any) {
        console.error("Error fetching riwayat:", error);
        setErrorMsg(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRiwayat();
  }, []);

  // =====================================================================
  // 2. FUNGSI FORMATTING & UTILITIES
  // =====================================================================
  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
  };

  const formatTanggal = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-apomacy-light-blue/50 text-apomacy-blue border-apomacy-light-blue';
      case 'Selesai':
        return 'bg-apomacy-teal/20 text-apomacy-teal border-apomacy-teal/30';
      case 'Batal':
        return 'bg-apomacy-danger/10 text-apomacy-danger border-apomacy-danger/20';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  // Memfilter data berdasarkan status dari Golang (Selesai, Pending, Batal)
  const pesananDifilter = riwayatPesanan.filter(pesanan => {
    if (tabAktif === 'Semua') return true;
    if (tabAktif === 'Berlangsung') return pesanan.status === 'Pending';
    if (tabAktif === 'Selesai') return pesanan.status === 'Selesai';
    if (tabAktif === 'Dibatalkan') return pesanan.status === 'Batal';
    return false;
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
            onClick={() => setTabAktif(tab)}
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

      {/* Handling Loading & Error */}
      {isLoading && (
        <div className="text-center py-10">
          <p className="text-apomacy-muted-blue">Memuat riwayat pesanan...</p>
        </div>
      )}

      {errorMsg && !isLoading && (
        <div className="mb-6 p-4 bg-red-50 border border-red-500 text-red-700 rounded-lg">
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Daftar Pesanan (Card) */}
      {!isLoading && !errorMsg && (
        <div className="space-y-6">
          {pesananDifilter.length > 0 ? (
            pesananDifilter.map((pesanan) => (
              <div key={pesanan.id_transaksi} className="bg-apomacy-white border border-apomacy-border rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition duration-200">
                
                {/* Card Header (No Invoice & Status) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-apomacy-border bg-gray-50/50">
                  <div className="flex items-center gap-3 mb-3 sm:mb-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-apomacy-muted-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <div>
                      <span className="font-semibold text-apomacy-dark mr-2">{pesanan.no_transaksi}</span>
                      <span className="text-sm text-apomacy-muted-blue">• {formatTanggal(pesanan.tanggal_transaksi)}</span>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(pesanan.status)} inline-block self-start sm:self-auto`}>
                    {pesanan.status}
                  </div>
                </div>

                {/* Card Body (Summary Item) */}
                <div className="p-5">
                  <div className="flex justify-between items-center py-2">
                    <div className="flex items-center gap-4">
                      {/* Ikon Obat Placeholder */}
                      <div className="w-12 h-12 bg-apomacy-light-blue/30 rounded-lg flex items-center justify-center text-apomacy-blue/50 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-apomacy-dark">Paket Pesanan Obat</h4>
                        <p className="text-sm text-apomacy-muted-blue">Berisi {pesanan.total_item} produk • Pembayaran: {pesanan.metode_pembayaran}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer (Total Harga & Tombol Aksi) */}
                <div className="flex flex-col sm:flex-row items-center justify-between p-5 border-t border-apomacy-border bg-gray-50/30 gap-4">
                  <div>
                    <p className="text-sm text-apomacy-muted-blue">Total Belanja</p>
                    <p className="text-lg font-bold text-apomacy-blue">{formatRupiah(pesanan.total_bayar)}</p>
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
      )}

    </div>
  );
}