"use client";

import { useEffect, useState } from "react";
import { Search, UserCircle2, Bell, Menu } from "lucide-react";


interface TopHeaderAdminProps {
    onMenuClick: () => void;
}

export default function TopHeaderAdmin({ onMenuClick }: TopHeaderAdminProps) {
    const [time, setTime] = useState("");

    useEffect(() => {
        setTime(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }));
        const id = setInterval(() => {
            setTime(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }));
        }, 1000);
        return () => clearInterval(id);
    }, []);

    return (
        <header className="sticky top-0 z-30 flex h-16 md:h-20 items-center justify-between gap-2 md:gap-4 bg-white/80 backdrop-blur-md border-b border-outline-variant px-4 md:px-8 shadow-sm">
            
            
            <button 
                onClick={onMenuClick}
                className="md:hidden flex items-center justify-center p-2 text-on-surface-variant hover:bg-surface-container-low hover:text-apomacy-primary rounded-xl transition-colors shrink-0"
            >
                <Menu size={24} />
            </button>

            
            <div className="flex max-w-md flex-1 items-center gap-2 rounded-xl bg-surface-container-low px-4 py-2 md:py-2.5 border border-transparent focus-within:border-apomacy-primary focus-within:ring-2 focus-within:ring-apomacy-primary/20 transition-all">
                <Search size={18} className="text-outline shrink-0" />
                <input 
                    type="text" 
                    placeholder="Pencarian global..." 
                    className="flex-1 w-full bg-transparent text-sm font-medium text-on-surface outline-none placeholder:text-outline" 
                />
            </div>

            
            <div className="flex items-center gap-2 md:gap-5 shrink-0">
                <button className="hidden sm:flex relative h-10 w-10 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-low hover:text-apomacy-primary transition-colors">
                    <Bell size={20} strokeWidth={2} />
                    <span className="absolute top-2.5 right-2.5 flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                </button>

                <div className="hidden md:block h-6 w-px bg-outline-variant"></div>

                
                <div className="hidden sm:block text-right">
                    <p className="text-sm font-bold text-apomacy-dark">Administrator</p>
                    <p className="text-[11px] font-medium text-apomacy-muted">{time} WIB</p>
                </div>
                
                <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full bg-apomacy-primary/10 border border-apomacy-primary/20 cursor-pointer hover:bg-apomacy-primary/20 transition-colors shrink-0">
                    <UserCircle2 size={24} className="text-apomacy-primary" strokeWidth={2} />
                </div>
            </div>
        </header>
    );
}