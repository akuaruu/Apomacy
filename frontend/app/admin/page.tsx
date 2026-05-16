"use client";

import { useState } from "react";
import { AlertTriangle, TrendingUp, DollarSign, Users, ShoppingCart } from "lucide-react";

// ─────────────────────────────────────────────
// DAta dummy lokal untuk test sementara
const RECENT_ORDERS = [
    { id: "#ORD576", medicine: "Atorvastatin", price: 185000, status: "Selesai" },
    { id: "#ORD575", medicine: "Omeprazole", price: 120000, status: "Proses" },
    { id: "#ORD574", medicine: "Metformin", price: 275000, status: "Proses" },
];

const STOK_MENIPIS = [
    { nama: "Paracetamol", sisa: 12, status: "Menipis" },
    { nama: "Amoxicillin", sisa: 4, status: "Kritis" },
];

const SALES_DATA = {
    mingguan: [
        { label: "Sen", value: 30 }, { label: "Sel", value: 45 }, { label: "Rab", value: 25 },
        { label: "Kam", value: 60 }, { label: "Jum", value: 80 }, { label: "Sab", value: 95 }, { label: "Min", value: 50 }
    ],
    bulanan: [
        { label: "Mg 1", value: 40 }, { label: "Mg 2", value: 70 }, { label: "Mg 3", value: 55 }, { label: "Mg 4", value: 90 }
    ],
    tahunan: [
        { label: "Jan", value: 30 }, { label: "Feb", value: 45 }, { label: "Mar", value: 60 },
        { label: "Apr", value: 40 }, { label: "Mei", value: 75 }, { label: "Jun", value: 85 }
    ]
};

const TOP_SELLING = [
    { name: "Paracetamol 500mg", sales: 1250, revenue: "Rp 15.000.000", height: "100%", color: "bg-apomacy-primary" },
    { name: "Vitamin C 1000mg", sales: 850, revenue: "Rp 10.200.000", height: "70%", color: "bg-apomacy-teal" },
    { name: "Amoxicillin 250mg", sales: 640, revenue: "Rp 8.500.000", height: "45%", color: "bg-apomacy-muted" },
];

// ─────────────────────────────────────────────
// KOMPONEN LOKAL (Hanya untuk Dashboard) 

// tiap page.tsx untuk page yang lain bisa langsung masuukin komponennya dalam 1 file page.tsx
// atau bisa juga dibikin modular (bikin folder dgn path contohnya "/components/admin/data_obat/")
function StatCard({ label, value, trend, isHighlight = false, icon }: any) {
    return (
        <div className={`rounded-3xl p-6 shadow-sm flex flex-col justify-between border ${isHighlight ? 'bg-apomacy-dark text-white border-apomacy-dark' : 'bg-white border-outline-variant'}`}>
            <div className="flex items-start justify-between">
                <div>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl mb-4 ${isHighlight ? 'bg-apomacy-primary/40' : 'bg-apomacy-bg'}`}>
                        {icon}
                    </div>
                    <p className={`text-xs font-bold uppercase tracking-widest ${isHighlight ? 'text-apomacy-ice' : 'text-outline'}`}>{label}</p>
                    <p className={`mt-1 text-3xl font-black tracking-tight ${isHighlight ? 'text-white' : 'text-apomacy-dark'}`}>{value}</p>
                </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold">
                <span className="flex items-center gap-1 rounded-full bg-apomacy-teal/10 px-2 py-0.5 text-apomacy-teal">
                    <TrendingUp size={12} /> {trend}
                </span>
                <span className={isHighlight ? 'text-apomacy-ice' : 'text-outline-variant'}>dari bulan lalu</span>
            </div>
        </div>
    );
}

function SalesAnalytics() {
    const [filter, setFilter] = useState<'mingguan' | 'bulanan' | 'tahunan'>('mingguan');
    const data = SALES_DATA[filter];

    return (
        <div className="rounded-3xl border border-outline-variant bg-white p-6 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-black text-apomacy-dark">Sales Analytics</h2>
                <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="rounded-lg border border-outline-variant bg-surface-container-low px-3 py-1.5 text-xs font-bold text-apomacy-dark outline-none cursor-pointer">
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
                    <div key={i} className="flex flex-col items-center gap-3 w-full group relative z-10">
                        <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-apomacy-dark text-white text-[10px] font-bold py-1 px-2 rounded shadow">{item.value}%</div>
                        <div className="w-full max-w-[40px] rounded-t-lg bg-apomacy-dark transition-all duration-500 group-hover:bg-apomacy-primary" style={{ height: `${item.value}%` }}></div>
                        <span className="text-[10px] font-bold text-outline uppercase">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function TopSellingMedicine() {
    return (
        <div className="rounded-3xl border border-outline-variant bg-white p-6 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-black text-apomacy-dark">Top Selling</h2>
                <span className="text-xs font-bold text-apomacy-muted">Bulan Ini</span>
            </div>
            <div className="flex-1 flex items-end justify-around h-48 pb-2">
                {TOP_SELLING.map((item, i) => (
                    <div key={i} className="flex flex-col items-center gap-3 w-1/3">
                        <div className={`w-12 rounded-t-full ${item.color} flex flex-col justify-end items-center pb-2 transition-all hover:opacity-90 shadow-inner`} style={{ height: item.height }}>
                            <span className="text-[10px] font-black text-white bg-black/20 px-1.5 py-0.5 rounded-full mb-1">#{i + 1}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-4 space-y-3 pt-4 border-t border-outline-variant/50">
                {TOP_SELLING.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 max-w-[70%]">
                            <span className={`w-3 h-3 rounded-full shrink-0 ${item.color}`}></span>
                            <span className="text-xs font-bold text-apomacy-dark truncate">{item.name}</span>
                        </div>
                        <span className="text-xs font-black text-apomacy-primary">{item.revenue}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}



// ini bagian Dashboard aja san
export default function DashboardPage() {
    return (
        <div className="p-8 space-y-8 max-w-[1400px] mx-auto pb-10">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-apomacy-dark">Dashboard Overview</h1>
                    <p className="mt-1 text-sm text-apomacy-muted font-medium">Pantau aktivitas penjualan dan operasional apotek hari ini.</p>
                </div>
                <button className="rounded-xl bg-apomacy-primary px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-apomacy-dark transition-colors">
                    + Buat Pesanan Kasir
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <StatCard label="Total Profit" value="Rp 12.5M" trend="+2.5%" isHighlight={true} icon={<DollarSign size={20} className="text-white" />} />
                <StatCard label="Total Customers" value="1,200" trend="+4.2%" icon={<Users size={20} className="text-apomacy-dark" />} />
                <StatCard label="Total Orders" value="2,549" trend="+6.1%" icon={<ShoppingCart size={20} className="text-apomacy-dark" />} />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2"><SalesAnalytics /></div>
                <div className="lg:col-span-1"><TopSellingMedicine /></div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Tabel Order */}
                <div className="lg:col-span-2 rounded-3xl border border-outline-variant bg-white shadow-sm overflow-hidden h-full">
                    <div className="flex items-center justify-between border-b border-outline-variant px-6 py-5">
                        <h2 className="text-base font-black text-apomacy-dark">Latest Orders</h2>
                        <button className="text-xs font-bold text-apomacy-primary hover:underline">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-surface-container-low text-left text-[11px] font-bold uppercase tracking-widest text-outline">
                                    <th className="px-6 py-4">Order ID</th>
                                    <th className="px-6 py-4">Nama Obat</th>
                                    <th className="px-6 py-4">HArga</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant">
                                {RECENT_ORDERS.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-surface-container-low/50 transition-colors">
                                        <td className="px-6 py-4 font-mono font-bold text-outline-variant">{tx.id}</td>
                                        <td className="px-6 py-4 font-bold text-apomacy-dark">{tx.medicine}</td>
                                        <td className="px-6 py-4 font-bold text-apomacy-dark">Rp {tx.price.toLocaleString("id-ID")}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold ${tx.status === "Selesai" ? "bg-apomacy-teal/10 text-apomacy-teal" : "bg-orange-100 text-orange-600"}`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Tabel Alerts */}
                <div className="lg:col-span-1 rounded-3xl border border-outline-variant bg-white shadow-sm overflow-hidden flex flex-col h-full">
                    <div className="flex items-center gap-2 bg-discount-red/10 border-b border-discount-red/20 px-6 py-5">
                        <AlertTriangle size={18} className="text-discount-red" strokeWidth={2.5} />
                        <h2 className="text-sm font-black uppercase tracking-widest text-discount-red">Peringatan Stok</h2>
                    </div>
                    <div className="p-4 space-y-3 flex-1 overflow-y-auto">
                        {STOK_MENIPIS.map((row, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-outline-variant/50 bg-surface-container-low/50">
                                <div>
                                    <p className="text-sm font-bold text-apomacy-dark">{row.nama}</p>
                                    <p className="text-xs text-outline mt-0.5">Sisa: <span className="font-bold text-discount-red">{row.sisa} unit</span></p>
                                </div>
                                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${row.status === "Kritis" ? "bg-discount-red text-white" : "bg-orange-100 text-orange-700"}`}>
                                    {row.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}