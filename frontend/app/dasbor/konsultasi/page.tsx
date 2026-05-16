"use client";

import { useState } from 'react';

// --- DATA DUMMY KONSULTASI ---
const riwayatKonsultasi = [
  {
    id: "KNS-260515-001",
    dokter: "dr. Tirta Mandira Hudhi, M.B.A",
    spesialisasi: "Dokter Umum",
    tanggal: "15 Mei 2026",
    waktu: "14:00 - 14:30 WIB",
    status: "Akan Datang",
    media: "Video Call",
    foto: "/drtirta.png"
  },
  {
    id: "KNS-260410-022",
    dokter: "dr. Dion Haryadi, CHC, AIFO-K",
    spesialisasi: "dokter umum",
    tanggal: "10 Apr 2026",
    waktu: "09:00 - 09:30 WIB",
    status: "Selesai",
    media: "Chat",
    foto: "/drDion.png"
  },
  {
    id: "KNS-260305-088",
    dokter: "dr. Indah Kusumaningrum ",
    spesialisasi: "Dokter Umum",
    tanggal: "05 Mar 2026",
    waktu: "19:00 - 19:15 WIB",
    status: "Dibatalkan",
    media: "Video Call",
    foto: "/indahkus.png"
  }
];

export default function KonsultasiPage() {
  const [tabAktif, setTabAktif] = useState('Semua');

  // Menentukan warna badge berdasarkan status
  const getStatusColor = (status: string) => {
    if (status === 'Akan Datang') return 'bg-apomacy-light-blue/50 text-[#14387D] border-[#C2ECEB]';
    if (status === 'Selesai') return 'bg-apomacy-teal/20 border-apomacy-teal border-apomacy-teal/30';
    if (status === 'Dibatalkan') return 'bg-[#FF4C4C]/10 text-[#FF4C4C] border-[#FF4C4C]/20';
    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  // Filter data sesuai tab yang dipilih
  const konsultasiDifilter = riwayatKonsultasi.filter(konsultasi => {
    if (tabAktif === 'Semua') return true;
    return konsultasi.status === tabAktif;
  });

  return (
    <div className="max-w-5xl mx-auto pb-10">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-apomacy-blue">Riwayat Konsultasi</h1>
        <p className="text-apomacy-muted-blue] mt-1">Kelola jadwal konsultasi Anda dengan dokter dan lihat riwayat sebelumnya.</p>
      </div>

      {/* Tab Filter */}
      <div className="flex space-x-2 border-b border-apomacy-border] mb-6 overflow-x-auto pb-px">
        {['Semua', 'Akan Datang', 'Selesai', 'Dibatalkan'].map((tab) => (
          <button
            key={tab}
            onClick={() => setTabAktif(tab)}
            className={`px-5 py-3 font-medium text-sm transition-colors whitespace-nowrap border-b-2 cursor-pointer ${
              tabAktif === tab
                ? 'border-apomacy-teal border-apomacy-teal'
                : 'border-transparent text-apomacy-muted-blue hover:text-apomacy-blue hover:border-apomacy-border'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Daftar Konsultasi */}
      <div className="space-y-6">
        {konsultasiDifilter.length > 0 ? (
          konsultasiDifilter.map((konsul) => (
            <div key={konsul.id} className="bg-white border border-apomacy-border rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition duration-200">
              
              {/* Header Kartu: Status & Media */}
              <div className="flex justify-between items-center p-4 border-b border-apomacy-border bg-gray-50/50">
                <div className="flex items-center gap-2 text-sm font-medium text-apomacy-muted-blue">
                  {/* Ikon Video atau Chat */}
                  {konsul.media === 'Video Call' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  )}
                  <span>{konsul.media}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(konsul.status)}`}>
                  {konsul.status}
                </span>
              </div>

              {/* Body Kartu: Info Dokter & Jadwal */}
              <div className="p-5 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                
                {/* Info Dokter */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border border-apomacy-border bg-gray-50 shrink-0">
                    <img src={konsul.foto} alt={`Foto ${konsul.dokter}`} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-apomacy-dark">{konsul.dokter}</h3>
                    <p className="text-sm text-apomacy-muted-blue">{konsul.spesialisasi}</p>
                  </div>
                </div>

                {/* Jadwal (Tanggal & Waktu) */}
                <div className="flex flex-col md:items-end gap-1 bg-gray-50 p-3 rounded-lg md:bg-transparent md:p-0 md:rounded-none w-full md:w-auto">
                  <div className="flex items-center gap-2 text-apomacy-dark font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-apomacy-muted-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {konsul.tanggal}
                  </div>
                  <div className="flex items-center gap-2 text-apomacy-dark font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-apomacy-muted-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {konsul.waktu}
                  </div>
                </div>

              </div>

              {/* Footer Kartu: Tombol Aksi */}
              <div className="p-4 border-t border-apomacy-border flex justify-end gap-3">
                {konsul.status === 'Akan Datang' && (
                  <>
                    <button className="px-4 py-2 border border-apomacy-border text-apomacy-muted-blue font-medium rounded-lg hover:bg-gray-50 transition text-sm">
                      Jadwal Ulang
                    </button>
                    <button className="px-4 py-2 bg-apomacy-blue text-white font-medium rounded-lg hover:bg-apomacy-dark transition shadow-sm text-sm">
                      Masuk Ruang Konsultasi
                    </button>
                  </>
                )}
                {konsul.status === 'Selesai' && (
                  <>
                    <button className="px-4 py-2 border border-apomacy-border text-apomacy-muted-blue font-medium rounded-lg hover:bg-gray-50 transition text-sm">
                      Resep Dokter
                    </button>
                    <button className="px-4 py-2 bg-apomacy-teal text-white font-medium rounded-lg hover:bg-teal-500 transition shadow-sm text-sm">
                      Konsultasi Lagi
                    </button>
                  </>
                )}
                {konsul.status === 'Dibatalkan' && (
                  <button className="px-4 py-2 border border-apomacy-border text-apomacy-muted-blue font-medium rounded-lg hover:bg-gray-50 transition text-sm">
                    Buat Janji Baru
                  </button>
                )}
              </div>

            </div>
          ))
        ) : (
          /* Tampilan Kosong Jika Tidak Ada Data */
          <div className="text-center py-16 bg-white border border-apomacy-border rounded-2xl">
            <div className="w-20 h-20 bg-apomacy-light-blue/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-apomacy-muted-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            <h3 className="text-lg font-semibold text-apomacy-dark">Belum ada jadwal konsultasi</h3>
            <p className="text-apomacy-muted-blue mt-1">Anda belum memiliki jadwal konsultasi dengan status ini.</p>
          </div>
        )}
      </div>

    </div>
  );
}