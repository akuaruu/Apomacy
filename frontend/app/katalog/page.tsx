"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
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
const normalizeCategory = (value: string) => {
    return value
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ")
        .replace(/\s*&\s*/g, " & ");
};

const CATEGORY_GROUPS: Record<string, string[]> = {
    "flu-batuk": [
        "flu & batuk",
        "batuk & flu",
        "flu dan batuk",
        "batuk dan flu",
        "batuk",
        "flu",
    ],

    demam: [
        "demam",
    ],

    "vitamin-suplemen": [
        "vitamin",
        "vitamin & suplemen",
        "suplemen & vitamin",
        "vitamin dan suplemen",
        "suplemen",
    ],

    pencernaan: [
        "mual & muntah",
        "muntah & mual",
        "mual dan muntah",
        "mual",
        "muntah",

        "sembelit & wasir",
        "wasir & sembelit",
        "sembelit dan wasir",
        "sembelit",
        "wasir",

        "diare",

        "infeksi cacing",
        "cacingan",

        "asam lambung & gerd",
        "gerd & asam lambung",
        "asam lambung dan gerd",
        "asam lambung",
        "gerd",

        "pencernaan",
        "gangguan pencernaan",
        "lambung",
    ],
};

const matchesCategoryGroup = (
    productCategories: unknown,
    selectedGroup: string
) => {
    if (!Array.isArray(productCategories)) {
        return false;
    }

    const allowedCategories = CATEGORY_GROUPS[selectedGroup];

    if (!allowedCategories) {
        return false;
    }

    const normalizedAllowedCategories = allowedCategories.map(
        normalizeCategory
    );

    return productCategories.some((category) => {
        if (typeof category !== "string") {
            return false;
        }

        const normalizedCategory = normalizeCategory(category);

        return normalizedAllowedCategories.includes(normalizedCategory);
    });
};

const BANNERS = [
    {
        id: 1,
        imageUrl:
            "https://rnyiyharbbhfvgjllueu.supabase.co/storage/v1/object/public/banner/banner1.png",
        alt: "Promo obat flu dan batuk",
        href: "/katalog?cat=flu-batuk",
    },
    {
        id: 2,
        imageUrl:
            "https://rnyiyharbbhfvgjllueu.supabase.co/storage/v1/object/public/banner/banner2.png",
        alt: "Promo vitamin dan suplemen",
        href: "/katalog?cat=vitamin-suplemen",
    },
    {
        id: 3,
        imageUrl:
            "https://rnyiyharbbhfvgjllueu.supabase.co/storage/v1/object/public/banner/banner3.png",
        alt: "Promo obat demam",
        href: "/katalog?cat=demam",
    },
    {
        id: 4,
        imageUrl:
            "https://rnyiyharbbhfvgjllueu.supabase.co/storage/v1/object/public/banner/banner4.png",
        alt: "Promo obat lambung dan pencernaan",
        href: "/katalog?cat=pencernaan",
    },
    {
        id: 5,
        imageUrl:
            "https://rnyiyharbbhfvgjllueu.supabase.co/storage/v1/object/public/banner/banner5.png",
        alt: "Promo gratis ongkir produk kesehatan",
        href: "/katalog",
    },
];

function KatalogContent() {
    const searchParams = useSearchParams();
    const categoryFilter = searchParams.get("cat");
    const searchQuery = searchParams.get("q");
    const badgeFilter = searchParams.get("badge");

    const isFiltering = !!categoryFilter || !!searchQuery || !!badgeFilter;

    const [sortBy, setSortBy] = useState("popular");
    const [currentPage, setCurrentPage] = useState(1);
    const [currentBanner, setCurrentBanner] = useState(0);

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
                const selectedGroup = categoryFilter
                    .trim()
                    .toLowerCase();

                data = data.filter((item: any) =>
                    matchesCategoryGroup(
                        item.kategori,
                        selectedGroup
                    )
                );
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

    useEffect(() => {
        if (isFiltering || BANNERS.length <= 1) {
            return;
        }

        const interval = window.setInterval(() => {
            setCurrentBanner((previousBanner) =>
                previousBanner === BANNERS.length - 1
                    ? 0
                    : previousBanner + 1
            );
        }, 5000);

        return () => {
            window.clearInterval(interval);
        };
    }, [isFiltering]);

    const handlePreviousBanner = () => {
        setCurrentBanner((previousBanner) =>
            previousBanner === 0
                ? BANNERS.length - 1
                : previousBanner - 1
        );
    };

    const handleNextBanner = () => {
        setCurrentBanner((previousBanner) =>
            previousBanner === BANNERS.length - 1
                ? 0
                : previousBanner + 1
        );
    };

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

    const paginationItems = useMemo<(number | "ellipsis")[]>(() => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, index) => index + 1);
        }

        if (currentPage <= 4) {
            return [1, 2, 3, 4, 5, "ellipsis", totalPages];
        }

        if (currentPage >= totalPages - 3) {
            return [
                1,
                "ellipsis",
                totalPages - 4,
                totalPages - 3,
                totalPages - 2,
                totalPages - 1,
                totalPages,
            ];
        }

        return [
            1,
            "ellipsis",
            currentPage - 1,
            currentPage,
            currentPage + 1,
            "ellipsis",
            totalPages,
        ];
    }, [currentPage, totalPages]);

    return (
        <main className="mt-8 pb-20 max-w-[1400px] mx-auto px-6">
            {!isFiltering && (
                <section
                    aria-label="Promo Apomacy"
                    className="relative overflow-hidden rounded-2xl"
                >
                    <a
                        href={BANNERS[currentBanner].href}
                        className="block"
                        aria-label={BANNERS[currentBanner].alt}
                    >
                        <img
                            src={BANNERS[currentBanner].imageUrl}
                            alt={BANNERS[currentBanner].alt}
                            className="block h-auto w-full object-cover"
                            loading={currentBanner === 0 ? "eager" : "lazy"}
                        />
                    </a>

                    <button
                        type="button"
                        onClick={handlePreviousBanner}
                        aria-label="Banner sebelumnya"
                        className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-apomacy-dark shadow-md transition hover:bg-white"
                    >
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                    </button>

                    <button
                        type="button"
                        onClick={handleNextBanner}
                        aria-label="Banner berikutnya"
                        className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-apomacy-dark shadow-md transition hover:bg-white"
                    >
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </button>

                    <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/20 px-3 py-2 backdrop-blur-sm">
                        {BANNERS.map((banner, index) => (
                            <button
                                key={banner.id}
                                type="button"
                                onClick={() => setCurrentBanner(index)}
                                aria-label={`Tampilkan banner ${index + 1}`}
                                aria-current={
                                    currentBanner === index ? "true" : undefined
                                }
                                className={`h-2.5 rounded-full transition-all ${currentBanner === index
                                        ? "w-7 bg-white"
                                        : "w-2.5 bg-white/60 hover:bg-white"
                                    }`}
                            />
                        ))}
                    </div>
                </section>
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
                            <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    className="px-5 py-2.5 border border-outline-variant rounded-lg font-bold text-sm text-apomacy-dark transition-all hover:bg-apomacy-primary hover:text-white disabled:opacity-50 disabled:hover:bg-transparent"
                                >
                                    &larr; Prev
                                </button>

                                {paginationItems.map((item, index) =>
                                    item === "ellipsis" ? (
                                        <span
                                            key={`ellipsis-${index}`}
                                            className="px-1 text-sm font-bold text-apomacy-muted"
                                        >
                                            ...
                                        </span>
                                    ) : (
                                        <button
                                            key={item}
                                            type="button"
                                            onClick={() => setCurrentPage(item)}
                                            aria-label={`Buka halaman ${item}`}
                                            aria-current={currentPage === item ? "page" : undefined}
                                            className={`h-10 min-w-10 rounded-lg border px-3 text-sm font-bold transition-all ${currentPage === item
                                                ? "border-apomacy-primary bg-apomacy-primary text-white"
                                                : "border-outline-variant text-apomacy-dark hover:bg-apomacy-primary hover:text-white"
                                                }`}
                                        >
                                            {item}
                                        </button>
                                    )
                                )}

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
