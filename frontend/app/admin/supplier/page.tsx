"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Search,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  Phone,
  Mail,
  UserCircle,
} from "lucide-react";
import ModalConfirm from "@/components/shared/ModalConfirm";
import Toast from "@/components/shared/Toast";

export default function SupplierPage() {
  const [supplierList, setSupplierList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [mode, setMode] = useState<"tambah" | "edit" | null>(null);

  // Modal & Toast
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    message: "",
    type: "tambah" as "tambah" | "edit" | "hapus" | "batal",
  });
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Form State
  const [formData, setFormData] = useState({
    kode: "",
    nama: "",
    cp: "",
    telepon: "",
    email: "",
    kota: "",
    alamat: "",
    status: "Aktif",
  });

  // Toast
  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // API FETCH
  const fetchSupplierData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        "https://api.npoint.io/f39f256e6c10202dbe42",
      );
      setSupplierList(response.data);
    } catch (error) {
      console.error("Gagal mengambil data dari API:", error);
      showToast(
        "Terjadi kesalahan saat memuat data supplier dari server.",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSupplierData();
  }, []);

  // Form Handlers
  const handleClearForm = () => {
    setFormData({
      kode: "",
      nama: "",
      cp: "",
      telepon: "",
      email: "",
      kota: "",
      alamat: "",
      status: "Aktif",
    });
    setSelectedSupplier(null);
    setMode(null);
  };

  const handleCancelForm = () => {
    setModalConfig({
      title: "Konfirmasi Pembatalan",
      message:
        "Apakah Anda yakin ingin membatalkan pengisian formulir ini? Semua data yang telah Anda masukkan akan hilang.",
      type: "batal",
    });
    setIsModalOpen(true);
  };

  const handleSelectRow = (supplier: any) => {
    setSelectedSupplier(supplier);
    if (mode === "edit") {
      setFormData(supplier);
    }
  };

  const handleActionClick = (actionMode: "tambah" | "edit" | "hapus") => {
    if (actionMode === "hapus") {
      if (selectedSupplier) {
        setModalConfig({
          title: "Konfirmasi Hapus Data",
          message: `Apakah Anda yakin ingin menghapus data supplier ${selectedSupplier.nama} (${selectedSupplier.kode})? Data tidak dapat dikembalikan.`,
          type: "hapus",
        });
        setIsModalOpen(true);
      }
      return;
    }

    setMode(actionMode);
    if (actionMode === "tambah") {
      handleClearForm();
      setMode("tambah");
    } else if (actionMode === "edit" && selectedSupplier) {
      setFormData(selectedSupplier);
    }
  };

  // Validasi khusus angka untuk telepon
  const handleTeleponChange = (val: string) => {
    const cleanDigits = val.replace(/\D/g, "");
    setFormData({ ...formData, telepon: cleanDigits });
  };

  // Handler yang divalidasi
  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validasi Data
    if (
      !formData.kode.trim() ||
      !formData.nama.trim() ||
      !formData.cp.trim() ||
      !formData.telepon.trim() ||
      !formData.email.trim() ||
      !formData.kota.trim() ||
      !formData.alamat.trim()
    ) {
      showToast(
        "Gagal! Seluruh kolom data supplier wajib diisi dengan lengkap.",
        "error",
      );
      return;
    }

    // 2. Validasi Format Email Sederhana
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showToast("Gagal! Format email tidak valid.", "error");
      return;
    }

    // 3. Validasi Duplikasi Kode/Nama/Email
    const isDuplicate = supplierList.some((item) => {
      const isSameKode =
        item.kode.toUpperCase() === formData.kode.trim().toUpperCase();
      const isSameNama =
        item.nama.toLowerCase() === formData.nama.trim().toLowerCase();
      const isSameEmail =
        item.email.toLowerCase() === formData.email.trim().toLowerCase();

      if (mode === "edit" && selectedSupplier) {
        return (
          (isSameKode || isSameNama || isSameEmail) &&
          item.kode !== selectedSupplier.kode
        );
      }
      return isSameKode || isSameNama || isSameEmail;
    });

    if (isDuplicate) {
      showToast(
        "Gagal! Kode, Nama, atau Email supplier sudah terdaftar di sistem. Gunakan data yang unik.",
        "error",
      );
      return;
    }

    setModalConfig({
      title:
        mode === "tambah"
          ? "Konfirmasi Tambah Supplier"
          : "Konfirmasi Edit Supplier",
      message:
        mode === "tambah"
          ? "Apakah Anda yakin ingin menyimpan data supplier baru ini ke dalam sistem?"
          : `Apakah Anda yakin ingin menyimpan perubahan pada data supplier ${formData.nama}?`,
      type: mode as "tambah" | "edit",
    });
    setIsModalOpen(true);
  };

  // Eksekusi aksi setelah konfirmasi di modal
  const executeAction = () => {
    if (modalConfig.type === "tambah" || modalConfig.type === "edit") {
      const finalData = { ...formData };

      if (modalConfig.type === "tambah") {
        setSupplierList([finalData, ...supplierList]);
        setCurrentPage(1);
        showToast("Data supplier baru berhasil ditambahkan!", "success");
      } else if (modalConfig.type === "edit") {
        setSupplierList(
          supplierList.map((item) =>
            item.kode === formData.kode ? finalData : item,
          ),
        );
        showToast("Perubahan data supplier berhasil disimpan!", "success");
      }
    } else if (modalConfig.type === "hapus" && selectedSupplier) {
      setSupplierList(
        supplierList.filter((item) => item.kode !== selectedSupplier.kode),
      );
      showToast("Data supplier berhasil dihapus dari sistem.", "success");
    }

    setIsModalOpen(false);
    handleClearForm();
  };

  // Searching & Pagination
  const filteredList = supplierList.filter((s) => {
    const q = search.toLowerCase();

    return (
      s.nama?.toLowerCase().includes(q) ||
      s.kode?.toLowerCase().includes(q) ||
      s.cp?.toLowerCase().includes(q) ||
      s.telepon?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.kota?.toLowerCase().includes(q) ||
      s.alamat?.toLowerCase().includes(q) ||
      s.status?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredList.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <div className="p-8 space-y-6 max-w-[1400px] mx-auto pb-10">
      {/* Header */}
      <div className="text-center py-4">
        <h1 className="text-2xl font-black tracking-widest text-apomacy-dark uppercase">
          Daftar Supplier
        </h1>
        <p className="mt-1 text-sm text-apomacy-muted font-medium">
          Kelola data vendor, distributor, dan penyuplai obat apotek Anda.
        </p>
      </div>

      {/* Pencarian & Refresh */}
      <div className="flex gap-4 items-center bg-white p-4 rounded-2xl border border-outline-variant shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-outline" />
          <input
            type="text"
            placeholder="Cari berdasarkan kode, nama, cp, telepon, atau alamat supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-sm font-bold text-apomacy-dark outline-none focus:border-apomacy-primary transition-all"
          />
        </div>
        <button className="rounded-xl bg-apomacy-dark px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-apomacy-primary transition-colors">
          Cari
        </button>
        <button
          onClick={() => {
            setSearch("");
            handleClearForm();
            fetchSupplierData();
          }}
          className="rounded-xl border border-outline-variant bg-white px-4 py-2.5 text-sm font-bold text-apomacy-dark hover:bg-surface-container-low transition-colors flex items-center gap-2"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />{" "}
          Refresh
        </button>
      </div>

      {/* Navigasi Tombol Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-surface-container-low p-3 rounded-2xl border border-outline-variant">
        <button
          type="button"
          onClick={() => handleActionClick("tambah")}
          className={`py-3 rounded-xl font-black text-xs tracking-wider transition-all flex items-center justify-center gap-2 border ${mode === "tambah" ? "bg-apomacy-primary text-white border-apomacy-primary shadow-sm" : "bg-white border-outline-variant text-apomacy-dark hover:bg-gray-50"}`}
        >
          <Plus size={16} /> TAMBAH SUPPLIER BARU
        </button>
        <button
          type="button"
          onClick={() => handleActionClick("edit")}
          disabled={!selectedSupplier}
          className={`py-3 rounded-xl font-black text-xs tracking-wider transition-all flex items-center justify-center gap-2 border ${!selectedSupplier ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200" : mode === "edit" ? "bg-apomacy-dark text-white border-apomacy-dark shadow-sm" : "bg-white border-outline-variant text-apomacy-dark hover:bg-gray-50"}`}
        >
          <Pencil size={16} /> EDIT DATA{" "}
          {selectedSupplier && `(${selectedSupplier.kode})`}
        </button>
        <button
          type="button"
          onClick={() => handleActionClick("hapus")}
          disabled={!selectedSupplier}
          className={`py-3 rounded-xl font-black text-xs tracking-wider transition-all flex items-center justify-center gap-2 border ${!selectedSupplier ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200" : "bg-white border-outline-variant text-red-600 hover:bg-red-50"}`}
        >
          <Trash2 size={16} /> HAPUS DATA
        </button>
      </div>

      {/* Form Dinamis */}
      {mode && (
        <div className="rounded-3xl border border-outline-variant bg-white p-6 shadow-md relative animate-in fade-in duration-300">
          <div className="flex justify-between items-center mb-6 border-b border-outline-variant/50 pb-3">
            <h3 className="text-sm font-black uppercase tracking-widest text-apomacy-dark flex items-center gap-2">
              <BriefcaseBusiness size={18} className="text-apomacy-primary" />
              {mode === "tambah"
                ? "Form Registrasi Supplier Baru"
                : `Form Edit Supplier - ${formData.kode}`}
            </h3>
            <button
              type="button"
              onClick={handleCancelForm}
              className="text-outline hover:text-apomacy-dark transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSaveSubmit} className="space-y-6">
            {/* Grid Form Input */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
              {/* Kolom 1 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-1.5">
                    Kode Supplier
                  </label>
                  <input
                    type="text"
                    disabled={mode === "edit"}
                    value={formData.kode}
                    onChange={(e) =>
                      setFormData({ ...formData, kode: e.target.value })
                    }
                    className="w-full px-4 py-2.5 text-sm font-bold text-apomacy-dark rounded-xl border border-outline-variant bg-surface-container-low disabled:opacity-60 outline-none focus:border-apomacy-primary transition-all"
                    placeholder="Contoh: SUP-001"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-1.5">
                    Nama Perusahaan / Supplier
                  </label>
                  <input
                    type="text"
                    value={formData.nama}
                    onChange={(e) =>
                      setFormData({ ...formData, nama: e.target.value })
                    }
                    className="w-full px-4 py-2.5 text-sm font-bold text-apomacy-dark rounded-xl border border-outline-variant bg-surface-container-low outline-none focus:border-apomacy-primary transition-all"
                    placeholder="PT. Nama Perusahaan"
                  />
                </div>
              </div>

              {/* Kolom 2 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-1.5">
                    Contact Person (CP)
                  </label>
                  <div className="relative">
                    <UserCircle
                      size={16}
                      className="absolute left-3.5 top-3 text-outline"
                    />
                    <input
                      type="text"
                      value={formData.cp}
                      onChange={(e) =>
                        setFormData({ ...formData, cp: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-2.5 text-sm font-bold text-apomacy-dark rounded-xl border border-outline-variant bg-surface-container-low outline-none focus:border-apomacy-primary transition-all"
                      placeholder="Nama Penanggung Jawab"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-1.5">
                    Telepon / WhatsApp
                  </label>
                  <div className="relative">
                    <Phone
                      size={16}
                      className="absolute left-3.5 top-3 text-outline"
                    />
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formData.telepon}
                      onChange={(e) => handleTeleponChange(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm font-bold text-apomacy-dark rounded-xl border border-outline-variant bg-surface-container-low outline-none focus:border-apomacy-primary transition-all"
                      placeholder="0812xxxxxx"
                    />
                  </div>
                </div>
              </div>

              {/* Kolom 3 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-1.5">
                    Email Resmi
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-3.5 top-3 text-outline"
                    />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-2.5 text-sm font-bold text-apomacy-dark rounded-xl border border-outline-variant bg-surface-container-low outline-none focus:border-apomacy-primary transition-all"
                      placeholder="email@perusahaan.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-1.5">
                    Kota Operasional
                  </label>
                  <div className="relative">
                    <MapPin
                      size={16}
                      className="absolute left-3.5 top-3 text-outline"
                    />
                    <input
                      type="text"
                      value={formData.kota}
                      onChange={(e) =>
                        setFormData({ ...formData, kota: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-2.5 text-sm font-bold text-apomacy-dark rounded-xl border border-outline-variant bg-surface-container-low outline-none focus:border-apomacy-primary transition-all"
                      placeholder="Jakarta, Bandung..."
                    />
                  </div>
                </div>
              </div>

              {/* Kolom 4 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-1.5">
                    Status Kemitraan
                  </label>
                  <div className="flex bg-surface-container-low p-1 rounded-xl border border-outline-variant">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, status: "Aktif" })
                      }
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        formData.status === "Aktif"
                          ? "bg-green-500 text-white shadow-sm"
                          : "text-outline hover:text-apomacy-dark"
                      }`}
                    >
                      Aktif
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, status: "NonAktif" })
                      }
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        formData.status === "NonAktif"
                          ? "bg-gray-400 text-white shadow-sm"
                          : "text-outline hover:text-apomacy-dark"
                      }`}
                    >
                      NonAktif
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Alamat Lengkap */}
            <div className="border-t border-outline-variant/30 pt-4">
              <label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-1.5">
                Alamat Lengkap Perusahaan
              </label>
              <textarea
                rows={2}
                value={formData.alamat}
                onChange={(e) =>
                  setFormData({ ...formData, alamat: e.target.value })
                }
                placeholder="Masukkan alamat lengkap gedung, blok, atau jalan operasional supplier..."
                className="w-full px-4 py-3 text-sm font-bold text-apomacy-dark rounded-xl border border-outline-variant bg-surface-container-low outline-none focus:border-apomacy-primary resize-none transition-all"
              />
            </div>

            {/* Tombol Simpan/Batal Form */}
            <div className="flex justify-end gap-3 border-t border-outline-variant/50 pt-4">
              <button
                type="button"
                onClick={handleCancelForm}
                className="rounded-xl border border-outline-variant bg-white px-6 py-2.5 text-sm font-bold text-apomacy-dark hover:bg-surface-container-low transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="rounded-xl bg-apomacy-primary px-8 py-2.5 text-sm font-bold text-white shadow-md hover:bg-apomacy-dark transition-colors flex items-center gap-2"
              >
                <Save size={16} /> Simpan Data
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabel Utama & Pagination */}
      <div className="rounded-3xl border border-outline-variant bg-white shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant text-[11px] font-black uppercase tracking-wider text-outline">
                <th className="px-5 py-4">KODE</th>
                <th className="px-5 py-4">NAMA SUPPLIER</th>
                <th className="px-5 py-4">CONTACT PERSON</th>
                <th className="px-5 py-4">TELEPON</th>
                <th className="px-5 py-4">EMAIL</th>
                <th className="px-5 py-4">KOTA</th>
                <th className="px-5 py-4">ALAMAT LENGKAP</th>
                <th className="px-5 py-4 text-center">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-outline font-bold"
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2
                        size={28}
                        className="animate-spin text-apomacy-primary"
                      />
                      <span>Memuat data supplier...</span>
                    </div>
                  </td>
                </tr>
              ) : currentItems.length > 0 ? (
                currentItems.map((supplier) => (
                  <tr
                    key={supplier.kode}
                    onClick={() => handleSelectRow(supplier)}
                    className={`cursor-pointer transition-colors ${selectedSupplier?.kode === supplier.kode ? "bg-apomacy-primary/10 hover:bg-apomacy-primary/15" : "hover:bg-surface-container-low/50"}`}
                  >
                    <td className="px-5 py-4 font-mono font-bold text-outline-variant">
                      {supplier.kode}
                    </td>
                    <td className="px-5 py-4 font-black text-apomacy-dark">
                      {supplier.nama}
                    </td>
                    <td className="px-5 py-4 font-bold text-apomacy-primary">
                      {supplier.cp}
                    </td>
                    <td className="px-5 py-4 font-medium text-apomacy-dark">
                      {supplier.telepon}
                    </td>
                    <td className="px-5 py-4 font-medium text-apomacy-dark">
                      {supplier.email}
                    </td>
                    <td className="px-5 py-4 font-bold text-apomacy-dark">
                      {supplier.kota}
                    </td>
                    <td
                      className="px-5 py-4 text-xs text-outline max-w-xs truncate"
                      title={supplier.alamat}
                    >
                      {supplier.alamat}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md ${
                          supplier.status === "Aktif"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {supplier.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-outline font-bold"
                  >
                    Data supplier tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="flex items-center justify-between border-t border-outline-variant bg-surface-container-low/50 px-6 py-4">
          <div className="text-xs font-bold text-outline">
            Menampilkan{" "}
            <span className="text-apomacy-dark">
              {filteredList.length === 0 ? 0 : indexOfFirstItem + 1}
            </span>{" "}
            -{" "}
            <span className="text-apomacy-dark">
              {Math.min(indexOfLastItem, filteredList.length)}
            </span>{" "}
            dari{" "}
            <span className="text-apomacy-dark">{filteredList.length}</span>{" "}
            data
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || isLoading}
              className="p-1.5 rounded-lg border border-outline-variant bg-white text-apomacy-dark hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-xs font-black text-apomacy-dark px-3">
              Hal {currentPage} / {totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={
                currentPage === totalPages || totalPages === 0 || isLoading
              }
              className="p-1.5 rounded-lg border border-outline-variant bg-white text-apomacy-dark hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <ModalConfirm
        isOpen={isModalOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onConfirm={executeAction}
        onCancel={() => setIsModalOpen(false)}
      />

      <Toast toast={toast} />
    </div>
  );
}
