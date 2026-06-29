"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard, Pill, Users, Receipt, LogOut, X
} from "lucide-react";
import Cookies from "js-cookie";

const NAV_ITEMS = [
    { label: "Dashboard", icon: <LayoutDashboard size={18} />, href: "/kasir" },
    { label: "Data Obat", icon: <Pill size={18} />, href: "/kasir/data-obat" },
    { label: "Customer", icon: <Users size={18} />, href: "/kasir/member" },
    { label: "Transaksi", icon: <Receipt size={18} />, href: "/kasir/transaksi" },
];

interface SidebarKasirProps {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
}

export default function SidebarKasir({ isOpen, setIsOpen }: SidebarKasirProps) {
    const pathname = usePathname();
    const handleLogout = () => {
        Cookies.remove("apomacy_token");
        window.location.href = "/";
    };

    return (
        <>

            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}


            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-apomacy-dark shadow-xl transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="flex h-16 md:h-20 shrink-0 items-center justify-between border-b border-white/10 px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white p-1.5 shadow-md">
                            <Image src="/image/logo_apomacy.png" alt="Logo" width={36} height={36} className="object-contain" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black tracking-widest text-white leading-none">Apomacy</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-apomacy-teal mt-1">Kasir Panel</span>
                        </div>
                    </div>


                    <button
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white md:hidden transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 scrollbar-hide">
                    {NAV_ITEMS.map((item) => {
                        const isActive =
                            item.href === "/kasir"
                                ? pathname === "/kasir"
                                : pathname === item.href || pathname.startsWith(`${item.href}/`);

                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${isActive
                                        ? "bg-apomacy-primary text-white shadow-md shadow-apomacy-primary/20"
                                        : "text-apomacy-ice hover:bg-white/10 hover:text-white"
                                    }`}
                            >
                                <span className={`shrink-0 ${isActive ? "text-white" : "text-apomacy-teal group-hover:text-white"}`}>
                                    {item.icon}
                                </span>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="shrink-0 border-t border-white/10 p-4">
                    <button onClick={handleLogout} className="flex w-full items-center justify-center gap-2 rounded-xl bg-discount-red/10 border border-discount-red/20 px-4 py-3 text-sm font-bold text-discount-red transition-all hover:bg-discount-red hover:text-white shadow-sm">
                        <LogOut size={18} strokeWidth={2.5} /> Keluar
                    </button>
                </div>
            </aside>
        </>
    );
}