"use client";

import { useState } from "react";
import Link from "next/link";

export default function CheckoutPage() {
    // Simulasi state keranjang
    const [cartItems, setCartItems] = useState([
        { id: 1, name: "Paracetamol 500mg", price: 15000, qty: 2 },
        { id: 3, name: "Vitamin C 1000mg", price: 45000, qty: 1 },
    ]);

    const totalBelanja = cartItems.reduce((total, item) => total + (item.price * item.qty), 0);
    const biayaAdmin = 2500;
    const totalBayar = totalBelanja + biayaAdmin;

    return (
        <div className="min-h-screen bg-white text-apomacy-900 font-sans flex flex-col">
            <header className="bg-apomacy-800 py-6 shadow-md">
                <h1 className="text-2xl font-bold text-white text-center">Keranjang Belanja</h1>
            </header>

            <main className="flex-grow max-w-4xl mx-auto w-full px-4 py-8">
                {cartItems.length === 0 ? (
                    <div className="text-center py-20">
                        <h2 className="text-2xl text-apomacy-500 mb-4">Keranjangmu masih kosong</h2>
                        <Link href="/katalog" className="text-base text-apomacy-800 underline hover:text-apomacy-900">
                            Mulai belanja di sini
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* List Item Keranjang */}
                        <div className="w-full md:w-2/3">
                            <h2 className="text-xl font-bold mb-4 text-apomacy-800">Daftar Pesanan</h2>
                            <div className="space-y-4">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center p-4 border border-apomacy-100 rounded-xl hover:shadow-md transition bg-apomacy-50/30">
                                        <div>
                                            <h3 className="font-bold text-base text-apomacy-900">{item.name}</h3>
                                            <p className="text-sm text-apomacy-500">Rp {item.price.toLocaleString('id-ID')} x {item.qty}</p>
                                        </div>
                                        <div className="font-bold text-apomacy-800 text-base">
                                            Rp {(item.price * item.qty).toLocaleString('id-ID')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Ringkasan Pembayaran */}
                        <div className="w-full md:w-1/3">
                            <div className="bg-apomacy-100 p-6 rounded-2xl shadow-sm sticky top-8">
                                <h2 className="text-xl font-bold mb-6 text-apomacy-900 border-b border-apomacy-300 pb-2">Ringkasan</h2>

                                <div className="flex justify-between mb-3 text-base">
                                    <span className="text-gray-700">Total Harga</span>
                                    <span className="font-semibold">Rp {totalBelanja.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between mb-6 text-base">
                                    <span className="text-gray-700">Biaya Admin</span>
                                    <span className="font-semibold">Rp {biayaAdmin.toLocaleString('id-ID')}</span>
                                </div>

                                <div className="flex justify-between mb-8 text-lg font-bold border-t border-apomacy-300 pt-4 text-apomacy-900">
                                    <span>Total Bayar</span>
                                    <span>Rp {totalBayar.toLocaleString('id-ID')}</span>
                                </div>

                                <button
                                    onClick={() => alert("Simulasi: Mengarahkan ke Payment Gateway...")}
                                    className="w-full py-3 bg-apomacy-500 text-white font-bold rounded-lg hover:bg-apomacy-800 transition-colors text-base shadow-md"
                                >
                                    Bayar Sekarang
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Semantic Footer */}
            <footer className="bg-apomacy-900 text-apomacy-100 text-center py-6 mt-12">
                <p className="text-sm">© 2026 Apomacy Digital Pharmacy. UTS Pemrograman Web.</p>
            </footer>
        </div>
    );
}