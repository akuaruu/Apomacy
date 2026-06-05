"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function PendingPaymentPage() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("order_id");

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-md w-full text-center">
                <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <h1 className="text-2xl font-black text-apomacy-dark mb-2">Menunggu Pembayaran</h1>
                <p className="text-gray-500 text-sm mb-6">
                    Pesanan dengan ID <span className="font-bold text-apomacy-primary">{orderId}</span> sedang menunggu pembayaran diselesaikan.
                </p>
                <Link
                    href="/"
                    className="block w-full bg-apomacy-primary text-white py-3 rounded-xl font-bold hover:bg-apomacy-dark transition-colors"
                >
                    Kembali ke Beranda
                </Link>
            </div>
        </div>
    );
}