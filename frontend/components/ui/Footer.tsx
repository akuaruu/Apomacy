import Link from "next/link";
import Image from "next/image";

export default function Footer() {
    return (
        <footer className="bg-apomacy-primary">
            <div className="mx-auto max-w-7xl px-4 pt-16 pb-6 sm:px-6 lg:px-8 lg:pt-24">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <div>
                        <div className="flex items-center justify-center gap-3 sm:justify-start">
                            <Image
                                src="/image/logo_apomacy.png"
                                alt="Logo Apomacy"
                                width={40}
                                height={40}
                                className="object-contain"
                            />
                            <span className="text-2xl font-black tracking-widest text-white">
                                Apomacy
                            </span>
                        </div>

                        <p className="mt-6 max-w-md text-center leading-relaxed text-apomacy-ice sm:max-w-xs sm:text-left">
                            Apotek digital terpercaya Anda di Indonesia. Menyediakan perawatan kesehatan premium, vitamin harian, dan kebutuhan kebugaran langsung ke pintu rumah Anda.
                        </p>

    
                    </div>

                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:col-span-2">
                        <div className="text-center sm:text-left">
                            <p className="text-lg font-bold text-white">Tentang Kami</p>

                            <ul className="mt-8 space-y-4 text-sm">
                                <li>
                                    <Link className="text-apomacy-ice transition hover:text-white" href="#">
                                        Sejarah Perusahaan
                                    </Link>
                                </li>
                                <li>
                                    <Link className="text-apomacy-ice transition hover:text-white" href="#">
                                        Tim Kami
                                    </Link>
                                </li>
                                <li>
                                    <Link className="text-apomacy-ice transition hover:text-white" href="#">
                                        Lisensi & Sertifikasi
                                    </Link>
                                </li>
                                <li>
                                    <Link className="text-apomacy-ice transition hover:text-white" href="#">
                                        Karir
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div className="text-center sm:text-left">
                            <p className="text-lg font-bold text-white">Layanan Kami</p>

                            <ul className="mt-8 space-y-4 text-sm">
                                <li>
                                    <Link className="text-apomacy-ice transition hover:text-white" href="#">
                                        Pengiriman Instan
                                    </Link>
                                </li>
                                <li>
                                    <Link className="text-apomacy-ice transition hover:text-white" href="#">
                                        Penebusan Resep Obat
                                    </Link>
                                </li>
                                <li>
                                    <Link className="text-apomacy-ice transition hover:text-white" href="#">
                                        Telemedisin
                                    </Link>
                                </li>
                                <li>
                                    <Link className="text-apomacy-ice transition hover:text-white" href="#">
                                        Pemeriksaan Kesehatan
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div className="text-center sm:text-left">
                            <p className="text-lg font-bold text-white">Tautan Bermanfaat</p>

                            <ul className="mt-8 space-y-4 text-sm">
                                <li>
                                    <Link className="text-apomacy-ice transition hover:text-white" href="#">
                                        FAQ
                                    </Link>
                                </li>
                                <li>
                                    <Link className="text-apomacy-ice transition hover:text-white" href="#">
                                        Bantuan & Dukungan
                                    </Link>
                                </li>
                                <li>
                                    <Link className="group flex justify-center gap-1.5 sm:justify-start" href="#">
                                        <span className="text-apomacy-ice transition group-hover:text-white">
                                            Obrolan Langsung
                                        </span>
                                        <span className="relative flex h-2 w-2">
                                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-apomacy-teal opacity-75"></span>
                                            <span className="relative inline-flex h-2 w-2 rounded-full bg-apomacy-teal"></span>
                                        </span>
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div className="text-center sm:text-left">
                            <p className="text-lg font-bold text-white">Hubungi Kami</p>

                            <ul className="mt-8 space-y-4 text-sm">
                                <li>
                                    <a className="flex items-center justify-center gap-2 sm:justify-start" href="#">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                        </svg>
                                        <span className="text-apomacy-ice">support@apomacy.id</span>
                                    </a>
                                </li>
                                <li>
                                    <a className="flex items-center justify-center gap-2 sm:justify-start" href="#">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                        </svg>
                                        <span className="text-apomacy-ice">+62 811 2345 6789</span>
                                    </a>
                                </li>
                                <li className="flex items-start justify-center gap-2 sm:justify-start">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    </svg>
                                    <address className="-mt-0.5 text-apomacy-ice not-italic">
                                        Jl. Ring Road Utara, Condongcatur,<br />Sleman, Yogyakarta, Indonesia
                                    </address>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="mt-12 border-t border-white/20 pt-6">
                    <div className="text-center sm:flex sm:justify-between sm:text-left">
                        <p className="text-sm text-apomacy-ice">
                            <span className="block sm:inline">Hak cipta dilindungi undang-undang.</span>
                            <Link className="inline-block text-white underline transition hover:text-apomacy-ice ml-1" href="#">
                                Syarat &amp; Ketentuan
                            </Link>
                            <span className="mx-2">&middot;</span>
                            <Link className="inline-block text-white underline transition hover:text-apomacy-ice" href="#">
                                Kebijakan Privasi
                            </Link>
                        </p>

                        <p className="mt-4 text-sm text-apomacy-ice sm:order-first sm:mt-0">
                            &copy; 2026 Apomacy Medical
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}