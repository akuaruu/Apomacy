"use client";

import Link from "next/link";
import Image from "next/image";
import { formatRupiah } from "@/lib/Data";
import { useCart } from "@/context/CartContext";

const SHIPPING_COST = 15000;
const FREE_SHIPPING_THRESHOLD = 150000;

export default function KeranjangPage() {
    const {
        cartItems,
        selectedIds,
        updateQuantity,
        removeItem,
        toggleSelect,
        toggleSelectAll,
        cartCount,
        cartTotal
    } = useCart();

    const subtotal = cartTotal;
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_COST;
    const total = subtotal + shipping;

    const isAllSelected = selectedIds.length === cartItems.length && cartItems.length > 0;
    const hasSelectedItems = selectedIds.length > 0;

    return (
        <div className="min-h-screen bg-apomacy-bg">
            <main className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6 lg:px-8">
                <nav className="mb-6 flex items-center gap-2 text-sm text-on-surface-variant">
                    <Link href="/" className="hover:text-apomacy-primary">Home</Link>
                    <span>/</span>
                    <span className="text-on-surface">Keranjang Belanja</span>
                </nav>

                <h1 className="mb-6 text-2xl font-bold text-apomacy-dark">
                    Keranjang Belanja
                    <span className="ml-2 text-base font-normal text-on-surface-variant">({cartCount} item)</span>
                </h1>

                {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-outline-variant bg-white py-24 text-center shadow-sm">
                        <svg className="mb-4 h-16 w-16 text-outline-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="mb-1 text-lg font-semibold text-on-surface">Keranjang Anda kosong</p>
                        <p className="mb-6 text-sm text-on-surface-variant">Mulai tambahkan produk ke keranjang</p>
                        <Link href="/katalog" className="rounded-lg bg-apomacy-primary px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-apomacy-dark shadow-md">
                            Mulai Belanja
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                        <div className="lg:col-span-2 space-y-4">

                            <div className="flex items-center gap-3 rounded-xl border border-outline-variant bg-white p-4 shadow-sm">
                                <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    onChange={toggleSelectAll}
                                    className="h-5 w-5 rounded-md border-gray-300 text-apomacy-primary focus:ring-apomacy-primary focus:ring-offset-0 cursor-pointer accent-apomacy-primary transition-all"
                                />
                                <span className="text-sm font-bold text-apomacy-dark">
                                    Pilih Semua ({cartItems.length})
                                </span>
                            </div>

                            <div className="space-y-3">
                                {cartItems.map((item) => {
                                    const lineTotal = item.product.price * item.quantity;
                                    const isSelected = selectedIds.includes(item.product.id);

                                    return (
                                        <div key={item.product.id} className={`flex items-center gap-4 rounded-xl border p-4 transition-all ${isSelected ? 'border-apomacy-primary bg-apomacy-primary/5' : 'border-outline-variant bg-white'}`}>

                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleSelect(item.product.id)}
                                                className="h-5 w-5 shrink-0 rounded-md border-gray-300 text-apomacy-primary focus:ring-apomacy-primary focus:ring-offset-0 cursor-pointer accent-apomacy-primary transition-all"
                                            />

                                            {/* BAGIAN GAMBAR YANG DIPERBARUI */}
                                            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-white border border-outline-variant p-1">
                                                {item.product.image ? (
                                                    <Image
                                                        src={item.product.image}
                                                        alt={item.product.name}
                                                        fill
                                                        unoptimized={true}
                                                        className="object-contain mix-blend-multiply p-1"
                                                        sizes="80px"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center bg-surface-container-low">
                                                        <svg className="h-10 w-10 text-outline-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-1 flex-col justify-between gap-2">
                                                <div>
                                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-apomacy-teal">
                                                        {item.product.category || item.product.brand}
                                                    </p>
                                                    <Link href={`/katalog/${item.product.id}`} className="text-sm font-medium text-on-surface hover:text-apomacy-primary line-clamp-2">
                                                        {item.product.name}
                                                    </Link>
                                                    {item.product.dosage && (
                                                        <p className="text-[11px] text-outline">{item.product.dosage}</p>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center overflow-hidden rounded-lg border border-outline-variant bg-white">
                                                        <button
                                                            onClick={() => updateQuantity(item.product.id, -1)}
                                                            disabled={item.quantity <= 1}
                                                            className="flex h-7 w-7 items-center justify-center text-on-surface-variant transition-colors hover:bg-surface-container disabled:opacity-30 disabled:hover:bg-transparent"
                                                        >
                                                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                                                            </svg>
                                                        </button>
                                                        <span className="flex w-8 items-center justify-center text-sm font-bold text-apomacy-dark">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.product.id, 1)}
                                                            className="flex h-7 w-7 items-center justify-center text-on-surface-variant transition-colors hover:bg-surface-container"
                                                        >
                                                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                                            </svg>
                                                        </button>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <span className="text-base font-extrabold text-apomacy-primary">{formatRupiah(lineTotal)}</span>
                                                        <button
                                                            onClick={() => removeItem(item.product.id)}
                                                            className="text-outline transition-colors hover:text-error"
                                                            title="Hapus produk"
                                                        >
                                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <Link href="/katalog" className="inline-flex items-center gap-2 mt-2 text-sm font-semibold text-apomacy-primary transition-colors hover:text-apomacy-dark">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                </svg>
                                Lanjutkan Belanja
                            </Link>
                        </div>

                        <div className="lg:col-span-1">
                            <div className="sticky top-24 rounded-2xl border border-outline-variant bg-white p-6 shadow-sm">
                                <h2 className="mb-4 text-base font-bold text-on-surface">Ringkasan Pesanan</h2>

                                <div className="mb-4 space-y-2.5 text-sm">
                                    <div className="flex justify-between text-on-surface-variant">
                                        <span>Subtotal ({selectedIds.length} item dipilih)</span>
                                        <span className="font-semibold text-on-surface">{formatRupiah(subtotal)}</span>
                                    </div>

                                    {hasSelectedItems && (
                                        <>
                                            <div className="flex justify-between text-on-surface-variant">
                                                <span>Estimasi Ongkir</span>
                                                <span className={shipping === 0 ? "font-semibold text-apomacy-teal" : "font-semibold text-on-surface"}>
                                                    {shipping === 0 ? "GRATIS" : formatRupiah(shipping)}
                                                </span>
                                            </div>
                                            {shipping > 0 && (
                                                <p className="rounded-lg bg-apomacy-ice/30 px-3 py-2 text-[11px] text-apomacy-muted">
                                                    Tambah {formatRupiah(FREE_SHIPPING_THRESHOLD - subtotal)} lagi untuk gratis ongkir
                                                </p>
                                            )}
                                        </>
                                    )}
                                </div>

                                <div className="mb-5 flex justify-between border-t border-outline-variant pt-4 text-base font-bold text-on-surface">
                                    <span>Total Tagihan</span>
                                    <span className="text-xl text-apomacy-primary">{formatRupiah(hasSelectedItems ? total : 0)}</span>
                                </div>

                                {hasSelectedItems ? (
                                    <Link
                                        href="/keranjang/checkout"
                                        className="block w-full rounded-lg bg-apomacy-primary py-3.5 text-center text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-apomacy-dark shadow-md shadow-apomacy-primary/20"
                                    >
                                        Lanjut ke Checkout
                                    </Link>
                                ) : (
                                    <button
                                        disabled
                                        className="block w-full rounded-lg bg-surface-container-high py-3.5 text-center text-sm font-bold uppercase tracking-wide text-outline-variant cursor-not-allowed"
                                    >
                                        Pilih Produk Dulu
                                    </button>
                                )}

                                <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-on-surface-variant">
                                    <svg className="h-3.5 w-3.5 text-apomacy-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    Pembayaran aman & terenkripsi
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </main>
        </div>
    );
}