"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import NavbarSingkat from "@/components/ui/NavbarSingkat";
import NavbarLanding from "@/components/ui/NavbarLanding";
import { useCart } from "@/context/CartContext";

export default function NavbarWrapper() {
    const pathname = usePathname();
    const { cartCount, cartTotal } = useCart();

    // Sembunyikan navbar di path admin
    if (pathname.startsWith("/admin") || pathname === "/dashboard") {
        return null;
    }

    if (pathname.startsWith("/kasir/member") || pathname === "/kasir") {
        return null;
    }
    // Gunakan navbar singkat untuk keranjang dan checkout
    if (pathname === "/keranjang" || pathname === "/keranjang/checkout") {
        return <NavbarSingkat />;
    }

    // Gunakan navbar landing untuk homepage, login, register, about
    if (pathname === "/" || pathname === "/login" || pathname === "/register" || pathname === "/about") {
        return <NavbarLanding />;
    }

    // Default navbar (katalog, dll)
    return <Navbar cartCount={cartCount} cartTotal={cartTotal} />;
}