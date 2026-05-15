"use client";

import { useState } from 'react';

// --- DATA DUMMY FAQ ---
const daftarFaq = [
  {
    pertanyaan: "Bagaimana cara melacak pesanan obat saya?",
    jawaban: "Anda dapat melacak pesanan dengan masuk ke menu 'Riwayat Pesanan Obat'. Cari pesanan yang berstatus 'Dikirim', lalu klik tombol 'Lacak Pesanan' untuk melihat status pengiriman secara real-time."
  },
  {
    pertanyaan: "Apakah saya bisa membatalkan atau mengubah jadwal konsultasi?",
    jawaban: "Ya, Anda bisa membatalkannya atau menjadwalkan ulang. Buka menu 'Riwayat Konsultasi', pilih jadwal yang berstatus 'Akan Datang', lalu klik tombol 'Jadwal Ulang' minimal 2 jam sebelum waktu konsultasi dimulai."
  },
  {
    pertanyaan: "Metode pembayaran apa saja yang tersedia di Apomacy?",
    jawaban: "Kami menerima berbagai metode pembayaran, mulai dari Transfer Bank (BCA, Mandiri, BNI, BRI), E-Wallet (GoPay, OVO, Dana, ShopeePay), Kartu Kredit/Debit, hingga pembayaran Virtual Account."
  },
  {
    pertanyaan: "Bagaimana cara menukarkan resep dokter elektronik (e-resep)?",
    jawaban: "Setelah konsultasi dokter selesai, e-resep akan otomatis masuk ke akun Anda. Anda bisa melihatnya di menu 'Riwayat Konsultasi', klik 'Resep Dokter', dan Anda bisa langsung menebusnya untuk dikirim ke rumah."
  },
  {
    pertanyaan: "Apakah Apomacy melayani pengiriman obat 24 jam?",
    jawaban: "Saat ini, layanan pengiriman instan 24 jam kami tersedia untuk wilayah Jabodetabek. Untuk wilayah lain, pengiriman beroperasi mulai pukul 06.00 hingga 22.00 waktu setempat."
  }
];

export default function FaqPage() {
  // State untuk melacak pertanyaan mana yang sedang dibuka
  // Null artinya semua tertutup. Jika diisi angka (misal 0), maka pertanyaan pertama terbuka.
  const [aktifIndex, setAktifIndex] = useState<number | null>(null);

  // Fungsi untuk membuka/menutup jawaban
  const toggleFaq = (index: number) => {
    // Jika pertanyaan yang diklik sudah terbuka, maka tutup. Jika belum, buka.
    setAktifIndex(aktifIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-apomacy-blue">Pusat Bantuan & FAQ</h1>
        <p className="text-apomacy-muted-bluemt-1">Temukan jawaban untuk pertanyaan yang paling sering diajukan terkait layanan Apomacy.</p>
      </div>

      {/* Kotak Pencarian (Visual Only) */}
      <div className="bg-white border border-apomacy-border rounded-xl p-2 mb-8 shadow-sm flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-apomacy-muted-blueml-3 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input 
          type="text" 
          placeholder="Cari topik bantuan (contoh: cara bayar, resep)..." 
          className="w-full py-2 px-2 outline-none text-apomacy-dark placeholder-gray-400 bg-transparent"
        />
        <button className="bg-apomacy-blue text-white px-6 py-2 rounded-lg font-medium hover:bg-apomacy-darktransition">
          Cari
        </button>
      </div>

      {/* Daftar Akordion FAQ */}
      <div className="bg-white border border-apomacy-border rounded-2xl shadow-sm overflow-hidden">
        {daftarFaq.map((item, index) => (
          <div 
            key={index} 
            className={`border-b border-apomacy-border last:border-b-0 transition-colors ${
              aktifIndex === index ? 'bg-apomacy-light-blue/10' : 'hover:bg-gray-50'
            }`}
          >
            {/* Tombol Pertanyaan */}
            <button
              onClick={() => toggleFaq(index)}
              className="w-full flex justify-between items-center p-6 text-left focus:outline-none"
            >
              <span className={`font-semibold text-lg ${aktifIndex === index ? 'text-apomacy-blue' : 'text-apomacy-dark'}`}>
                {item.pertanyaan}
              </span>
              
              {/* Ikon Panah yang berputar */}
              <div className={`ml-4 shrink-0 transition-transform duration-300 ease-in-out ${
                aktifIndex === index ? 'rotate-180 text-apomacy-light-blue' : 'rotate-0 text-apomacy-muted-blue'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Area Jawaban (Muncul jika aktifIndex cocok) */}
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                aktifIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="p-6 pt-0 text-apomacy-muted-blueleading-relaxed">
                {item.jawaban}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bantuan Tambahan */}
      <div className="mt-8 bg-apomacy-light-blue/20 rounded-2xl p-6 border border-apomacy-light-blue flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="font-bold text-apomacy-blue text-lg">Masih butuh bantuan?</h3>
          <p className="text-apomacy-muted-blue">Tim dukungan Apomacy siap membantu Anda setiap hari.</p>
        </div>
        <button className="px-6 py-3 bg-apomacy-teal text-white font-medium rounded-xl hover:bg-teal-500 transition shadow-sm w-full md:w-auto flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Chat Customer Service
        </button>
      </div>

    </div>
  );
}