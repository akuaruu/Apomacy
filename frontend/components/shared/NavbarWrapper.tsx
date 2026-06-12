"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import NavbarSingkat from "@/components/ui/NavbarSingkat";
import NavbarLanding from "@/components/ui/NavbarLanding";
import { useCart } from "@/context/CartContext";
import path from "path";

export default function NavbarWrapper() {
    const pathname = usePathname();
    const { cartCount, cartTotal } = useCart();

    if (!pathname) return null;

    // Sembunyikan navbar di path admin, kasir, dan login/register
    if (
        pathname.startsWith("/admin") ||
        pathname === "/dashboard" ||
        pathname === "/login" ||
        pathname === "/register" ||
        pathname.startsWith("/kasir/member") ||
        pathname.startsWith("/kasir")
    ) {
        return null;
    }



    // cuman gunain navbar singkat uuntuk keranjang dan checkout
    if (pathname === "/keranjang" || pathname === "/keranjang/checkout") {
        return <NavbarSingkat />;
    }

       if (pathname === "app/dasbor" || pathname === "/dasbor" || pathname == "/dasbor/profil" || pathname == "/dasbor/riwayat-obat" || pathname == "/dasbor/faq") {
        return <NavbarSingkat />;
    }


    // cuman gunain navbar singkat untuk dasbor pengguna
    if (pathname.startsWith("/dasbor")) {
        return null
    }

    // Gunakan navbar landing untuk homepage, login, register, about
    if (pathname === "/" || pathname === "/login" || pathname === "/register" || pathname === "/about") {
        return <NavbarLanding />;
    }

    // Default navbar (katalog, dll)
    return <Navbar cartCount={cartCount} cartTotal={cartTotal} />;
}