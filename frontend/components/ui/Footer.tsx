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
                            Your trusted digital pharmacy in Indonesia. Providing premium healthcare, daily vitamins, and wellness essentials directly to your door.
                        </p>

                        <ul className="mt-8 flex justify-center gap-6 sm:justify-start md:gap-8">
                            <li>
                                <a href="#" rel="noreferrer" target="_blank" className="text-apomacy-ice transition hover:text-white">
                                    <span className="sr-only">Facebook</span>
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                                    </svg>
                                </a>
                            </li>

                            <li>
                                <a href="#" rel="noreferrer" target="_blank" className="text-apomacy-ice transition hover:text-white">
                                    <span className="sr-only">Instagram</span>
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                                    </svg>
                                </a>
                            </li>

                            <li>
                                <a href="#" rel="noreferrer" target="_blank" className="text-apomacy-ice transition hover:text-white">
                                    <span className="sr-only">Twitter</span>
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:col-span-2">
                        <div className="text-center sm:text-left">
                            <p className="text-lg font-bold text-white">About Us</p>

                            <ul className="mt-8 space-y-4 text-sm">
                                <li>
                                    <Link className="text-apomacy-ice transition hover:text-white" href="#">
                                        Company History
                                    </Link>
                                </li>
                                <li>
                                    <Link className="text-apomacy-ice transition hover:text-white" href="#">
                                        Meet the Team
                                    </Link>
                                </li>
                                <li>
                                    <Link className="text-apomacy-ice transition hover:text-white" href="#">
                                        Licenses & Certifications
                                    </Link>
                                </li>
                                <li>
                                    <Link className="text-apomacy-ice transition hover:text-white" href="#">
                                        Careers
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div className="text-center sm:text-left">
                            <p className="text-lg font-bold text-white">Our Services</p>

                            <ul className="mt-8 space-y-4 text-sm">
                                <li>
                                    <Link className="text-apomacy-ice transition hover:text-white" href="#">
                                        Instant Delivery
                                    </Link>
                                </li>
                                <li>
                                    <Link className="text-apomacy-ice transition hover:text-white" href="#">
                                        Prescription Refill
                                    </Link>
                                </li>
                                <li>
                                    <Link className="text-apomacy-ice transition hover:text-white" href="#">
                                        Telemedicine
                                    </Link>
                                </li>
                                <li>
                                    <Link className="text-apomacy-ice transition hover:text-white" href="#">
                                        Health Checkups
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div className="text-center sm:text-left">
                            <p className="text-lg font-bold text-white">Helpful Links</p>

                            <ul className="mt-8 space-y-4 text-sm">
                                <li>
                                    <Link className="text-apomacy-ice transition hover:text-white" href="#">
                                        FAQs
                                    </Link>
                                </li>
                                <li>
                                    <Link className="text-apomacy-ice transition hover:text-white" href="#">
                                        Support
                                    </Link>
                                </li>
                                <li>
                                    <Link className="group flex justify-center gap-1.5 sm:justify-start" href="#">
                                        <span className="text-apomacy-ice transition group-hover:text-white">
                                            Live Chat
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
                            <p className="text-lg font-bold text-white">Contact Us</p>

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
                            <span className="block sm:inline">All rights reserved.</span>
                            <Link className="inline-block text-white underline transition hover:text-apomacy-ice ml-1" href="#">
                                Terms &amp; Conditions
                            </Link>
                            <span className="mx-2">&middot;</span>
                            <Link className="inline-block text-white underline transition hover:text-apomacy-ice" href="#">
                                Privacy Policy
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