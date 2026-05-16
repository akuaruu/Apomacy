"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/ui/Footer";
import FooterSingkat from "@/components/ui/FooterSingkat";

export default function FooterWrapper() {
    const pathname = usePathname();

    // Sembunyyin Footer di path admin
    if (pathname.startsWith("/admin") || pathname === "/dashboard") {
        return null;
    }

    // cuman gunain Footer singkat uuntuk keranjang dan checkout
    if (pathname === "/keranjang" || pathname === "/keranjang/checkout") {
        return <FooterSingkat />;
    }

    // Default Footer
    return <Footer />;

}