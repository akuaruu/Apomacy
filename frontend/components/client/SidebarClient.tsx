"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import api from "@/lib/api";

export default function SidebarClient() {
  const pathname = usePathname();

  // State untuk menyimpan nama, role, dan foto dinamis
  const [userName, setUserName] = useState<string>("Memuat...");
  const [userRole, setUserRole] = useState<string>("Member");

  // Berikan default foto jika belum ada foto di database
  const [fotoProfil, setFotoProfil] = useState<string>("");

  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        const session = await api.get("/users/session");
        setUserRole(session.data?.user?.role || "Member");
        setUserName(session.data?.user?.nama || "Pengguna");

        const res = await api.get("/users/profile");
        const data = res.data?.data;

        if (data) {
          const validName = data.nama || data.username || session.data?.user?.nama || "Pengguna";
          setUserName(validName);

          if (data.fotoProfil && data.fotoProfil !== "") {
            setFotoProfil(`${data.fotoProfil}?t=${new Date().getTime()}`);
          }
        }
      } catch (error) {
        console.error("Gagal memuat data profil sidebar:", error);
        setUserName("Pengguna");
      }
    };

    fetchSidebarData();
  }, []);

  const handleLogout = async () => {
    await api.post("/users/logout").catch(() => undefined);
    window.location.href = "/";
  };

  return (
    <aside className="w-64 bg-apomacy-primary text-white hidden md:flex flex-col shadow-lg border-r border-apomacy-border h-screen sticky top-0">

      {/* Profil Pengguna */}
      <div className="px-6 pt-10 pb-6 flex items-center gap-4 mb-2">

        {/* BAGIAN KIRI: Foto Profil */}
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-apomacy-teal bg-apomacy-white shrink-0 flex items-center justify-center bg-gray-50">
          {fotoProfil ? (
            <img
              src={fotoProfil}
              alt="Foto Profil"
              className="w-full h-full object-cover bg-apomacy-light-blue/30"
            />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          )}
        </div>

        {/* BAGIAN KANAN: Teks Nama & Role (Ini yang tadi terhapus!) */}
        <div className="overflow-hidden">
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
          Kembali ke Katalog
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
