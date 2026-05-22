"use client";

import { useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import TopHeader from "@/components/admin/TopHeader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-apomacy-bg flex relative">
            
            
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            
            <div className="flex-1 flex flex-col pl-0 md:pl-[260px] w-full max-w-full overflow-x-hidden">
                
                
                <TopHeader onMenuClick={() => setIsSidebarOpen(true)} />

                
                <main className="flex-1 p-4 md:p-8 w-full max-w-full overflow-x-hidden">
                    {children}
                </main>
                
            </div>
        </div>
    );
}