"use client";

import { useState, useRef, useEffect } from 'react';
import api from "@/lib/api";
import { getApiDataObject } from "@/lib/api-data";
import { getUserFriendlyError } from "@/lib/errors";
import { getImageUploadError, IMAGE_UPLOAD_ACCEPT, isValidIndonesianPhone, isValidPastDate, isValidPersonName, normalizePhone } from "@/lib/validation";

const PROFILE_IMAGE_MAX_SIZE = 2 * 1024 * 1024;

export default function ProfilPage() {
  // State untuk menyimpan isian form
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    telepon: '',
    tanggalLahir: '',
    alamat: '',
  });
  const [initialFormData, setInitialFormData] = useState(formData);

  const [fotoProfil, setFotoProfil] = useState('');
  const [initialFotoProfil, setInitialFotoProfil] = useState('');
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
        const response = await api.get("/users/profile");
        const data = getApiDataObject<Record<string, unknown>>(response.data, "profil");

        const tanggalLahir =
          data.tanggalLahir ??
          data.tanggal_lahir ??
          "";

        const fotoProfil =
          data.fotoProfil ??
          data.foto_profil ??
          "";

        const loadedFormData = {
          nama:
            String(data.nama ?? data.nama_lengkap ?? ""),

          email:
            String(data.email ?? ""),

          telepon:
            String(data.telepon ?? data.no_telp ?? ""),

          tanggalLahir: tanggalLahir
            ? String(tanggalLahir).slice(0, 10)
            : "",

          alamat:
            String(data.alamat ?? ""),
        };
        setFormData(loadedFormData);
        setInitialFormData(loadedFormData);

        const loadedFotoProfil = fotoProfil ? encodeURI(String(fotoProfil)) : "";
        setFotoProfil(loadedFotoProfil);
        setInitialFotoProfil(loadedFotoProfil);
      } catch (error: unknown) {
        console.error("Error fetching profile:", error);
        setPesanError(getUserFriendlyError(error, "Gagal mengambil data profil."));
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
      const fileError = getImageUploadError(file, PROFILE_IMAGE_MAX_SIZE);
      if (fileError) {
        setPesanError(fileError);
        e.target.value = "";
        return;
      }
      setPesanError("");
      setSelectedFile(file); // Simpan file mentah untuk dikirim ke API
      setFotoProfil(URL.createObjectURL(file)); // Tampilkan preview lokal di web
    }
  };

  // =====================================================================
  // 3. SUBMIT PERUBAHAN
  // =====================================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPesanSukses(false);
    setPesanError("");

    if (!isValidPersonName(formData.nama)) {
      setPesanError("Nama lengkap harus terdiri dari 2–100 karakter dan tidak boleh berisi angka.");
      return;
    }
    if (!isValidIndonesianPhone(formData.telepon)) {
      setPesanError("Masukkan nomor telepon Indonesia yang valid.");
      return;
    }
    if (formData.tanggalLahir && !isValidPastDate(formData.tanggalLahir)) {
      setPesanError("Tanggal lahir tidak valid atau berada di masa depan.");
      return;
    }

    setIsLoading(true);

    try {
      let savedFotoProfil = fotoProfil;

      // --- A. Upload Foto Profil ---
      // (Sesuai endpoint PUT /api/users/:id/foto di router.go)
      if (selectedFile) {
        const formDataFoto = new FormData();
        const extension = selectedFile.type.split("/")[1].replace("jpeg", "jpg");
        formDataFoto.append("foto", selectedFile, `profile-${Date.now()}.${extension}`);

        const resFoto = await api.put("/users/foto", formDataFoto);
        const fotoData = getApiDataObject<{ url?: string }>(resFoto.data, "foto profil");
        if (!fotoData.url) throw new Error("URL foto profil tidak ditemukan pada respons server.");
        setFotoProfil(fotoData.url);
        savedFotoProfil = fotoData.url;
        setSelectedFile(null);

      }

      // --- B. Update Data Teks (Menyimpan Nama, Alamat, Tanggal Lahir) ---
      await api.put("/users/profile", {
          nama_lengkap: formData.nama.trim(),
          no_telp: normalizePhone(formData.telepon),
          tanggal_lahir: formData.tanggalLahir,
          alamat: formData.alamat.trim()
      });
      setInitialFormData({
        ...formData,
        nama: formData.nama.trim(),
        telepon: normalizePhone(formData.telepon),
        alamat: formData.alamat.trim(),
      });
      setInitialFotoProfil(savedFotoProfil);
      setPesanSukses(true);
      setTimeout(() => setPesanSukses(false), 3000);
    } catch (error: unknown) {
      console.error("Gagal memperbarui profil:", error);
      setPesanError(getUserFriendlyError(error, "Gagal menyimpan perubahan profil."));
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
            <input type="file" ref={fileInputRef} onChange={handleFotoChange} accept={IMAGE_UPLOAD_ACCEPT} className="hidden" />
          </div>
          <div className="text-center sm:text-left pt-2">
            <h3 className="text-lg font-semibold text-apomacy-dark">Foto Profil</h3>
            <p className="text-sm text-apomacy-muted-blue mt-1 max-w-sm">Format gambar: JPEG, PNG, atau WebP. Maksimal 2 MB dan direkomendasikan rasio 1:1.</p>
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
            <button type="button" onClick={() => {
              setFormData(initialFormData);
              setFotoProfil(initialFotoProfil);
              setSelectedFile(null);
              setPesanError("");
              setPesanSukses(false);
            }} className="px-6 py-2.5 border border-apomacy-border text-apomacy-muted-blue font-medium rounded-lg hover:bg-gray-50 transition">
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
