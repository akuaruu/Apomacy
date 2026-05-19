"use client";

import Link from "next/link";
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import React, { useState } from "react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex-grow bg-transparent flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full bg-white rounded-[2rem] shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-gray-100">
        
        {/* Left Side - Banner */}
        <div className="md:w-1/2 bg-primary-500 text-white p-12 flex flex-col justify-center relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <h2 className="text-4xl font-bold leading-tight">Apotek Digital Aman dan Tepercaya</h2>
            <p className="text-primary-100 text-lg leading-relaxed">
              Akses resep obat dan kebutuhan kesehatan Anda dengan keamanan dan presisi yang layak Anda dapatkan.
            </p>
          </div>
          {/* Background Illustration / Overlay */}
          <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1550831107-1553da8c8464?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary-400 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary-300 rounded-full blur-3xl opacity-30"></div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-1/2 p-10 md:p-14 flex flex-col relative">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-primary-500 mb-2">Selamat Datang Kembali</h2>
            <p className="text-gray-500 text-sm">Masuk untuk mengelola obat-obatan Anda secara aman.</p>
          </div>

          <form className="space-y-6 flex-grow">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Alamat Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  placeholder="nama@contoh.com" 
                  className="w-full pl-11 pr-4 py-3.5 bg-[#f8faff] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300 transition-all text-sm"
                />
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
                  placeholder="••••••••" 
                  className="w-full pl-11 pr-12 py-3.5 bg-[#f8faff] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300 transition-all text-sm"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 cursor-pointer hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
                <span className="text-sm text-gray-600">Ingat saya</span>
              </label>
              <Link href="#" className="text-sm font-medium text-primary-500 hover:text-primary-400">Lupa kata sandi?</Link>
            </div>

            <button type="button" className="w-full bg-primary-500 hover:bg-primary-400 text-white font-semibold py-3.5 rounded-xl transition-colors shadow-md mt-4">
              Masuk
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-gray-400 font-semibold tracking-widest">atau</span>
              </div>
            </div>
            
            <div className="mt-6 text-center text-sm text-gray-600">
              Baru di Apomacy? <Link href="/register" className="font-semibold text-primary-500 hover:text-primary-400">Daftar Sekarang</Link>
            </div>
          </div>

          <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-6 text-[10px] font-semibold text-gray-400 tracking-wider">
            <div className="flex items-center gap-1.5"><ShieldCheck size={14} /> HIPAA AMAN</div>
            <div className="flex items-center gap-1.5"><ShieldCheck size={14} /> SSL 256-BIT</div>
          </div>
        </div>
      </div>
    </div>
  );
}
