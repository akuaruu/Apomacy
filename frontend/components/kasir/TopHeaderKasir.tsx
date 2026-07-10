"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, UserCircle2, Bell, Plus, Menu, Clock, Truck, Store, Package, X, RefreshCw } from "lucide-react";
import api from "@/lib/api";


const API_URL = "/api/transaksi/all";
const POLL_MS = 5_000;

// ─── TYPES ───────────────────────────────────────────────────────────────────────
interface TopHeaderProps {
    onMenuClick: () => void;
}

interface Pengiriman {
    id_pengiriman: number;
    id_transaksi: number;
    metode_penerimaan: string;
    nama_penerima?: string;
    no_hp_penerima?: string;
    alamat_pengiriman?: string;
    waktu_pesanan_sampai?: string;
}

interface TransaksiAPI {
    id_transaksi: number;
    no_transaksi: string;
    tanggal_transaksi: string;
    nama_customer: string | null;
    status: string;
    status_pesanan: string;
    pengiriman?: Pengiriman | null;
}

interface GetAllResponse {
    message: string;
    data: TransaksiAPI[];
}

type AktifStatusPesanan =
    | "Menunggu Diproses"
    | "Sedang Diracik"
    | "Sedang Dikirim"
    | "Siap Diambil";

const AKTIF_STATUSES: AktifStatusPesanan[] = [
    "Menunggu Diproses",
    "Sedang Diracik",
    "Sedang Dikirim",
    "Siap Diambil",
];

const STATUS_CFG: Record<AktifStatusPesanan, {
    bg: string;
    color: string;
    icon: React.ReactNode;
    label: string;
}> = {
    "Menunggu Diproses": { bg: "#fef2f2", color: "#ef4444", icon: <Package size={13} />, label: "Perlu Diproses" },
    "Sedang Diracik": { bg: "#fffbeb", color: "#d97706", icon: <Clock size={13} />, label: "Sedang Diracik" },
    "Sedang Dikirim": { bg: "#eff6ff", color: "#2563eb", icon: <Truck size={13} />, label: "Sedang Dikirim" },
    "Siap Diambil": { bg: "#f5f3ff", color: "#7c3aed", icon: <Store size={13} />, label: "Siap Diambil" },
};

interface PendingOrder {
    id: string;
    customerName: string;
    status: AktifStatusPesanan;
    time: string;
    isOnline: boolean;
    metodeKirim?: string;
}

// ─── HELPER ──────────────────────────────────────────────────────────────────────
function toWIBTime(isoString: string): string {
    try {
        return new Date(isoString).toLocaleTimeString("id-ID", {
            hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta",
        });
    } catch { return "--:--"; }
}

function isAktifStatus(s: string): s is AktifStatusPesanan {
    return (AKTIF_STATUSES as string[]).includes(s);
}

function mapToDisplay(trx: TransaksiAPI): PendingOrder | null {
    if (!isAktifStatus(trx.status_pesanan)) return null;
    return {
        id: trx.no_transaksi,
        customerName: trx.nama_customer ?? "Customer",
        status: trx.status_pesanan,
        time: toWIBTime(trx.tanggal_transaksi),
        isOnline: !!trx.pengiriman,
        metodeKirim: trx.pengiriman?.metode_penerimaan,
    };
}

// ─── HOOK: usePendingOrders ───────────────────────────────────────────────────────
function usePendingOrders() {
    const [orders, setOrders] = useState<PendingOrder[]>([]);
    const [readIds, setReadIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [lastFetch, setLastFetch] = useState<Date | null>(null);

    const fetchOrders = useCallback(async () => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 6000);

            const res = await fetch(API_URL, {
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "same-origin",
                signal: controller.signal,
            });
            clearTimeout(timeoutId);

            if (!res.ok) throw new Error(`Gagal memuat notifikasi (status ${res.status})`);

            const json: GetAllResponse = await res.json();
            const raw: TransaksiAPI[] = json?.data ?? [];
            const pending = raw
                .map(mapToDisplay)
                .filter((o): o is PendingOrder => o !== null)
                .sort((a, b) => AKTIF_STATUSES.indexOf(a.status) - AKTIF_STATUSES.indexOf(b.status));
            setOrders(pending);
        } catch (err) {
            console.error("Gagal mengambil data notifikasi transaksi:", err);
        } finally {
            setLastFetch(new Date());
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
        const timer = setInterval(fetchOrders, POLL_MS);
        return () => clearInterval(timer);
    }, [fetchOrders]);

    const markRead = useCallback((id: string) => setReadIds(prev => new Set([...prev, id])), []);
    const markAllRead = useCallback(() => setReadIds(new Set(orders.map(o => o.id))), [orders]);
    const unreadCount = orders.filter(o => !readIds.has(o.id)).length;

    return { orders, unreadCount, readIds, loading, lastFetch, markRead, markAllRead, refetch: fetchOrders };
}

// ─── NOTIFICATION DROPDOWN ────────────────────────────────────────────────────────
function NotificationDropdown({
    orders, unreadCount, readIds, loading, lastFetch,
    onMarkRead, onMarkAllRead, onRefetch,
}: {
    orders: PendingOrder[];
    unreadCount: number;
    readIds: Set<string>;
    loading: boolean;
    lastFetch: Date | null;
    onMarkRead: (id: string) => void;
    onMarkAllRead: () => void;
    onRefetch: () => void;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        const clickOut = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        const escKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
        document.addEventListener("mousedown", clickOut);
        document.addEventListener("keydown", escKey);
        return () => {
            document.removeEventListener("mousedown", clickOut);
            document.removeEventListener("keydown", escKey);
        };
    }, []);

    const fmtTime = (d: Date) =>
        d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });


    const handleOrderClick = (orderId: string) => {
        onMarkRead(orderId);
        setOpen(false);
        router.push("/kasir?tab=pesanan-baru");
    };

    // ── Tombol "Lihat semua" di footer ──
    const handleViewAll = () => {
        setOpen(false);
        router.push("/kasir?tab=pesanan-baru");
    };

    return (
        <div ref={ref} className="relative">
            {/* ── Bell button ── */}
            <button
                onClick={() => setOpen(v => !v)}
                aria-label="Notifikasi pesanan aktif"
                className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors
                    ${open
                        ? "bg-apomacy-primary/10 text-apomacy-primary"
                        : "text-on-surface-variant hover:bg-surface-container-low hover:text-apomacy-primary"
                    }`}
            >
                <Bell
                    size={20}
                    strokeWidth={2}
                    style={{
                        animation: unreadCount > 0 && !open ? "bellShake 2.5s ease infinite" : "none",
                        color: unreadCount > 0 ? "#d97706" : undefined,
                    }}
                />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-black ring-2 ring-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* ── Dropdown panel ── */}
            {open && (
                <div
                    className="absolute right-0 mt-2 bg-white rounded-2xl border border-gray-100 overflow-hidden"
                    style={{
                        width: 340,
                        zIndex: 9999,
                        boxShadow: "0 20px 60px rgba(0,0,0,0.13), 0 4px 16px rgba(0,0,0,0.07)",
                        animation: "dropIn 0.2s cubic-bezier(0.34,1.2,0.64,1)",
                    }}
                >
                    {/* Header dropdown */}
                    <div
                        className="flex items-center justify-between px-4 py-3"
                        style={{ background: "linear-gradient(135deg, #0d1b3e 0%, #1e3a6e 100%)" }}
                    >
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-white/10 rounded-lg">
                                <Bell size={14} className="text-white" />
                            </div>
                            <div>
                                <p className="text-white font-bold text-[13px] leading-none">Pesanan Aktif</p>
                                <p className="text-white/50 text-[10px] mt-0.5">
                                    {unreadCount > 0
                                        ? `${unreadCount} perlu diperhatikan`
                                        : "Semua sudah dilihat"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={onRefetch}
                                title="Refresh manual"
                                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
                            >
                                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                            </button>
                            {unreadCount > 0 && (
                                <button
                                    onClick={onMarkAllRead}
                                    className="text-[10px] text-blue-300 hover:text-white font-semibold px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
                                >
                                    Tandai semua
                                </button>
                            )}
                            <button
                                onClick={() => setOpen(false)}
                                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
                            >
                                <X size={13} />
                            </button>
                        </div>
                    </div>

                    {/* List pesanan aktif */}
                    <div className="overflow-y-auto" style={{ maxHeight: 360 }}>
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50">
                                    <div className="w-7 h-7 rounded-lg bg-gray-100 animate-pulse flex-shrink-0" />
                                    <div className="flex-1 space-y-1.5">
                                        <div className="h-2.5 bg-gray-100 rounded animate-pulse w-3/4" />
                                        <div className="h-2 bg-gray-100 rounded animate-pulse w-1/2" />
                                    </div>
                                </div>
                            ))
                        ) : orders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                                <Bell size={32} className="mb-2 opacity-20" />
                                <p className="text-sm font-semibold">Tidak ada pesanan aktif</p>
                                <p className="text-xs mt-0.5">Semua pesanan sudah selesai</p>
                            </div>
                        ) : (
                            orders.map((order, idx) => {
                                const cfg = STATUS_CFG[order.status];
                                const isRead = readIds.has(order.id);
                                return (
                                    <button
                                        key={order.id}
                                        type="button"
                                        onClick={() => handleOrderClick(order.id)}
                                        className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                                        style={{
                                            borderBottom: idx < orders.length - 1 ? "1px solid #f3f4f6" : "none",
                                            background: !isRead ? "rgba(239,246,255,0.5)" : undefined,
                                        }}
                                    >
                                        {/* Status icon */}
                                        <div
                                            className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-lg mt-0.5"
                                            style={{ background: cfg.bg, color: cfg.color }}
                                        >
                                            {cfg.icon}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className={`text-[12px] font-bold truncate ${!isRead ? "text-gray-900" : "text-gray-500"}`}>
                                                    {order.customerName}
                                                </p>
                                                <span className="text-[10px] text-gray-400 font-mono flex-shrink-0">
                                                    {order.time} WIB
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                                <span
                                                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                                                    style={{ background: cfg.bg, color: cfg.color }}
                                                >
                                                    {cfg.label}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-mono">
                                                    {order.id}
                                                </span>
                                                {order.isOnline && (
                                                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-500">
                                                        {order.metodeKirim === "delivery" ? "Dikirim" : "Pickup"}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Unread dot */}
                                        {!isRead && (
                                            <span className="flex-shrink-0 mt-2 w-1.5 h-1.5 rounded-full bg-blue-500" />
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                        <p className="text-[10px] text-gray-400">
                            {lastFetch
                                ? <>Diperbarui <span className="font-semibold text-gray-600">{fmtTime(lastFetch)}</span></>
                                : "Memuat..."}
                        </p>

                        <button
                            type="button"
                            onClick={handleViewAll}
                            className="text-[11px] font-bold text-apomacy-primary hover:underline bg-transparent border-none cursor-pointer"
                        >
                            Lihat semua →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────────
export default function TopHeader({ onMenuClick }: TopHeaderProps) {
    const [time, setTime] = useState("");
    const [namaKaryawan, setNamaKaryawan] = useState("Kasir");

    const {
        orders, unreadCount, readIds, loading, lastFetch,
        markRead, markAllRead, refetch,
    } = usePendingOrders();

    useEffect(() => {
        api.get("/users/session")
            .then((response) => {
                const nama = response.data?.user?.nama;
                if (nama) setNamaKaryawan(nama);
            })
            .catch(() => undefined);

        const tick = () =>
            setTime(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }));
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    return (
        <>
            <style>{`
                @keyframes bellShake {
                    0%,100% { transform: rotate(0deg); }
                    10%     { transform: rotate(15deg); }
                    20%     { transform: rotate(-10deg); }
                    30%     { transform: rotate(6deg); }
                    40%     { transform: rotate(-4deg); }
                    50%,100%{ transform: rotate(0deg); }
                }
                @keyframes dropIn {
                    from { opacity: 0; transform: translateY(-8px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0)    scale(1);    }
                }
            `}</style>

            <header className="sticky top-0 z-30 flex h-16 md:h-20 items-center justify-between gap-2 md:gap-4 bg-white/80 backdrop-blur-md border-b border-outline-variant px-4 md:px-8 shadow-sm">

                {/* Hamburger mobile */}
                <button
                    onClick={onMenuClick}
                    className="md:hidden flex items-center justify-center p-2 text-on-surface-variant hover:bg-surface-container-low hover:text-apomacy-primary rounded-xl transition-colors"
                >
                    <Menu size={24} />
                </button>

                {/* Search bar */}
                <div className="hidden md:flex max-w-md flex-1 items-center gap-2 rounded-xl bg-surface-container-low px-4 py-2.5 border border-transparent focus-within:border-apomacy-primary focus-within:ring-2 focus-within:ring-apomacy-primary/20 transition-all">
                    <Search size={18} className="text-outline" />
                    <input
                        type="text"
                        placeholder="Pencarian global..."
                        className="flex-1 bg-transparent text-sm font-medium text-on-surface outline-none placeholder:text-outline"
                    />
                </div>

                <div className="flex-1 md:hidden" />

                {/* Kanan: aksi + notif + profil */}
                <div className="flex items-center gap-2 md:gap-5">

                    {/* Tambah Transaksi */}
                    <Link
                        href="/kasir/transaksi"
                        className="flex items-center gap-2 bg-apomacy-primary hover:bg-apomacy-dark text-white px-3 md:px-4 py-2 md:py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm"
                    >
                        <Plus size={18} strokeWidth={2.5} />
                        <span className="hidden sm:inline">Tambah Transaksi</span>
                    </Link>

                    {/* ── Notification Bell ── */}
                    <NotificationDropdown
                        orders={orders}
                        unreadCount={unreadCount}
                        readIds={readIds}
                        loading={loading}
                        lastFetch={lastFetch}
                        onMarkRead={markRead}
                        onMarkAllRead={markAllRead}
                        onRefetch={refetch}
                    />

                    <div className="hidden md:block h-6 w-px bg-outline-variant" />

                    {/* Nama kasir + jam */}
                    <div className="hidden md:block text-right">
                        <p className="text-sm font-bold text-apomacy-dark">{namaKaryawan}</p>
                        <p className="text-[11px] font-medium text-apomacy-muted">{time} WIB</p>
                    </div>

                    {/* Avatar */}
                    <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full bg-apomacy-primary/10 border border-apomacy-primary/20 cursor-pointer hover:bg-apomacy-primary/20 transition-colors shrink-0">
                        <UserCircle2 size={24} className="text-apomacy-primary" strokeWidth={2} />
                    </div>
                </div>
            </header>
        </>
    );
}
