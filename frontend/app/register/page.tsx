"use client";

import Link from "next/link";
import { User, Mail, Phone, Calendar, Lock, Zap, ArrowLeft, Eye, EyeOff } from "lucide-react";
import React, { useState, useEffect } from "react";
import axios from "axios";
import api from "@/lib/api";
import Cookies from "js-cookie";

interface Product {
  id: number;
  title: string;
  price: number;
  category: string;
  image: string;
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    const token = Cookies.get("apomacy_token");
    if (token) {
      window.location.href = "/dasbor";
    }

    const fetchProducts = async () => {
      try {
        const response = await axios.get("https://fakestoreapi.com/products?limit=10");
        setProducts(response.data);
      } catch (err) {
        console.error("Gagal mengambil data produk:", err);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchProducts();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!agreed) {
      setError("Anda harus menyetujui Ketentuan Layanan dan Kebijakan Privasi.");
      return;
    }

    setIsRegistering(true);

    try {
      // PENYESUAIAN PAYLOAD: Disesuaikan dengan tag JSON di backend model User
      await api.post("/users/register", {
        nama_lengkap: name,
        email: email,
        username: email, // Kita gunakan email sebagai username
        no_telp: phone,
        password: password, // Akan ditangkap oleh custom struct di backend
      });

      setSuccess("Pendaftaran berhasil! Silakan masuk ke akun Anda.");

      setName("");
      setEmail("");
      setPhone("");
      setBirthDate("");
      setPassword("");
      setAgreed(false);

      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (err: any) {
      console.error("Register Error:", err);
      const msg = err.response?.data?.message || err.response?.data?.error || "Gagal melakukan pendaftaran. Silakan periksa kembali data Anda.";
      setError(msg);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="flex-grow bg-[#f8faff] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full mb-4 flex justify-start">
        <Link href="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-500 transition-colors font-medium">
          <ArrowLeft size={16} /> Kembali ke Beranda
        </Link>
      </div>

      <div className="max-w-6xl w-full flex flex-col md:flex-row gap-10 items-center mb-16">
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
          </div>
        </div>

        <div className="md:w-[55%]">
          <div className="bg-white p-10 md:p-12 rounded-[2rem] shadow-xl border border-gray-100">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-primary-500 mb-2">Buat Akun Anda</h2>
              <p className="text-gray-500 text-sm">Silakan isi detail Anda untuk memulai.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium animate-fadeIn">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-600 rounded-xl text-sm font-medium animate-fadeIn">
                {success}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Lengkap</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@contoh.com"
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
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
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
                      required
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
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
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
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
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500 mt-0.5"
                  />
                  <span className="text-sm text-gray-600 leading-snug">
                    Saya menyetujui <Link href="#" className="font-semibold text-primary-500 hover:underline">Ketentuan Layanan</Link> dan <Link href="#" className="font-semibold text-primary-500 hover:underline">Kebijakan Privasi</Link>.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isRegistering}
                className={`w-full ${isRegistering ? 'bg-primary-300 cursor-not-allowed' : 'bg-primary-500 hover:bg-primary-400'} text-white font-semibold py-3.5 rounded-xl transition-colors shadow-md mt-6 flex items-center justify-center gap-2`}
              >
                {isRegistering ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Mendaftarkan...
                  </span>
                ) : (
                  <>Daftar Akun <Zap size={18} /></>
                )}
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