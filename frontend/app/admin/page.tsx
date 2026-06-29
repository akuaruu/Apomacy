"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  DollarSign,
  Users,
  ShoppingCart,
  Plus,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
} from "lucide-react";
import Cookies from "js-cookie";

import StatCard from "@/components/admin/StatCard";
// Pastikan komponen SalesAnalytics ini sudah kamu update dengan kode yang aku kasih sebelumnya
import SalesAnalytics from "@/components/admin/SalesAnalytics";

// --- Typescript Interfaces ---
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
  id_user: number;
  no_transaksi: string;
  tanggal_transaksi: string;
  total_bayar: number;
  status: string;
  status_pesanan: string;
  details: DetailTransaksi[];
}

interface Obat {
  id_obat: number;
  nama_obat: string;
  satuan: string;
  stok: number;
  stok_minimum: number;
  expired_date: string;
}

export default function DashboardPage() {
  // --- States ---
  const [transactions, setTransactions] = useState<Transaksi[]>([]);
  const [obatList, setObatList] = useState<Obat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- Fetching Logic ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = Cookies.get("apomacy_token");

        if (!token) {
          throw new Error("Sesi tidak valid. Silakan login kembali.");
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        // Fetch API Transaksi dan Obat secara bersamaan
        const [resTrx, resObat] = await Promise.all([
          fetch(`/api/transaksi/all`, { headers }),
          fetch(`/api/obat`, { headers }),
        ]);

        if (!resTrx.ok) {
          if (resTrx.status === 401 || resTrx.status === 403) throw new Error("Akses ditolak. Anda tidak memiliki izin.");
          throw new Error("Gagal mengambil data transaksi");
        }
        if (!resObat.ok) throw new Error("Gagal mengambil data obat");

        const dataTrx = await resTrx.json();
        const dataObat = await resObat.json();

        setTransactions(dataTrx.data || []);
        setObatList(dataObat.data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // --- DERIVED DATA & CALCULATIONS ---
  const currentDate = new Date();

  // 1. Kalkulasi Statistik Utama
  const totalPendapatan = transactions
    .filter((tx) => tx.status === "Selesai")
    .reduce((acc, tx) => acc + tx.total_bayar, 0);

  const totalPesanan = transactions.length;
  const totalPelangganUnik = new Set(transactions.map((tx) => tx.id_user)).size;

  // 2. Kalkulasi Obat Terlaris (Bulan Ini)
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Buat dictionary satuan obat untuk tampilan (BOX, STRIP, BOTOL, dll)
  const satuanMap: Record<string, string> = {};
  obatList.forEach((o) => {
    satuanMap[o.nama_obat] = o.satuan || "UNIT";
  });

  const medicineStats: Record<string, { qty: number; revenue: number; satuan: string }> = {};

  transactions.forEach((tx) => {
    const txDate = new Date(tx.tanggal_transaksi);
    if (
      tx.status === "Selesai" &&
      txDate.getMonth() === currentMonth &&
      txDate.getFullYear() === currentYear
    ) {
      tx.details?.forEach((detail) => {
        if (!medicineStats[detail.nama_obat]) {
          medicineStats[detail.nama_obat] = {
            qty: 0,
            revenue: 0,
            satuan: satuanMap[detail.nama_obat] || "UNIT",
          };
        }
        medicineStats[detail.nama_obat].qty += detail.qty;
        medicineStats[detail.nama_obat].revenue += detail.subtotal;
      });
    }
  });

  const topSellingData = Object.entries(medicineStats)
    .map(([nama, stats]) => ({ nama, ...stats }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 3); // Ambil 3 teratas

  // 3. Kalkulasi Data Analitik Penjualan untuk Chart
  // --- A. Data Mingguan ---
  const currentDayOfWeek = currentDate.getDay(); 
  const distanceToMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1; 
  const mondayThisWeek = new Date(currentDate);
  mondayThisWeek.setDate(currentDate.getDate() - distanceToMonday);
  mondayThisWeek.setHours(0, 0, 0, 0);

  const weeklySalesData = [0, 0, 0, 0, 0, 0, 0]; 
  
  // --- B. Data Bulanan ---
  const monthlySalesData = new Array(12).fill(0); // 12 bulan (Jan - Des)

  transactions.forEach((tx) => {
    if (tx.status === "Selesai") {
      const txDate = new Date(tx.tanggal_transaksi);
      
      // Hitung untuk Mingguan
      if (txDate >= mondayThisWeek) {
        const dayDiff = Math.floor((txDate.getTime() - mondayThisWeek.getTime()) / (1000 * 60 * 60 * 24));
        if (dayDiff >= 0 && dayDiff < 7) {
          weeklySalesData[dayDiff] += tx.total_bayar;
        }
      }

      // Hitung untuk Bulanan (di tahun yang sama)
      if (txDate.getFullYear() === currentYear) {
        const monthIndex = txDate.getMonth(); // 0 = Jan, 11 = Des
        monthlySalesData[monthIndex] += tx.total_bayar;
      }
    }
  });

  // 4. Pemetaan Pesanan Terbaru
  const recentOrdersMapped = transactions.map((tx) => {
    const mainMedicine =
      tx.details && tx.details.length > 0
        ? tx.details.length > 1
          ? `${tx.details[0].nama_obat} +${tx.details.length - 1} lainnya`
          : tx.details[0].nama_obat
        : "Tidak ada rincian";

    return {
      id: tx.no_transaksi,
      medicine: mainMedicine,
      price: tx.total_bayar,
      status: tx.status,
    };
  });

  const totalPages = Math.ceil(recentOrdersMapped.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = recentOrdersMapped.slice(indexOfFirstItem, indexOfLastItem);

  // 5. Peringatan Stok
  const stokMenipis = obatList
    .filter((o) => o.stok <= o.stok_minimum)
    .map((o) => {
      const isKritis = o.stok <= o.stok_minimum / 2 || o.stok === 0;
      return {
        nama: o.nama_obat,
        sisa: o.stok,
        status: isKritis ? "Kritis" : "Menipis",
      };
    })
    .sort((a, b) => a.sisa - b.sisa)
    .slice(0, 5);

  // 6. Peringatan Expired (3 Bulan ke depan)
  const threeMonthsLater = new Date();
  threeMonthsLater.setMonth(currentDate.getMonth() + 3);

  const obatExpired = obatList
    .filter((o) => new Date(o.expired_date) <= threeMonthsLater)
    .map((o) => {
      const expDate = new Date(o.expired_date);
      const diffTime = expDate.getTime() - currentDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const diffMonths = Math.ceil(diffDays / 30);

      let status = "";
      if (diffDays <= 0) status = "Kritis";
      else if (diffMonths <= 1) status = "1 Bulan";
      else status = `${diffMonths} Bulan`;

      return {
        nama: o.nama_obat,
        date: expDate.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
        status: status,
        diffDays: diffDays,
      };
    })
    .sort((a, b) => a.diffDays - b.diffDays)
    .slice(0, 5);

  // --- Render Loading & Error States ---
  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-apomacy-primary">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm font-bold animate-pulse">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[80vh] items-center justify-center p-8">
        <div className="bg-discount-red/10 border border-discount-red text-discount-red p-6 rounded-2xl max-w-md text-center space-y-3">
          <AlertTriangle size={32} className="mx-auto" />
          <h2 className="font-black text-lg">Gagal Memuat Dashboard</h2>
          <p className="text-sm font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto pb-10">
      {/* HEADER PAGE */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-apomacy-dark">
            Dashboard Admin
          </h1>
          <p className="mt-1 text-sm text-apomacy-muted font-medium">
            Pantau aktivitas penjualan dan operasional apotek hari ini.
          </p>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <StatCard
          label="Total Keuntungan"
          value={`Rp ${totalPendapatan.toLocaleString("id-ID")}`}
          isHighlight={true}
          icon={<DollarSign size={20} className="text-white" />}
        />
        <StatCard
          label="Total Pelanggan"
          value={totalPelangganUnik.toLocaleString("id-ID")}
          icon={<Users size={20} className="text-apomacy-dark" />}
        />
        <StatCard
          label="Total Pesanan"
          value={totalPesanan.toLocaleString("id-ID")}
          icon={<ShoppingCart size={20} className="text-apomacy-dark" />}
        />
      </div>

      {/* ANALYTICS & TOP SELLING */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-stretch">
        
        {/* Sales Analytics Chart */}
        <div className="lg:col-span-2">
          {/* Kirim weeklySalesData dan monthlySalesData sebagai props agar bisa dirender chart */}
          <SalesAnalytics 
            weeklyData={weeklySalesData} 
            monthlyData={monthlySalesData} 
          />
        </div>

        {/* Obat Terlaris */}
        <div className="lg:col-span-1 rounded-3xl border border-outline-variant bg-white shadow-sm p-6 flex flex-col h-full">
          <div className="mb-6">
            <h2 className="text-xl font-black text-apomacy-dark">Obat Terlaris</h2>
            <p className="text-sm text-outline mt-1 font-medium">Berdasarkan kuantitas penjualan bulan ini</p>
          </div>
          <div className="space-y-4 flex-1">
            {topSellingData.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-apomacy-dark text-white flex items-center justify-center font-black text-sm shadow-sm">
                    #{i + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-apomacy-dark text-[15px]">{item.nama}</h3>
                    <p className="text-xs mt-1">
                      <span className="font-black text-apomacy-primary">{item.qty.toLocaleString("id-ID")} {item.satuan.toUpperCase()}</span>
                      <span className="text-outline font-medium"> terjual</span>
                    </p>
                  </div>
                </div>
                <div className="font-black text-apomacy-dark text-[15px]">
                  Rp {item.revenue.toLocaleString("id-ID")}
                </div>
              </div>
            ))}
            {topSellingData.length === 0 && (
              <div className="text-center py-8 text-outline text-sm font-medium h-full flex items-center justify-center">
                Belum ada penjualan bulan ini.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ALERTS & RECENT ORDERS GRID */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-stretch">
        {/* KOLOM KIRI: Tabel Pesanan Terbaru */}
        <div className="lg:col-span-2 rounded-3xl border border-outline-variant bg-white shadow-sm overflow-hidden flex flex-col h-full">
          <div className="flex items-center justify-between border-b border-outline-variant px-6 py-5">
            <h2 className="text-base font-black text-apomacy-dark">
              Pesanan Terbaru
            </h2>
            <Link
              href="/admin/transaksi"
              className="text-xs font-bold text-apomacy-primary hover:text-apomacy-dark flex items-center gap-1 transition-colors"
            >
              Lihat Semua Transaksi <ArrowRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-container-low text-left text-[11px] font-bold uppercase tracking-widest text-outline border-b border-outline-variant/50">
                  <th className="px-6 py-4">No Transaksi</th>
                  <th className="px-6 py-4">Nama Obat</th>
                  <th className="px-6 py-4">Total Harga</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {currentOrders.length > 0 ? (
                  currentOrders.map((tx) => (
                    <tr
                      key={tx.id}
                      className="hover:bg-surface-container-low/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono font-bold text-outline-variant">
                        {tx.id}
                      </td>
                      <td className="px-6 py-4 font-bold text-apomacy-dark">
                        {tx.medicine}
                      </td>
                      <td className="px-6 py-4 font-bold text-apomacy-dark">
                        Rp {tx.price.toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold 
                          ${
                            tx.status === "Selesai"
                              ? "bg-apomacy-teal/10 text-apomacy-teal"
                              : tx.status === "Pending"
                              ? "bg-orange-100 text-orange-600"
                              : "bg-discount-red/10 text-discount-red" 
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-outline font-medium">
                      Belum ada transaksi saat ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Pagination */}
          {recentOrdersMapped.length > 0 && (
            <div className="flex items-center justify-between border-t border-outline-variant bg-surface-container-low/50 px-6 py-4 mt-auto">
              <div className="text-xs font-bold text-outline">
                Menampilkan{" "}
                <span className="text-apomacy-dark">{indexOfFirstItem + 1}</span>{" "}
                -{" "}
                <span className="text-apomacy-dark">
                  {Math.min(indexOfLastItem, recentOrdersMapped.length)}
                </span>{" "}
                dari{" "}
                <span className="text-apomacy-dark">{recentOrdersMapped.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-outline-variant bg-white text-apomacy-dark hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-xs font-black text-apomacy-dark px-3">
                  Hal {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-outline-variant bg-white text-apomacy-dark hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* KOLOM KANAN: Tabel Alerts */}
        <div className="lg:col-span-1 flex flex-col gap-6 h-full">
          
          {/* Peringatan Stok */}
          <div className="rounded-3xl border border-outline-variant bg-white shadow-sm overflow-hidden flex flex-col flex-1 max-h-[350px]">
            <div className="flex items-center gap-2 bg-discount-red/10 border-b border-discount-red/20 px-6 py-5">
              <AlertTriangle size={18} className="text-discount-red" strokeWidth={2.5} />
              <h2 className="text-sm font-black uppercase tracking-widest text-discount-red">
                Peringatan Stok
              </h2>
            </div>
            <div className="p-4 space-y-3 flex-1 overflow-y-auto">
              {stokMenipis.length > 0 ? (
                stokMenipis.map((row, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl border border-outline-variant/50 bg-surface-container-low/50 transition-colors hover:bg-surface-container-low"
                  >
                    <div>
                      <p className="text-sm font-bold text-apomacy-dark line-clamp-1">{row.nama}</p>
                      <p className="text-xs text-outline mt-0.5">
                        Sisa: <span className="font-black text-discount-red">{row.sisa} unit</span>
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          row.status === "Kritis"
                            ? "bg-discount-red text-white shadow-sm"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {row.status}
                      </span>
                      <Link
                        href={`/admin/restock?obat=${encodeURIComponent(row.nama)}`}
                        className="flex items-center gap-1 text-[10px] font-bold bg-apomacy-primary/10 text-apomacy-primary px-2 py-1 rounded hover:bg-apomacy-primary hover:text-white transition-colors whitespace-nowrap"
                      >
                        <Plus size={10} strokeWidth={3} /> RESTOCK
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-sm font-medium text-outline py-8">
                  Semua stok obat dalam kondisi aman.
                </div>
              )}
            </div>
          </div>

          {/* Peringatan Expired */}
          <div className="rounded-3xl border border-outline-variant bg-white shadow-sm overflow-hidden flex flex-col flex-1 max-h-[350px]">
            <div className="flex items-center gap-2 bg-orange-50 border-b border-orange-200 px-6 py-5">
              <Clock size={18} className="text-orange-500" strokeWidth={2.5} />
              <h2 className="text-sm font-black uppercase tracking-widest text-orange-600">
                Peringatan Expired
              </h2>
            </div>
            <div className="p-4 space-y-3 flex-1 overflow-y-auto">
              {obatExpired.length > 0 ? (
                obatExpired.map((row, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl border border-outline-variant/50 bg-surface-container-low/50 transition-colors hover:bg-surface-container-low"
                  >
                    <div>
                      <p className="text-sm font-bold text-apomacy-dark line-clamp-1">{row.nama}</p>
                      <p className="text-xs text-outline mt-0.5">
                        Exp: <span className="font-black text-orange-500">{row.date}</span>
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          row.status === "Kritis"
                            ? "bg-discount-red text-white shadow-sm"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {row.status}
                      </span>
                      <Link
                        href={`/admin/data-obat`}
                        className="flex items-center gap-1 text-[10px] font-bold bg-apomacy-primary/10 text-apomacy-primary px-2 py-1 rounded hover:bg-apomacy-primary hover:text-white transition-colors whitespace-nowrap"
                      >
                        CEK DATA
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-sm font-medium text-outline py-8">
                  Tidak ada obat yang mendekati masa kadaluarsa.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}