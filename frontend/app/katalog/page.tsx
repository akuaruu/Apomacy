"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import PromoBanner from "@/components/ui/PromoBanner";
import ProductCard, { ExtendedProduct } from "@/components/shared/ProductCard";
import SectionHeader from "@/components/ui/Header";
import { useCart } from "@/context/CartContext";
import api from "@/lib/api";

const SORT_OPTIONS = [
    { value: "popular", label: "Terpopuler" },
    { value: "price-asc", label: "Harga: Rendah ke Tinggi" },
    { value: "price-desc", label: "Harga: Tinggi ke Rendah" },
];

const ITEMS_PER_PAGE = 15;

function KatalogContent() {
    const searchParams = useSearchParams();
    const categoryFilter = searchParams.get("cat");
    const searchQuery = searchParams.get("q");
    const badgeFilter = searchParams.get("badge");

    const isFiltering = !!categoryFilter || !!searchQuery || !!badgeFilter;

    const [sortBy, setSortBy] = useState("popular");
    const [currentPage, setCurrentPage] = useState(1);
    const [apiProducts, setApiProducts] = useState<ExtendedProduct[]>([]);
    const [isLoadingAPI, setIsLoadingAPI] = useState(true);
    const [apiError, setApiError] = useState<string | null>(null);

    const { addToCart } = useCart();

    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const fetchCatalogData = async () => {
        setIsLoadingAPI(true);
        setApiError(null);
        try {
            const response = await api.get("/obat");
            let data = response.data?.data || response.data;

            if (!Array.isArray(data)) data = [];

            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                data = data.filter((item: any) =>
                    item.nama_obat?.toLowerCase().includes(q) ||
                    item.deskripsi?.toLowerCase().includes(q)
                );
            }

            if (categoryFilter) {
                const cat = categoryFilter.toLowerCase();
                data = data.filter((item: any) => {
                    if (item.kategori && Array.isArray(item.kategori)) {
                        return item.kategori.some((k: string) => k.toLowerCase() === cat);
                    }
                    return false;
                });
            }

            const mappedData: ExtendedProduct[] = data.map((item: any) => ({
                id: item.id_obat.toString(),
                name: item.nama_obat,
                price: item.harga_jual,
                image: item.gambar_produk,
                category: item.kategori && item.kategori.length > 0 ? item.kategori[0] : item.jenis_obat,
                unit: item.satuan,
                inStock: item.stok > 0
            }));

            if (sortBy === "price-asc") {
                mappedData.sort((a, b) => a.price - b.price);
            } else if (sortBy === "price-desc") {
                mappedData.sort((a, b) => b.price - a.price);
            }

            setApiProducts(mappedData);
            setCurrentPage(1);
        } catch (error) {
            setApiError("Gagal memuat produk dari server.");
        } finally {
            setIsLoadingAPI(false);
        }
    };

    useEffect(() => {
        setIsLoggedIn(!!Cookies.get("apomacy_token"));
        fetchCatalogData();
    }, [searchQuery, categoryFilter, badgeFilter, sortBy]);

    const handleAddToCartClick = (product: ExtendedProduct) => {
        if (!isLoggedIn) {
            window.dispatchEvent(new Event("openLoginModal"));
            return;
        }
        addToCart(product as any);
    };

    const totalPages = Math.ceil(apiProducts.length / ITEMS_PER_PAGE);
    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return apiProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [apiProducts, currentPage]);

    return (
        <main className="mt-8 pb-20 max-w-[1400px] mx-auto px-6">
            {!isFiltering && (
                <PromoBanner
                    badge="-20% OFF WEEKEND SALE"
                    title="Premium Healthcare & Wellness Essentials"
                    subtitle="Discover top-tier medical supplies, daily vitamins, and personal care products trusted by professionals."
                    ctaLabel="Shop Now"
                    ctaHref="/katalog"
                />
            )}

            <section className="mt-8">
                <SectionHeader
                    title={isFiltering ? "Hasil Pencarian" : "Katalog Lengkap Apomacy"}
                />

                <div className="flex justify-between items-center mb-6 mt-8">
                    <p className="text-sm font-bold text-outline">
                        Menampilkan <span className="text-apomacy-dark">{apiProducts.length}</span> produk
                    </p>
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-outline hidden sm:inline">Urutkan:</span>
                        <select
                            className="bg-white border border-outline-variant text-apomacy-dark text-sm rounded-xl focus:ring-apomacy-primary focus:border-apomacy-primary block p-2.5 outline-none font-bold shadow-sm"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            {SORT_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {isLoadingAPI ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-outline-variant border-t-apomacy-primary"></div>
                    </div>
                ) : apiError ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 py-20 text-center">
                        <p className="text-base font-bold text-red-600 mb-2">{apiError}</p>
                        <button onClick={fetchCatalogData} className="px-4 py-2 bg-white border border-red-200 rounded-lg text-sm font-bold text-red-600 hover:bg-red-100">
                            Coba Lagi
                        </button>
                    </div>
                ) : paginatedProducts.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {paginatedProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onAddToCart={() => handleAddToCartClick(product)}
                                />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-12 flex items-center justify-center gap-3">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    className="px-5 py-2.5 border border-outline-variant rounded-lg font-bold text-sm text-apomacy-dark transition-all hover:bg-apomacy-primary hover:text-white disabled:opacity-50 disabled:hover:bg-transparent"
                                >
                                    &larr; Prev
                                </button>
                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    className="px-5 py-2.5 border border-outline-variant rounded-lg font-bold text-sm text-apomacy-dark transition-all hover:bg-apomacy-primary hover:text-white disabled:opacity-50 disabled:hover:bg-transparent"
                                >
                                    Next &rarr;
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-outline-variant bg-white py-20 text-center">
                        <p className="text-base font-semibold text-on-surface">Produk tidak ditemukan</p>
                    </div>
                )}
            </section>
        </main>
    );
}

export default function KatalogPage() {
    return (
        <div className="min-h-screen bg-apomacy-bg">
            <Suspense fallback={
                <div className="flex min-h-screen items-center justify-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-apomacy-bg border-t-apomacy-primary"></div>
                </div>
            }>
                <KatalogContent />
            </Suspense>
        </div>
    );
}