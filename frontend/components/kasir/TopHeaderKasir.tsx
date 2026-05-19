"use client";

import { useEffect, useState } from "react";
import { Search, UserCircle2 } from "lucide-react";

export default function TopHeader() {
    const [time, setTime] = useState("");

    useEffect(() => {
        setTime(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }));
        const id = setInterval(() => setTime(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })), 1000);
        return () => clearInterval(id);
    }, []);

    return (
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between gap-4 bg-white/80 backdrop-blur-md border-b border-outline-variant px-8 shadow-sm">
            <div className="flex max-w-md flex-1 items-center gap-2 rounded-xl bg-surface-container-low px-4 py-2.5 border border-transparent focus-within:border-apomacy-primary focus-within:ring-2 focus-within:ring-apomacy-primary/20 transition-all">
                <Search size={18} className="text-outline" />
                <input type="text" placeholder="Pencarian global..." className="flex-1 bg-transparent text-sm font-medium text-on-surface outline-none placeholder:text-outline" />
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="text-sm font-bold text-apomacy-dark">Kasir</p>
                    <p className="text-xs font-medium text-apomacy-muted">{time} WIB</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-apomacy-primary/10 border border-apomacy-primary/20 cursor-pointer hover:bg-apomacy-primary/20 transition-colors">
                    <UserCircle2 size={24} className="text-apomacy-primary" strokeWidth={2} />
                </div>
            </div>
        </header>
    );
}