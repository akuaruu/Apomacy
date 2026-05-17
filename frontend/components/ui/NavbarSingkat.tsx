import Image from "next/image";
import Link from "next/link";

export default function NavbarSingkat() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-surface-container-highest shadow-sm">
      <div className="mx-auto flex h-20 max-w-screen-xl items-center justify-between px-4 lg:px-8">

        {/* Bagian Kiri: Logo Asli Apomacy */}
        <Link
          href="/katalog"
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
        {/* Bagian Kanan: Secure Checkout Indicator (Sesuai Gambar Checkout) */}
        <div className="flex items-center gap-2 text-apomacy-dark">
          {/* Ikon Gembok SVG murni, tanpa material symbols */}
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-sm font-semibold">Secure Checkout</span>
        </div>

      </div>
    </header>
  );
}