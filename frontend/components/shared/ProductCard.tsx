"use client";

import Link from "next/link";
import Image from "next/image";
import { formatRupiah } from "@/lib/Data";

export interface ExtendedProduct {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    category: string;
    image?: string;
    badge?: string;
    inStock: boolean;
    unit?: string;
}

interface ProductCardProps {
    product: ExtendedProduct;
    onAddToCart?: (product: ExtendedProduct) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
    return (
        <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-outline-variant bg-white p-3 transition-all duration-300 hover:border-apomacy-primary hover:shadow-lg hover:shadow-apomacy-primary/10">
            <Link href={`/katalog/${product.id}`} className="relative mb-4 aspect-square w-full overflow-hidden rounded-xl bg-surface-container-low block">
                {product.image ? (
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
                        No Image
                    </div>
                )}
            </Link>

            <div className="flex flex-1 flex-col">
                <div className="mb-2 text-xs font-bold text-apomacy-teal">
                    {product.category}
                </div>

                <Link href={`/katalog/${product.id}`} className="mb-1 block">
                    <h3 className="line-clamp-2 text-sm font-medium leading-snug text-apomacy-muted transition-colors hover:text-apomacy-primary">
                        {product.name}
                    </h3>
                </Link>

                {product.unit && (
                    <p className="mb-1.5 text-[12px] font-medium text-outline capitalize">
                        Per {product.unit}
                    </p>
                )}

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