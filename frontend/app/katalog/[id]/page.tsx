"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { useCart } from "@/context/CartContext";
import { formatRupiah } from "@/lib/Data";
import ProductCard from "@/components/shared/ProductCard";

interface ProductDetail {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    category: string;
    image?: string;
    badge?: string;
    inStock: boolean;
    description: string;
    dosage: string;
    specifications?: any;
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);

    const { addToCart } = useCart();
    const [product, setProduct] = useState<ProductDetail | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [activeTab, setActiveTab] = useState<'description' | 'specifications'>('description');
    const [quantity, setQuantity] = useState(1);

    const handleQuantityChange = (type: 'plus' | 'minus') => {
        if (type === 'plus') {
            setQuantity(prev => prev + 1);
        } else if (type === 'minus' && quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const handleAddToCart = () => {
        if (product) {
            (addToCart as any)(product);
        }
    };

    useEffect(() => {
        const fetchProductDetail = async () => {
            try {
                const apiUrl = "https://api.npoint.io/68d5bfcf641eb545455a";
                const response = await axios.get(`${apiUrl}?t=${new Date().getTime()}`);

                const rawId = id.replace("api-", "");

                const allMappedProducts = response.data.map((item: any, index: number) => {
                    let badge = undefined;
                    let originalPrice = undefined;

                    if (index % 7 === 0) {
                        badge = "sale";
                        originalPrice = Math.round(item.price * 1.25);
                    } else if (index % 5 === 1) {
                        badge = "new";
                    } else if (index % 6 === 2) {
                        badge = "popular";
                    }

                    return {
                        id: `api-${item.id}`,
                        name: item.title,
                        price: item.price,
                        originalPrice: originalPrice,
                        category: item.category,
                        image: item.image,
                        inStock: true,
                        badge: badge,
                        description: item.description || "Deskripsi tidak tersedia.",
                        dosage: item.specifications?.dosis || "Sesuai petunjuk kemasan.",
                        specifications: item.specifications
                    };
                });

                const foundItem = allMappedProducts.find((p: any) => p.id === `api-${rawId}`);

                if (foundItem) {
                    setProduct(foundItem);

                    const related = allMappedProducts
                        .filter((p: any) => p.category === foundItem.category && p.id !== foundItem.id)
                        .slice(0, 5);
                    setRelatedProducts(related);
                }

            } catch (error) {
                console.error("Gagal mengambil detail produk:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProductDetail();
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center bg-apomacy-bg">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-outline-variant border-t-apomacy-primary"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center bg-apomacy-bg">
                <p className="text-xl font-bold text-apomacy-dark">Produk Tidak Ditemukan</p>
                <Link href="/katalog" className="mt-4 rounded-lg bg-apomacy-primary px-6 py-2 text-white hover:bg-apomacy-dark">
                    Kembali ke Katalog
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pb-20 pt-8">
            <div className="mx-auto max-w-screen-xl px-4 lg:px-8">

                <nav className="mb-8 flex items-center gap-2 text-sm text-outline-variant font-medium">
                    <Link href="/" className="hover:text-apomacy-primary">Home</Link>
                    <span>/</span>
                    <Link href="/katalog" className="hover:text-apomacy-primary">Katalog</Link>
                    <span>/</span>
                    <span className="text-apomacy-primary capitalize line-clamp-1">{product.category}</span>
                </nav>

                <div className="flex flex-col gap-12">

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

                        {/* Bagian Kiri: Gambar Produk */}
                        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-surface-container-low border border-gray-100 p-8 flex items-center justify-center">
                            {product.badge && (
                                <span className={`absolute left-4 top-4 z-10 rounded-md px-3 py-1 text-xs font-bold uppercase tracking-wide ${product.badge === 'sale' ? 'bg-discount-red text-white' :
                                    product.badge === 'new' ? 'bg-apomacy-teal text-white' : 'bg-amber-500 text-white'
                                    }`}>
                                    {product.badge === 'sale' ? '-20%' : product.badge}
                                </span>
                            )}

                            {product.image ? (
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    unoptimized={true}
                                    className="object-contain mix-blend-multiply p-8"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            ) : (
                                <svg className="h-24 w-24 text-outline-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                            )}
                        </div>

                        {/* Bagian Kanan: INFO, TABS, & AKSI */}
                        <div className="flex flex-col pt-2 h-full">

                            <h1 className="mb-4 text-2xl lg:text-3xl font-black text-apomacy-dark">
                                {product.name}
                            </h1>

                            <div className="mb-6 flex items-end gap-3">
                                <span className="text-3xl font-extrabold text-apomacy-dark">
                                    {formatRupiah(product.price)}
                                </span>
                                {product.originalPrice && (
                                    <span className="mb-1 text-sm font-medium text-outline-variant line-through">
                                        {formatRupiah(product.originalPrice)}
                                    </span>
                                )}
                            </div>

                            {/* TABS (Description & Specifications) */}
                            <div className="flex-1 mb-8">
                                <div className="flex items-center gap-8 border-b border-gray-200">
                                    <button
                                        onClick={() => setActiveTab('description')}
                                        className={`pb-3 text-sm font-bold transition-colors border-b-2 -mb-[1px] ${activeTab === 'description' ? 'border-apomacy-dark text-apomacy-dark' : 'border-transparent text-outline-variant hover:text-apomacy-dark'}`}
                                    >
                                        Description
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('specifications')}
                                        className={`pb-3 text-sm font-bold transition-colors border-b-2 -mb-[1px] ${activeTab === 'specifications' ? 'border-apomacy-dark text-apomacy-dark' : 'border-transparent text-outline-variant hover:text-apomacy-dark'}`}
                                    >
                                        Specifications
                                    </button>
                                </div>

                                <div className="py-6 text-sm text-on-surface-variant leading-relaxed">
                                    {activeTab === 'description' ? (
                                        <p className="whitespace-pre-line">
                                            {product.description}
                                        </p>
                                    ) : (
                                        <ul className="list-disc pl-5 space-y-3">
                                            <li><span className="font-semibold text-apomacy-dark">Kategori:</span> {product.category.toUpperCase()}</li>
                                            {product.specifications?.komposisi && (
                                                <li><span className="font-semibold text-apomacy-dark">Komposisi:</span> {product.specifications.komposisi}</li>
                                            )}
                                            <li><span className="font-semibold text-apomacy-dark">Dosis / Aturan Pakai:</span> {product.dosage}</li>
                                            {product.specifications?.kemasan && (
                                                <li><span className="font-semibold text-apomacy-dark">Kemasan:</span> {product.specifications.kemasan}</li>
                                            )}
                                            <li><span className="font-semibold text-apomacy-dark">Status Persediaan:</span> {product.inStock ? 'Tersedia' : 'Habis'}</li>
                                        </ul>
                                    )}
                                </div>
                            </div>

                            {/* pengatur jumlah untuk produk yang akan dimasukin ke keranjang */}
                            <div className="flex flex-col sm:flex-row items-center gap-4 border-t border-gray-100 pt-8 mt-auto">
                                <div className="flex h-12 w-full sm:w-32 shrink-0 items-center justify-between overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                                    <button onClick={() => handleQuantityChange('minus')} className="flex h-full w-10 items-center justify-center text-outline-variant transition-colors hover:bg-gray-50 active:bg-gray-100">
                                        <span className="text-xl leading-none mb-1">-</span>
                                    </button>
                                    <span className="font-bold text-apomacy-dark">{quantity}</span>
                                    <button onClick={() => handleQuantityChange('plus')} className="flex h-full w-10 items-center justify-center text-outline-variant transition-colors hover:bg-gray-50 active:bg-gray-100">
                                        <span className="text-xl leading-none mb-1">+</span>
                                    </button>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    className="flex h-12 w-full flex-1 items-center justify-center gap-2 rounded-xl border-2 border-apomacy-primary bg-white text-sm font-bold uppercase tracking-wide text-apomacy-primary transition-all hover:bg-apomacy-primary hover:text-white active:scale-95 shadow-sm"
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Add to Cart
                                </button>
                            </div>

                        </div>
                    </div>

                    {/* Related Produk */}
                    {relatedProducts.length > 0 && (
                        <div className="mt-4 pt-8 border-t border-gray-100">
                            <h2 className="text-xl font-black text-apomacy-dark mb-6">Related Products</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {relatedProducts.map((relProduct) => (
                                    <ProductCard
                                        key={relProduct.id}
                                        product={relProduct}
                                        onAddToCart={addToCart as any}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}