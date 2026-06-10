"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useCart } from "@/context/CartContext";
import api from "@/lib/api"; // axios instance yang sudah attach Bearer token otomatis

interface ItemDetail {
    id: string;
    price: number;
    quantity: number;
    name: string;
}

interface CheckoutButtonProps {
    grossAmount: number;
    paymentMethod: string;
    items: ItemDetail[];
    onValidate: () => boolean;
    /** Data pengiriman/pickup dari form di page.tsx */
    deliveryData: {
        method: "delivery" | "pickup";
        name: string;
        phone: string;
        address: string;
        landmark: string;
        pickupName: string;
        pickupPhone: string;
    };
}

type NotifStatus = "success" | "pending" | "error" | "closed" | null;

// ── Komponen notifikasi internal ─────────────────────────────────────────────
function PaymentNotification({
    status,
    orderId,
    onRedirect,
}: {
    status: NotifStatus;
    orderId: string;
    onRedirect: () => void;
}) {
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        if (status !== "success") return;
        if (countdown <= 0) {
            onRedirect();
            return;
        }
        const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [status, countdown, onRedirect]);

    if (!status) return null;

    const config: Record<
        NonNullable<NotifStatus>,
        { bg: string; border: string; icon: string; title: string; message: string }
    > = {
        success: {
            bg: "bg-emerald-50",
            border: "border-emerald-400",
            icon: "✅",
            title: "Pembayaran Berhasil!",
            message: `Order #${orderId} telah dikonfirmasi.`,
        },
        pending: {
            bg: "bg-yellow-50",
            border: "border-yellow-400",
            icon: "⏳",
            title: "Menunggu Pembayaran",
            message: `Order #${orderId} sedang diproses. Selesaikan pembayaran sebelum batas waktu.`,
        },
        error: {
            bg: "bg-red-50",
            border: "border-red-400",
            icon: "❌",
            title: "Pembayaran Gagal",
            message: "Transaksi tidak berhasil. Silakan coba kembali.",
        },
        closed: {
            bg: "bg-gray-50",
            border: "border-gray-300",
            icon: "ℹ️",
            title: "Pembayaran Dibatalkan",
            message: "Kamu menutup halaman pembayaran. Pesanan belum diproses.",
        },
    };

    const { bg, border, icon, title, message } = config[status];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className={`w-full max-w-sm rounded-2xl border-2 ${border} ${bg} p-6 shadow-2xl`}>
                <div className="mb-4 text-center text-5xl">{icon}</div>
                <h2 className="mb-2 text-center text-xl font-black text-apomacy-dark">{title}</h2>
                <p className="mb-5 text-center text-sm text-gray-600">{message}</p>

                {status === "success" && (
                    <div className="mb-4">
                        <div className="mb-1 text-center text-xs text-gray-500">
                            Mengalihkan ke katalog dalam{" "}
                            <span className="font-bold text-apomacy-primary">{countdown}</span> detik...
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-emerald-200">
                            <div
                                className="h-full rounded-full bg-emerald-500 transition-all duration-1000 ease-linear"
                                style={{ width: `${(countdown / 5) * 100}%` }}
                            />
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-2">
                    {status === "success" && (
                        <button
                            onClick={onRedirect}
                            className="w-full rounded-xl bg-apomacy-primary py-3 text-sm font-bold text-white transition-all hover:bg-apomacy-dark"
                        >
                            Ke Katalog Sekarang
                        </button>
                    )}
                    {status === "pending" && (
                        <button
                            onClick={onRedirect}
                            className="w-full rounded-xl bg-yellow-500 py-3 text-sm font-bold text-white transition-all hover:bg-yellow-600"
                        >
                            Lihat Status Pesanan
                        </button>
                    )}
                    {(status === "error" || status === "closed") && (
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full rounded-xl bg-apomacy-primary py-3 text-sm font-bold text-white transition-all hover:bg-apomacy-dark"
                        >
                            Coba Lagi
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Helper: decode JWT payload tanpa library tambahan ─────────────────────────
function decodeJwtPayload(token: string): Record<string, unknown> | null {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const json = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
                .join("")
        );
        return JSON.parse(json);
    } catch {
        return null;
    }
}

// ── Komponen utama ────────────────────────────────────────────────────────────
export default function CheckoutButton({
    grossAmount,
    paymentMethod,
    items,
    onValidate,
    deliveryData,
}: CheckoutButtonProps) {
    const router = useRouter();
    const { clearCart } = useCart();

    const [isLoading, setIsLoading] = useState(false);
    const [notifStatus, setNotifStatus] = useState<NotifStatus>(null);
    const [orderId, setOrderId] = useState("");

    const handleRedirect = () => {
        setNotifStatus(null);
        router.push("/katalog");
    };

    const handleCheckout = async () => {
        if (!onValidate()) return;
        setIsLoading(true);

        try {
            // ── STEP 1: Ambil id_user dari JWT di cookie ──────────────────
            const Cookies = (await import("js-cookie")).default;
            const token = Cookies.get("apomacy_token");

            if (!token) {
                // Token tidak ada → redirect ke login
                router.push("/login?redirect=/checkout");
                return;
            }

            const payload = decodeJwtPayload(token);
            const idUser = payload?.id_user as number | undefined;

            if (!idUser) {
                throw new Error("Token tidak valid, silakan login ulang");
            }

            // ── STEP 2: Bangun payload transaksi untuk backend Go ─────────
            const generatedOrderId = `TRX-${Date.now()}`;
            setOrderId(generatedOrderId);

            // Mapping items dari Midtrans format → detail_transaksi format
            const details = items
                .filter((item) => item.id !== "ONGKIR-01") // shipping bukan obat
                .map((item) => ({
                    id_obat: parseInt(item.id),
                    nama_obat: item.name,
                    harga_satuan: item.price,
                    qty: item.quantity,
                    subtotal: item.price * item.quantity,
                }));

            const subtotal = details.reduce((acc, d) => acc + d.subtotal, 0);

            // Nama customer: ambil dari form delivery atau pickup
            const namaCustomer =
                deliveryData.method === "delivery"
                    ? deliveryData.name
                    : deliveryData.pickupName;

            const transaksiPayload = {
                id_user: idUser,
                no_transaksi: generatedOrderId,
                nama_customer: namaCustomer || null,
                total_item: details.reduce((acc, d) => acc + d.qty, 0),
                subtotal: subtotal,
                total_bayar: grossAmount, // sudah termasuk ongkir
                metode_pembayaran: mapPaymentMethod(paymentMethod),
                resep_required: false,
                status: "menunggu_pembayaran",
                details,
            };

            // ── STEP 3: Simpan transaksi ke database dulu ─────────────────
            // Menggunakan axios instance `api` yang sudah attach Authorization header otomatis
            await api.post("/transaksi", transaksiPayload);

            // ── STEP 4: Ambil Snap token dari backend Go ──────────────────
            const snapRes = await api.post("/checkout", {
                order_id: generatedOrderId,
                gross_amount: grossAmount,
                payment_method: paymentMethod,
                items,
            });

            const snapToken = snapRes.data.token;

            if (!window.snap) {
                throw new Error("Snap script belum termuat");
            }

            // ── STEP 5: Buka Snap popup ───────────────────────────────────
            window.snap.pay(snapToken, {
                onSuccess: function () {
                    clearCart?.();
                    setNotifStatus("success");
                },
                onPending: function () {
                    setNotifStatus("pending");
                },
                onError: function () {
                    setNotifStatus("error");
                },
                onClose: function () {
                    setNotifStatus("closed");
                },
            });
        } catch (error: unknown) {
            console.error("Checkout failed:", error);

            // Jika 401 → axios interceptor di api.ts sudah redirect ke /login
            // Tangkap error lain dan tampilkan notif
            if ((error as { response?: { status: number } })?.response?.status !== 401) {
                setNotifStatus("error");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Script
                src="https://app.sandbox.midtrans.com/snap/snap.js"
                data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
                strategy="beforeInteractive"
            />

            <PaymentNotification
                status={notifStatus}
                orderId={orderId}
                onRedirect={handleRedirect}
            />

            <button
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full bg-apomacy-primary text-white py-4 rounded-2xl font-bold mt-8 hover:bg-apomacy-dark transition-all shadow-lg shadow-apomacy-primary/20 tracking-wider uppercase text-sm disabled:opacity-50"
            >
                {isLoading ? "Menyiapkan Pembayaran..." : "Selesaikan Pesanan"}
            </button>
        </>
    );
}

// ── Helper: map string payment method ke enum backend ─────────────────────────
function mapPaymentMethod(method: string): string {
    switch (method) {
        case "qris":
            return "QRIS";
        case "bca":
        case "mandiri":
            return "Transfer";
        default:
            return "QRIS";
    }
}