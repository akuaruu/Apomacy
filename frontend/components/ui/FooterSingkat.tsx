import Link from "next/link";
import Image from "next/image";

export default function FooterSingkat() {
    return (
        <footer className="w-full bg-white border-t border-outline-variant py-6 mt-auto">
            <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-4 px-6 sm:flex-row lg:px-10">

                <p className="text-sm font-medium text-outline text-center sm:text-left">
                    &copy; 2026 Apomacy Medical. All rights reserved.
                </p>

                <div className="flex items-center gap-1.5 text-sm font-medium text-outline text-center sm:text-right">
                    <svg className="h-4 w-4 text-apomacy-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Berlisensi BPOM RI & Kemenkes
                </div>

            </div>
        </footer>
    );
}