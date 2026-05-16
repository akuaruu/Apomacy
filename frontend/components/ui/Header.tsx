import Link from "next/link";

interface HeaderProps {
    title: string;
    viewAllHref?: string;
    viewAllLabel?: string;
}

export default function Header({ title, viewAllHref, viewAllLabel = "View All" }: HeaderProps) {
    return (
        <div className="mb-4 flex items-center justify-between border-b border-outline-variant pb-2">
            <h2 className="text-xl font-bold text-on-surface">{title}</h2>
            {viewAllHref && (
                <Link
                    href={viewAllHref}
                    className="text-sm font-semibold text-apomacy-primary transition-colors hover:text-apomacy-dark"
                >
                    {viewAllLabel} &rarr;
                </Link>
            )}
        </div>
    );
}