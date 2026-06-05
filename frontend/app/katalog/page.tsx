"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import PromoBanner from "@/components/ui/PromoBanner";
import ProductCard from "@/components/shared/ProductCard";
import SectionHeader from "@/components/ui/Header";
import { useCart } from "@/context/CartContext";

const SORT_OPTIONS = [
    { value: "popular", label: "Terpopuler" },
    { value: "price-asc", label: "Harga: Rendah ke Tinggi" },
    { value: "price-desc", label: "Harga: Tinggi ke Rendah" },
];

const ITEMS_PER_PAGE = 15;

// KOMPONEN UTAMA DIPISAH AGAR BISA DIBUNGKUS SUSPENSE
function KatalogContent() {
    const searchParams = useSearchParams();
    const categoryFilter = searchParams.get("cat");
    const searchQuery = searchParams.get("q");
    const badgeFilter = searchParams.get("badge");

    // DETEKSI APAKAH USER SEDANG MELAKUKAN PENCARIAN/FILTER
    const isFiltering = !!categoryFilter || !!searchQuery || !!badgeFilter;

    const [sortBy, setSortBy] = useState("popular");
    const [currentPage, setCurrentPage] = useState(1);
    const [apiProducts, setApiProducts] = useState<any[]>([]);
    const [isLoadingAPI, setIsLoadingAPI] = useState(true);
    const [apiError, setApiError] = useState<string | null>(null);

    const { addToCart } = useCart();

    useEffect(() => {
        const fetchApiData = async () => {
            try {
                setIsLoadingAPI(true);
                setApiError(null);

                const apiUrl = "https://api.npoint.io/68d5bfcf641eb545455a";
                const response = await axios.get(`${apiUrl}?t=${new Date().getTime()}`);

                const mappedApiData = response.data.map((item: any, index: number) => {
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
                        reviewCount: Math.floor(Math.random() * 500) + 10,
                        rating: (Math.random() * (5.0 - 4.0) + 4.0).toFixed(1),
                        badge: badge,
                    };
                });

                setApiProducts(mappedApiData);
            } catch (error: any) {
                console.error("Gagal memuat API:", error);
                if (error.response && error.response.status === 429) {
                    setApiError("Terlalu banyak permintaan ke Server API (Error 429). Mohon tunggu 1-2 menit lalu refresh.");
                } else {
                    setApiError("Gagal mengambil data dari server mitra.");
                }
            } finally {
                setIsLoadingAPI(false);
            }
        };

        fetchApiData();
    }, []);

    // 1. FILTER DATA BERDASARKAN KATEGORI / SEARCH
    const filteredProducts = useMemo(() => {
        let result = [...apiProducts];

        if (searchQuery) {
            const lowerQ = searchQuery.toLowerCase();
            result = result.filter(p => p.name.toLowerCase().includes(lowerQ));
        }

        if (categoryFilter) {
            result = result.filter(p => {
                const apiCat = p.category.toLowerCase();
                // Pencocokan string kasar agar dropdown sesuai dengan API JSON
                if (categoryFilter === 'perawatan-diri') return apiCat.includes('skincare') || apiCat.includes('body care');
                if (categoryFilter === 'herbal') return apiCat.includes('herbal');
                if (categoryFilter === 'ibu-anak') return apiCat.includes('ibu');
                if (categoryFilter === 'p3k') return apiCat.includes('p3k');
                if (categoryFilter === 'vitamin') return apiCat.includes('vitamin');
                if (categoryFilter === 'pencernaan') return apiCat.includes('pencernaan');
                if (categoryFilter === 'batuk-flu') return apiCat.includes('batuk');
                if (categoryFilter === 'pereda-nyeri') return apiCat.includes('nyeri');
                return true;
            });
        }

        if (badgeFilter) {
            result = result.filter(p => p.badge === badgeFilter);
        }

        return result;
    }, [apiProducts, searchQuery, categoryFilter, badgeFilter]);

    // 2. DATA TOP SELLING DAN LATEST (Hanya dari api asli, bukan hasil filter)
    const topSellingProducts = useMemo(() => {
        return [...apiProducts].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 5);
    }, [apiProducts]);

    const latestProducts = useMemo(() => {
        const newItems = apiProducts.filter(p => p.badge === "new");
        return newItems.length > 0 ? newItems.slice(0, 5) : apiProducts.slice(0, 5);
    }, [apiProducts]);

    // 3. SORT DATA HASIL FILTER
    const sortedCatalog = useMemo(() => {
        let result = [...filteredProducts];
        switch (sortBy) {
            case "price-asc": return result.sort((a, b) => a.price - b.price);
            case "price-desc": return result.sort((a, b) => b.price - a.price);
            case "rating": return result.sort((a, b) => b.rating - a.rating);
            default: return result.sort((a, b) => b.reviewCount - a.reviewCount);
        }
    }, [filteredProducts, sortBy]);

    const totalPages = Math.ceil(sortedCatalog.length / ITEMS_PER_PAGE);

    const paginatedCatalog = sortedCatalog.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Reset paginasi saat ada filter baru
    useEffect(() => {
        setCurrentPage(1);
    }, [sortBy, isFiltering]);

    return (
        <main className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6 lg:px-8 flex flex-col gap-10">

            {/* JIKA SEDANG MENCARI / MEMFILTER, SEMBUNYIKAN BANNER DEKORATIF */}
            {!isFiltering && (
                <section>
                    <PromoBanner
                        badge="-20% OFF WEEKEND SALE"
                        title="Premium Healthcare & Wellness Essentials"
                        subtitle="Discover top-tier medical supplies, daily vitamins, and personal care products trusted by professionals."
                        ctaLabel="Shop Now"
                        ctaHref="/katalog"
                    />
                </section>
            )}

            {apiError && (
                <div className="rounded-xl border border-discount-red bg-discount-red/10 p-6 text-center text-discount-red font-bold">
                    {apiError}
                </div>
            )}

            {/* SEMBUNYIKAN TOP SELLING & LATEST JIKA SEDANG FILTER */}
            {!isLoadingAPI && !apiError && apiProducts.length > 0 && !isFiltering && (
                <>
                    <section>
                        <SectionHeader title="Top Selling" />
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                            {topSellingProducts.map((product) => (
                                <div key={product.id} className="min-w-[200px] max-w-[240px] shrink-0 snap-start">
                                    <ProductCard product={product} onAddToCart={addToCart} />
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <SectionHeader title="Latest Arrivals" viewAllHref="/katalog?badge=new" />
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                            {latestProducts.map((product) => (
                                <div key={product.id} className="min-w-[200px] max-w-[240px] shrink-0 snap-start">
                                    <ProductCard product={product} onAddToCart={addToCart} />
                                </div>
                            ))}
                        </div>
                    </section>
                </>
            )}

            <section>
                <SectionHeader
                    title={searchQuery ? `Hasil Pencarian: "${searchQuery}"` : categoryFilter ? `Kategori Pilihan` : "Semua Produk"}
                />

                <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant pb-4">
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-apomacy-dark">Tersedia di toko</h3>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-medium text-outline hidden sm:inline-block">
                            {filteredProducts.length} produk
                        </span>
                        <div className="h-4 w-px bg-outline-variant hidden sm:block"></div>
                        <span className="text-sm text-on-surface-variant">Sort:</span>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="rounded-lg border border-outline-variant bg-white px-3 py-1.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-apomacy-primary/30 cursor-pointer"
                        >
                            {SORT_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {isLoadingAPI ? (
                    <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-outline-variant bg-white">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-apomacy-bg border-t-apomacy-primary"></div>
                        <p className="mt-4 text-sm font-bold text-apomacy-dark">Memuat Katalog Produk...</p>
                    </div>
                ) : paginatedCatalog.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                            {paginatedCatalog.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onAddToCart={addToCart}
                                />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-10 flex justify-center items-center gap-4">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    className="px-5 py-2.5 border border-outline-variant rounded-lg font-bold text-sm text-apomacy-dark transition-colors hover:bg-apomacy-bg disabled:opacity-50 disabled:hover:bg-transparent"
                                >
                                    &larr; Prev
                                </button>
                                <span className="px-4 py-2 text-sm font-bold text-apomacy-primary bg-apomacy-primary/10 rounded-lg">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    className="px-5 py-2.5 border border-outline-variant rounded-lg font-bold text-sm text-apomacy-dark transition-colors hover:bg-apomacy-bg disabled:opacity-50 disabled:hover:bg-transparent"
                                >
                                    Next &rarr;
                                </button>
                            </div>
                        )}
                    </>
                ) : !apiError && (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-outline-variant bg-white py-20 text-center">
                        <p className="text-base font-semibold text-on-surface">Produk tidak ditemukan</p>
                    </div>
                )}
            </section>
        </main>
    );
}

// BUNGKUS DENGAN SUSPENSE AGAR NEXT.JS TIDAK ERROR SAAT MENGGUNAKAN useSearchParams
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