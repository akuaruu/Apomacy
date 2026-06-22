"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Pill,
  RefreshCcw,
  Truck,
  Users,
  UserCheck,
  Receipt,
  BarChart2,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", icon: <LayoutDashboard size={18} />, href: "/admin" },
  { label: "Data Obat", icon: <Pill size={18} />, href: "/admin/data-obat" },
  { label: "Restock", icon: <RefreshCcw size={18} />, href: "/admin/restock" },
  { label: "Supplier", icon: <Truck size={18} />, href: "/admin/supplier" },
  { label: "Member", icon: <Users size={18} />, href: "/admin/member" },
  { label: "Karyawan", icon: <UserCheck size={18} />, href: "/admin/karyawan" },
  { label: "Transaksi", icon: <Receipt size={18} />, href: "/admin/transaksi" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-65 flex-col bg-apomacy-dark shadow-xl">
      <div className="flex h-20 shrink-0 items-center gap-3 border-b border-white/10 px-6">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white p-1.5 shadow-md">
          <Image
            src="/image/logo_apomacy.png"
            alt="Logo"
            width={36}
            height={36}
            className="object-contain w-auto h-auto"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-black tracking-widest text-white leading-none">
            Apomacy
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-apomacy-teal mt-1">
            Admin Panel
          </span>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 scrollbar-hide">
        {NAV_ITEMS.map((item) => {
          // LOGIKA PERBAIKAN: Jika item.href adalah '/admin', maka harus sama persis.
          // Jika bukan '/admin', boleh pakai startsWith.
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <a
              key={item.label}
              href={item.href}
              className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${isActive ? "bg-apomacy-primary text-white shadow-md shadow-apomacy-primary/20" : "text-apomacy-ice hover:bg-white/10 hover:text-white"}`}
            >
              <span
                className={`shrink-0 ${isActive ? "text-white" : "text-apomacy-teal group-hover:text-white"}`}
              >
                {item.icon}
              </span>
              {item.label}
            </a>
          );
        })}
      </nav>
      <div className="shrink-0 border-t border-white/10 p-4">
        <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-discount-red/10 border border-discount-red/20 px-4 py-3 text-sm font-bold text-discount-red transition-all hover:bg-discount-red hover:text-white shadow-sm">
          <LogOut size={18} strokeWidth={2.5} /> Keluar
        </button>
      </div>
    </aside>
  );
}
