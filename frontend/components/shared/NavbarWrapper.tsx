"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import NavbarSingkat from "@/components/ui/NavbarSingkat";
import { useCart } from "@/context/CartContext";

export default function NavbarWrapper() {
    const pathname = usePathname();
    const { cartCount, cartTotal } = useCart();

    // Sembunyyin navbar di path admin
    if (pathname.startsWith("/admin") || pathname === "/dashboard") {
        return null;
    }

       // Sembunyyin navbar di path admin
    if (pathname.startsWith("/dasbor") || pathname === "/dashboard") {
        return null;
    }

    // cuman gunain navbar singkat uuntuk keranjang dan checkout
    if (pathname === "/keranjang" || pathname === "/keranjang/checkout") {
        return <NavbarSingkat />;
    }

    // yang ini untuk homepage (bisa diedit nanti)
    if (pathname === "/") {
        // kalau nanti ada komponennya , bisa digunain disini
        return <Navbar cartCount={cartCount} cartTotal={cartTotal} />;
    }

    // Default navbar
    return <Navbar cartCount={cartCount} cartTotal={cartTotal} />;
}