"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/ui/Footer";
import FooterSingkat from "@/components/ui/FooterSingkat";
import FooterLanding from "@/components/ui/FooterLanding";

export default function FooterWrapper() {
    const pathname = usePathname();

    // Sembunyikan Footer di path admin
    if (pathname.startsWith("/admin") || pathname === "/dashboard") {
        return null;
    }

    // Gunakan Footer singkat untuk keranjang, checkout, dan kasir member
    if (pathname === "/keranjang" || pathname === "/keranjang/checkout" || pathname === "/kasir/member") {
        return <FooterSingkat />;
    }

    // Gunakan Footer landing untuk homepage, login, register, about
    if (pathname === "/" || pathname === "/login" || pathname === "/register" || pathname === "/about") {
        return <FooterLanding />;
    }
    // Default Footer
    return <Footer />;
}