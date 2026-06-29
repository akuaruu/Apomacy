"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/ui/Footer";
import FooterSingkat from "@/components/ui/FooterSingkat";

export default function FooterWrapper() {
    const pathname = usePathname();

    if (!pathname) return null;

    // Sembunyikan Footer di path admin dan halaman login/register
    if (
        pathname.startsWith("/admin") ||
        pathname === "/dashboard" ||
        pathname === "/login" ||
        pathname === "/register"
    ) {
        return null;
    }

    if (
        pathname.startsWith("/dasbor") ||
        pathname === "/faq" ||
        pathname === "/profil" ||
        pathname === "/riwayat-obat" ||
        pathname.startsWith("/pembayaran")
    ) {
        return null;
    }

    // Gunakan Footer singkat untuk keranjang, checkout, dan kasir member
    if (pathname === "/keranjang" || pathname === "/keranjang/checkout" || pathname === "/kasir/member") {
        return <FooterSingkat />;
    }
    if (pathname.startsWith("/kasir") || pathname === "/kasir/member" || pathname === "/kasir/dashboard" || pathname === "/kasir/karyawan" || pathname === "/kasir/transaksi") {
        return <FooterSingkat />;
    }

    // Default Footer (Digunakan pada homepage, about, katalog, dll)
    return <Footer />;
}