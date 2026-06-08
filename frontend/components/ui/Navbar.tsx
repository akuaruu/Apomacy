"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import api from "@/lib/api";

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

interface MyTokenPayload {
    id_user?: number;
    user_id?: number;
    id?: number;
    role?: string;
    nama?: string;
    name?: string;
    username?: string;
    exp?: number;
}

export default function Navbar({ cartTotal = 0, cartCount = 0 }: NavbarProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
    const router = useRouter();

    const [userName, setUserName] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const [showLoginModal, setShowLoginModal] = useState(false);
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loginError, setLoginError] = useState("");
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    useEffect(() => {
        const token = Cookies.get("apomacy_token");
        if (token) {
            try {
                const decoded = jwtDecode<MyTokenPayload>(token);
                setIsLoggedIn(true);
                setUserName(decoded.nama || decoded.name || decoded.username || "Akun Saya");
            } catch (error) {
                setIsLoggedIn(false);
            }
        }

        const handleOpenModal = () => setShowLoginModal(true);
        window.addEventListener("openLoginModal", handleOpenModal);

        return () => {
            window.removeEventListener("openLoginModal", handleOpenModal);
        };
    }, []);

    const formattedTotal = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(cartTotal);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/katalog?q=${encodeURIComponent(searchQuery)}`);
            setSearchQuery("");
        }
    };

    const handleProtectedNavigation = (e: React.MouseEvent, path: string) => {
        e.preventDefault();
        if (!isLoggedIn) {
            setShowLoginModal(true);
        } else {
            router.push(path);
        }
    };

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError("");
        setIsLoggingIn(true);

        try {
            const response = await api.post("/users/login", {
                username: loginEmail,
                password: loginPassword,
            });

            const { token } = response.data;

            if (token) {
                Cookies.set("apomacy_token", token, { expires: 1 });
                const decoded = jwtDecode<MyTokenPayload>(token);
                const userRole = decoded.role;

                if (userRole === "Admin") {
                    window.location.href = "/admin";
                } else if (userRole === "Kasir") {
                    window.location.href = "/kasir";
                } else {
                    window.location.reload();
                }
            }
        } catch (err: any) {
            const msg = err.response?.data?.error || "Gagal masuk. Periksa kembali email dan password Anda.";
            setLoginError(msg);
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <>
            <header className="sticky top-0 z-40 w-full">
                <div className="bg-white shadow-sm">
                    <div className="mx-auto flex h-16 max-w-screen-xl items-center gap-6 px-4 lg:px-8">
                        <Link href="/katalog" className="group flex items-center gap-2 text-apomacy-dark transition-colors hover:text-primary-container">
                            <Image src="/image/logo_apomacy.png" alt="Logo Apomacy" width={40} height={40} className="object-contain" />
                            <span className="text-xl font-black tracking-[-0.02em]">Apomacy</span>
                        </Link>

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
                                CARI
                            </button>
                        </form>

                        <div className="flex shrink-0 items-center gap-5">
                            <a href="/dasbor" onClick={(e) => handleProtectedNavigation(e, "/dasbor")} className="hidden items-center gap-1.5 text-apomacy-dark cursor-pointer transition-colors hover:text-apomacy-primary sm:flex">
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                {/* Nampilin nama user secara dinamis stelah login */}
                                <span className="text-sm font-semibold">
                                    {isLoggedIn ? `Hi, ${userName}` : "Akun Saya"}
                                </span>
                            </a>

                            <a href="/keranjang" onClick={(e) => handleProtectedNavigation(e, "/keranjang")} className="flex items-center cursor-pointer gap-1.5 text-apomacy-dark transition-colors hover:text-apomacy-primary">
                                <div className="relative">
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    {cartCount > 0 && isLoggedIn && (
                                        <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-discount-red text-[9px] font-bold text-white">
                                            {cartCount}
                                        </span>
                                    )}
                                </div>
                                <div className="hidden flex-col leading-none sm:flex">
                                    <span className="text-[10px] text-apomacy-muted">Keranjang</span>
                                    <span className="text-sm font-bold">{cartTotal === 0 || !isLoggedIn ? "Rp 0" : formattedTotal}</span>
                                </div>
                            </a>
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
                                <span className="hidden sm:inline">Lihat Kategori</span>
                            </button>

                            {categoryMenuOpen && (
                                <div className="absolute left-0 top-full z-50 min-w-64 rounded-b-xl bg-white py-2 shadow-xl ring-1 ring-black/5 border-t border-gray-100">
                                    {[
                                        { label: "Pereda Nyeri & Demam", href: "/katalog?cat=pereda-nyeri" },
                                        { label: "Batuk & Flu", href: "/katalog?cat=batuk-flu" },
                                        { label: "Pencernaan & Lambung", href: "/katalog?cat=pencernaan" },
                                        { label: "Vitamin & Suplemen", href: "/katalog?cat=vitamin" },
                                        { label: "Ibu & Anak", href: "/katalog?cat=ibu-anak" },
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

            {showLoginModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-5 border-b border-gray-100">
                            <h2 className="text-lg font-black text-apomacy-dark">Masuk ke Akun Anda</h2>
                            <button
                                onClick={() => setShowLoginModal(false)}
                                className="text-gray-400 hover:text-apomacy-dark transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-gray-500 mb-6">Silakan masuk untuk melanjutkan transaksi dan mengakses fitur penuh Apomacy.</p>

                            {loginError && (
                                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-xs font-medium text-red-600">
                                    {loginError}
                                </div>
                            )}

                            <form onSubmit={handleLoginSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Email / Username</label>
                                    <input
                                        type="text"
                                        required
                                        value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-apomacy-primary focus:ring-1 focus:ring-apomacy-primary transition-all"
                                        placeholder="Masukkan email Anda"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-apomacy-primary focus:ring-1 focus:ring-apomacy-primary transition-all"
                                        placeholder="Masukkan kata sandi"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoggingIn}
                                    className="w-full mt-2 bg-apomacy-primary hover:bg-apomacy-dark text-white font-bold text-sm py-3 rounded-xl transition-colors disabled:opacity-70"
                                >
                                    {isLoggingIn ? "Memproses..." : "Masuk"}
                                </button>
                            </form>
                            <p className="text-xs text-center text-gray-500 mt-6">
                                Belum memiliki akun? <Link href="/register" className="font-bold text-apomacy-primary hover:underline">Daftar sekarang</Link>
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}