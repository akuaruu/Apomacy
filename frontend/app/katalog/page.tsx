"use client";

import { useState, useMemo } from "react";
import PromoBanner from "@/components/ui/PromoBanner";
import CategoryPill from "@/components/shared/CategoryPill";
import ProductCard from "@/components/shared/ProductCard";
import SectionHeader from "@/components/ui/Header";
import { products, categories } from "@/lib/Data";
import { Product } from "@/lib/index";
import { useCart } from "@/context/CartContext";

const SORT_OPTIONS = [
    { value: "popular", label: "Most Popular" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "rating", label: "Top Rated" },
];

const ITEMS_PER_PAGE = 10;

export default function KatalogPage() {
    const [activeCategory, setActiveCategory] = useState("all");
    const [sortBy, setSortBy] = useState("popular");
    const [currentPage, setCurrentPage] = useState(1);

    // Gunakan fungsi dari Global Context, bukan useState lokal lagi
    const { addToCart } = useCart();

    const topSellingProducts = useMemo(() => {
        return [...products].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 5);
    }, []);

    const latestProducts = useMemo(() => {
        const newItems = products.filter(p => p.badge === "new");
        return newItems.length > 0 ? newItems.slice(0, 5) : products.slice(-5);
    }, []);

    const filteredCatalog = useMemo(() => {
        let result = activeCategory === "all"
            ? products
            : products.filter((p) => p.category === activeCategory);

        switch (sortBy) {
            case "price-asc":
                return [...result].sort((a, b) => a.price - b.price);
            case "price-desc":
                return [...result].sort((a, b) => b.price - a.price);
            case "rating":
                return [...result].sort((a, b) => b.rating - a.rating);
            default:
                return [...result].sort((a, b) => b.reviewCount - a.reviewCount);
        }
    }, [activeCategory, sortBy]);

    const totalPages = Math.ceil(filteredCatalog.length / ITEMS_PER_PAGE);
    const paginatedCatalog = filteredCatalog.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleCategoryChange = (id: string) => {
        setActiveCategory(id);
        setCurrentPage(1);
    };

    return (
        <div className="min-h-screen bg-apomacy-bg">
            <main className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6 lg:px-8 flex flex-col gap-10">

                <section>
                    <PromoBanner
                        badge="-20% OFF WEEKEND SALE"
                        title="Premium Healthcare & Wellness Essentials"
                        subtitle="Discover top-tier medical supplies, daily vitamins, and personal care products trusted by professionals."
                        ctaLabel="Shop Now"
                        ctaHref="/katalog"
                    />
                    <div className="mt-4 flex justify-center gap-2">
                        <span className="h-2 w-6 rounded-full bg-apomacy-primary"></span>
                        <span className="h-2 w-2 rounded-full bg-outline-variant"></span>
                        <span className="h-2 w-2 rounded-full bg-outline-variant"></span>
                    </div>
                </section>

                <section>
                    <SectionHeader title="Top Selling" viewAllHref="/katalog?sort=popular" />
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

                <section>
                    <SectionHeader title="All Products" />

                    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant pb-4">
                        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                            {categories.map((cat) => (
                                <CategoryPill
                                    key={cat.id}
                                    label={cat.name}
                                    count={cat.count}
                                    isActive={activeCategory === cat.id}
                                    onClick={() => handleCategoryChange(cat.id)}
                                />
                            ))}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
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
                            <span className="text-sm text-outline hidden sm:inline-block">
                                {filteredCatalog.length} produk
                            </span>
                        </div>
                    </div>

                    {paginatedCatalog.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                            {paginatedCatalog.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onAddToCart={addToCart}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-outline-variant bg-white py-20 text-center">
                            <p className="text-base font-semibold text-on-surface">Produk tidak ditemukan</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}