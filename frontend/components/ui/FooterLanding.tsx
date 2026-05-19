import Link from "next/link";

export default function FooterLanding() {
  return (
    <footer className="w-full bg-linear-to-br from-[#f8faff] to-[#e6f2fb] py-10 px-10 border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-col max-w-xs">
            <h3 className="text-xl font-bold text-primary-500 mb-2">Apomacy</h3>
            <p className="text-xs text-gray-500 leading-relaxed">Mitra terpercaya Anda untuk layanan apotek digital dan manajemen kesehatan.</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-gray-500 font-medium">
          <Link href="#" className="hover:text-primary-500">Kebijakan Privasi</Link>
          <Link href="#" className="hover:text-primary-500">Ketentuan Layanan</Link>
          <Link href="#" className="hover:text-primary-500">Hubungi Dukungan</Link>
          <Link href="#" className="hover:text-primary-500">FAQ</Link>
        </div>
        <div className="text-xs text-gray-400">
            © 2026 Apomacy Digital Pharmacy. Hak cipta dilindungi undang-undang.
        </div>
      </div>
    </footer>
  );
}
