import Link from "next/link";

export default function NavbarLanding() {
  return (
    <nav className="w-full flex items-center justify-between py-6 px-10 bg-white border-b border-gray-100">
      <Link href="/" className="text-2xl font-bold text-primary-500">Apomacy</Link>
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
        <Link href="/" className="hover:text-primary-500">Home</Link>
        <Link href="/katalog" className="hover:text-primary-500">Katalog Obat</Link>
        <Link href="/about" className="hover:text-primary-500">Tentang Kami</Link>
      </div>
      <div className="flex items-center gap-4 text-sm font-medium">
        <Link href="/login" className="text-gray-600 hover:text-primary-500">Login</Link>
        <Link href="/register" className="bg-primary-500 text-white px-5 py-2.5 rounded-md hover:bg-primary-400 transition-colors">Register</Link>
      </div>
    </nav>
  );
}
