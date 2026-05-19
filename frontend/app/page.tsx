import Link from "next/link";
import { ArrowRight, FileText, HeartPulse, Clock, Sparkles, ShieldCheck, Gauge, Headset, Pill } from "lucide-react";
import React from "react";

export default function Home() {
  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Hero Section */}
      <section className="px-10 py-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 space-y-6">
            <div className="inline-block bg-primary-100 text-primary-400 font-semibold text-xs px-3 py-1 rounded-full">
              MITRA KESEHATAN TERPERCAYA
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary-500 leading-tight">
              Layanan Farmasi Tepercaya, Diantar Langsung ke Pintu Rumah Anda.
            </h1>
            <p className="text-gray-600 text-lg max-w-lg">
              Kelola resep obat Anda, konsultasikan dengan apoteker berlisensi, dan dapatkan obat-obatan esensial dengan presisi dan kepedulian tinggi.
            </p>
            <div className="flex items-center gap-4 pt-4">
              <Link href="/register" className="bg-primary-500 text-white px-6 py-3 rounded-md hover:bg-primary-400 transition-colors flex items-center gap-2 font-medium shadow-md shadow-primary-200">
                Pesan Sekarang <ArrowRight size={18} />
              </Link>
              <Link href="/katalog" className="bg-white text-primary-500 border border-gray-200 px-6 py-3 rounded-md hover:bg-gray-50 transition-colors font-medium">
                Telusuri Katalog
              </Link>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=64" alt="user" className="w-full h-full object-cover" />
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-400 border-2 border-white overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=64" alt="user" className="w-full h-full object-cover" />
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-500 border-2 border-white overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=64" alt="user" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="text-sm">
                <p className="font-semibold text-primary-500">Bergabung bersama 10.000+ Pengguna</p>
                <p className="text-gray-500 text-xs">Apotek digital tepercaya di seluruh wilayah.</p>
              </div>
            </div>
          </div>
          <div className="flex-1 relative w-full">
            <div className="w-full h-[400px] md:h-[500px] bg-gray-100 rounded-3xl overflow-hidden shadow-xl flex items-end justify-center relative">
              <img src="/image/pharmacy_interior.png" alt="Interior Apotek" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute bottom-6 left-6 max-w-xs bg-white/90 backdrop-blur-md p-4 rounded-xl flex items-center gap-4 shadow-lg border border-white/50">
                 <div className="bg-primary-100 p-3 rounded-lg"><Clock className="text-primary-400" size={24} /></div>
                 <div>
                    <h4 className="font-bold text-primary-500 text-sm">Pengiriman Cepat</h4>
                    <p className="text-xs text-gray-500">Kirim di bawah 60 menit untuk area perkotaan.</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Care */}
      <section className="py-20 px-10">
         <div className="max-w-7xl mx-auto space-y-10">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-primary-500">Layanan Komprehensif</h2>
              <p className="text-gray-500">Layanan khusus yang dirancang demi kesehatan dan kenyamanan Anda.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-white border border-gray-100 p-10 rounded-3xl relative overflow-hidden group shadow-sm">
                 <FileText className="text-primary-300 mb-6" size={32} />
                 <h3 className="text-2xl font-bold text-primary-500 mb-3">Isi Ulang Resep Obat</h3>
                 <p className="text-gray-500 max-w-md mb-8 leading-relaxed">Unggah resep Anda sekali, dan kami akan mengurus sisanya. Jangan pernah melewatkan dosis obat dengan pengingat otomatis dan pengiriman kilat ke rumah Anda.</p>
                 <Link href="/katalog" className="font-semibold text-primary-500 flex items-center gap-2 group-hover:gap-3 transition-all text-sm">Kelola Sekarang <ArrowRight size={16} /></Link>
                 <div className="absolute -bottom-12 -right-12 text-gray-100 group-hover:text-primary-50 transition-colors pointer-events-none">
                    <Pill size={280} strokeWidth={1} />
                 </div>
              </div>
              <div className="bg-primary-400 text-white p-10 rounded-3xl flex flex-col justify-between shadow-lg shadow-primary-400/20">
                 <div>
                    <h3 className="text-2xl font-bold mb-3">Telekonsultasi</h3>
                    <p className="text-primary-100 text-sm leading-relaxed">Bicaralah dengan apoteker bersertifikat atau pakar kesehatan secara instan melalui video call.</p>
                 </div>
                 <button type="button" suppressHydrationWarning className="w-full bg-primary-300 hover:bg-primary-200 text-white py-3.5 rounded-xl font-medium transition-colors mt-10 shadow-inner">Mulai Panggilan</button>
              </div>
              
              <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm flex flex-col justify-center">
                 <HeartPulse className="text-primary-300 mb-6" size={28} />
                 <h3 className="font-bold text-primary-500 mb-2 text-lg">Pemantauan Kesehatan</h3>
                 <p className="text-sm text-gray-500 leading-relaxed">Pantau kepatuhan konsumsi obat dan kondisi vital Anda dalam satu dashboard bersih.</p>
              </div>
              
              <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm flex flex-col justify-center relative overflow-hidden">
                 <div className="inline-block bg-primary-100 text-primary-500 text-[10px] font-bold px-2.5 py-1 rounded-md mb-6 w-max tracking-wide uppercase">Tersedia</div>
                 <h3 className="font-bold text-primary-500 mb-2 text-lg">5.000+ Produk Tersedia</h3>
                 <p className="text-sm text-gray-500 leading-relaxed">Mulai dari kebutuhan harian hingga obat khusus yang langka.</p>
              </div>

              <div className="bg-primary-300 text-white p-8 rounded-3xl flex flex-col justify-center relative overflow-hidden">
                 <p className="text-lg italic text-primary-100 mb-6 relative z-10 leading-snug">&quot;Layanan apotek tercepat dan paling andal yang pernah saya gunakan di kota ini.&quot;</p>
                 <div className="flex items-center gap-3 relative z-10">
                   <div className="w-8 h-8 rounded-full overflow-hidden border border-white/30">
                       <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=64" alt="John D" className="w-full h-full object-cover" />
                   </div>
                   <span className="text-xs font-medium text-white/90">John D., anggota terverifikasi</span>
                 </div>
                 <div className="absolute top-4 right-4 text-white/10 pointer-events-none">
                     <Sparkles size={100} strokeWidth={1} />
                 </div>
              </div>
            </div>
         </div>
      </section>

      {/* Features - Certifications */}
      <section className="bg-linear-to-br from-[#f8faff] to-[#e6f2fb] py-24 px-10">
         <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
               <div className="w-14 h-14 bg-primary-500 rounded-full flex items-center justify-center text-white mb-6 shadow-sm">
                 <ShieldCheck size={24} />
               </div>
               <h3 className="text-xl font-bold text-primary-500 mb-3">Terjamin Keasliannya</h3>
               <p className="text-xs text-gray-500 leading-relaxed px-4">Semua obat bersumber langsung dari produsen resmi dengan jaminan keaslian 100%.</p>
            </div>
            <div className="flex flex-col items-center">
               <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center text-primary-500 mb-6 shadow-sm">
                 <Gauge size={24} />
               </div>
               <h3 className="text-xl font-bold text-primary-500 mb-3">Pengiriman Kilat</h3>
               <p className="text-xs text-gray-500 leading-relaxed px-4">Jaringan logistik kami memastikan obat-obatan yang sensitif terhadap suhu sampai di tangan Anda dalam kondisi prima dengan cepat.</p>
            </div>
            <div className="flex flex-col items-center">
               <div className="w-14 h-14 bg-[#052659] rounded-full flex items-center justify-center text-white mb-6 shadow-sm">
                 <Headset size={24} />
               </div>
               <h3 className="text-xl font-bold text-primary-500 mb-3">Dukungan Ahli 24/7</h3>
               <p className="text-xs text-gray-500 leading-relaxed px-4">Butuh bantuan mengenai dosis obat Anda? Tim dukungan dan apoteker kami tersedia sepanjang waktu demi ketenangan pikiran Anda.</p>
            </div>
         </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 px-10">
         <div className="max-w-6xl mx-auto bg-primary-500 rounded-[2rem] p-12 md:px-16 md:py-14 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="text-white max-w-lg space-y-3">
              <h2 className="text-3xl font-bold">Dapatkan Informasi Kesehatan Terkini</h2>
              <p className="text-primary-100 text-sm leading-relaxed">Bergabunglah dengan newsletter kesehatan kami untuk tips profesional, informasi ketersediaan obat, dan penawaran kebugaran eksklusif.</p>
            </div>
            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4 items-center">
              <input type="email" suppressHydrationWarning placeholder="Alamat email Anda" className="px-5 py-3.5 rounded-xl w-full sm:w-80 bg-white text-gray-900 focus:outline-none text-sm" />
              <button type="button" suppressHydrationWarning className="bg-primary-200 hover:bg-primary-300 text-primary-500 hover:text-white px-8 py-3.5 rounded-xl font-semibold transition-colors whitespace-nowrap text-sm">Berlangganan</button>
            </div>
         </div>
      </section>
    </div>
  );
}
