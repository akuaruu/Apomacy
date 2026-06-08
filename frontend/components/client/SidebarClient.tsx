"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

// Interface untuk membaca isi Token
interface MyTokenPayload {
  id_user?: number;
  role?: string;
  nama?: string;
  name?: string;
  username?: string;
}

export default function SidebarClient() {
  const pathname = usePathname();

  // State untuk menyimpan nama dan role dinamis
  const [userName, setUserName] = useState<string>("Memuat...");
  const [userRole, setUserRole] = useState<string>("Member");

  useEffect(() => {
    // Ambil token dan ekstrak namanya saat komponen dimuat
    const token = Cookies.get("apomacy_token");
    if (token) {
      try {
        const decoded = jwtDecode<MyTokenPayload>(token);
        setUserName(decoded.nama || decoded.name || decoded.username || "Pengguna");
        setUserRole(decoded.role || "Member");
      } catch (error) {
        console.error("Gagal membaca token:", error);
        setUserName("Pengguna");
      }
    } else {
      setUserName("Pengguna");
    }
  }, []);

  const handleLogout = () => {
    Cookies.remove("apomacy_token");
    window.location.href = "/";
  };

  return (
    <aside className="w-64 bg-apomacy-primary text-white hidden md:flex flex-col shadow-lg border-r border-apomacy-border h-screen sticky top-0">

      {/* Profil Pengguna */}
      <div className="px-6 pt-10 pb-6 flex items-center gap-4 mb-2">
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-apomacy-teal bg-apomacy-white shrink-0">
          <img
            src="https://i.pinimg.com/736x/c5/fa/25/c5fa25a74ace1a1b5e351626a4bf6936.jpg"
            alt="Foto Profil"
            className="w-full h-full object-cover bg-apomacy-light-blue/30"
          />
        </div>
        <div className="overflow-hidden">
          {/* Render Nama & Role secara dinamis */}
          <p className="font-bold text-base text-white truncate">{userName}</p>
          <p className="text-sm text-apomacy-light-blue truncate">{userRole} Aktif</p>
        </div>
      </div>

      {/* Menu Navigasi */}
      <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto">
        <Link
          href="/katalog"
          className={`block px-4 py-3 rounded-lg transition ${pathname === '/katalog'
              ? 'bg-white/10 text-white font-medium'
              : 'text-apomacy-light-blue hover:text-white hover:bg-apomacy-muted-blue/50'
            }`}
        >
          Halaman Utama
        </Link>

        <Link
          href="/dasbor"
          className={`block px-4 py-3 rounded-lg transition ${pathname === '/dasbor'
              ? 'bg-white/10 text-white font-medium'
              : 'text-apomacy-light-blue hover:text-white hover:bg-apomacy-muted-blue/50'
            }`}
        >
          Dasbor Pengguna
        </Link>

        <Link
          href="/dasbor/profil"
          className={`block px-4 py-3 rounded-lg transition ${pathname === '/dasbor/profil'
              ? 'bg-white/10 text-white font-medium'
              : 'text-apomacy-light-blue hover:text-white hover:bg-apomacy-muted-blue/50'
            }`}
        >
          Profil & Edit Akun
        </Link>

        <Link
          href="/dasbor/riwayat-obat"
          className={`block px-4 py-3 rounded-lg transition ${pathname === '/dasbor/riwayat-obat'
              ? 'bg-white/10 text-white font-medium'
              : 'text-apomacy-light-blue hover:text-white hover:bg-apomacy-muted-blue/50'
            }`}
        >
          Riwayat Pesanan Obat
        </Link>

        <Link
          href="/dasbor/faq"
          className={`block px-4 py-3 rounded-lg transition ${pathname === '/dasbor/faq'
              ? 'bg-white/10 text-white font-medium'
              : 'text-apomacy-light-blue hover:text-white hover:bg-apomacy-muted-blue/50'
            }`}
        >
          FAQ
        </Link>
      </nav>

      {/* Tombol Logout */}
      <div className="p-4 border-t border-white/10">
        <button onClick={handleLogout} className="w-full px-4 py-2 text-left text-apomacy-danger font-medium hover:bg-white/10 rounded-lg transition">
          Keluar (Logout)
        </button>
      </div>

    </aside>
  );
}