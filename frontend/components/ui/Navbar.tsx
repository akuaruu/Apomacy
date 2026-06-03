"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation"; // TAMBAHAN PENTING

interface NavCategory {
    label: string;
    href: string;
    isPromo?: boolean;
}

const navCategories: NavCategory[] = [
    { label: "PRODUK BARU", href: "/katalog?badge=new" },
    { label: "PROMO", href: "/katalog?badge=sale", isPromo: true },
];

interface NavbarProps {
    cartTotal?: number;
    cartCount?: number;
}

export default function Navbar({ cartTotal = 0, cartCount = 0 }: NavbarProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
    const router = useRouter(); // INISIALISASI ROUTER

    const formattedTotal = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(cartTotal);

    // FUNGSI UNTUK MENANGANI PENCARIAN
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/katalog?q=${encodeURIComponent(searchQuery)}`);
            setSearchQuery(""); // Reset kolom setelah mencari
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full">
            <div className="bg-white shadow-sm">
                <div className="mx-auto flex h-16 max-w-screen-xl items-center gap-6 px-4 lg:px-8">
                    <Link
                        href="/katalog"
                        className="group flex items-center gap-2 text-apomacy-dark transition-colors hover:text-primary-container"
                        aria-label="Apomacy Home"
                    >
                        <Image src="/image/logo_apomacy.png" alt="Logo Apomacy" width={40} height={40} className="object-contain" />
                        <span className="text-xl font-black tracking-[-0.02em]">Apomacy</span>
                    </Link>

                    {/* DIUBAH MENJADI FORM AGAR BISA TEKAN ENTER */}
                    <form onSubmit={handleSearch} className="flex flex-1 items-stretch overflow-hidden rounded-full border border-apomacy-ice focus-within:border-apomacy-primary focus-within:ring-2 focus-within:ring-apomacy-primary/20 transition-all">
                        <input
                            type="text"
                            suppressHydrationWarning
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari obat, vitamin, atau produk kesehatan..."
                            className="min-w-0 flex-1 bg-white px-5 py-2.5 text-sm text-apomacy-dark placeholder:text-apomacy-muted focus:outline-none"
                        />
                        <button type="submit" suppressHydrationWarning className="shrink-0 bg-apomacy-primary px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-apomacy-dark">
                            SEARCH
                        </button>
                    </form>

                    <div className="flex shrink-0 items-center gap-5">
                        <Link href="./dasbor" className="hidden items-center gap-1.5 text-apomacy-dark transition-colors hover:text-apomacy-primary sm:flex">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="text-sm font-semibold">My Account</span>
                        </Link>

                        <Link href="/keranjang" className="flex items-center gap-1.5 text-apomacy-dark transition-colors hover:text-apomacy-primary">
                            <div className="relative">
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                {cartCount > 0 && (
                                    <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-discount-red text-[9px] font-bold text-white">
                                        {cartCount}
                                    </span>
                                )}
                            </div>
                            <div className="hidden flex-col leading-none sm:flex">
                                <span className="text-[10px] text-apomacy-muted">Cart</span>
                                <span className="text-sm font-bold">{cartTotal === 0 ? "Rp 0" : formattedTotal}</span>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="bg-apomacy-primary">
                <div className="mx-auto flex h-11 max-w-screen-xl items-center px-4 lg:px-8">
                    <div className="relative h-full">
                        <button
                            type="button"
                            suppressHydrationWarning
                            onClick={() => setCategoryMenuOpen(!categoryMenuOpen)}
                            className="flex h-full items-center gap-2 bg-apomacy-teal px-5 text-sm font-semibold text-white transition-colors hover:bg-apomacy-teal/90"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                            <span className="hidden sm:inline">Shop By Categories</span>
                        </button>

                        {categoryMenuOpen && (
                            <div className="absolute left-0 top-full z-50 min-w-64 rounded-b-xl bg-white py-2 shadow-xl ring-1 ring-black/5 border-t border-gray-100">
                                {[
                                    { label: "Pereda Nyeri & Demam", href: "/katalog?cat=pereda-nyeri" },
                                    { label: "Batuk & Flu", href: "/katalog?cat=batuk-flu" },
                                    { label: "Pencernaan & Lambung", href: "/katalog?cat=pencernaan" },
                                    { label: "Vitamin & Suplemen", href: "/katalog?cat=vitamin" },
                                    { label: "P3K & Antiseptik", href: "/katalog?cat=p3k" },
                                    { label: "Ibu & Anak", href: "/katalog?cat=ibu-anak" },
                                    { label: "Skincare & Perawatan Diri", href: "/katalog?cat=perawatan-diri" },
                                    { label: "Herbal & Tradisional", href: "/katalog?cat=herbal" }
                                ].map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setCategoryMenuOpen(false)}
                                        className="block px-5 py-3 text-sm font-medium text-apomacy-dark transition-colors hover:bg-apomacy-primary/10 hover:text-apomacy-primary"
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="mx-4 hidden h-5 w-px bg-white/20 lg:block" />

                    <nav className="hidden items-center gap-2 lg:flex">
                        {navCategories.map((cat) => (
                            <Link
                                key={cat.href}
                                href={cat.href}
                                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors hover:bg-white/15 ${cat.isPromo ? "text-[#FF4B72] drop-shadow-sm hover:text-[#FF2A55]" : "text-white/90 hover:text-white"}`}
                            >
                                {cat.isPromo && <Image src="/Deal.png" alt="Promo" width={16} height={16} className="object-contain" />}
                                <span>{cat.label}</span>
                            </Link>
                        ))}
                    </nav>

                    <div className="flex-1" />

                    <div className="hidden items-center gap-1.5 xl:flex">
                        <svg className="h-4 w-4 text-apomacy-ice" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span className="text-xs font-medium text-apomacy-ice/90">Gratis Ongkir Order diatas Rp 150.000</span>
                    </div>
                </div>
            </div>
        </header>
    );
}