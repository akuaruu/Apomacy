"use client";

import Link from "next/link";
import { User, Mail, Phone, Calendar, Lock, Zap, History, BellRing, Eye, EyeOff, ArrowLeft } from "lucide-react";
import React, { useState } from "react";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex-grow bg-transparent flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full mb-4 flex justify-start">
        <Link href="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-500 transition-colors font-medium">
          <ArrowLeft size={16} /> Kembali ke Beranda
        </Link>
      </div>
      <div className="max-w-6xl w-full flex flex-col md:flex-row gap-10 items-center">
        
        {/* Left Side - Info */}
        <div className="md:w-[45%] flex flex-col justify-center space-y-10">
          <div className="space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold text-primary-500 leading-tight">Bergabunglah dengan masa depan layanan kesehatan.</h2>
            <p className="text-gray-600 text-lg leading-relaxed max-w-md">
              Buat akun hari ini untuk menikmati layanan apotek yang personal, efisien, dan dirancang khusus demi kesejahteraan Anda.
            </p>
          </div>
          
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-400 shrink-0 shadow-sm border border-primary-200/50">
                <Zap size={24} />
              </div>
              <div>
                <h4 className="text-xl font-bold text-primary-500 mb-1">Pembelian Lebih Cepat</h4>
                <p className="text-sm text-gray-500 leading-relaxed">Simpan detail pengiriman dan pembayaran Anda untuk menebus resep hanya dengan dua klik.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-400 shrink-0 shadow-sm border border-primary-200/50">
                <History size={24} />
              </div>
              <div>
                <h4 className="text-xl font-bold text-primary-500 mb-1">Riwayat Pesanan</h4>
                <p className="text-sm text-gray-500 leading-relaxed">Akses riwayat lengkap pembelian medis Anda dan unduh faktur untuk asuransi dengan mudah.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-400 shrink-0 shadow-sm border border-primary-200/50">
                <BellRing size={24} />
              </div>
              <div>
                <h4 className="text-xl font-bold text-primary-500 mb-1">Notifikasi Pintar</h4>
                <p className="text-sm text-gray-500 leading-relaxed">Dapatkan pengingat otomatis saat tiba waktunya untuk tebus ulang obat atau pemeriksaan kesehatan berikutnya.</p>
              </div>
            </div>
          </div>
          
          <div className="w-full h-48 rounded-2xl overflow-hidden mt-4 shadow-md">
            <img src="/image/register_pharmacy.png" alt="Pharmacy Interior" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-[55%]">
           <div className="bg-white p-10 md:p-12 rounded-[2rem] shadow-xl border border-gray-100">
             <div className="mb-8">
               <h2 className="text-3xl font-bold text-primary-500 mb-2">Buat Akun Anda</h2>
               <p className="text-gray-500 text-sm">Silakan isi detail Anda untuk memulai.</p>
             </div>

             <form className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Lengkap</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <User size={18} />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Rizky Pelangi" 
                      className="w-full pl-11 pr-4 py-3 bg-[#f8faff] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300 transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Alamat Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <Mail size={18} />
                    </div>
                    <input 
                      type="email" 
                      placeholder="Rizky@example.com" 
                      className="w-full pl-11 pr-4 py-3 bg-[#f8faff] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300 transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-5">
                   <div className="space-y-1.5 flex-1">
                     <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nomor Telepon</label>
                     <div className="relative">
                       <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                         <Phone size={18} />
                       </div>
                       <input 
                         type="tel" 
                         placeholder="+62 123-4567-890" 
                         className="w-full pl-11 pr-4 py-3 bg-[#f8faff] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300 transition-all text-sm"
                       />
                     </div>
                   </div>
                   
                   <div className="space-y-1.5 flex-1">
                     <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tanggal Lahir</label>
                     <div className="relative">
                       <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                         <Calendar size={18} />
                       </div>
                       <input 
                         type="date" 
                         className="w-full pl-11 pr-4 py-3 bg-[#f8faff] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300 transition-all text-sm text-gray-500"
                       />
                     </div>
                   </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Kata Sandi</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                      <Lock size={18} />
                    </div>
                    <input 
                      type={showPassword ? "text" : "password"}  
                      className="w-full pl-11 pr-12 py-3 bg-[#f8faff] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300 transition-all text-sm"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 cursor-pointer hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Harus minimal 8 karakter dengan kombinasi huruf dan angka.</p>
                </div>

                <div className="pt-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500 mt-0.5" />
                    <span className="text-sm text-gray-600 leading-snug">
                      Saya menyetujui <Link href="#" className="font-semibold text-primary-500 hover:underline">Ketentuan Layanan</Link> dan <Link href="#" className="font-semibold text-primary-500 hover:underline">Kebijakan Privasi</Link>.
                    </span>
                  </label>
                </div>

                <button type="button" className="w-full bg-primary-500 hover:bg-primary-400 text-white font-semibold py-3.5 rounded-xl transition-colors shadow-md mt-6 flex items-center justify-center gap-2">
                  Daftar Akun <Zap size={18} />
                </button>
             </form>
             
             <div className="mt-8 text-center text-sm text-gray-600">
               Sudah punya akun? <Link href="/login" className="font-semibold text-primary-500 hover:text-primary-400">Masuk di sini</Link>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}
