"use client";

import Link from "next/link";
import Image from "next/image"; // Wajib ditambahkan agar Next.js bisa me-render gambar
import { Product } from "@/lib";
import { formatRupiah } from "@/lib/Data";

// Kita tambahkan opsi 'image' agar bisa membaca data API
interface ExtendedProduct extends Product {
    image?: string;
}

interface ProductCardProps {
    product: ExtendedProduct;
    onAddToCart?: (product: ExtendedProduct) => void;
}

const badgeConfig: Record<string, { label: string; classes: string }> = {
    sale: { label: "SALE", classes: "bg-discount-red text-white" },
    new: { label: "NEW", classes: "bg-apomacy-teal text-white" },
    popular: { label: "POPULAR", classes: "bg-amber-500 text-white" },
};

function ProductImagePlaceholder({ category, name }: { category: string; name: string }) {
    const palettes: Record<string, { bg: string; accent: string }> = {
        vitamins: { bg: "#f0fdf4", accent: "#86efac" },
        medication: { bg: "#eff6ff", accent: "#93c5fd" },
        skincare: { bg: "#fdf2f8", accent: "#f9a8d4" },
        baby: { bg: "#fffbeb", accent: "#fcd34d" },
        covid: { bg: "#f8fafc", accent: "#cbd5e1" },
    };
    const p = palettes[category] ?? { bg: "#f8fafc", accent: "#bdd8e9" };

    return (
        <div
            className="flex h-full w-full items-center justify-center"
            style={{ backgroundColor: p.bg }}
        >
            <div className="flex flex-col items-center gap-2">
                <div
                    className="flex h-16 w-16 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: p.accent + "60" }}
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={p.accent}
                        strokeWidth={1.5}
                        className="h-9 w-9"
                        style={{ stroke: p.accent.replace("60", "") }}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                </div>
                <span className="max-w-[80px] text-center text-[10px] font-medium leading-tight text-apomacy-muted">
                    {name.split(" ").slice(0, 2).join(" ")}
                </span>
            </div>
        </div>
    );
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
    const badge = product.badge ? badgeConfig[product.badge] : null;
    const discount = product.originalPrice
        ? Math.round((1 - product.price / product.originalPrice) * 100)
        : null;

    return (
        <div className="group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow duration-200 hover:shadow-md">

            <Link href={`/katalog/${product.id}`} className="relative block aspect-square overflow-hidden bg-white p-2">

                {/* INI KUNCI UTAMANYA: Cek apakah ada link gambar, jika ada pakai <Image>, jika tidak pakai Placeholder */}
                {product.image ? (
                    <div className="relative h-full w-full">
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            unoptimized={true} // Wajib agar proxy wsrv.nl jalan
                            className="object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, 20vw"
                        />
                    </div>
                ) : (
                    <ProductImagePlaceholder category={product.category} name={product.name} />
                )}

                {badge && (
                    <span className={`absolute left-2 top-2 rounded px-2 py-0.5 text-[10px] font-bold ${badge.classes}`}>
                        {badge.label}
                    </span>
                )}
                {discount && (
                    <span className="absolute right-2 top-2 rounded bg-discount-red px-1.5 py-0.5 text-[10px] font-bold text-white">
                        -{discount}%
                    </span>
                )}
            </Link>

            {/* Content */}
            <div className="flex flex-1 flex-col p-3">
                <Link href={`/katalog/${product.id}`}>
                    <h3 className="mb-1 line-clamp-2 text-sm font-medium leading-snug text-apomacy-muted transition-colors hover:text-apomacy-primary">
                        {product.name}
                    </h3>
                </Link>

                {product.dosage && (
                    <p className="mb-1.5 text-[11px] text-outline">{product.dosage}</p>
                )}

                {/* Price */}
                <div className="mb-3 mt-auto flex items-baseline gap-2">
                    {product.originalPrice && (
                        <span className="text-sm text-outline line-through">
                            {formatRupiah(product.originalPrice)}
                        </span>
                    )}
                    <span className="text-base font-extrabold text-apomacy-primary">
                        {formatRupiah(product.price)}
                    </span>
                </div>

                <button
                    onClick={() => onAddToCart?.(product)}
                    disabled={!product.inStock}
                    className="w-full rounded border border-apomacy-primary px-3 py-2 text-xs font-bold normal tracking-wide text-apomacy-primary transition-all hover:bg-apomacy-primary hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:border-outline-variant disabled:text-outline-variant"
                >
                    {product.inStock ? "Tambah ke Keranjang" : "Stock Habis"}
                </button>
            </div>
        </div>
    );
}

export type { ProductCardProps };