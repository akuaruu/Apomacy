"use client";

interface CategoryPillProps {
    label: string;
    count?: number;
    isActive?: boolean;
    onClick?: () => void;
}

export default function CategoryPill({ label, count, isActive = false, onClick }: CategoryPillProps) {
    return (
        <button
            onClick={onClick}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-semibold transition-all duration-150 ${isActive
                    ? "border-apomacy-primary bg-apomacy-primary text-white"
                    : "border-outline-variant bg-white text-on-surface-variant hover:border-apomacy-primary hover:text-apomacy-primary"
                }`}
        >
            {label}
            {count !== undefined && (
                <span className={`rounded-full px-1.5 py-px text-[10px] font-bold ${isActive ? "bg-white/20 text-white" : "bg-surface-container text-on-surface-variant"}`}>
                    {count}
                </span>
            )}
        </button>
    );
}