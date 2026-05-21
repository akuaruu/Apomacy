"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
    Search, Eye, X, Receipt, ShoppingBag, Clock, Truck, Store, Bell, CheckCircle2, ChevronLeft, ChevronRight, PackageCheck, Loader2 
} from "lucide-react";

interface TransaksiItem {
    name: string;
    qty: number;
    price: number;
}

type StatusType = 
    | "Pesanan Baru"           
    | "Obat sedang Disiapkan"  
    | "Dalam perjalanan"       
    | "Obat menunggu di ambil" 
    | "Selesai";               

interface TransaksiDashboard {
    id: string;
    type: "Online" | "Offline";
    customerName: string;
    items: TransaksiItem[];
    subtotal: number;
    paymentMethod: string;
    status: StatusType;
    date: string;
}

// ─── PORTAL MODAL ───────────────────────────────────────────────────────────────
function PortalModal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
    if (typeof document === "undefined") return null;
    return createPortal(
        <>
            <style>{`
                @keyframes mfadeIn  { from { opacity: 0 }                       to { opacity: 1 } }
                @keyframes mscaleIn { from { opacity: 0; transform: scale(0.95) } to { opacity: 1; transform: scale(1) } }
                @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            `}</style>
            <div
                className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-[mfadeIn_0.2s_ease]"
                onClick={onClose}
            >
                <div className="max-h-[90vh] flex" onClick={e => e.stopPropagation()}>
                    {children}
                </div>
            </div>
        </>,
        document.body
    );
}

const PAGE_SIZE = 25;

const statusPriority: Record<StatusType, number> = {
    "Pesanan Baru": 1,
    "Obat sedang Disiapkan": 2,
    "Dalam perjalanan": 3,
    "Obat menunggu di ambil": 4, // Bisa ditukar dengan Dalam Perjalanan tergantung alur apotek
    "Selesai": 5,
};

// ─── MAIN PAGE ──────────────────────────────────────────────────────────────────
export default function KasirDashboardPage() {
    const [transactions, setTransactions] = useState<TransaksiDashboard[]>([]);
    const [isLoading, setIsLoading]       = useState(true); 
    const [searchQuery, setSearchQuery]   = useState("");
    const [selectedDetail, setSelectedDetail] = useState<TransaksiDashboard | null>(null);
    const [mounted, setMounted]           = useState(false);
    const [activeTab, setActiveTab]       = useState<"Semua" | "Pesanan Baru" | "Diproses" | "Selesai">("Semua");
    const [toast, setToast]               = useState<{ visible: boolean; message: string; id: string }>({ visible: false, message: "", id: "" });
    const [currentPage, setCurrentPage]   = useState(1);

    useEffect(() => { setMounted(true); }, []);

    // ─── AMBIL DATA DARi API                  
    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                setIsLoading(true);
                
              
                const API_URL = "https://api.npoint.io/386af8416f1525ba8335"; 

                const response = await fetch(API_URL);
                if (!response.ok) throw new Error("Gagal memuat data ");
                
                const data: TransaksiDashboard[] = await response.json();
                setTransactions(data);

            } catch (error) {
                console.error("Koneksi API  Error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTransactions();

        
        const timer = setTimeout(() => {
            const newOrder: TransaksiDashboard = {
                id: "TRX-099",
                type: "Online",
                customerName: "Ahmad Fauzi (Gojek)",
                items: [{ name: "Tolak Angin Cair Box", qty: 1, price: 45000 }],
                subtotal: 45000,
                paymentMethod: "QRIS",
                status: "Obat sedang Disiapkan",
                date: "2026-05-19 14:35",
            };
            setTransactions(prev => [newOrder, ...prev]);
            setToast({ visible: true, message: "Pesanan Online baru masuk dari Ahmad Fauzi! Obat perlu disiapkan.", id: "TRX-099" });
            setTimeout(() => setToast({ visible: false, message: "", id: "" }), 5000);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    const formatRupiah = (num: number) => "Rp " + num.toLocaleString("id-ID");

    const getStatusStyle = (status: string): React.CSSProperties => {
        const map: Record<string, React.CSSProperties> = {
            "Pesanan Baru":           { background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca" },
            "Obat sedang Disiapkan":  { background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a" },
            "Dalam perjalanan":       { background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe" },
            "Obat menunggu di ambil": { background: "#f5f3ff", color: "#7c3aed", border: "1px solid #ddd6fe" },
            "Selesai":                { background: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0" },
        };
        return map[status] ?? { background: "#f3f4f6", color: "#6b7280" };
    };

    const handleConfirmOrder = (trxId: string, action: "kirim" | "ambil") => {
        const newStatus: StatusType = action === "kirim" ? "Dalam perjalanan" : "Obat menunggu di ambil";
        setTransactions(prev => prev.map(t => t.id === trxId ? { ...t, status: newStatus } : t));
    };

    const handleCompleteOrder = (trxId: string) => {
        setTransactions(prev => prev.map(t => t.id === trxId ? { ...t, status: "Selesai" } : t));
    };

    const newOrdersCount = transactions.filter(
        t => t.type === "Online" && (t.status === "Pesanan Baru" || t.status === "Obat sedang Disiapkan")
    ).length;

    
    let filteredData = transactions;
    if (activeTab === "Pesanan Baru") {
        filteredData = transactions.filter(
            t => t.status === "Pesanan Baru" || t.status === "Obat sedang Disiapkan"
        );
    } else if (activeTab === "Diproses") {
        filteredData = transactions.filter(
            t => t.status === "Dalam perjalanan" || t.status === "Obat menunggu di ambil"
        );
    } else if (activeTab === "Selesai") {
        filteredData = transactions.filter(t => t.status === "Selesai");
    }

    if (searchQuery) {
        filteredData = filteredData.filter(
            t => t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 t.customerName.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

  
    filteredData = [...filteredData].sort((a, b) => {
       
        if (statusPriority[a.status] !== statusPriority[b.status]) {
            return statusPriority[a.status] - statusPriority[b.status];
        }
        

        return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    const totalPages    = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
    const safePage      = Math.min(currentPage, totalPages);
    const displayedData = filteredData.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    const handleTabChange = (tab: typeof activeTab) => { setActiveTab(tab); setCurrentPage(1); };
    const handleSearch    = (q: string)             => { setSearchQuery(q); setCurrentPage(1); };

const renderAction = (trx: TransaksiDashboard) => {
    // 1. Jika pengguna berada di tab "Semua", hanya tampilkan badge status (tidak ada tombol aksi)
    if (activeTab === "Semua") {
        return (
            <span style={getStatusStyle(trx.status)} className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border">
                {trx.status}
            </span>
        );
    }

    // 2. Jika di tab "Pesanan Baru" dan status pesanan sesuai, tampilkan tombol Kirim/Ambil
    if (activeTab === "Pesanan Baru" && (trx.status === "Pesanan Baru" || trx.status === "Obat sedang Disiapkan")) {
        return (
            <div className="flex gap-2 flex-wrap">
                <button
                    onClick={() => handleConfirmOrder(trx.id, "kirim")}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 text-[10px] font-bold hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                >
                    <Truck size={12} /> Sudah Dikirim
                </button>
                <button
                    onClick={() => handleConfirmOrder(trx.id, "ambil")}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-600 border border-purple-200 text-[10px] font-bold hover:bg-purple-600 hover:text-white transition-all cursor-pointer"
                >
                    <Store size={12} /> Siap Diambil
                </button>
            </div>
        );
    }

    // 3. Jika di tab "Diproses" dan status pesanan sesuai, tampilkan tombol Selesaikan
    if (activeTab === "Diproses" && (trx.status === "Dalam perjalanan" || trx.status === "Obat menunggu di ambil")) {
        return (
            <button
                onClick={() => handleCompleteOrder(trx.id)}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold hover:bg-green-600 hover:text-white transition-all cursor-pointer"
            >
                <PackageCheck size={12} /> Selesaikan
            </button>
        );
    }

    // 4. Default tampilan (termasuk untuk tab "Selesai" atau kondisi lain yang tidak terpenuhi di atas)
    return (
        <span style={getStatusStyle(trx.status)} className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border">
            {trx.status}
        </span>
    );
};
    return (
        <div className="flex flex-col gap-6 w-full h-[calc(100vh-100px)] relative overflow-hidden">

            {/* BARIS SUMMARY PANEL CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
                {[
                    { icon: <Receipt size={24} />, bg: "#eff6ff", color: "#2563eb", label: "Total Hari Ini",       value: `${transactions.length} Transaksi` },
                    { icon: <Clock size={24} />,   bg: "#fffbeb", color: "#d97706", label: "Sedang Disiapkan",     value: `${transactions.filter(t => t.status === "Obat sedang Disiapkan" || t.status === "Pesanan Baru").length} Pesanan` },
                    { icon: <Store size={24} />,   bg: "#f5f3ff", color: "#7c3aed", label: "Menunggu Diambil",     value: `${transactions.filter(t => t.status === "Obat menunggu di ambil").length} Pesanan` },
                    { icon: <Truck size={24} />,   bg: "#ecfdf5", color: "#059669", label: "Dalam Perjalanan",     value: `${transactions.filter(t => t.status === "Dalam perjalanan").length} Pesanan` },
                ].map((s, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-outline-variant shadow-sm flex items-center gap-4">
                        <div style={{ background: s.bg, color: s.color }} className="p-3 rounded-xl">{s.icon}</div>
                        <div>
                            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{s.label}</p>
                            <h3 className="text-xl font-black text-apomacy-dark">{s.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* TABEL DATA PANEL */}
            <div className="flex-1 bg-white rounded-2xl border border-outline-variant p-6 shadow-sm flex flex-col min-h-0">

                <div className="flex flex-row flex-nowrap items-center justify-between gap-4 mb-4 shrink-0 border-b border-gray-100 pb-5 w-full">
                    <div className="flex gap-3 flex-nowrap pt-2">
                        {(["Semua", "Pesanan Baru", "Diproses", "Selesai"] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => handleTabChange(tab)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all relative ${
                                    activeTab === tab ? "bg-apomacy-dark text-white shadow-md" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                }`}
                            >
                                {tab}
                                {tab === "Pesanan Baru" && newOrdersCount > 0 && (
                                    <span className="absolute -top-2.5 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-black ring-2 ring-white animate-bounce z-30 shadow-sm">
                                        {newOrdersCount}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-64 md:w-72 shrink-0">
                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
                        <input
                            type="text"
                            placeholder="Cari No Trx atau Nama..."
                            value={searchQuery}
                            onChange={e => handleSearch(e.target.value)}
                            className="w-full rounded-xl bg-surface-container-low py-2 pl-10 pr-4 text-sm text-on-surface border border-outline-variant outline-none focus:border-apomacy-primary transition-all"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between mb-3 shrink-0">
                    <p className="text-xs text-gray-400 font-medium">
                        Menampilkan <span className="text-gray-700 font-bold">{displayedData.length}</span> dari <span className="text-gray-700 font-bold">{filteredData.length}</span> data
                        {totalPages > 1 && <> · Halaman <span className="text-gray-700 font-bold">{safePage}</span> dari <span className="text-gray-700 font-bold">{totalPages}</span></>}
                    </p>
                </div>

                <div className="w-full border border-outline-variant rounded-xl overflow-hidden bg-white shadow-xs flex-1 min-h-0">
                    <div className="overflow-y-auto overflow-x-auto max-h-[580px] block w-full scrollbar-thin scrollbar-thumb-gray-300 relative h-full">
                        
                        {isLoading ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 gap-2 z-50">
                                <Loader2 className="animate-spin text-apomacy-primary" size={32} />
                                <p className="text-sm font-bold text-gray-500">Mengkoneksikan & Memproses Data API Luar...</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse min-w-[800px] table-fixed">
                                <thead className="sticky top-0 z-20 bg-gray-50 border-b border-outline-variant shadow-xs">
                                    <tr className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                                        <th className="px-4 py-3 bg-gray-50 w-[100px] whitespace-nowrap">No Trx</th>
                                        <th className="px-4 py-3 bg-gray-50 w-[130px] whitespace-nowrap">Waktu</th>
                                        <th className="px-4 py-3 bg-gray-50 w-[90px] text-center whitespace-nowrap">Jenis</th>
                                        <th className="px-4 py-3 bg-gray-50 w-[180px] whitespace-nowrap">Nama Pemesan</th>
                                        <th className="px-4 py-3 bg-gray-50 w-[120px] text-center whitespace-nowrap">Data Obat</th>
                                        <th className="px-4 py-3 bg-gray-50 w-[120px] text-right whitespace-nowrap">Subtotal</th>
                                        <th className="px-4 py-3 bg-gray-50 w-[240px] whitespace-nowrap">Status Pesanan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant text-sm text-on-surface bg-white">
                                    {displayedData.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-20 text-center text-gray-400">
                                                <CheckCircle2 size={40} className="mx-auto mb-3 opacity-30" />
                                                <p className="font-bold">Tidak ada data di tab ini.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        displayedData.map(trx => (
                                            <tr
                                                key={trx.id}
                                                className={`hover:bg-surface-container-low transition-colors ${
                                                    trx.status === "Obat sedang Disiapkan" || trx.status === "Pesanan Baru" ? "bg-amber-50/30" : ""
                                                }`}
                                            >
                                                <td className="px-4 py-3.5 text-apomacy-primary font-mono text-[12px] font-bold whitespace-nowrap">{trx.id}</td>
                                                <td className="px-4 py-3.5 text-on-surface-variant font-mono text-[11px] whitespace-nowrap">{trx.date}</td>
                                                <td className="px-4 py-3.5 text-center">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${trx.type === "Online" ? "bg-indigo-50 text-indigo-600" : "bg-gray-100 text-gray-600"}`}>
                                                        {trx.type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 font-semibold text-apomacy-dark text-[13px] truncate">{trx.customerName}</td>
                                                <td className="px-4 py-3.5 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedDetail(trx)}
                                                        className="inline-flex items-center gap-1.5 bg-apomacy-ice text-apomacy-primary hover:bg-apomacy-primary hover:text-white px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer shadow-xs"
                                                    >
                                                        <Eye size={14} /> Cek Obat
                                                    </button>
                                                </td>
                                                <td className="px-4 py-3.5 font-mono text-[12px] font-bold text-apomacy-teal text-right whitespace-nowrap">{formatRupiah(trx.subtotal)}</td>
                                                <td className="px-4 py-3.5 text-left">
                                                    {renderAction(trx)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* ── PAGINATION CONTROLLERS ── */}
                {totalPages > 1 && (
                    <div className="mt-4 shrink-0 flex items-center justify-between gap-4">
                        <p className="text-xs text-gray-400">{PAGE_SIZE} data per halaman</p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCurrentPage(1)}
                                disabled={safePage === 1}
                                className="px-2 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >«</button>
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={safePage === 1}
                                className="px-2 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                            >
                                <ChevronLeft size={14} /> Prev
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                                .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                                    acc.push(p);
                                    return acc;
                                }, [])
                                .map((p, i) =>
                                    p === "..." ? (
                                        <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-xs">…</span>
                                    ) : (
                                        <button
                                            key={p}
                                            onClick={() => setCurrentPage(p as number)}
                                            className={`w-8 h-8 rounded-lg text-xs font-bold border transition-all ${
                                                safePage === p
                                                    ? "bg-apomacy-dark text-white border-apomacy-dark shadow-sm"
                                                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    )
                                )
                            }

                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={safePage === totalPages}
                                className="px-2 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                            >
                                Next <ChevronRight size={14} />
                            </button>
                            <button
                                onClick={() => setCurrentPage(totalPages)}
                                disabled={safePage === totalPages}
                                className="px-2 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >»</button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── TOAST NOTIFICATION ── */}
            {mounted && toast.visible && typeof document !== "undefined" && createPortal(
                <div style={{
                    position: "fixed", bottom: 40, right: 40, zIndex: 999999,
                    background: "#fff", borderRadius: 16, padding: "16px 20px",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.2)", border: "1px solid #fde68a",
                    display: "flex", alignItems: "flex-start", gap: 12, width: 340,
                    animation: "slideInRight 0.4s cubic-bezier(0.34,1.3,0.64,1)"
                }}>
                    <div style={{ background: "#fffbeb", color: "#d97706", padding: 8, borderRadius: "50%", marginTop: 2 }}>
                        <Bell size={20} className="animate-pulse" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h4 style={{ fontWeight: 800, fontSize: 14, color: "#111827", margin: "0 0 4px 0" }}>Pesanan Online Baru!</h4>
                        <p style={{ fontSize: 12, color: "#4b5563", margin: 0, lineHeight: 1.4 }}>{toast.message}</p>
                        <button
                            onClick={() => { handleTabChange("Pesanan Baru"); setToast({ ...toast, visible: false }); }}
                            style={{ background: "none", border: "none", color: "#2563eb", fontWeight: 700, fontSize: 12, padding: 0, marginTop: 8, cursor: "pointer" }}
                        >
                            Lihat &amp; Siapkan Pesanan →
                        </button>
                    </div>
                    <button onClick={() => setToast({ ...toast, visible: false })} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer" }}>
                        <X size={16} />
                    </button>
                </div>,
                document.body
            )}

            {/* ── MODAL DETAIL OBAT RESEP ── */}
            {mounted && selectedDetail && (
                <PortalModal onClose={() => setSelectedDetail(null)}>
                    <div style={{ background: "#fff", borderRadius: 20, width: 400, maxWidth: "100%", boxShadow: "0 24px 80px rgba(0,0,0,0.25)", overflow: "hidden" }}>
                        <div style={{ background: "var(--color-apomacy-primary, #0d6efd)", color: "#fff", display: "flex", justifycontent: "space-between", justifyContent: "space-between", alignItems: "center", padding: "16px 20px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <ShoppingBag size={20} />
                                <div>
                                    <p style={{ fontWeight: 700, fontSize: 13, letterSpacing: "0.08em", margin: 0 }}>DETAIL PESANAN</p>
                                    <p style={{ fontFamily: "monospace", fontSize: 11, opacity: 0.75, margin: 0 }}>{selectedDetail.id}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedDetail(null)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", display: "flex" }}>
                                <X size={22} />
                            </button>
                        </div>
                        <div style={{ padding: "14px 20px", borderBottom: "1px dashed #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                            <div>
                                <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>Customer</p>
                                <p style={{ fontSize: 13, fontWeight: 700, color: "#1f2937", margin: 0 }}>{selectedDetail.customerName}</p>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: selectedDetail.type === "Online" ? "#eef2ff" : "#f3f4f6", color: selectedDetail.type === "Online" ? "#4338ca" : "#6b7280" }}>
                                    {selectedDetail.type}
                                </span>
                                <span style={{ ...getStatusStyle(selectedDetail.status), fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6 }}>
                                    {selectedDetail.status}
                                </span>
                            </div>
                        </div>
                        <div style={{ maxHeight: 260, overflowY: "auto", padding: "0 20px" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                                        {["Item", "Qty", "Total"].map((h, i) => (
                                            <th key={h} style={{ padding: "10px 0 8px", fontSize: 10, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", tracking: "wider", textAlign: i === 0 ? "left" : i === 1 ? "center" : "right" }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedDetail.items.map((item, idx) => (
                                        <tr key={idx} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                            <td style={{ padding: "10px 0" }}>
                                                <p style={{ fontSize: 12, fontWeight: 700, color: "#1f2937", margin: 0 }}>{item.name}</p>
                                                <p style={{ fontSize: 10, color: "#9ca3af", fontFamily: "monospace", margin: 0 }}>{formatRupiah(item.price)}</p>
                                            </td>
                                            <td style={{ textAlign: "center", fontSize: 12, fontWeight: 700, fontFamily: "monospace", color: "#374151" }}>{item.qty}x</td>
                                            <td style={{ textAlign: "right", fontSize: 12, fontWeight: 700, fontFamily: "monospace", color: "#0d6efd" }}>{formatRupiah(item.qty * item.price)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div style={{ background: "#f9fafb", borderTop: "1px solid #e5e7eb", padding: "16px 20px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                <span style={{ fontSize: 12, color: "#6b7280" }}>Metode Pembayaran</span>
                                <span style={{ fontSize: 12, fontWeight: 700, color: "#1f2937" }}>{selectedDetail.paymentMethod}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #e5e7eb", marginTop: 10, paddingTop: 10 }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: "#1f2937", textTransform: "uppercase" }}>Subtotal</span>
                                <span style={{ fontSize: 20, fontWeight: 800, fontFamily: "monospace", color: "#0d9488" }}>{formatRupiah(selectedDetail.subtotal)}</span>
                            </div>
                        </div>
                    </div>
                </PortalModal>
            )}

        </div>
    );
}