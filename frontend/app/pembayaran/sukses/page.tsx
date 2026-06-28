"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

function SuksesContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const redirectHandledRef = useRef(false);

    const orderId = searchParams.get("order_id");
    const statusCode = searchParams.get("status_code");
    const transactionStatus = searchParams
        .get("transaction_status")
        ?.trim()
        .toLowerCase();

    const isSuccess =
        transactionStatus === "settlement" ||
        transactionStatus === "capture" ||
        (!transactionStatus && statusCode === "200");

    const isPending =
        transactionStatus === "pending" ||
        (!transactionStatus && statusCode === "201");

    const isFailure = [
        "cancel",
        "expire",
        "deny",
        "failure",
    ].includes(transactionStatus ?? "");

    useEffect(() => {
        if (!isPending || redirectHandledRef.current) return;

        redirectHandledRef.current = true;

        const params = new URLSearchParams();

        if (orderId) params.set("order_id", orderId);
        if (statusCode) params.set("status_code", statusCode);
        if (transactionStatus) {
            params.set("transaction_status", transactionStatus);
        }

        router.replace(`/pembayaran/pending?${params.toString()}`);
    }, [
        isPending,
        orderId,
        router,
        statusCode,
        transactionStatus,
    ]);

    if (isPending) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Memuat status pembayaran...
            </div>
        );
    }

    if (isFailure || !isSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-2">
                        Pembayaran Tidak Berhasil
                    </h1>

                    <p className="text-gray-500 mb-6">
                        Transaksi dibatalkan, ditolak, kedaluwarsa, atau statusnya tidak valid.
                    </p>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-8">
                        <p className="text-sm text-gray-500 mb-1">Order ID</p>
                        <p className="font-mono font-semibold text-gray-800">
                            {orderId || "TRX-TIDAK-DIKETAHUI"}
                        </p>
                    </div>

                    <Link
                        href="/keranjang/checkout"
                        className="block w-full bg-teal-500 text-white py-3 rounded-xl font-bold hover:bg-teal-600 transition-all shadow-lg shadow-teal-200"
                    >
                        Kembali ke Checkout
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Pembayaran Berhasil!</h1>
                <p className="text-gray-500 mb-6">Terima kasih. Pesananmu sudah masuk dan sedang kami siapkan.</p>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-8">
                    <p className="text-sm text-gray-500 mb-1">Order ID</p>
                    <p className="font-mono font-semibold text-gray-800">{orderId || "TRX-TIDAK-DIKETAHUI"}</p>
                </div>
                <Link href="/katalog" className="block w-full bg-teal-500 text-white py-3 rounded-xl font-bold hover:bg-teal-600 transition-all shadow-lg shadow-teal-200">
                    Kembali ke Katalog
                </Link>
            </div>
        </div>
    );
}

export default function PembayaranSuksesPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Memuat...</div>}>
            <SuksesContent />
        </Suspense>
    );
}
