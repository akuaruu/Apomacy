"use client"; // WAJIB ditambahkan agar kita bisa mendeteksi URL saat ini

import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Mengimpor fitur pendeteksi URL

export default function DasborLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); // Menyimpan URL saat ini ke dalam variabel 'pathname'

  return (
    <div className="min-h-screen bg-apomacy-white flex font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-apomacy-blue text-white hidden md:flex flex-col shadow-lg border-r border-apomacy-border">
        
        {/* Logo Apomacy */}
        <div className="p-6 pb-4">
          <div className="bg-apomacy-white w-full h-12 px-2 rounded-lg shadow-sm flex justify-center items-center">
            <img 
              src="/Apomacy.png" 
              alt="Logo Apomacy" 
              className="max-h-full max-w-full object-contain py-1.5"
            />
          </div>
        </div>
        
        {/* Profil Pengguna */}
        <div className="px-6 pb-6 flex items-center gap-4 mb-2">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-apomacy-teal bg-apomacy-white shrink-0">
            <img 
              src="https://i.pinimg.com/736x/c5/fa/25/c5fa25a74ace1a1b5e351626a4bf6936.jpg" 
              alt="Foto Profil" 
              className="w-full h-full object-cover bg-apomacy-light-blue/30"
            />
          </div>
          <div className="overflow-hidden">
            <p className="font-bold text-base text-white truncate">Budi Santoso</p>
            <p className="text-sm text-apomacy-light-blue truncate">Member Aktif</p>
          </div>
        </div>

        {/* Menu Navigasi (DI SINI PERUBAHANNYA) */}
        <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto">

          <Link 
            href="/katalog" 
            className={`block px-4 py-3 rounded-lg transition ${
              pathname === '/dasbor/katalog' 
                ? 'bg-white/10 text-white font-medium' 
                : 'text-apomacy-light-blue hover:text-white hover:bg-apomacy-muted-blue/50'
            }`}
          >
            Halaman Utama
          </Link>

          
          <Link 
            href="/dasbor" 
            className={`block px-4 py-3 rounded-lg transition ${
              pathname === '/dasbor' 
                ? 'bg-white/10 text-white font-medium' // Style JIKA AKTIF (menyala)
                : 'text-apomacy-light-blue hover:text-white hover:bg-apomacy-muted-blue/50' // Style JIKA TIDAK AKTIF (redup)
            }`}
          >
            Dasbor Pengguna
          </Link>

          <Link 
            href="/dasbor/profil" 
            className={`block px-4 py-3 rounded-lg transition ${
              pathname === '/dasbor/profil' 
                ? 'bg-white/10 text-white font-medium' 
                : 'text-apomacy-light-blue hover:text-white hover:bg-apomacy-muted-blue/50'
            }`}
          >
            Profil & Edit Akun
          </Link>

          <Link 
            href="/dasbor/riwayat-obat" 
            className={`block px-4 py-3 rounded-lg transition ${
              pathname === '/dasbor/riwayat-obat' 
                ? 'bg-white/10 text-white font-medium' 
                : 'text-apomacy-light-blue hover:text-white hover:bg-apomacy-muted-blue/50'
            }`}
          >
            Riwayat Pesanan Obat
          </Link>

          <Link 
            href="/dasbor/konsultasi" 
            className={`block px-4 py-3 rounded-lg transition ${
              pathname === '/dasbor/konsultasi' 
                ? 'bg-white/10 text-white font-medium' 
                : 'text-apomacy-light-blue hover:text-white hover:bg-apomacy-muted-blue/50'
            }`}
          >
            Riwayat Konsultasi
          </Link>

          <Link 
            href="/dasbor/faq" 
            className={`block px-4 py-3 rounded-lg transition ${
              pathname === '/dasbor/faq' 
                ? 'bg-white/10 text-white font-medium' 
                : 'text-apomacy-light-blue hover:text-white hover:bg-apomacy-muted-blue/50'
            }`}
          >
            FAQ
          </Link>

        </nav>

        {/* Tombol Logout */}
        <div className="p-4 border-t border-white/10">
          <button className="w-full px-4 py-2 text-left text-apomacy-danger font-medium hover:bg-white/10 rounded-lg transition">
            Keluar (Logout)
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen">
        <main className="flex-1 p-8 overflow-y-auto bg-apomacy-white">
          {children}
        </main>
      </div>
    </div>
  );
}