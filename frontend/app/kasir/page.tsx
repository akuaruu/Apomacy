"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
    Search, Eye, X, Receipt, ShoppingBag, Clock, Truck, Store, Bell, CheckCircle2, ChevronLeft, ChevronRight, PackageCheck, Loader2
} from "lucide-react";
import ModalConfirm from "@/components/shared/ModalConfirm";
import Toast from "@/components/shared/Toast";

interface TransaksiItem {
    name: string;
    qty: number;
    price: number;
}

type StatusType =
    | "Menunggu Pembayaran"
    | "Menunggu Diproses"
    | "Sedang Diracik"
    | "Sedang Dikirim"
    | "Siap Diambil"
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
    deliveryMethod?: string;
    phone?: string;
    address?: string;
}

type PendingAction = {
    trxId: string;
    action: "kirim" | "ambil" | "selesai";
    newStatus: StatusType;
    title: string;
    message: string;
};

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
                className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-[mfadeIn_0.2s_ease]"
                onClick={onClose}
            >
                <div className="max-h-[90vh] flex w-full justify-center" onClick={e => e.stopPropagation()}>
                    {children}
                </div>
            </div>
        </>,
        document.body
    );
}

const PROCESS_TIMER_KEY = "apomacy_diproses_timestamps";
const AUTO_COMPLETE_MS = 60 * 60 * 1000;

function loadProcessTimers(): Record<string, number> {
    if (typeof window === "undefined") return {};
    try {
        return JSON.parse(window.localStorage.getItem(PROCESS_TIMER_KEY) || "{}");
    } catch {
        return {};
    }
}

function saveProcessTimers(timers: Record<string, number>) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(PROCESS_TIMER_KEY, JSON.stringify(timers));
}

const PAGE_SIZE = 25;

const statusPriority: Record<StatusType, number> = {
    "Menunggu Pembayaran": 1,
    "Menunggu Diproses": 2,
    "Sedang Diracik": 3,
    "Sedang Dikirim": 4,
    "Siap Diambil": 5,
    "Selesai": 6,
};

// ─── MAIN PAGE ──────────────────────────────────────────────────────────────────
function KasirDashboardContent() {
    const [transactions, setTransactions] = useState<TransaksiDashboard[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDetail, setSelectedDetail] = useState<TransaksiDashboard | null>(null);
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<"Semua" | "Pesanan Baru" | "Diproses" | "Selesai">("Semua");
    const [toast, setToast] = useState<{ visible: boolean; message: string; id: string }>({ visible: false, message: "", id: "" });
    const [currentPage, setCurrentPage] = useState(1);
    const [confirmModal, setConfirmModal] = useState<PendingAction | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

    // MENGINGAT ID TRANSAKSI SEBELUMNYA AGAR TIDAK BENTROK DENGAN RENDER REACT
    const prevTxIds = useRef<Set<string>>(new Set());

    const showFeedback = (message: string, type: "success" | "error") => {
        setFeedback({ message, type });
        setTimeout(() => setFeedback(null), 6000);
    };

    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const tabParam = searchParams.get("tab");
        if (tabParam === "pesanan-baru") {
            setActiveTab("Pesanan Baru");
            setCurrentPage(1);

            router.replace("/kasir", { scroll: false });
        }
    }, [router, searchParams]);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        const fetchTransactions = async (isInitial = false) => {
            try {
                if (isInitial) setIsLoading(true);

                const API_URL = "/api/transaksi/all";

                const response = await fetch(API_URL, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) throw new Error("Gagal memuat data dari server");

                const result = await response.json();
                const rawData = result.data || [];

                // --- PROSES MAPPING DATA ---
                const newData: TransaksiDashboard[] = rawData.map((t: any) => {
                    let formattedDate = t.tanggal_transaksi;

                    const isOnline = t.pengiriman != null;
                    let statusPesanan: StatusType = t.status_pesanan || "Menunggu Pembayaran";

                    if (!isOnline && statusPesanan === "Menunggu Pembayaran") {
                        statusPesanan = "Selesai";
                    }

                    return {
                        id: t.no_transaksi,
                        type: isOnline ? "Online" : "Offline",
                        customerName: t.nama_customer || "Anonim",
                        subtotal: t.subtotal,
                        paymentMethod: t.metode_pembayaran || "-",
                        status: statusPesanan,
                        deliveryMethod: t.pengiriman?.metode_penerimaan || null,
                        phone: t.pengiriman?.no_hp_penerima || "-",
                        address: t.pengiriman?.alamat_pengiriman || "-",
                        date: formattedDate,
                        items: (t.details || t.Details || []).map((d: any) => ({
                            name: d.nama_obat,
                            qty: d.qty,
                            price: d.harga_satuan
                        }))
                    };
                });

                // --- LACAK WAKTU MASUK TAB "DIPROSES" UNTUK AUTO-COMPLETE 1 JAM ---
                const timers = loadProcessTimers();
                let timersChanged = false;
                const toAutoComplete: string[] = [];
                const now = Date.now();

                newData.forEach(t => {
                    const isDiproses = t.status === "Sedang Dikirim" || t.status === "Siap Diambil";

                    if (isDiproses) {
                        if (!timers[t.id]) {
                            timers[t.id] = now;
                            timersChanged = true;
                        } else if (now - timers[t.id] >= AUTO_COMPLETE_MS) {
                            toAutoComplete.push(t.id);
                        }
                    } else if (timers[t.id]) {
                        delete timers[t.id];
                        timersChanged = true;
                    }
                });

                if (timersChanged) saveProcessTimers(timers);

                if (toAutoComplete.length > 0) {
                    toAutoComplete.forEach(trxId => {
                        autoCompleteOrder(trxId);
                        delete timers[trxId];
                    });
                    saveProcessTimers(timers);
                    toAutoComplete.forEach(trxId => {
                        const idx = newData.findIndex(t => t.id === trxId);
                        if (idx !== -1) newData[idx] = { ...newData[idx], status: "Selesai" };
                    });
                }

                // 1. Cek pesanan baru dengan membandingkan memori Ref, bukan State
                const incomingNewOrders = newData.filter(t => !prevTxIds.current.has(t.id));

                // 2. Jika bukan load pertama kali DAN ada pesanan baru, panggil Toast
                if (prevTxIds.current.size > 0 && incomingNewOrders.length > 0) {
                    setToast({
                        visible: true,
                        message: `Ada ${incomingNewOrders.length} pesanan baru masuk!`,
                        id: incomingNewOrders[0].id
                    });
                    setTimeout(() => setToast({ visible: false, message: "", id: "" }), 5000);
                }

                // 3. Perbarui memori Ref dengan data terbaru
                prevTxIds.current = new Set(newData.map(t => t.id));

                // 4. Update state secara aman (Pure Function)
                setTransactions(newData);

            } catch (error) {
                console.error("Koneksi API Error:", error);
            } finally {
                if (isInitial) setIsLoading(false);
            }
        };

        fetchTransactions(true);

        const intervalId = setInterval(() => {
            fetchTransactions(false);
        }, 5000);

        return () => clearInterval(intervalId);
    }, []);

    // KEBALKAN FUNGSI FORMAT RUPIAH AGAR TIDAK CRASH JIKA TERIMA STRING
    const formatRupiah = (num: any) => "Rp " + Number(num).toLocaleString("id-ID");

    const getStatusStyle = (status: string): React.CSSProperties => {
        const map: Record<string, React.CSSProperties> = {
            "Menunggu Pembayaran": { background: "#f3f4f6", color: "#6b7280", border: "1px solid #d1d5db" },
            "Menunggu Diproses": { background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca" },
            "Sedang Diracik": { background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a" },
            "Sedang Dikirim": { background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe" },
            "Siap Diambil": { background: "#f5f3ff", color: "#7c3aed", border: "1px solid #ddd6fe" },
            "Selesai": { background: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0" },
        };
        return map[status] ?? { background: "#f3f4f6", color: "#6b7280" };
    };

    const autoCompleteOrder = async (trxId: string) => {
        try {
            const response = await fetch(`/api/transaksi/${trxId}/status-pesanan`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status_pesanan: "Selesai" })
            });

            if (!response.ok) throw new Error("Gagal auto-update status di server");

            showFeedback(`Pesanan ${trxId} otomatis diselesaikan (lebih dari 1 jam diproses)`, "success");
        } catch (error) {
            console.error("Auto-complete error:", error);
        }
    };

    const requestConfirm = (trxId: string, action: "kirim" | "ambil" | "selesai") => {
        const map: Record<typeof action, { newStatus: StatusType; title: string; message: string }> = {
            kirim: {
                newStatus: "Sedang Dikirim",
                title: "Konfirmasi Pengiriman",
                message: `Tandai pesanan ${trxId} sebagai sudah dikirim ke customer?`,
            },
            ambil: {
                newStatus: "Siap Diambil",
                title: "Konfirmasi Siap Diambil",
                message: `Tandai pesanan ${trxId} sebagai siap diambil oleh customer?`,
            },
            selesai: {
                newStatus: "Selesai",
                title: "Selesaikan Pesanan",
                message: `Tandai pesanan ${trxId} sebagai selesai?`,
            },
        };
        setConfirmModal({ trxId, action, ...map[action] });
    };

    const handleConfirmedStatusUpdate = async () => {
        if (!confirmModal) return;
        const { trxId, newStatus } = confirmModal;

        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/transaksi/${trxId}/status-pesanan`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status_pesanan: newStatus })
            });

            if (!response.ok) throw new Error("Gagal update status di server");

            setTransactions(prev => prev.map(t => t.id === trxId ? { ...t, status: newStatus } : t));
            setSelectedDetail(prev => prev && prev.id === trxId ? { ...prev, status: newStatus } : prev);
            showFeedback(`Status pesanan berhasil diubah menjadi "${newStatus}"`, "success");
        } catch (error) {
            console.error("Error:", error);
            showFeedback("Gagal mengubah status pesanan. Periksa koneksi.", "error");
        } finally {
            setIsSubmitting(false);
            setConfirmModal(null);
        }
    };

    const newOrdersCount = transactions.filter(
        t => t.type === "Online" && (t.status === "Menunggu Diproses" || t.status === "Sedang Diracik")
    ).length;

    let filteredData = transactions;
    if (activeTab === "Pesanan Baru") {
        filteredData = transactions.filter(t => t.status === "Menunggu Diproses" || t.status === "Sedang Diracik");
    } else if (activeTab === "Diproses") {
        filteredData = transactions.filter(t => t.status === "Sedang Dikirim" || t.status === "Siap Diambil");
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

    const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
    const safePage = Math.min(currentPage, totalPages);
    const displayedData = filteredData.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    const handleTabChange = (tab: typeof activeTab) => { setActiveTab(tab); setCurrentPage(1); };
    const handleSearch = (q: string) => { setSearchQuery(q); setCurrentPage(1); };

    const renderAction = (trx: TransaksiDashboard) => {
        if (activeTab === "Semua") {
            return (
                <span style={getStatusStyle(trx.status)} className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap">
                    {trx.status}
                </span>
            );
        }

        if (activeTab === "Pesanan Baru" && (trx.status === "Menunggu Diproses" || trx.status === "Sedang Diracik")) {
            if (trx.deliveryMethod === "delivery") {
                return (
                    <button onClick={() => requestConfirm(trx.id, "kirim")} className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 text-[10px] font-bold hover:bg-blue-600 hover:text-white transition-all cursor-pointer whitespace-nowrap">
                        <Truck size={12} /> Sudah Dikirim
                    </button>
                );
            }
            if (trx.deliveryMethod === "pickup") {
                return (
                    <button onClick={() => requestConfirm(trx.id, "ambil")} className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-600 border border-purple-200 text-[10px] font-bold hover:bg-purple-600 hover:text-white transition-all cursor-pointer whitespace-nowrap">
                        <Store size={12} /> Siap Diambil
                    </button>
                );
            }
            return (
                <span style={getStatusStyle(trx.status)} className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap">
                    {trx.status}
                </span>
            );
        }

        if (activeTab === "Diproses" && (trx.status === "Sedang Dikirim" || trx.status === "Siap Diambil")) {
            return (
                <button onClick={() => requestConfirm(trx.id, "selesai")} className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold hover:bg-green-600 hover:text-white transition-all cursor-pointer whitespace-nowrap">
                    <PackageCheck size={12} /> Selesaikan
                </button>
            );
        }

        return (
            <span style={getStatusStyle(trx.status)} className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap">
                {trx.status}
            </span>
        );
    };

    return (

        <div className="flex flex-col gap-4 md:gap-6 w-full h-[calc(100vh-100px)] md:h-[calc(100vh-120px)] relative">

            {/* BARIS SUMMARY PANEL CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
                {[
                    { icon: <Receipt size={24} />, bg: "#eff6ff", color: "#2563eb", label: "Total Hari Ini", value: `${transactions.length} Transaksi` },
                    { icon: <Clock size={24} />, bg: "#fffbeb", color: "#d97706", label: "Sedang Disiapkan", value: `${transactions.filter(t => t.status === "Sedang Diracik" || t.status === "Menunggu Diproses").length} Pesanan` },
                    { icon: <Store size={24} />, bg: "#f5f3ff", color: "#7c3aed", label: "Menunggu Diambil", value: `${transactions.filter(t => t.status === "Siap Diambil").length} Pesanan` },
                    { icon: <Truck size={24} />, bg: "#ecfdf5", color: "#059669", label: "Dalam Perjalanan", value: `${transactions.filter(t => t.status === "Sedang Dikirim").length} Pesanan` },
                ].map((s, i) => (
                    <div key={i} className="bg-white p-4 md:p-5 rounded-2xl border border-outline-variant shadow-sm flex items-center gap-3 md:gap-4">
                        <div style={{ background: s.bg, color: s.color }} className="p-2.5 md:p-3 rounded-xl shrink-0">{s.icon}</div>
                        <div>
                            <p className="text-[10px] md:text-xs font-bold text-on-surface-variant uppercase tracking-wider">{s.label}</p>
                            <h3 className="text-lg md:text-xl font-black text-apomacy-dark">{s.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* TABEL DATA PANEL */}
            <div className="flex-1 bg-white rounded-2xl border border-outline-variant p-4 md:p-6 shadow-sm flex flex-col min-h-0">


                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 shrink-0 border-b border-gray-100 pb-4 md:pb-5 w-full">


                    <div className="flex gap-2 md:gap-3 overflow-x-auto w-full md:w-auto scrollbar-hide snap-x pb-2 md:pb-0 pt-2">
                        {(["Semua", "Pesanan Baru", "Diproses", "Selesai"] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => handleTabChange(tab)}
                                className={`snap-center shrink-0 px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all relative whitespace-nowrap ${activeTab === tab ? "bg-apomacy-dark text-white shadow-md" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                    }`}
                            >
                                {tab}
                                {tab === "Pesanan Baru" && newOrdersCount > 0 && (
                                    <span className="absolute -top-2 -right-1 flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full bg-red-500 text-white text-[9px] md:text-[10px] font-black ring-2 ring-white animate-bounce z-30 shadow-sm">
                                        {newOrdersCount}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Search Input */}
                    <div className="relative w-full md:w-72 shrink-0">
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

                <div className="flex flex-wrap items-center justify-between mb-3 gap-2 shrink-0">
                    <p className="text-[11px] md:text-xs text-gray-400 font-medium">
                        Menampilkan <span className="text-gray-700 font-bold">{displayedData.length}</span> dari <span className="text-gray-700 font-bold">{filteredData.length}</span> data
                    </p>
                </div>

                <div className="w-full border border-outline-variant rounded-xl overflow-hidden bg-white shadow-xs flex-1 flex flex-col min-h-0">

                    <div className="overflow-y-auto overflow-x-auto w-full flex-1 scrollbar-thin scrollbar-thumb-gray-300 relative">

                        {isLoading ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 gap-2 z-50 min-h-[300px]">
                                <Loader2 className="animate-spin text-apomacy-primary" size={32} />
                                <p className="text-xs md:text-sm font-bold text-gray-500 text-center px-4">Mengkoneksikan & Memproses Data </p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse min-w-[1000px]">
                                {/* HEADER TABEL */}
                                <thead className="sticky top-0 z-20 bg-gray-50/90 backdrop-blur-sm border-b border-gray-200">
                                    <tr className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                        <th className="px-6 py-4 w-[15%] whitespace-nowrap">No Trx</th>
                                        <th className="px-6 py-4 w-[15%] whitespace-nowrap">Waktu</th>
                                        <th className="px-6 py-4 w-[10%] text-center whitespace-nowrap">Jenis</th>
                                        <th className="px-6 py-4 w-[22%] whitespace-nowrap">Nama Pemesan</th>
                                        <th className="px-6 py-4 w-[8%] text-center whitespace-nowrap">Detail</th>
                                        <th className="px-6 py-4 w-[14%] text-right whitespace-nowrap">Subtotal</th>
                                        <th className="px-6 py-4 w-[16%] whitespace-nowrap">Status Pesanan</th>
                                    </tr>
                                </thead>

                                {/* BODY TABEL */}
                                <tbody className="divide-y divide-gray-100 text-sm text-gray-700 bg-white">
                                    {displayedData.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-24 text-center text-gray-400">
                                                <CheckCircle2 size={48} className="mx-auto mb-4 opacity-30" />
                                                <p className="font-bold text-base">Tidak ada data di tab ini.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        displayedData.map(trx => (
                                            <tr key={trx.id} className={`hover:bg-blue-50/50 transition-colors ${trx.status === "Sedang Diracik" || trx.status === "Menunggu Diproses" ? "bg-amber-50/30" : ""}`}>

                                                {/* Kolom No Trx */}
                                                <td className="px-6 py-4 font-mono text-[16px] font-bold text-apomacy-primary whitespace-nowrap">
                                                    {trx.id}
                                                </td>

                                                {/* Kolom Waktu */}
                                                <td className="px-6 py-4 text-[16px] text-gray-600 whitespace-nowrap">
                                                    {trx.date}
                                                </td>

                                                {/* Kolom Jenis (Online/Offline) */}
                                                <td className="px-2 py-4 text-center">
                                                    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${trx.type === "Online" ? "bg-indigo-50 text-indigo-600 border-indigo-100" : "bg-gray-50 text-gray-600 border-gray-200"}`}>
                                                        {trx.type}
                                                    </span>
                                                </td>

                                                {/* Kolom Nama Pemesan */}
                                                <td className="px-6 py-4 font-semibold text-gray-800 text-[16px] truncate max-w-[200px]">
                                                    {trx.customerName}
                                                </td>

                                                {/* Kolom Aksi Cek Obat */}
                                                <td className="px-6 py-4 text-center">
                                                    <button type="button" onClick={() => setSelectedDetail(trx)} className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-600 hover:text-white px-3 py-2 rounded-lg text-[12px] font-bold transition-all shadow-sm whitespace-nowrap">
                                                        <Eye size={16} /> Cek Detail
                                                    </button>
                                                </td>

                                                {/* Kolom Subtotal */}
                                                <td className="px-6 py-4 font-mono text-[16px] font-bold text-emerald-600 text-right whitespace-nowrap">
                                                    {formatRupiah(trx.subtotal)}
                                                </td>

                                                {/* Kolom Status Aksi */}
                                                <td className="px-6 py-4 text-left">
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
                    <div className="mt-4 shrink-0 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
                        <p className="text-[11px] md:text-xs text-gray-400 order-2 md:order-1 hidden sm:block">{PAGE_SIZE} data per halaman</p>
                        <div className="flex items-center gap-1 order-1 md:order-2 overflow-x-auto w-full md:w-auto justify-center pb-1 md:pb-0 scrollbar-hide">
                            <button onClick={() => setCurrentPage(1)} disabled={safePage === 1} className="px-2 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">«</button>
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safePage === 1} className="hidden sm:flex px-2 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all items-center gap-1">
                                <ChevronLeft size={14} /> Prev
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                                .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                                    acc.push(p);
                                    return acc;
                                }, [])
                                .map((p, i) => p === "..." ? (
                                    <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-xs">…</span>
                                ) : (
                                    <button key={p} onClick={() => setCurrentPage(p as number)} className={`w-7 h-7 md:w-8 md:h-8 rounded-lg text-xs font-bold border transition-all shrink-0 ${safePage === p ? "bg-apomacy-dark text-white border-apomacy-dark shadow-sm" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                                        {p}
                                    </button>
                                ))
                            }

                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="hidden sm:flex px-2 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all items-center gap-1">
                                Next <ChevronRight size={14} />
                            </button>
                            <button onClick={() => setCurrentPage(totalPages)} disabled={safePage === totalPages} className="px-2 py-1.5 rounded-lg text-xs font-bold border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">»</button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── TOAST NOTIFICATION */}
            {mounted && toast.visible && typeof document !== "undefined" && createPortal(
                <div style={{
                    position: "fixed", bottom: 20, right: "auto", left: "50%", transform: "translateX(-50%)", zIndex: 999999,
                    background: "#fff", borderRadius: 16, padding: "14px 16px",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.2)", border: "1px solid #fde68a",
                    display: "flex", alignItems: "flex-start", gap: 12,
                    width: "calc(100% - 40px)", maxWidth: 360,
                    animation: "slideInRight 0.4s cubic-bezier(0.34,1.3,0.64,1)"
                }}
                    className="md:right-10 md:left-auto md:transform-none"
                >
                    <div style={{ background: "#fffbeb", color: "#d97706", padding: 8, borderRadius: "50%", marginTop: 2, flexShrink: 0 }}>
                        <Bell size={20} className="animate-pulse" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h4 style={{ fontWeight: 800, fontSize: 13, color: "#111827", margin: "0 0 4px 0" }}>Pesanan Online Baru!</h4>
                        <p style={{ fontSize: 11, color: "#4b5563", margin: 0, lineHeight: 1.4 }}>{toast.message}</p>
                        <button
                            onClick={() => { handleTabChange("Pesanan Baru"); setToast({ ...toast, visible: false }); }}
                            style={{ background: "none", border: "none", color: "#2563eb", fontWeight: 700, fontSize: 11, padding: 0, marginTop: 8, cursor: "pointer" }}
                        >
                            Lihat &amp; Siapkan →
                        </button>
                    </div>
                    <button onClick={() => setToast({ ...toast, visible: false })} style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", flexShrink: 0 }}>
                        <X size={16} />
                    </button>
                </div>,
                document.body
            )}

            {/* ── MODAL DETAIL PESANAN ── */}
            {mounted && selectedDetail && (
                <PortalModal onClose={() => setSelectedDetail(null)}>
                    <div style={{
                        background: "#fff",
                        borderRadius: 20,
                        width: "100%",
                        maxWidth: 620,
                        boxShadow: "0 24px 80px rgba(0,0,0,0.25)",
                        overflow: "hidden",
                        margin: "0 16px",
                        display: "flex",
                        flexDirection: "column",
                        maxHeight: "88vh"
                    }}>
                        {/* Header */}
                        <div style={{ background: "var(--color-apomacy-primary, #0d6efd)", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", flexShrink: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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

                        {/* Customer + Status */}
                        <div style={{ padding: "14px 20px", borderBottom: "1px dashed #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexShrink: 0 }}>
                            <div>
                                <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 2 }}>Customer</p>
                                <p style={{ fontSize: 14, fontWeight: 700, color: "#1f2937", margin: 0 }}>{selectedDetail.customerName}</p>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                                <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: selectedDetail.type === "Online" ? "#eef2ff" : "#f3f4f6", color: selectedDetail.type === "Online" ? "#4338ca" : "#6b7280" }}>
                                    {selectedDetail.type}
                                </span>
                                <span style={{ ...getStatusStyle(selectedDetail.status), fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6 }}>
                                    {selectedDetail.status}
                                </span>
                            </div>
                        </div>

                        {/* Info Pengiriman — hanya tampil jika Online */}
                        {selectedDetail.type === "Online" && (
                            <div style={{ background: "#f8fafc", padding: "14px 20px", borderBottom: "1px solid #e5e7eb", flexShrink: 0 }}>
                                <p style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", marginBottom: 6, letterSpacing: "0.1em" }}>
                                    Info Pengiriman ({selectedDetail.deliveryMethod === "delivery" ? "Dikirim" : selectedDetail.deliveryMethod === "pickup" ? "Ambil Sendiri" : selectedDetail.deliveryMethod})
                                </p>
                                <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", margin: "0 0 4px 0" }}>
                                    📞 {selectedDetail.phone}
                                </p>
                                {selectedDetail.deliveryMethod === "delivery" && (
                                    <p style={{ fontSize: 12, color: "#6b7280", margin: 0, lineHeight: 1.6, wordBreak: "break-word" }}>
                                        📍 {selectedDetail.address}
                                    </p>
                                )}
                                {selectedDetail.deliveryMethod === "pickup" && (
                                    <p style={{ fontSize: 12, color: "#7c3aed", margin: 0, fontWeight: 600 }}>
                                        🏪 Customer akan mengambil langsung di apotek
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Daftar Item — scrollable */}
                        <div style={{ overflowY: "auto", padding: "0 20px", flex: 1, minHeight: 0 }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                                        {["Item", "Qty", "Total"].map((h, i) => (
                                            <th key={h} style={{ padding: "10px 0", fontSize: 10, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", textAlign: i === 0 ? "left" : i === 1 ? "center" : "right" }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedDetail.items.map((item, idx) => (
                                        <tr key={idx} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                            <td style={{ padding: "11px 0" }}>
                                                <p style={{ fontSize: 12, fontWeight: 700, color: "#1f2937", margin: 0 }}>{item.name}</p>
                                                <p style={{ fontSize: 11, color: "#9ca3af", fontFamily: "monospace", margin: 0 }}>{formatRupiah(item.price)}</p>
                                            </td>
                                            <td style={{ textAlign: "center", fontSize: 12, fontWeight: 700, fontFamily: "monospace", color: "#374151" }}>{item.qty}x</td>
                                            <td style={{ textAlign: "right", fontSize: 12, fontWeight: 700, fontFamily: "monospace", color: "#0d6efd" }}>{formatRupiah(item.qty * item.price)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer: Subtotal + Tombol Aksi */}
                        <div style={{ background: "#f9fafb", borderTop: "1px solid #e5e7eb", padding: "16px 20px", flexShrink: 0 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                <span style={{ fontSize: 12, color: "#6b7280" }}>Metode Pembayaran</span>
                                <span style={{ fontSize: 12, fontWeight: 700, color: "#1f2937" }}>{selectedDetail.paymentMethod}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #e5e7eb", marginTop: 8, paddingTop: 10 }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: "#1f2937", textTransform: "uppercase" }}>Subtotal</span>
                                <span style={{ fontSize: 20, fontWeight: 800, fontFamily: "monospace", color: "#0d9488" }}>{formatRupiah(selectedDetail.subtotal)}</span>
                            </div>

                            {/* ── TOMBOL AKSI BERDASARKAN STATUS & METODE PENGIRIMAN ── */}
                            {selectedDetail.type === "Online" && (() => {
                                const s = selectedDetail.status;
                                const dm = selectedDetail.deliveryMethod;

                                // Tab Pesanan Baru: tampilkan tombol sesuai metode pengiriman customer
                                if (s === "Menunggu Diproses" || s === "Sedang Diracik") {
                                    if (dm === "delivery") {
                                        return (
                                            <button
                                                onClick={() => { requestConfirm(selectedDetail.id, "kirim"); }}
                                                style={{ marginTop: 14, width: "100%", padding: "12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                                            >
                                                <Truck size={16} /> Tandai Sudah Dikirim
                                            </button>
                                        );
                                    }
                                    if (dm === "pickup") {
                                        return (
                                            <button
                                                onClick={() => { requestConfirm(selectedDetail.id, "ambil"); }}
                                                style={{ marginTop: 14, width: "100%", padding: "12px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                                            >
                                                <Store size={16} /> Tandai Siap Diambil
                                            </button>
                                        );
                                    }
                                }

                                // Tab Diproses: tampilkan tombol selesaikan
                                if (s === "Sedang Dikirim" || s === "Siap Diambil") {
                                    return (
                                        <button
                                            onClick={() => { requestConfirm(selectedDetail.id, "selesai"); }}
                                            style={{ marginTop: 14, width: "100%", padding: "12px", background: "#059669", color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                                        >
                                            <PackageCheck size={16} /> Selesaikan Pesanan
                                        </button>
                                    );
                                }

                                return null;
                            })()}
                        </div>
                    </div>
                </PortalModal>
            )}

            {/* ── MODAL KONFIRMASI PERUBAHAN STATUS PESANAN ── */}
            {mounted && confirmModal && (
                <ModalConfirm
                    isOpen={!!confirmModal}
                    title={confirmModal.title}
                    message={confirmModal.message}
                    type="edit"
                    onConfirm={handleConfirmedStatusUpdate}
                    onCancel={() => !isSubmitting && setConfirmModal(null)}
                />
            )}

            {/* ── TOAST FEEDBACK SUKSES/GAGAL UNTUK SETIAP AKSI STATUS ── */}
            {mounted && <Toast toast={feedback} />}

        </div>
    );
}

export default function KasirDashboardPage() {
    return (
        <Suspense fallback={null}>
            <KasirDashboardContent />
        </Suspense>
    );
}
