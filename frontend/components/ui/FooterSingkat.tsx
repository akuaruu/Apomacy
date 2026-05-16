import Link from "next/link";
import Image from "next/image";

export default function FooterSingkat() {
    return (
        <footer className="w-full bg-white border-t border-outline-variant py-6 mt-auto">
            <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-4 px-6 sm:flex-row lg:px-10">

                <Link
                    href="./katalog"
                    className="group flex items-center gap-2 text-apomacy-dark transition-colors hover:text-primary-container"
                >
                    <Image
                        src="/image/logo_apomacy.png"
                        alt="Logo Apomacy"
                        width={40}
                        height={40}
                        className="object-contain"
                    />
                    <span className="text-xl font-black tracking-[-0.02em]">
                        Apomacy
                    </span>
                </Link>

                <p className="text-sm font-medium text-outline text-center sm:text-right">
                    &copy; 2026 Apomacy Medical. All rights reserved.
                </p>

            </div>
        </footer>
    );
}