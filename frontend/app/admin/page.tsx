"use client";

import { useState } from "react";
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
} from "lucide-react";

const RECENT_ORDERS = Array.from({ length: 35 })
  .map((_, i) => ({
    id: `#ORD${5000 + i}`,
    medicine: [
      "Atorvastatin",
      "Omeprazole",
      "Metformin",
      "Paracetamol 500mg",
      "Amoxicillin 250mg",
      "Vitamin C 1000mg",
    ][i % 6],
    // PERBAIKAN: Ganti Math.random() dengan pola index agar tidak Hydration Error
    price: ((i % 10) + 5) * 15000,
    status: i % 3 === 0 ? "Proses" : "Selesai",
  }))
  .reverse();

const STOK_MENIPIS = [
  { nama: "Paracetamol 500mg", sisa: 12, status: "Menipis" },
  { nama: "Amoxicillin 250mg", sisa: 4, status: "Kritis" },
  { nama: "Promag Tablet Kunyah", sisa: 8, status: "Menipis" },
];

const OBAT_EXPIRED = [
  { nama: "Siladex Antitussive", date: "12 Ags 2026", status: "2 Bulan" },
  { nama: "Sangobion Kapsul", date: "05 Jun 2026", status: "Kritis" },
  { nama: "Oskadon Tablet", date: "20 Jul 2026", status: "1 Bulan" },
];

const SALES_DATA = {
  mingguan: [
    { label: "Sen", value: 30 },
    { label: "Sel", value: 45 },
    { label: "Rab", value: 25 },
    { label: "Kam", value: 60 },
    { label: "Jum", value: 80 },
    { label: "Sab", value: 95 },
    { label: "Min", value: 50 },
  ],
  bulanan: [
    { label: "Mg 1", value: 40 },
    { label: "Mg 2", value: 70 },
    { label: "Mg 3", value: 55 },
    { label: "Mg 4", value: 90 },
  ],
  tahunan: [
    { label: "Jan", value: 30 },
    { label: "Feb", value: 45 },
    { label: "Mar", value: 60 },
    { label: "Apr", value: 40 },
    { label: "Mei", value: 75 },
    { label: "Jun", value: 85 },
  ],
};

const TOP_SELLING = [
  {
    name: "Paracetamol 500mg",
    qty: "1.250 Box",
    revenue: "Rp 15.000.000",
    percentage: 100,
    color: "bg-apomacy-primary",
    text: "text-apomacy-primary",
  },
  {
    name: "Vitamin C 1000mg",
    qty: "850 Botol",
    revenue: "Rp 10.200.000",
    percentage: 70,
    color: "bg-apomacy-teal",
    text: "text-apomacy-teal",
  },
  {
    name: "Amoxicillin 250mg",
    qty: "640 Strip",
    revenue: "Rp 8.500.000",
    percentage: 45,
    color: "bg-apomacy-muted",
    text: "text-apomacy-muted",
  },
];

// ─────────────────────────────────────────────
// KOMPONEN LOKAL
// ─────────────────────────────────────────────

function StatCard({ label, value, isHighlight = false, icon }: any) {
  return (
    <div
      className={`rounded-3xl p-6 shadow-sm flex flex-col justify-center border ${isHighlight ? "bg-apomacy-dark text-white border-apomacy-dark" : "bg-white border-outline-variant"}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl mb-4 ${isHighlight ? "bg-apomacy-primary/40" : "bg-apomacy-bg"}`}
          >
            {icon}
          </div>
          <p
            className={`text-[11px] font-bold uppercase tracking-widest ${isHighlight ? "text-apomacy-ice" : "text-outline"}`}
          >
            {label}
          </p>
          <p
            className={`mt-1 text-3xl font-black tracking-tight ${isHighlight ? "text-white" : "text-apomacy-dark"}`}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function SalesAnalytics() {
  const [filter, setFilter] = useState<"mingguan" | "bulanan" | "tahunan">(
    "mingguan",
  );
  const data = SALES_DATA[filter];

  return (
    <div className="rounded-3xl border border-outline-variant bg-white p-6 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-lg font-black text-apomacy-dark">
          Analitik Penjualan
        </h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="rounded-lg border border-outline-variant bg-surface-container-low px-3 py-1.5 text-xs font-bold text-apomacy-dark outline-none cursor-pointer"
        >
          <option value="mingguan">Mingguan</option>
          <option value="bulanan">Bulanan</option>
          <option value="tahunan">Tahunan</option>
        </select>
      </div>
      <div className="flex-1 flex items-end justify-between gap-2 h-48 mt-auto pt-6 border-b border-outline-variant/50 relative">
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
          <div className="w-full border-t border-dashed border-outline-variant h-0"></div>
          <div className="w-full border-t border-dashed border-outline-variant h-0"></div>
          <div className="w-full border-t border-dashed border-outline-variant h-0"></div>
        </div>
        {data.map((item, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-3 w-full group relative z-10"
          >
            <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-apomacy-dark text-white text-[10px] font-bold py-1 px-2 rounded shadow">
              {item.value}%
            </div>
            <div
              className="w-full max-w-[40px] rounded-t-lg bg-apomacy-dark transition-all duration-500 group-hover:bg-apomacy-primary"
              style={{ height: `${item.value}%` }}
            ></div>
            <span className="text-[10px] font-bold text-outline uppercase">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopSellingMedicine() {
  return (
    <div className="rounded-3xl border border-outline-variant bg-white p-6 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 border-b border-outline-variant/50 pb-4">
        <div>
          <h2 className="text-lg font-black text-apomacy-dark">
            Obat Terlaris
          </h2>
          <p className="text-[11px] font-semibold text-outline mt-0.5">
            Berdasarkan kuantitas penjualan bulan ini
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-4 flex-1">
        {TOP_SELLING.map((item, i) => (
          <div
            key={i}
            className="relative p-3 rounded-xl border border-outline-variant bg-white overflow-hidden shadow-sm hover:shadow transition-shadow"
          >
            <div
              className={`absolute top-0 left-0 bottom-0 opacity-10 transition-all duration-1000 ease-out ${item.color}`}
              style={{ width: `${item.percentage}%` }}
            ></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-lg shadow-inner text-xs font-black text-white ${item.color}`}
                >
                  #{i + 1}
                </div>
                <div>
                  <span className="text-xs font-bold text-apomacy-dark">
                    {item.name}
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider ${item.text}`}
                    >
                      {item.qty}
                    </span>
                    <span className="text-[10px] text-outline font-medium">
                      terjual
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-xs font-black text-apomacy-dark">
                {item.revenue}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// HALAMAN UTAMA DASHBOARD
// ─────────────────────────────────────────────
export default function DashboardPage() {
  // Logic Pagination untuk Pesanan Terbaru
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(RECENT_ORDERS.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = RECENT_ORDERS.slice(indexOfFirstItem, indexOfLastItem);

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
          value="Rp 12.5M"
          isHighlight={true}
          icon={<DollarSign size={20} className="text-white" />}
        />
        <StatCard
          label="Total Pelanggan"
          value="1,200"
          icon={<Users size={20} className="text-apomacy-dark" />}
        />
        <StatCard
          label="Total Pesanan"
          value="2,549"
          icon={<ShoppingCart size={20} className="text-apomacy-dark" />}
        />
      </div>

      {/* ANALYTICS & TOP SELLING */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SalesAnalytics />
        </div>
        <div className="lg:col-span-1">
          <TopSellingMedicine />
        </div>
      </div>

      {/* ALERTS & RECENT ORDERS GRID (Tinggi Diselaraskan) */}
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
                  <th className="px-6 py-4">ID Pesanan</th>
                  <th className="px-6 py-4">Nama Obat</th>
                  <th className="px-6 py-4">Harga</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {currentOrders.map((tx) => (
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
                        className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold ${tx.status === "Selesai" ? "bg-apomacy-teal/10 text-apomacy-teal" : "bg-orange-100 text-orange-600"}`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Pagination untuk Pesanan Terbaru */}
          <div className="flex items-center justify-between border-t border-outline-variant bg-surface-container-low/50 px-6 py-4 mt-auto">
            <div className="text-xs font-bold text-outline">
              Menampilkan{" "}
              <span className="text-apomacy-dark">{indexOfFirstItem + 1}</span>{" "}
              -{" "}
              <span className="text-apomacy-dark">
                {Math.min(indexOfLastItem, RECENT_ORDERS.length)}
              </span>{" "}
              dari{" "}
              <span className="text-apomacy-dark">{RECENT_ORDERS.length}</span>
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
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-outline-variant bg-white text-apomacy-dark hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: Tabel Alerts (Stok & Expired) */}
        <div className="lg:col-span-1 flex flex-col gap-6 h-full">
          {/* 1. Alert Peringatan Stok */}
          <div className="rounded-3xl border border-outline-variant bg-white shadow-sm overflow-hidden flex flex-col flex-1">
            <div className="flex items-center gap-2 bg-discount-red/10 border-b border-discount-red/20 px-6 py-5">
              <AlertTriangle
                size={18}
                className="text-discount-red"
                strokeWidth={2.5}
              />
              <h2 className="text-sm font-black uppercase tracking-widest text-discount-red">
                Peringatan Stok
              </h2>
            </div>
            <div className="p-4 space-y-3 flex-1 overflow-y-auto">
              {STOK_MENIPIS.map((row, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl border border-outline-variant/50 bg-surface-container-low/50 transition-colors hover:bg-surface-container-low"
                >
                  <div>
                    <p className="text-sm font-bold text-apomacy-dark">
                      {row.nama}
                    </p>
                    <p className="text-xs text-outline mt-0.5">
                      Sisa:{" "}
                      <span className="font-black text-discount-red">
                        {row.sisa} unit
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${row.status === "Kritis" ? "bg-discount-red text-white shadow-sm" : "bg-orange-100 text-orange-700"}`}
                    >
                      {row.status}
                    </span>
                    <Link
                      href={`/admin/restock?obat=${encodeURIComponent(row.nama)}`}
                      className="flex items-center gap-1 text-[10px] font-bold bg-apomacy-primary/10 text-apomacy-primary px-2 py-1 rounded hover:bg-apomacy-primary hover:text-white transition-colors"
                    >
                      <Plus size={10} strokeWidth={3} /> RESTOCK
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Alert Peringatan Expired */}
          <div className="rounded-3xl border border-outline-variant bg-white shadow-sm overflow-hidden flex flex-col flex-1">
            <div className="flex items-center gap-2 bg-orange-50 border-b border-orange-200 px-6 py-5">
              <Clock size={18} className="text-orange-500" strokeWidth={2.5} />
              <h2 className="text-sm font-black uppercase tracking-widest text-orange-600">
                Peringatan Expired
              </h2>
            </div>
            <div className="p-4 space-y-3 flex-1 overflow-y-auto">
              {OBAT_EXPIRED.map((row, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl border border-outline-variant/50 bg-surface-container-low/50 transition-colors hover:bg-surface-container-low"
                >
                  <div>
                    <p className="text-sm font-bold text-apomacy-dark">
                      {row.nama}
                    </p>
                    <p className="text-xs text-outline mt-0.5">
                      Exp:{" "}
                      <span className="font-black text-orange-500">
                        {row.date}
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${row.status === "Kritis" ? "bg-discount-red text-white shadow-sm" : "bg-orange-100 text-orange-700"}`}
                    >
                      {row.status}
                    </span>
                    <Link
                      href={`/admin/data-obat`}
                      className="flex items-center gap-1 text-[10px] font-bold bg-apomacy-primary/10 text-apomacy-primary px-2 py-1 rounded hover:bg-apomacy-primary hover:text-white transition-colors"
                    >
                      CEK DATA
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
