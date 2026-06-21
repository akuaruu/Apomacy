"use client";

import Link from "next/link";
// 1. Tambahkan useRouter di sini
import { useSearchParams, useRouter } from "next/navigation";
import Script from "next/script";
import { Suspense } from "react";

function PendingContent() {
    const searchParams = useSearchParams();
    const router = useRouter(); // 2. Inisialisasi router
    const orderId = searchParams.get("order_id");
    const token = searchParams.get("token");

    // 3. Update fungsi pemanggil Snap dengan Callbacks lengkap
    const handleReopenSnap = () => {
        if (typeof window !== "undefined" && (window as any).snap && token) {
            (window as any).snap.pay(token, {
                onSuccess: function (result: any) {
                    // Jika user iseng bayar beneran lewat pop-up ini, lempar ke halaman sukses
                    console.log("Payment Success from Pending:", result);
                    router.push(`/pembayaran/sukses?order_id=${result.order_id}`);
                },
                onPending: function (result: any) {
                    // Jika user ganti metode bayar tapi tetap pending, biarkan saja di halaman ini
                    console.log("Masih Pending");
                },
                onError: function (result: any) {
                    alert("Terjadi kesalahan pada sistem pembayaran. Silakan coba lagi.");
                },
                onClose: function () {
                    // KUNCI UTAMA: Jika tombol 'X' ditekan, biarkan pop-up tertutup, 
                    // JANGAN lempar ke mana-mana agar user tetap di halaman instruksi Pending.
                    console.log("Pop-up ditutup oleh user.");
                }
            });
        } else {
            alert("Sistem pembayaran sedang dimuat, mohon tunggu sebentar.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <Script
                src="https://app.sandbox.midtrans.com/snap/snap.js"
                data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
                strategy="lazyOnload"
            />

            <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-gray-800 mb-2">Menunggu Pembayaran</h1>
                <p className="text-gray-500 mb-6">Pesanan berhasil dibuat! Silakan selesaikan pembayaranmu sesuai instruksi di bawah ini.</p>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-8">
                    <p className="text-sm text-gray-500 mb-1">Order ID</p>
                    <p className="font-mono font-semibold text-gray-800">{orderId || "TRX-TIDAK-DIKETAHUI"}</p>
                </div>

                {token && (
                    <button
                        onClick={handleReopenSnap}
                        className="block w-full bg-apomacy-teal text-white py-3 rounded-xl font-bold hover:bg-teal-600 transition-all shadow-lg shadow-teal-200 mb-3"
                    >
                        Lihat VA & Cara Bayar
                    </button>
                )}

                <Link href="/katalog" className="block w-full bg-white text-gray-500 border border-gray-300 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all">
                    Tutup & Kembali ke Katalog
                </Link>
            </div>
        </div>
    );
}

export default function PembayaranPendingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Memuat data...</div>}>
            <PendingContent />
        </Suspense>
    );
}