"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  Search,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  ImageIcon,
  Upload,
  ChevronDown,
  Lock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

export default function DataObatPage() {
  const [obatList, setObatList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedObat, setSelectedObat] = useState<any>(null);
  const [mode, setMode] = useState<"tambah" | "edit" | null>(null);

  // ==========================================
  // POP UP MODAL & TOAST DINAMIS
  // ==========================================
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

  // ==========================================
  // PAGINATION & DATA MASTER
  // ==========================================
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  const [jenisOptions] = useState([
    "Obat Bebas",
    "Obat Bebas Terbatas",
    "Obat Keras",
  ]);
  const [categories, setCategories] = useState([
    "Analgetik",
    "Antibiotik",
    "Vitamin",
    "Suplemen",
    "Herbal",
    "Antasida",
    "Obat Maag",
    "Obat Batuk",
    "Antihipertensi",
    "Antidiabetes",
  ]);
  const [bentukOptions] = useState([
    "Tablet",
    "Kapsul",
    "Kaplet",
    "Sirup",
    "Salep",
  ]);
  const [satuanOptions] = useState(["Strip", "Botol", "Pcs", "Box", "Tube"]);
  const [supplierOptions] = useState([
    "PT. Kimia Farma",
    "PT. Kalbe Farma",
    "PT. Sanbe Farma",
    "PT. Konimex",
    "PT. Merck Indonesia",
    "PT. Supra Ferbindo Farma",
    "PT. Deltomed Laboratories",
    "PT. Johnson & Johnson",
    "PT. Dexa Medica",
  ]);

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryText, setNewCategoryText] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    kode: "",
    nama: "",
    jenis: "",
    kategori: [] as string[],
    bentuk: "",
    satuan: "",
    supplier: "",
    hargaBeli: 0,
    hargaJual: 0,
    stok: 0,
    minimal: 0,
    expired: "",
    gambar: "",
    deskripsi: "",
    komposisi: "",
    dosis: "",
  });

  // ==========================================
  // FUNGSI PEMANGGIL TOAST
  // ==========================================
  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ==========================================
  // API FETCH
  // ==========================================
  const fetchObatData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        "https://api.npoint.io/b6965231a2d369815479",
      );
      setObatList(response.data);
    } catch (error) {
      console.error("Gagal mengambil data dari API:", error);
      showToast(
        "Terjadi kesalahan saat memuat data obat dari server.",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchObatData();
  }, []);

  // ==========================================
  // FORM HANDLERS
  // ==========================================
  const handleClearForm = () => {
    setFormData({
      kode: "",
      nama: "",
      jenis: "",
      kategori: [],
      bentuk: "",
      satuan: "",
      supplier: "",
      hargaBeli: 0,
      hargaJual: 0,
      stok: 0,
      minimal: 0,
      expired: "",
      gambar: "",
      deskripsi: "",
      komposisi: "",
      dosis: "",
    });
    setImageFile(null);
    setImagePreview("");
    setIsAddingCategory(false);
    setNewCategoryText("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    setSelectedObat(null);
    setMode(null);
  };

  // Konfirmasi Batal Form
  const handleCancelForm = () => {
    setModalConfig({
      title: "Konfirmasi Pembatalan",
      message:
        "Apakah Anda yakin ingin membatalkan pengisian formulir ini? Semua data yang telah Anda masukkan akan hilang dan tidak disimpan ke dalam sistem.",
      type: "batal",
    });
    setIsModalOpen(true);
  };

  const handleSelectRow = (obat: any) => {
    setSelectedObat(obat);
    if (mode === "edit") {
      setFormData(obat);
      setImagePreview(obat.gambar);
    }
  };

  const handleActionClick = (actionMode: "tambah" | "edit" | "hapus") => {
    if (actionMode === "hapus") {
      if (selectedObat) {
        setModalConfig({
          title: "Konfirmasi Hapus Data",
          message: `Apakah Anda yakin ingin menghapus data obat ${selectedObat.nama} (${selectedObat.kode})? Data yang sudah dihapus tidak dapat dikembalikan.`,
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
    } else if (actionMode === "edit" && selectedObat) {
      setFormData(selectedObat);
      setImagePreview(selectedObat.gambar);
    }
  };

  const handleNumberOnlyChange = (field: string, val: string) => {
    const cleanDigits = val.replace(/\D/g, "");
    setFormData({
      ...formData,
      [field]: cleanDigits === "" ? 0 : parseInt(cleanDigits, 10),
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSelectCategoryTag = (cat: string) => {
    if (!formData.kategori.includes(cat)) {
      setFormData({ ...formData, kategori: [...formData.kategori, cat] });
    }
  };

  const handleRemoveCategoryTag = (catToRemove: string) => {
    setFormData({
      ...formData,
      kategori: formData.kategori.filter((c) => c !== catToRemove),
    });
  };

  const handleAddCategorySubmit = () => {
    const trimmed = newCategoryText.trim();
    if (!trimmed) return;
    if (!categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setCategories([...categories, trimmed]);
    }
    if (!formData.kategori.includes(trimmed)) {
      setFormData({ ...formData, kategori: [...formData.kategori, trimmed] });
    }
    setNewCategoryText("");
    setIsAddingCategory(false);
  };

  // ==========================================
  // VALIDASI KETAT SEBELUM SIMPAN
  // ==========================================
  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validasi Wajib Isi Semua Kolom
    if (
      !formData.kode.trim() ||
      !formData.nama.trim() ||
      !formData.jenis ||
      formData.kategori.length === 0 ||
      !formData.bentuk ||
      !formData.satuan ||
      !formData.supplier ||
      !formData.minimal ||
      !formData.expired ||
      !formData.dosis.trim() ||
      !formData.deskripsi.trim() ||
      !formData.komposisi.trim()
    ) {
      showToast(
        "Gagal! Seluruh kolom data (termasuk Deskripsi, Komposisi, & Dosis) wajib diisi.",
        "error",
      );
      return;
    }

    // 2. Validasi Angka & Media
    if (formData.hargaJual <= 0) {
      showToast("Gagal! Harga Jual harus lebih dari 0.", "error");
      return;
    }
    if (!imagePreview) {
      showToast("Gagal! Anda wajib mengunggah Foto/Gambar Produk.", "error");
      return;
    }

    // 3. Validasi Duplikasi (Kode atau Nama)
    const isDuplicate = obatList.some((item) => {
      const isSameKode =
        item.kode.toUpperCase() === formData.kode.trim().toUpperCase();
      const isSameNama =
        item.nama.toLowerCase() === formData.nama.trim().toLowerCase();

      // Pengecualian: Jika mode edit, abaikan data dirinya sendiri
      if (mode === "edit" && selectedObat) {
        return (isSameKode || isSameNama) && item.kode !== selectedObat.kode;
      }
      return isSameKode || isSameNama;
    });

    if (isDuplicate) {
      showToast(
        "Gagal! Data obat dengan Kode atau Nama tersebut sudah terdaftar di sistem. Silakan gunakan identitas yang unik.",
        "error",
      );
      return;
    }

    // Lolos semua validasi -> Tampilkan Modal Konfirmasi
    setModalConfig({
      title:
        mode === "tambah" ? "Konfirmasi Tambah Data" : "Konfirmasi Edit Data",
      message:
        mode === "tambah"
          ? "Apakah Anda yakin ingin menyimpan data obat baru ini ke dalam sistem inventaris?"
          : `Apakah Anda yakin ingin menyimpan perubahan pada data obat ${formData.nama} (${formData.kode})?`,
      type: mode as "tambah" | "edit",
    });
    setIsModalOpen(true);
  };

  // ==========================================
  // EKSEKUSI DATA (SETELAH KLIK 'YA' DI MODAL)
  // ==========================================
  const executeAction = () => {
    if (modalConfig.type === "tambah" || modalConfig.type === "edit") {
      const finalData = { ...formData, gambar: imagePreview };

      if (modalConfig.type === "tambah") {
        setObatList([finalData, ...obatList]);
        setCurrentPage(1);
        showToast("Data obat baru berhasil ditambahkan!", "success");
      } else if (modalConfig.type === "edit") {
        setObatList(
          obatList.map((item) =>
            item.kode === formData.kode ? finalData : item,
          ),
        );
        showToast("Perubahan data obat berhasil disimpan!", "success");
      }
    } else if (modalConfig.type === "hapus" && selectedObat) {
      setObatList(obatList.filter((item) => item.kode !== selectedObat.kode));
      showToast("Data obat berhasil dihapus dari sistem.", "success");
    }

    // Jika tipe "batal", murni tutup modal dan clear form
    setIsModalOpen(false);
    handleClearForm();
  };

  // ==========================================
  // FILTERING OMNI-SEARCH & PAGINATION
  // ==========================================
  const filteredObatList = obatList.filter((o) => {
    // Ubah search term ke huruf kecil
    const q = search.toLowerCase();

    // Kembalikan true jika search term cocok dengan HAMPIR SEMUA fields
    return (
      o.kode?.toLowerCase().includes(q) ||
      o.nama?.toLowerCase().includes(q) ||
      o.jenis?.toLowerCase().includes(q) ||
      o.bentuk?.toLowerCase().includes(q) ||
      o.supplier?.toLowerCase().includes(q) ||
      o.stok?.toString().includes(q) ||
      o.hargaJual?.toString().includes(q) ||
      // Logika khusus untuk array kategori (mengecek jika ada salah satu tag yg cocok)
      (Array.isArray(o.kategori) &&
        o.kategori.some((cat: string) => cat.toLowerCase().includes(q)))
    );
  });

  const totalPages = Math.ceil(filteredObatList.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentItems = filteredObatList.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <div className="p-8 space-y-6 max-w-[1400px] mx-auto pb-10">
      <div className="text-center py-4">
        <h1 className="text-2xl font-black tracking-widest text-apomacy-dark uppercase">
          Daftar Obat Tersedia
        </h1>
      </div>

      {/* Bar Pencarian */}
      <div className="flex gap-4 items-center bg-white p-4 rounded-2xl border border-outline-variant shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-outline" />
          <input
            type="text"
            placeholder="Cari berdasarkan kode, nama, kategori, supplier, atau stok..."
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
            fetchObatData();
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
          <Plus size={16} /> TAMBAH OBAT BARU
        </button>
        <button
          type="button"
          onClick={() => handleActionClick("edit")}
          disabled={!selectedObat}
          className={`py-3 rounded-xl font-black text-xs tracking-wider transition-all flex items-center justify-center gap-2 border ${!selectedObat ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200" : mode === "edit" ? "bg-apomacy-dark text-white border-apomacy-dark shadow-sm" : "bg-white border-outline-variant text-apomacy-dark hover:bg-gray-50"}`}
        >
          <Pencil size={16} /> EDIT DATA{" "}
          {selectedObat && `(${selectedObat.kode})`}
        </button>
        <button
          type="button"
          onClick={() => handleActionClick("hapus")}
          disabled={!selectedObat}
          className={`py-3 rounded-xl font-black text-xs tracking-wider transition-all flex items-center justify-center gap-2 border ${!selectedObat ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200" : "bg-white border-outline-variant text-red-600 hover:bg-red-50"}`}
        >
          <Trash2 size={16} /> HAPUS DATA
        </button>
      </div>

      {/* Area Form Dinamis */}
      {mode && (
        <div className="rounded-3xl border border-outline-variant bg-white p-6 shadow-md relative animate-in fade-in duration-300">
          <div className="flex justify-between items-center mb-6 border-b border-outline-variant/50 pb-3">
            <h3 className="text-sm font-black uppercase tracking-widest text-apomacy-dark">
              {mode === "tambah"
                ? "Form Tambah Inventaris Obat Baru"
                : `Form Edit Data Obat - ${formData.kode}`}
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
              {/* Kolom 1 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-1.5">
                    Kode Obat
                  </label>
                  <input
                    type="text"
                    disabled={mode === "edit"}
                    value={formData.kode}
                    onChange={(e) =>
                      setFormData({ ...formData, kode: e.target.value })
                    }
                    className="w-full px-4 py-2.5 text-sm font-bold text-apomacy-dark rounded-xl border border-outline-variant bg-surface-container-low disabled:opacity-60 outline-none focus:border-apomacy-primary transition-all"
                    placeholder="Contoh: OBT004"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-1.5">
                    Nama Obat
                  </label>
                  <input
                    type="text"
                    value={formData.nama}
                    onChange={(e) =>
                      setFormData({ ...formData, nama: e.target.value })
                    }
                    className="w-full px-4 py-2.5 text-sm font-bold text-apomacy-dark rounded-xl border border-outline-variant bg-surface-container-low outline-none focus:border-apomacy-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-1.5">
                    Kategori (Multi-Tag)
                  </label>
                  {isAddingCategory ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        autoFocus
                        value={newCategoryText}
                        onChange={(e) => setNewCategoryText(e.target.value)}
                        placeholder="Kategori Baru"
                        className="flex-1 px-3 py-2 text-xs font-bold text-apomacy-dark rounded-xl border border-apomacy-primary outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddCategorySubmit}
                        className="bg-apomacy-primary text-white p-2 rounded-xl"
                      >
                        <Save size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddingCategory(false)}
                        className="bg-gray-100 text-outline p-2 rounded-xl"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <SearchableSelect
                          options={categories}
                          placeholder="Pilih Kategori"
                          value=""
                          onChange={handleSelectCategoryTag}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAddingCategory(true)}
                        className="bg-surface-container-low border border-outline-variant text-apomacy-dark p-2.5 rounded-xl hover:text-apomacy-primary hover:border-apomacy-primary transition-colors"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {formData.kategori.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 bg-apomacy-primary/10 text-apomacy-primary text-[11px] font-black px-2.5 py-1 rounded-lg"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveCategoryTag(tag)}
                          className="hover:text-red-500 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Kolom 2 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-1.5">
                    Jenis Obat
                  </label>
                  <SearchableSelect
                    options={jenisOptions}
                    placeholder="Pilih Jenis"
                    value={formData.jenis}
                    onChange={(val: string) =>
                      setFormData({ ...formData, jenis: val })
                    }
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-1.5">
                    Bentuk Obat
                  </label>
                  <SearchableSelect
                    options={bentukOptions}
                    placeholder="Pilih Bentuk"
                    value={formData.bentuk}
                    onChange={(val: string) =>
                      setFormData({ ...formData, bentuk: val, satuan: "" })
                    }
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-1.5">
                    Satuan
                  </label>
                  <SearchableSelect
                    options={satuanOptions}
                    placeholder={
                      formData.bentuk ? "Pilih Satuan" : "Pilih Bentuk Dulu"
                    }
                    value={formData.satuan}
                    onChange={(val: string) =>
                      setFormData({ ...formData, satuan: val })
                    }
                    disabled={!formData.bentuk}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-1.5">
                    Supplier
                  </label>
                  <SearchableSelect
                    options={supplierOptions}
                    placeholder="Pilih Supplier"
                    value={formData.supplier}
                    onChange={(val: string) =>
                      setFormData({ ...formData, supplier: val })
                    }
                  />
                </div>
              </div>

              {/* Kolom 3 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-red-500 uppercase tracking-wider mb-1.5">
                    Harga Beli (Lock)
                  </label>
                  <input
                    type="text"
                    readOnly
                    disabled
                    value={`Rp ${formData.hargaBeli.toLocaleString("id-ID")}`}
                    className="w-full px-4 py-2.5 text-sm font-bold text-gray-400 rounded-xl border border-dashed border-outline-variant bg-gray-50/80 cursor-not-allowed outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-1.5">
                    Harga Jual (Rp)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.hargaJual === 0 ? "" : formData.hargaJual}
                    onChange={(e) =>
                      handleNumberOnlyChange("hargaJual", e.target.value)
                    }
                    className="w-full px-4 py-2.5 text-sm font-bold text-apomacy-dark rounded-xl border border-outline-variant bg-surface-container-low outline-none focus:border-apomacy-primary transition-all"
                    placeholder="0"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-red-500 uppercase tracking-wider mb-1.5">
                      Stok (Lock)
                    </label>
                    <input
                      type="text"
                      readOnly
                      disabled
                      value={formData.stok}
                      className="w-full px-4 py-2.5 text-sm font-bold text-gray-400 rounded-xl border border-dashed border-outline-variant bg-gray-50/80 text-center cursor-not-allowed outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-1.5">
                      Stok Min
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={formData.minimal === 0 ? "" : formData.minimal}
                      onChange={(e) =>
                        handleNumberOnlyChange("minimal", e.target.value)
                      }
                      className="w-full px-4 py-2.5 text-sm font-bold text-apomacy-dark rounded-xl border border-outline-variant bg-surface-container-low text-center outline-none focus:border-apomacy-primary transition-all"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Kolom 4 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-1.5">
                    Gambar Produk
                  </label>
                  <div className="flex gap-3 items-center">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-16 h-16 shrink-0 rounded-xl border-2 border-dashed border-outline-variant bg-surface-container-low flex items-center justify-center text-outline cursor-pointer overflow-hidden hover:border-apomacy-primary hover:text-apomacy-primary transition-all"
                    >
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Upload size={18} />
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 text-[11px] font-black tracking-wide rounded-lg border border-outline-variant bg-white text-apomacy-dark hover:bg-gray-50 transition-colors"
                      >
                        FOTO
                      </button>
                      <p className="text-[10px] text-outline mt-1 truncate max-w-[120px]">
                        {imageFile ? imageFile.name : "JPG, PNG"}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-1.5">
                    Expired Date
                  </label>
                  <input
                    type="date"
                    value={formData.expired}
                    onChange={(e) =>
                      setFormData({ ...formData, expired: e.target.value })
                    }
                    className="w-full px-4 py-2.5 text-sm font-bold text-apomacy-dark rounded-xl border border-outline-variant bg-surface-container-low outline-none cursor-pointer focus:border-apomacy-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-1.5">
                    Dosis Pemakaian
                  </label>
                  <input
                    type="text"
                    value={formData.dosis}
                    onChange={(e) =>
                      setFormData({ ...formData, dosis: e.target.value })
                    }
                    placeholder="Contoh: 3 x sehari 1 tablet"
                    className="w-full px-4 py-2.5 text-sm font-bold text-apomacy-dark rounded-xl border border-outline-variant bg-surface-container-low outline-none focus:border-apomacy-primary transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Baris Bawah: Textarea */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-outline-variant/30 pt-4">
              <div>
                <label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-1.5">
                  Deskripsi Obat
                </label>
                <textarea
                  rows={3}
                  value={formData.deskripsi}
                  onChange={(e) =>
                    setFormData({ ...formData, deskripsi: e.target.value })
                  }
                  placeholder="Masukkan informasi indikasi umum atau deskripsi obat..."
                  className="w-full px-4 py-3 text-sm font-bold text-apomacy-dark rounded-xl border border-outline-variant bg-surface-container-low outline-none focus:border-apomacy-primary resize-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-1.5">
                  Komposisi Obat
                </label>
                <textarea
                  rows={3}
                  value={formData.komposisi}
                  onChange={(e) =>
                    setFormData({ ...formData, komposisi: e.target.value })
                  }
                  placeholder="Kandungan bahan aktif obat..."
                  className="w-full px-4 py-3 text-sm font-bold text-apomacy-dark rounded-xl border border-outline-variant bg-surface-container-low outline-none focus:border-apomacy-primary resize-none transition-all"
                />
              </div>
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
                <th className="px-5 py-4">NAMA OBAT</th>
                <th className="px-5 py-4">JENIS</th>
                <th className="px-5 py-4">KATEGORI (TAGS)</th>
                <th className="px-5 py-4">BENTUK</th>
                <th className="px-5 py-4">STOK</th>
                <th className="px-5 py-4">HARGA JUAL</th>
                <th className="px-5 py-4">SUPPLIER</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-12 text-center text-outline font-bold"
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2
                        size={28}
                        className="animate-spin text-apomacy-primary"
                      />
                      <span>Memuat data dari server...</span>
                    </div>
                  </td>
                </tr>
              ) : currentItems.length > 0 ? (
                currentItems.map((obat) => (
                  <tr
                    key={obat.kode}
                    onClick={() => handleSelectRow(obat)}
                    className={`cursor-pointer transition-colors ${selectedObat?.kode === obat.kode ? "bg-apomacy-primary/10 hover:bg-apomacy-primary/15" : "hover:bg-surface-container-low/50"}`}
                  >
                    <td className="px-5 py-4 font-mono font-bold text-outline-variant">
                      {obat.kode}
                    </td>
                    <td className="px-5 py-4 font-black text-apomacy-dark">
                      {obat.nama}
                    </td>
                    <td className="px-5 py-4 font-bold text-apomacy-primary">
                      {obat.jenis}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {obat.kategori?.map((cat: string, idx: number) => (
                          <span
                            key={idx}
                            className="bg-surface-container-low border border-outline-variant text-apomacy-dark text-[10px] font-bold px-2 py-0.5 rounded-md"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-medium text-apomacy-dark">
                      {obat.bentuk}
                    </td>
                    <td className="px-5 py-4 font-bold">
                      <span
                        className={
                          obat.stok <= obat.minimal
                            ? "text-red-600 bg-red-50 px-2 py-0.5 rounded-md"
                            : "text-apomacy-dark"
                        }
                      >
                        {obat.stok}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold text-apomacy-primary">
                      Rp {obat.hargaJual.toLocaleString("id-ID")}
                    </td>
                    <td className="px-5 py-4 font-medium text-apomacy-muted">
                      {obat.supplier}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-12 text-center text-outline font-bold"
                  >
                    Data obat tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination UI */}
        <div className="flex items-center justify-between border-t border-outline-variant bg-surface-container-low/50 px-6 py-4">
          <div className="text-xs font-bold text-outline">
            Menampilkan{" "}
            <span className="text-apomacy-dark">
              {filteredObatList.length === 0 ? 0 : indexOfFirstItem + 1}
            </span>{" "}
            -{" "}
            <span className="text-apomacy-dark">
              {Math.min(indexOfLastItem, filteredObatList.length)}
            </span>{" "}
            dari total{" "}
            <span className="text-apomacy-dark">{filteredObatList.length}</span>{" "}
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

      {/* OVERLAY MODAL KONFIRMASI GLOBAL (MODERN STYLE) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 px-4">
          <div className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl scale-in-95 animate-in zoom-in duration-200">
            <div className="flex items-center gap-4 mb-5">
              <div
                className={`p-3.5 rounded-full shrink-0 ${modalConfig.type === "hapus" || modalConfig.type === "batal" ? "bg-red-100 text-red-600" : "bg-apomacy-primary/10 text-apomacy-primary"}`}
              >
                {modalConfig.type === "hapus" ||
                modalConfig.type === "batal" ? (
                  <AlertTriangle size={28} strokeWidth={2.5} />
                ) : (
                  <Save size={28} strokeWidth={2.5} />
                )}
              </div>
              <div>
                <h3 className="text-lg font-black text-apomacy-dark uppercase tracking-wide">
                  {modalConfig.title}
                </h3>
              </div>
            </div>

            <p className="text-sm font-medium text-outline mb-8 leading-relaxed">
              {modalConfig.message}
            </p>

            <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/40">
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl border border-outline-variant bg-white px-5 py-2.5 text-xs font-bold text-apomacy-dark hover:bg-surface-container-low transition-colors"
              >
                Kembali
              </button>
              <button
                onClick={executeAction}
                className={`rounded-xl px-6 py-2.5 text-xs font-bold text-white shadow-md transition-colors flex items-center gap-2 ${
                  modalConfig.type === "hapus" || modalConfig.type === "batal"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-apomacy-primary hover:bg-apomacy-dark"
                }`}
              >
                {modalConfig.type === "hapus"
                  ? "Ya, Hapus Data"
                  : modalConfig.type === "batal"
                    ? "Ya, Batalkan"
                    : "Ya, Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION DINAMIS */}
      {toast && (
        <div
          className={`fixed top-10 right-10 z-[200] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-5 fade-in duration-300 max-w-md ${toast.type === "error" ? "bg-red-600" : "bg-green-600"}`}
        >
          <div className="shrink-0">
            {toast.type === "error" ? (
              <AlertTriangle size={24} strokeWidth={2.5} />
            ) : (
              <CheckCircle2 size={24} strokeWidth={2.5} />
            )}
          </div>
          <p className="text-sm font-bold tracking-wide leading-snug">
            {toast.message}
          </p>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// KOMPONEN REUSABLE
// ──────────────────────────────────────────────────────────────

interface SearchableSelectProps {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  disabled?: boolean;
}

function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen) setSearchTerm("");
          }
        }}
        className={`w-full px-4 py-2.5 text-sm font-bold rounded-xl border flex justify-between items-center select-none transition-all ${disabled ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-75" : "bg-surface-container-low border-outline-variant text-apomacy-dark cursor-pointer focus-within:border-apomacy-primary focus-within:ring-4 focus-within:ring-apomacy-primary/10"}`}
      >
        <span
          className={
            value
              ? "text-apomacy-dark"
              : "text-outline/60 flex items-center gap-1.5"
          }
        >
          {disabled && <Lock size={12} className="text-gray-400" />}
          {value || placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-outline transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1.5 bg-white border border-outline-variant rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="p-2 border-b border-outline-variant/50 bg-gray-50">
            <input
              type="text"
              autoFocus
              placeholder="Ketik untuk mencari..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-bold text-apomacy-dark bg-white border border-outline-variant rounded-lg outline-none focus:border-apomacy-primary"
            />
          </div>
          <ul className="max-h-40 overflow-y-auto divide-y divide-gray-50 p-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <li
                  key={opt}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={`px-4 py-2 text-xs font-bold text-apomacy-dark cursor-pointer transition-colors rounded-lg hover:bg-apomacy-primary/10 ${value === opt ? "bg-apomacy-primary text-white hover:bg-apomacy-dark" : ""}`}
                >
                  {opt}
                </li>
              ))
            ) : (
              <li className="px-4 py-3 text-xs font-medium text-outline text-center">
                Data tidak ditemukan
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
