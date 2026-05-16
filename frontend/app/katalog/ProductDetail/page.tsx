"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import ProductCard from "@/components/shared/ProductCard";
import SectionHeader from "@/components/ui/Header";
import { products, formatRupiah } from "@/lib/Data";
import { Product } from "@/lib";

interface PageProps {
    params: { id: string };
}

function StarRating({ rating, reviewCount }: { rating: number; reviewCount: number }) {
    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className={`h-4 w-4 ${i < Math.round(rating) ? "text-amber-400" : "text-outline-variant"}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
            </div>
            <span className="text-sm font-semibold text-on-surface">{rating}</span>
            <span className="text-sm text-on-surface-variant">({reviewCount.toLocaleString("id-ID")} ulasan)</span>
        </div>
    );
}

function ProductImageLarge({ product }: { product: Product }) {
    const palettes: Record<string, { bg: string; accent: string }> = {
        vitamins: { bg: "#f0fdf4", accent: "#86efac" },
        medication: { bg: "#eff6ff", accent: "#93c5fd" },
        skincare: { bg: "#fdf2f8", accent: "#f9a8d4" },
        baby: { bg: "#fffbeb", accent: "#fcd34d" },
        covid: { bg: "#f8fafc", accent: "#cbd5e1" },
    };
    const p = palettes[product.category] ?? { bg: "#f8fafc", accent: "#bdd8e9" };

    return (
        <div className="flex aspect-square w-full items-center justify-center rounded-xl" style={{ backgroundColor: p.bg }}>
            <div className="flex flex-col items-center gap-3">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl" style={{ backgroundColor: p.accent + "60" }}>
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.5} className="h-14 w-14" style={{ stroke: "#49769f" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                </div>
                <span className="text-sm font-medium text-apomacy-muted">{product.brand}</span>
            </div>
        </div>
    );
}

export default function ProductDetailPage({ params }: PageProps) {
    const product = products.find((p) => p.id === params.id);
    if (!product) notFound();

    const [quantity, setQuantity] = useState(1);
    const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
    const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : null;

    return (
        <div className="min-h-screen bg-apomacy-bg">
            <Navbar />

            <main className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <nav className="mb-6 flex items-center gap-2 text-sm text-on-surface-variant">
                    <Link href="/" className="hover:text-apomacy-primary">Home</Link>
                    <span>/</span>
                    <Link href="/katalog" className="hover:text-apomacy-primary">Katalog</Link>
                    <span>/</span>
                    <span className="text-on-surface line-clamp-1">{product.name}</span>
                </nav>

                {/* Product Detail Grid */}
                <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* Image */}
                    <div className="overflow-hidden rounded-xl border border-outline-variant bg-white p-4">
                        <ProductImageLarge product={product} />
                    </div>

                    {/* Info */}
                    <div className="flex flex-col">
                        <p className="mb-1 text-sm font-semibold uppercase tracking-widest text-apomacy-teal">{product.brand}</p>
                        <h1 className="mb-3 text-2xl font-bold leading-snug text-apomacy-dark lg:text-3xl">{product.name}</h1>

                        {product.dosage && (
                            <p className="mb-3 text-sm text-on-surface-variant">{product.dosage}</p>
                        )}

                        <div className="mb-4">
                            <StarRating rating={product.rating} reviewCount={product.reviewCount} />
                        </div>

                        <div className="mb-5 flex items-baseline gap-3">
                            {product.originalPrice && (
                                <span className="text-lg text-outline line-through">{formatRupiah(product.originalPrice)}</span>
                            )}
                            <span className="text-3xl font-extrabold text-apomacy-primary">{formatRupiah(product.price)}</span>
                            {discount && (
                                <span className="rounded bg-discount-red px-2 py-0.5 text-xs font-bold text-white">-{discount}%</span>
                            )}
                        </div>

                        {product.description && (
                            <p className="mb-5 text-sm leading-relaxed text-on-surface-variant">{product.description}</p>
                        )}

                        {product.benefits && product.benefits.length > 0 && (
                            <ul className="mb-6 space-y-1.5">
                                {product.benefits.map((b) => (
                                    <li key={b} className="flex items-center gap-2 text-sm text-on-surface">
                                        <svg className="h-4 w-4 shrink-0 text-apomacy-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                        {b}
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* Qty + Cart */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center overflow-hidden rounded-lg border border-outline-variant">
                                <button
                                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                    className="flex h-10 w-10 items-center justify-center text-on-surface-variant transition-colors hover:bg-surface-container"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                                    </svg>
                                </button>
                                <span className="flex h-10 w-12 items-center justify-center text-sm font-bold text-on-surface">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => setQuantity((q) => q + 1)}
                                    className="flex h-10 w-10 items-center justify-center text-on-surface-variant transition-colors hover:bg-surface-container"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                    </svg>
                                </button>
                            </div>

                            <button
                                disabled={!product.inStock}
                                className="flex-1 rounded-lg border border-apomacy-primary bg-apomacy-primary py-2.5 text-sm font-bold uppercase tracking-wide text-white transition-all hover:bg-apomacy-dark disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {product.inStock ? "ADD TO CART" : "OUT OF STOCK"}
                            </button>
                        </div>

                        {/* Trust badges */}
                        <div className="mt-6 grid grid-cols-3 gap-3 border-t border-outline-variant pt-5">
                            {[
                                { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", label: "BPOM Certified" },
                                { icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4", label: "Fast Delivery" },
                                { icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z", label: "Secure Payment" },
                            ].map((badge) => (
                                <div key={badge.label} className="flex flex-col items-center gap-1.5 rounded-lg bg-surface-container-low p-3 text-center">
                                    <svg className="h-5 w-5 text-apomacy-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d={badge.icon} />
                                    </svg>
                                    <span className="text-[10px] font-semibold text-on-surface-variant">{badge.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {related.length > 0 && (
                    <div>
                        <SectionHeader title="Produk Serupa" viewAllHref="/katalog" />
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                            {related.map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}