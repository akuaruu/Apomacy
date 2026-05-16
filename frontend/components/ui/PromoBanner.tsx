import Link from "next/link";

interface PromoBannerProps {
    badge?: string;
    title: string;
    subtitle: string;
    ctaLabel: string;
    ctaHref: string;
}

function MedicineIllustration() {
    return (
        <div className="relative flex h-48 w-full items-center justify-center md:h-full">
            <div className="absolute right-8 top-4 h-32 w-20 rounded-2xl bg-apomacy-primary/20 rotate-6 shadow-lg" />
            <div className="absolute right-20 top-8 h-28 w-16 rounded-2xl bg-apomacy-teal/25 -rotate-3 shadow-md" />
            <div className="relative z-10 flex h-36 w-24 flex-col items-center justify-between rounded-2xl bg-white p-3 shadow-xl ring-1 ring-apomacy-ice">
                <div className="flex w-full flex-col gap-1.5">
                    <div className="h-2 w-3/4 rounded-full bg-apomacy-primary/30" />
                    <div className="h-1.5 w-full rounded-full bg-apomacy-ice" />
                    <div className="h-1.5 w-2/3 rounded-full bg-apomacy-ice" />
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-apomacy-ice">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-7 w-7 text-apomacy-primary">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7H5a2 2 0 00-2 2v6a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 11v4M10 13h4" />
                    </svg>
                </div>
                <div className="h-2 w-full rounded-full bg-apomacy-primary/20" />
            </div>
            <div className="absolute bottom-4 left-8 flex h-10 w-10 items-center justify-center rounded-full bg-apomacy-teal/20">
                <div className="h-4 w-4 rounded-full bg-apomacy-teal/50" />
            </div>
        </div>
    );
}

export default function PromoBanner({ badge, title, subtitle, ctaLabel, ctaHref }: PromoBannerProps) {
    return (
        <div className="overflow-hidden rounded-2xl bg-apomacy-ice/40 ring-1 ring-apomacy-ice">
            <div className="grid min-h-64 grid-cols-1 items-center md:grid-cols-2">
                <div className="px-8 py-10 md:px-12 md:py-12">
                    {badge && (
                        <p className="mb-3 text-sm font-bold uppercase tracking-widest text-apomacy-teal">
                            {badge}
                        </p>
                    )}
                    <h1 className="mb-4 text-4xl font-extrabold leading-[1.1] text-apomacy-dark md:text-[40px]">
                        {title}
                    </h1>
                    <p className="mb-7 max-w-sm text-base leading-relaxed text-apomacy-muted">
                        {subtitle}
                    </p>
                    <Link
                        href={ctaHref}
                        className="inline-flex items-center gap-2 rounded-lg bg-apomacy-primary px-7 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-md transition-all hover:-translate-y-px hover:bg-apomacy-dark hover:shadow-lg active:translate-y-0"
                    >
                        {ctaLabel}
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                    </Link>
                </div>
                <div className="hidden md:block">
                    <MedicineIllustration />
                </div>
            </div>
        </div>
    );
}