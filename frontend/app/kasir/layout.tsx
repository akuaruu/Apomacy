"use client";

import { useState } from "react";
import SidebarKasir from "@/components/kasir/SidebarKasir";
import TopHeader from "@/components/kasir/TopHeaderKasir";
import NavbarWrapper from "@/components/shared/NavbarWrapper";
import FooterWrapper from "@/components/shared/FooterWrapper";

export default function KasirLayout({ children }: { children: React.ReactNode }) {
    // State untuk mengontrol buka/tutup sidebar di mobile
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-apomacy-bg flex relative">
            
            
            <SidebarKasir isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <div className="flex-1 flex flex-col pl-0 md:pl-[260px] w-full max-w-full overflow-x-hidden">
                
                
                <TopHeader onMenuClick={() => setIsSidebarOpen(true)} />

                <main className="flex-1 p-4 md:p-8 w-full max-w-full overflow-x-hidden">
                    {children}
                </main>

            </div>
        </div>
    );
}