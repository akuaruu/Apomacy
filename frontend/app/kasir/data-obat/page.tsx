"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search,
  RefreshCw,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Upload,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

import SearchableSelect from "@/components/shared/SearchableSelect";
import Toast from "@/components/shared/Toast";
import ModalConfirm from "@/components/shared/ModalConfirm";
import api from "@/lib/api";

export default function DataObatPage() {
  const [obatList, setObatList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedObat, setSelectedObat] = useState<any>(null);
  const [mode, setMode] = useState<"tambah" | "edit" | null>(null);

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

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  const [jenisOptions] = useState([
    "Obat Bebas",
    "Obat Bebas Terbatas",
    "Obat Keras",
  ]);
  const [bentukOptions] = useState([
    "Tablet",
    "Kapsul",
    "Kaplet",
    "Sirup",
    "Salep",
    "Suspensi",
    "Gel",
  ]);
  const [satuanOptions] = useState(["Strip", "Botol", "Pcs", "Box", "Tube"]);

  const [categories, setCategories] = useState<string[]>([]);
  const [supplierList, setSupplierList] = useState<any[]>([]);
  const [supplierOptions, setSupplierOptions] = useState<string[]>([]);

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryText, setNewCategoryText] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    id: "",
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

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchMasterData = async () => {
    try {
      // Hanya request ke supplier, kategori ditiadakan karena tidak ada route /kategori di backend
      const supRes = await api.get("/supplier");
      const supData = supRes.data?.data || supRes.data || [];

      setSupplierList(supData);
      setSupplierOptions(supData.map((s: any) => s.nama_supplier));
    } catch (error) {
      console.error("Gagal mengambil data master supplier", error);
    }
  };

  const fetchObatData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/obat");
      const data = response.data?.data || response.data || [];

      // Mengekstrak kategori unik dari data obat yang ditarik untuk tag suggestions
      const extractedCategories = new Set<string>();

      const mappedData = data.map((item: any) => {
        const catArray = item.kategori || [];
        catArray.forEach((c: string) => extractedCategories.add(c));

        // Format waktu agar sesuai untuk value HTML date picker (YYYY-MM-DD)
        const expiredDate = item.expired_date ? item.expired_date.split("T")[0] : "";

        return {
          id: item.id_obat,
          kode: item.kode_obat,
          nama: item.nama_obat,
          jenis: item.jenis_obat,
          kategori: catArray,
          bentuk: item.bentuk_obat,
          satuan: item.satuan,
          // Mencari nama supplier dari List atau set manual jika di backend belum ada join.
          // Kita pakai id_supplier sbg jembatan, asumsi supplierList sdh termuat
          supplier: item.id_supplier,
          hargaBeli: item.harga_beli,
          hargaJual: item.harga_jual,
          stok: item.stok,
          minimal: item.stok_minimum,
          expired: expiredDate,
          gambar: item.gambar_produk,
          deskripsi: item.deskripsi,
          komposisi: item.komposisi,
          dosis: item.dosis_pemakaian,
        };
      });

      setCategories(Array.from(extractedCategories));
      setObatList(mappedData);
    } catch (error) {
      showToast("Terjadi kesalahan saat memuat data obat dari server.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMasterData();
  }, []);

  // Fetch Obat dipisah agar menunggu fetchMasterData selesai
  // Sehingga supplierList sudah ready saat mapping di fetchObatData
  useEffect(() => {
    if (supplierOptions.length >= 0) {
      fetchObatData();
    }
  }, [supplierOptions.length]);

  const handleClearForm = () => {
    setFormData({
      id: "",
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

  const handleCancelForm = () => {
    setModalConfig({
      title: "Konfirmasi Pembatalan",
      message:
        "Apakah Anda yakin ingin membatalkan pengisian formulir ini? Semua data yang telah Anda masukkan akan hilang dan tidak disimpan ke dalam sistem.",
      type: "batal",
    });
    setIsModalOpen(true);
  };

  const getSupplierNameFromId = (id: number) => {
    const s = supplierList.find(x => x.id_supplier === id);
    return s ? s.nama_supplier : "Pilih Supplier";
  };

  const handleSelectRow = (obat: any) => {
    setSelectedObat(obat);
    if (mode === "edit") {
      setFormData({
        ...obat,
        supplier: getSupplierNameFromId(obat.supplier)
      });
      setImagePreview(obat.gambar);
      setImageFile(null);
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
      setFormData({
        ...selectedObat,
        supplier: getSupplierNameFromId(selectedObat.supplier)
      });
      setImagePreview(selectedObat.gambar);
      setImageFile(null);
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

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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
        "Gagal! Seluruh kolom data wajib diisi.",
        "error",
      );
      return;
    }

    if (formData.hargaJual <= 0) {
      showToast("Gagal! Harga Jual harus lebih dari 0.", "error");
      return;
    }

    if (!imagePreview) {
      showToast("Gagal! Anda wajib mengunggah Foto/Gambar Produk.", "error");
      return;
    }

    const isDuplicate = obatList.some((item) => {
      const isSameKode = item.kode.toUpperCase() === formData.kode.trim().toUpperCase();
      const isSameNama = item.nama.toLowerCase() === formData.nama.trim().toLowerCase();
      if (mode === "edit" && selectedObat) {
        return (isSameKode || isSameNama) && item.kode !== selectedObat.kode;
      }
      return isSameKode || isSameNama;
    });

    if (isDuplicate) {
      showToast(
        "Gagal! Data obat dengan Kode atau Nama tersebut sudah terdaftar di sistem.",
        "error",
      );
      return;
    }

    setModalConfig({
      title: mode === "tambah" ? "Konfirmasi Tambah Data" : "Konfirmasi Edit Data",
      message: mode === "tambah"
        ? "Apakah Anda yakin ingin menyimpan data obat baru ini ke dalam sistem inventaris?"
        : `Apakah Anda yakin ingin menyimpan perubahan pada data obat ${formData.nama} (${formData.kode})?`,
      type: mode as "tambah" | "edit",
    });
    setIsModalOpen(true);
  };

  const executeAction = async () => {
    setIsModalOpen(false);

    try {
      if (modalConfig.type === "tambah" || modalConfig.type === "edit") {
        const selectedSupplier = supplierList.find(s => s.nama_supplier === formData.supplier);
        const supplierId = selectedSupplier ? selectedSupplier.id_supplier.toString() : "0";

        // Format ke RFC3339 agar mudah di-parse time.Time oleh Golang
        const formattedExpiredDate = `${formData.expired}T00:00:00Z`;

        if (modalConfig.type === "tambah") {
          // POST Menerima Multipart Form Data di obat_handler.go
          const payload = new FormData();
          payload.append("kode_obat", formData.kode);
          payload.append("nama_obat", formData.nama);
          payload.append("jenis_obat", formData.jenis);
          payload.append("bentuk_obat", formData.bentuk);
          payload.append("satuan", formData.satuan);
          payload.append("id_supplier", supplierId);
          payload.append("harga_beli", formData.hargaBeli.toString());
          payload.append("harga_jual", formData.hargaJual.toString());
          payload.append("stok", formData.stok.toString());
          payload.append("stok_minimum", formData.minimal.toString());
          payload.append("expired_date", formattedExpiredDate);
          payload.append("deskripsi", formData.deskripsi);
          payload.append("komposisi", formData.komposisi);
          payload.append("dosis_pemakaian", formData.dosis);

          formData.kategori.forEach(k => {
            payload.append("kategori", k);
          });

          if (imageFile) {
            payload.append("gambar_produk", imageFile);
          }

          await api.post("/obat", payload, {
            headers: { "Content-Type": "multipart/form-data" }
          });
          showToast("Data obat baru berhasil ditambahkan!", "success");

        } else if (modalConfig.type === "edit") {
          // PERHATIAN: PUT /api/obat/:id di handler.go menggunakan c.ShouldBindJSON
          // Jadi kita Wajib mengirim JSON.
          const jsonPayload = {
            kode_obat: formData.kode,
            nama_obat: formData.nama,
            jenis_obat: formData.jenis,
            bentuk_obat: formData.bentuk,
            satuan: formData.satuan,
            id_supplier: parseInt(supplierId),
            harga_beli: formData.hargaBeli,
            harga_jual: formData.hargaJual,
            stok: formData.stok,
            stok_minimum: formData.minimal,
            expired_date: formattedExpiredDate,
            deskripsi: formData.deskripsi,
            komposisi: formData.komposisi,
            dosis_pemakaian: formData.dosis,
            kategori: formData.kategori,
            gambar_produk: formData.gambar,
          };

          if (imageFile) {
            showToast("Endpoint Update di server saat ini hanya mendukung JSON. Gambar baru akan diabaikan.", "error");
          }

          await api.put(`/obat/${formData.id}`, jsonPayload);
          showToast("Perubahan data obat berhasil disimpan!", "success");
        }
      } else if (modalConfig.type === "hapus" && selectedObat) {
        await api.delete(`/obat/${selectedObat.id}`);
        showToast("Data obat berhasil dihapus dari sistem.", "success");
      }

      await fetchObatData();
      handleClearForm();

    } catch (error: any) {
      const errMsg = error.response?.data?.error || "Terjadi kesalahan pada server saat memproses data.";
      showToast(errMsg, "error");
    }
  };

  const filteredObatList = obatList.filter((o) => {
    const q = search.toLowerCase();
    const sName = getSupplierNameFromId(o.supplier).toLowerCase();
    return (
      o.kode?.toLowerCase().includes(q) ||
      o.nama?.toLowerCase().includes(q) ||
      o.jenis?.toLowerCase().includes(q) ||
      o.bentuk?.toLowerCase().includes(q) ||
      sName.includes(q) ||
      o.stok?.toString().includes(q) ||
      o.hargaJual?.toString().includes(q) ||
      (Array.isArray(o.kategori) &&
        o.kategori.some((cat: string) => cat.toLowerCase().includes(q)))
    );
  });

  const totalPages = Math.ceil(filteredObatList.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredObatList.slice(indexOfFirstItem, indexOfLastItem);

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
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

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
          <Pencil size={16} /> EDIT DATA
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

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-1.5">
                    Gambar Produk
                  </label>
                  <div className="flex gap-3 items-center">
                    <div
                      onClick={() => mode !== "edit" && fileInputRef.current?.click()}
                      className={`w-16 h-16 shrink-0 rounded-xl border-2 border-dashed border-outline-variant bg-surface-container-low flex items-center justify-center text-outline overflow-hidden transition-all ${mode === "edit" ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:border-apomacy-primary hover:text-apomacy-primary"}`}
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
                        disabled={mode === "edit"}
                        className="hidden"
                      />
                      <button
                        type="button"
                        disabled={mode === "edit"}
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 text-[11px] font-black tracking-wide rounded-lg border border-outline-variant bg-white text-apomacy-dark hover:bg-gray-50 disabled:opacity-50 transition-colors"
                      >
                        FOTO
                      </button>
                      <p className="text-[10px] text-outline mt-1 truncate max-w-[120px]">
                        {mode === "edit" ? "Update foto dari UI belum didukung" : (imageFile ? imageFile.name : "JPG, PNG")}
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
                  <td colSpan={9} className="px-4 py-12 text-center text-outline font-bold">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 size={28} className="animate-spin text-apomacy-primary" />
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
                      {getSupplierNameFromId(obat.supplier)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-outline font-bold">
                    Data obat tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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