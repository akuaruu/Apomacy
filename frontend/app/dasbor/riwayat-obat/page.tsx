"use client";

import { useState, useEffect } from 'react';
import Cookies from "js-cookie";

// --- INTERFACE DATA DARI API ---
interface DetailTransaksi {
  id_detail_trx: number;
  id_obat: number;
  nama_obat: string;
  harga_satuan: number;
  qty: number;
  subtotal: number;
}

interface Transaksi {
  id_transaksi: number;
  no_transaksi: string;
  tanggal_transaksi: string;
  total_item: number;
  subtotal: number;
  total_bayar: number;
  status: string;
  metode_pembayaran: string;
  // Field details akan terisi saat melakukan fetch GetDetail
  Details?: DetailTransaksi[];
  details?: DetailTransaksi[]; // Fallback jika json tag huruf kecil
}

export default function PesananPage() {
  const [riwayatPesanan, setRiwayatPesanan] = useState<Transaksi[]>([]);
  const [tabAktif, setTabAktif] = useState('Semua');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // --- STATE UNTUK MODAL DETAIL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaksi, setSelectedTransaksi] = useState<Transaksi | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // =====================================================================
  // 1. FETCH DATA DARI API BACKEND
  // =====================================================================
  useEffect(() => {
    const fetchRiwayat = async () => {
      try {
        const token = Cookies.get('apomacy_token');
        if (!token) throw new Error("Anda belum login. Silakan login terlebih dahulu.");

        const res = await fetch('/api/transaksi', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!res.ok) throw new Error("Gagal mengambil riwayat pesanan dari server.");

        const responseData = await res.json();
        setRiwayatPesanan(responseData.data || []);
      } catch (error: any) {
        setErrorMsg(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRiwayat();
  }, []);

  // =====================================================================
  // 2. FUNGSI FETCH DETAIL POPUP
  // =====================================================================
  const handleLihatDetail = async (idTransaksi: number) => {
    // Buka modal segera dan set loading agar terasa cepat/responsif
    setIsModalOpen(true);
    setIsDetailLoading(true);
    setSelectedTransaksi(null);

    try {
      const token = Cookies.get('apomacy_token');
      // Memanggil endpoint GetDetail yang sudah ada di Golang
      const res = await fetch(`/api/transaksi/${idTransaksi}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Gagal mengambil detail transaksi");

      const resData = await res.json();
      setSelectedTransaksi(resData.data);
    } catch (error) {
      console.error(error);
      alert("Gagal memuat detail pesanan.");
      setIsModalOpen(false);
    } finally {
      setIsDetailLoading(false);
    }
  };

  // =====================================================================
  // 3. FUNGSI FORMATTING & UTILITIES
  // =====================================================================
  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
  };

  const formatTanggal = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-apomacy-light-blue/50 text-apomacy-blue border-apomacy-light-blue';
      case 'Selesai': return 'bg-apomacy-teal/20 text-apomacy-teal border-apomacy-teal/30';
      case 'Batal': return 'bg-apomacy-danger/10 text-apomacy-danger border-apomacy-danger/20';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const pesananDifilter = riwayatPesanan.filter(pesanan => {
    if (tabAktif === 'Semua') return true;
    if (tabAktif === 'Berlangsung') return pesanan.status === 'Pending';
    if (tabAktif === 'Selesai') return pesanan.status === 'Selesai';
    if (tabAktif === 'Dibatalkan') return pesanan.status === 'Batal';
    return false;
  });

  return (
    <div className="max-w-5xl mx-auto pb-10 relative">
      {/* --- HEADER & TABS (Tetap Sama) --- */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-apomacy-blue">Riwayat Pesanan Obat</h1>
        <p className="text-apomacy-muted-blue mt-1">Pantau status pengiriman dan lihat riwayat belanja obat Anda.</p>
      </div>

      <div className="flex space-x-2 border-b border-apomacy-border mb-6 overflow-x-auto pb-px">
        {['Semua', 'Berlangsung', 'Selesai', 'Dibatalkan'].map((tab) => (
          <button
            key={tab}
            onClick={() => setTabAktif(tab)}
            className={`px-5 py-3 font-medium text-sm transition-colors whitespace-nowrap border-b-2 ${tabAktif === tab
                ? 'border-apomacy-teal text-apomacy-teal'
                : 'border-transparent text-apomacy-muted-blue hover:text-apomacy-blue hover:border-apomacy-border'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {isLoading && <div className="text-center py-10 text-apomacy-muted-blue">Memuat riwayat pesanan...</div>}
      {errorMsg && !isLoading && <div className="mb-6 p-4 bg-red-50 border border-red-500 text-red-700 rounded-lg">{errorMsg}</div>}

      {/* --- DAFTAR PESANAN --- */}
      {!isLoading && !errorMsg && (
        <div className="space-y-6">
          {pesananDifilter.length > 0 ? (
            pesananDifilter.map((pesanan) => (
              <div key={pesanan.id_transaksi} className="bg-apomacy-white border border-apomacy-border rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-apomacy-border bg-gray-50/50">
                  <div className="flex items-center gap-3 mb-3 sm:mb-0">
                    <div className="font-semibold text-apomacy-dark">{pesanan.no_transaksi}</div>
                    <div className="text-sm text-apomacy-muted-blue">• {formatTanggal(pesanan.tanggal_transaksi)}</div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(pesanan.status)} inline-block`}>
                    {pesanan.status}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between p-5 bg-gray-50/30 gap-4">
                  <div>
                    <p className="text-sm text-apomacy-muted-blue">Total Belanja</p>
                    <p className="text-lg font-bold text-apomacy-blue">{formatRupiah(pesanan.total_bayar)}</p>
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    {/* TRIGGER MODAL DI SINI */}
                    <button
                      onClick={() => handleLihatDetail(pesanan.id_transaksi)}
                      className="flex-1 sm:flex-none px-4 py-2 border border-apomacy-border text-apomacy-dark text-sm font-medium rounded-lg hover:bg-gray-100 transition"
                    >
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
            <div className="text-center py-16 text-apomacy-muted-blue">Belum ada pesanan</div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. MODAL POPUP DETAIL TRANSAKSI */}
      {/* ===================================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden transform transition-all flex flex-col max-h-[90vh]">

            {/* Header Modal */}
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-apomacy-dark">Detail Transaksi</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body Modal (Bisa di-scroll jika item banyak) */}
            <div className="p-5 overflow-y-auto">
              {isDetailLoading ? (
                <div className="flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-apomacy-teal"></div>
                </div>
              ) : selectedTransaksi ? (
                <div className="space-y-6">
                  {/* Info Dasar */}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">No. Invoice</span>
                    <span className="font-semibold text-apomacy-dark">{selectedTransaksi.no_transaksi}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tanggal Pembelian</span>
                    <span className="font-semibold text-apomacy-dark">{formatTanggal(selectedTransaksi.tanggal_transaksi)}</span>
                  </div>

                  <hr className="border-gray-100" />

                  {/* Daftar Obat */}
                  <div>
                    <h4 className="font-semibold text-apomacy-dark mb-3">Rincian Produk</h4>
                    <div className="space-y-4">
                      {/* Mapping details dari backend Golang (menyesuaikan case huruf) */}
                      {(selectedTransaksi.Details || selectedTransaksi.details || []).map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm text-gray-800">{item.nama_obat}</p>
                            <p className="text-xs text-gray-500">{item.qty} x {formatRupiah(item.harga_satuan)}</p>
                          </div>
                          <span className="font-medium text-sm text-gray-800">{formatRupiah(item.subtotal)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  {/* Ringkasan Pembayaran */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-apomacy-dark mb-2">Rincian Pembayaran</h4>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Metode Pembayaran</span>
                      <span className="font-medium text-apomacy-dark">{selectedTransaksi.metode_pembayaran}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal Produk</span>
                      <span className="font-medium text-gray-800">{formatRupiah(selectedTransaksi.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-100">
                      <span className="text-apomacy-dark">Total Belanja</span>
                      <span className="text-apomacy-blue">{formatRupiah(selectedTransaksi.total_bayar)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">Data tidak ditemukan.</div>
              )}
            </div>

            {/* Footer Modal */}
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full py-2.5 bg-apomacy-teal text-white rounded-xl font-medium hover:bg-teal-600 transition"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}