"use client";

import { useState, useRef, useEffect } from 'react';
import Cookies from "js-cookie";

export default function ProfilPage() {
  // Asumsi: ID User ini digunakan sementara untuk endpoint upload foto (PUT /api/users/:id/foto)
  const userID = 1;

  // State untuk menyimpan isian form
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    telepon: '',
    tanggalLahir: '',
    alamat: '',
  });

  const [fotoProfil, setFotoProfil] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [pesanSukses, setPesanSukses] = useState(false);
  const [pesanError, setPesanError] = useState("");

  // =====================================================================
  // 1. FETCH DATA PROFIL (Dipanggil otomatis saat halaman dibuka)
  // =====================================================================
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Ambil token dari Cookies sesuai dengan nama yang diset di halaman Login
        const token = Cookies.get('apomacy_token');

        // Memanggil endpoint GET /api/users/profile (Sesuai dengan router.go Anda!)
        const res = await fetch(`/api/users/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // Penanganan error yang tahan banting (Mencegah SyntaxError JSON position 4)
        if (!res.ok) {
          const errText = await res.text();
          let errMessage = "Gagal mengambil data profil";
          try {
            const errData = JSON.parse(errText);
            errMessage = errData.error || errMessage;
          } catch (e) {
            errMessage = `Error Server (${res.status}): ${errText}`;
          }
          throw new Error(errMessage);
        }

        // Parsing JSON jika responsnya sukses (200 OK)
        const responseData = await res.json();
        const data = responseData.data;

        // Mengisi form dengan data dari database
        setFormData({
          nama: data.nama || '',
          email: data.email || '',
          telepon: data.telepon || '',
          tanggalLahir: data.tanggalLahir || '',
          alamat: data.alamat || '',
        });

        if (data.fotoProfil) {
          setFotoProfil(data.fotoProfil);
        }
      } catch (error: any) {
        console.error("Error fetching profile:", error);
        setPesanError(error.message);
      }
    };

    fetchProfile();
  }, []);

  // =====================================================================
  // 2. HANDLER INPUT & FOTO
  // =====================================================================
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file); // Simpan file mentah untuk dikirim ke API
      setFotoProfil(URL.createObjectURL(file)); // Tampilkan preview lokal di web
    }
  };

  // =====================================================================
  // 3. SUBMIT PERUBAHAN
  // =====================================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setPesanSukses(false);
    setPesanError("");

    try {
      // Ambil token dari Cookies sesuai dengan nama yang diset di halaman Login
      const token = Cookies.get('apomacy_token');

      // --- A. Upload Foto Profil ---
      // (Sesuai endpoint PUT /api/users/:id/foto di router.go)
      if (selectedFile) {
        const formDataFoto = new FormData();
        formDataFoto.append("foto", selectedFile);

        const resFoto = await fetch(`/api/users/${userID}/foto`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
            // Jangan set Content-Type secara manual saat menggunakan FormData!
          },
          body: formDataFoto
        });

        if (!resFoto.ok) {
          const errText = await resFoto.text();
          let errMessage = "Gagal mengunggah foto profil";
          try {
            const errData = JSON.parse(errText);
            errMessage = errData.error || errMessage;
          } catch {
            errMessage = `Error Server (${resFoto.status}): ${errText}`;
          }
          throw new Error(errMessage);
        }

      }

      // --- B. Update Data Teks (Menyimpan Nama, Alamat, Tanggal Lahir) ---
      const resData = await fetch(`/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        // Pastikan key JSON di bawah ini (nama, telepon, dll) sesuai 
        // dengan struct yang kamu buat di file handler Golang-mu!
        body: JSON.stringify({
          nama_lengkap: formData.nama,
          no_telp: formData.telepon,
          tanggal_lahir: formData.tanggalLahir,
          alamat: formData.alamat
        })
      });

      if (!resData.ok) {
        const errText = await resData.text();
        let errMessage = "Gagal menyimpan perubahan teks profil";
        try {
          const errData = JSON.parse(errText);
          errMessage = errData.error || errMessage;
        } catch {
          errMessage = `Error Server (${resData.status}): ${errText}`;
        }
        throw new Error(errMessage);
      }


      setPesanSukses(true);
      setTimeout(() => setPesanSukses(false), 3000);
    } catch (error: any) {
      console.error("Gagal memperbarui profil:", error);
      setPesanError(error.message || "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsLoading(false);
    }
  };

  // =====================================================================
  // 4. TAMPILAN ANTARMUKA (UI)
  // =====================================================================
  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-apomacy-blue">Profil & Edit Akun</h1>
        <p className="text-apomacy-muted-blue mt-1">Kelola informasi data diri dan alamat pengiriman Anda.</p>
      </div>

      {pesanSukses && (
        <div className="mb-6 p-4 bg-apomacy-light-blue/40 border border-apomacy-teal text-apomacy-blue rounded-lg flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-apomacy-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">Profil berhasil diperbarui!</span>
        </div>
      )}

      {pesanError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-500 text-red-700 rounded-lg flex items-center gap-3">
          <span className="font-medium">{pesanError}</span>
        </div>
      )}

      <div className="bg-apomacy-white rounded-2xl shadow-sm border border-apomacy-border p-8 sm:p-10">

        {/* Foto Profil UI */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 pb-8 border-b border-apomacy-border">
          <div className="relative group shrink-0">

            <div className="w-32 h-32 rounded-full border-4 border-apomacy-light-blue bg-apomacy-white overflow-hidden shadow-sm flex items-center justify-center bg-gray-50">
              {fotoProfil ? (
                <img src={fotoProfil} alt="Foto Profil" className="w-full h-full object-cover bg-apomacy-light-blue/20" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              )}
            </div>

            <div onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-apomacy-dark/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-apomacy-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs font-medium">Ubah</span>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFotoChange} accept="image/*" className="hidden" />
          </div>
          <div className="text-center sm:text-left pt-2">
            <h3 className="text-lg font-semibold text-apomacy-dark">Foto Profil</h3>
            <p className="text-sm text-apomacy-muted-blue mt-1 max-w-sm">Format gambar yang didukung: JPEG, PNG, atau GIF. Direkomendasikan rasio 1:1.</p>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-4 px-4 py-2 text-sm font-medium text-apomacy-blue bg-apomacy-light-blue/50 hover:bg-apomacy-light-blue rounded-lg transition border border-apomacy-light-blue">
              Pilih Foto Baru
            </button>
          </div>
        </div>

        {/* Form Edit Profil UI */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-apomacy-dark mb-4 pb-2 border-b border-apomacy-border">Informasi Pribadi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-apomacy-dark mb-1">Nama Lengkap</label>
                <input type="text" name="nama" value={formData.nama} onChange={handleInputChange} required
                  className="w-full px-4 py-2.5 border border-apomacy-border rounded-lg focus:ring-2 focus:ring-apomacy-teal focus:border-apomacy-teal outline-none transition bg-apomacy-white text-apomacy-dark" />
              </div>
              <div>
                <label className="block text-sm font-medium text-apomacy-dark mb-1">Email <span className="text-apomacy-danger">*</span></label>
                <input
                  type="email"
                  value={formData.email} // <-- Gunakan value dari state
                  disabled
                  className="w-full px-4 py-2.5 border border-apomacy-border bg-gray-50 rounded-lg text-apomacy-muted-blue cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-apomacy-dark mb-1">Nomor Telepon</label>
                <input type="tel" name="telepon" value={formData.telepon} onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-apomacy-border rounded-lg focus:ring-2 focus:ring-apomacy-teal focus:border-apomacy-teal outline-none transition bg-apomacy-white text-apomacy-dark" />
              </div>
              <div>
                <label className="block text-sm font-medium text-apomacy-dark mb-1">Tanggal Lahir</label>
                <input type="date" name="tanggalLahir" value={formData.tanggalLahir} onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-apomacy-border rounded-lg focus:ring-2 focus:ring-apomacy-teal focus:border-apomacy-teal outline-none transition bg-apomacy-white text-apomacy-dark" />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <h3 className="text-lg font-semibold text-apomacy-dark mb-4 pb-2 border-b border-apomacy-border">Alamat Pengiriman</h3>
            <div>
              <label className="block text-sm font-medium text-apomacy-dark mb-1">Alamat Lengkap</label>
              <textarea rows={3} name="alamat" value={formData.alamat} onChange={handleInputChange}
                className="w-full px-4 py-3 border border-apomacy-border rounded-lg focus:ring-2 focus:ring-apomacy-teal focus:border-apomacy-teal outline-none transition resize-none bg-apomacy-white text-apomacy-dark"></textarea>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 mt-6 border-t border-apomacy-border">
            <button type="button" className="px-6 py-2.5 border border-apomacy-border text-apomacy-muted-blue font-medium rounded-lg hover:bg-gray-50 transition">
              Batal
            </button>
            <button type="submit" disabled={isLoading}
              className={`px-6 py-2.5 font-medium rounded-lg transition shadow-sm flex items-center justify-center min-w-[160px]
                ${isLoading ? 'bg-apomacy-muted-blue cursor-not-allowed text-apomacy-white' : 'bg-apomacy-blue hover:bg-apomacy-dark text-apomacy-white'}`}>
              {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}