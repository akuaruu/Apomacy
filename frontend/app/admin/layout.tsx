"use client";

import { useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import TopHeader from "@/components/admin/TopHeader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    // State untuk mengontrol buka/tutup sidebar di layar mobile
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-apomacy-bg flex relative">
            
            {/* Sidebar di sebelah kiri menerima prop isOpen dan setIsOpen */}
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            {/* Area Kanan: pl-0 di HP, pl-[260px] di Desktop/Tablet */}
            <div className="flex-1 flex flex-col pl-0 md:pl-[260px] w-full max-w-full overflow-x-hidden">
                
                {/* Header menempel di atas menerima fungsi onMenuClick */}
                <TopHeader onMenuClick={() => setIsSidebarOpen(true)} />

                {/* Konten Halaman dengan padding yang responsif */}
                <main className="flex-1 p-4 md:p-8 w-full max-w-full overflow-x-hidden">
                    {children}
                </main>
                
            </div>
        </div>
    );
}