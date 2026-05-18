"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';

// Interface untuk tipe data dari Public API
interface ApotekMitra {
  id: number;
  name: string;
  email: string;
  address: {
    street: string;
    city: string;
  };
  phone: string;
}

export default function DasborPage() {
  // State untuk Integrasi Data API
  const [mitraApotek, setMitraApotek] = useState<ApotekMitra[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Mengambil data saat halaman dasbor pertama kali dimuat
  useEffect(() => {
    // Mengambil 10 data dari Public API menggunakan Axios
    axios.get('https://jsonplaceholder.typicode.com/users')
      .then((response) => {
        setMitraApotek(response.data); // Menyimpan data dari API
        setLoading(false); // Mematikan efek loading
      })
      .catch((error) => {
        console.error("Gagal mengambil data mitra:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-5xl mx-auto pb-10">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-apomacy-blue">Ringkasan Dasbor</h1>
        <p className="text-apomacy-muted-blue mt-1">Pantau aktivitas kesehatan dan pesanan obat Anda di sini.</p>
      </div>

      {/* Grid 2 Kolom untuk Kartu Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* Card 1: Pesanan Obat */}
        <div className="bg-apomacy-white p-6 rounded-xl shadow-sm border border-apomacy-border flex flex-col hover:border-apomacy-teal transition">
          <h3 className="text-apomacy-muted-blue text-sm font-medium">Pesanan Obat Aktif</h3>
          <p className="text-3xl font-bold text-apomacy-blue mt-2">2</p>
          <a href="/dasbor/riwayat-obat" className="text-sm text-apomacy-teal font-medium hover:underline mt-4">
            Lihat detail pesanan &rarr;
          </a>
        </div>

        {/* Card 2: Kelengkapan Profil */}
        <div className="bg-apomacy-white p-6 rounded-xl shadow-sm border border-apomacy-border flex flex-col hover:border-apomacy-teal transition">
          <h3 className="text-apomacy-muted-blue text-sm font-medium">Kelengkapan Profil</h3>
          <p className="text-3xl font-bold text-apomacy-teal mt-2">85%</p>
          <a href="/dasbor/profil" className="text-sm text-apomacy-muted-blue hover:text-apomacy-blue hover:underline mt-4">
            Lengkapi profil &rarr;
          </a>
        </div>

      </div>

      {/* Aktivitas Terakhir (Statis) */}
      <div className="bg-apomacy-white p-6 rounded-xl shadow-sm border border-apomacy-border mb-8">
        <h3 className="text-lg font-bold text-apomacy-blue mb-4">Aktivitas Terakhir</h3>
        <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
          <div>
            <p className="font-medium text-apomacy-dark">Pembelian Obat: Paracetamol 500mg</p>
            <p className="text-sm text-apomacy-muted-blue"> 24 Okt 2023 - Sedang Dikirim</p>
          </div>
          <span className="bg-apomacy-light-blue/30 text-apomacy-blue text-xs font-bold px-3 py-1 rounded-full">
            Proses
          </span>
        </div>

        <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
          
          <div>
            <p className="font-medium text-apomacy-dark">Vitamin C 1000mg - Botol</p>
            <p className="text-sm text-apomacy-muted-blue"> 24 Okt 2023 - Sedang Dikirim</p>
          </div>
          <span className="bg-apomacy-light-blue/30 text-apomacy-blue text-xs font-bold px-3 py-1 rounded-full">
            Proses
          </span>
        </div>
      </div>

      {/* ========================================================
          INTEGRASI AXIOS & LOADING (Syarat Tugas Nilai A)
         ======================================================== */}
      <div className="bg-apomacy-white p-6 rounded-xl shadow-sm border border-apomacy-border">
        <h3 className="text-lg font-bold text-apomacy-blue border-l-4 border-apomacy-teal pl-2 mb-2">
          Jaringan Apotek Mitra Terdekat
        </h3>
        <p className="text-sm text-apomacy-muted-blue mb-6">
          Menampilkan 10 apotek mitra terdekat di area Anda. Data ini diambil secara <span className="italic">real-time</span> dari server.
        </p>

        {/* CONDITIONAL RENDERING: LOADING STATE */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-10 h-10 border-4 border-apomacy-light-blue border-t-apomacy-blue rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-apomacy-muted-blue animate-pulse">Menghubungkan ke server...</p>
          </div>
        ) : (
          /* CONDITIONAL RENDERING: DATA SELESAI DIAMBIL */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mitraApotek.map((apotek) => (
              <div 
                key={apotek.id} 
                className="p-4 border border-apomacy-border rounded-xl hover:border-apomacy-teal hover:shadow-md transition duration-200 bg-gray-50/50 flex gap-3 items-start"
              >
                {/* Ikon/Inisial */}
                <div className="w-10 h-10 rounded-lg bg-apomacy-light-blue/50 flex items-center justify-center shrink-0">
                  <span className="text-apomacy-blue font-bold">
                    {apotek.name.charAt(0)}
                  </span>
                </div>
                
                <div className="overflow-hidden w-full">
                  <h4 className="font-bold text-apomacy-dark text-sm truncate">{apotek.name}</h4>
                  <p className="text-xs text-apomacy-muted-blue mt-0.5 truncate">{apotek.address.street}, {apotek.address.city}</p>
                  
                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-200/60">
                    <span className="text-xs font-medium text-apomacy-teal">Tersedia</span>
                    <span className="text-xs text-apomacy-muted-blue bg-gray-100 px-2 py-0.5 rounded">
                      {apotek.phone.split(' ')[0]}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}