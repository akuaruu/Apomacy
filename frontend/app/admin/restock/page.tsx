"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  Search,
  Plus,
  Trash2,
  Save,
  X,
  ChevronDown,
  Lock,
  ShoppingCart,
  FileText,
  PackagePlus,
  AlertTriangle,
  CheckCircle2,
  Pencil,
} from "lucide-react";

export default function RestockPage() {
  // =====================================
  // STATE MASTER DATA (Dari API)
  // =====================================
  const [supplierOptions, setSupplierOptions] = useState<string[]>([]);
  const [obatOptions, setObatOptions] = useState<any[]>([]);
  const [isLoadingMaster, setIsLoadingMaster] = useState(true);

  // =====================================
  // STATE HEADER (Faktur & Supplier)
  // =====================================
  const [headerData, setHeaderData] = useState({
    noTerima: "",
    tanggal: new Date().toISOString().split("T")[0],
    supplier: "",
    noFaktur: "",
  });

  // =====================================
  // STATE FORM ITEM (Input Detail Obat)
  // =====================================
  const [formItem, setFormItem] = useState({
    obat: null as any,
    hargaBeli: 0,
    qty: 0,
    expired: "",
  });

  // Penanda status jika sedang dalam mode Edit baris tabel
  const [editingItemKode, setEditingItemKode] = useState<string | null>(null);

  // =====================================
  // STATE CART, MODAL & TOAST DINAMIS
  // =====================================
  const [cartItems, setCartItems] = useState<any[]>([]);

  // Konfigurasi Dinamis Modal Pop-up
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "process" as "process" | "reset" | "deleteRow",
    title: "",
    message: "",
    targetId: "",
  });

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // =====================================
  // LIFECYCLE & FETCH API
  // =====================================
  useEffect(() => {
    generateNoTerima();
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    setIsLoadingMaster(true);
    try {
      // Mengambil data obat dan supplier secara bersamaan (paralel)
      const [resObat, resSupplier] = await Promise.all([
        axios.get("https://api.npoint.io/b6965231a2d369815479"),
        axios.get("https://api.npoint.io/f39f256e6c10202dbe42"),
      ]);

      // Set data obat
      setObatOptions(resObat.data);

      // Set data supplier (kita hanya ambil 'nama' nya saja untuk dropdown string)
      const supplierNames = resSupplier.data.map((sup: any) => sup.nama);
      setSupplierOptions(supplierNames);
    } catch (error) {
      console.error("Gagal memuat data master:", error);
      showToast(
        "Gagal terhubung ke server untuk memuat data Obat dan Supplier.",
        "error",
      );
    } finally {
      setIsLoadingMaster(false);
    }
  };

  const generateNoTerima = () => {
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const randomNum = String(Math.floor(Math.random() * 999) + 1).padStart(
      3,
      "0",
    );
    setHeaderData((prev) => ({
      ...prev,
      noTerima: `REC-${yyyy}${mm}${dd}-${randomNum}`,
    }));
  };

  // FUNGSI PEMANGGIL TOAST
  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // HANDLERS INPUT
  const handleNumberChange = (field: string, val: string) => {
    const cleanDigits = val.replace(/\D/g, "");
    setFormItem({
      ...formItem,
      [field]: cleanDigits === "" ? 0 : parseInt(cleanDigits, 10),
    });
  };

  // =========================================================================
  // LOGIKA PENAMBAHAN / PENYUNTINGAN ITEM KERANJANG (VALIDASI KETAT)
  // =========================================================================
  const handleAddToCart = () => {
    // Validasi Tunggal: Cek seluruh form secara bersamaan
    if (
      !headerData.supplier ||
      !headerData.noFaktur.trim() ||
      !formItem.obat ||
      formItem.hargaBeli <= 0 ||
      formItem.qty <= 0 ||
      !formItem.expired
    ) {
      return showToast(
        "Gagal! Seluruh formulir penerimaan dan detail obat wajib diisi dengan lengkap.",
        "error",
      );
    }

    if (editingItemKode) {
      // MODE UPDATE/EDIT
      setCartItems(
        cartItems.map((item) =>
          item.kode === editingItemKode
            ? {
                ...item,
                obat: formItem.obat,
                kode: formItem.obat.kode,
                nama: formItem.obat.nama,
                hargaBeli: formItem.hargaBeli,
                qty: formItem.qty,
                expired: formItem.expired,
                subtotal: formItem.hargaBeli * formItem.qty,
              }
            : item,
        ),
      );
      showToast("Perubahan data item berhasil disimpan.", "success");
      cancelEditItem();
    } else {
      // MODE TAMBAH BARU & CEK DUPLIKASI
      const existingIndex = cartItems.findIndex(
        (item) => item.kode === formItem.obat.kode,
      );
      if (existingIndex >= 0) {
        return showToast(
          "Data obat sudah terdapat di dalam daftar. Silakan gunakan fitur edit pada baris tabel untuk mengubah jumlah atau harga.",
          "error",
        );
      }

      const newItem = {
        kode: formItem.obat.kode,
        nama: formItem.obat.nama,
        hargaBeli: formItem.hargaBeli,
        qty: formItem.qty,
        expired: formItem.expired,
        subtotal: formItem.hargaBeli * formItem.qty,
      };
      setCartItems([...cartItems, newItem]);
      setFormItem({ obat: null, hargaBeli: 0, qty: 0, expired: "" });
    }
  };

  const handleEditItem = (item: any) => {
    setFormItem({
      obat: { kode: item.kode, nama: item.nama },
      hargaBeli: item.hargaBeli,
      qty: item.qty,
      expired: item.expired,
    });
    setEditingItemKode(item.kode);
    window.scrollTo({ top: 150, behavior: "smooth" });
  };

  const cancelEditItem = () => {
    setFormItem({ obat: null, hargaBeli: 0, qty: 0, expired: "" });
    setEditingItemKode(null);
  };

  const handleClearAll = () => {
    setCartItems([]);
    setFormItem({ obat: null, hargaBeli: 0, qty: 0, expired: "" });
    setHeaderData((prev) => ({ ...prev, supplier: "", noFaktur: "" }));
    setEditingItemKode(null);
  };

  // =====================================
  // TRIGGER MODAL POP-UP
  // =====================================
  const requestProcess = () => {
    if (cartItems.length === 0)
      return showToast(
        "Daftar obat masih kosong! Masukkan minimal 1 obat.",
        "error",
      );
    setModalConfig({
      isOpen: true,
      type: "process",
      targetId: "",
      title: "Konfirmasi Restock",
      message: `Apakah Anda yakin ingin memproses penerimaan barang ini? Stok sebanyak ${cartItems.length} jenis obat akan otomatis ditambahkan ke database.`,
    });
  };

  const requestReset = () => {
    setModalConfig({
      isOpen: true,
      type: "reset",
      targetId: "",
      title: "Konfirmasi Reset Form",
      message:
        "Apakah Anda yakin ingin mengosongkan seluruh formulir? Semua data yang belum diproses akan hilang tanpa tersimpan.",
    });
  };

  const requestDeleteRow = (kode: string, nama: string) => {
    setModalConfig({
      isOpen: true,
      type: "deleteRow",
      targetId: kode,
      title: "Hapus Item Obat",
      message: `Apakah Anda yakin ingin menghapus data ${nama} dari daftar penerimaan sementara ini?`,
    });
  };

  // =====================================
  // EKSEKUSI NYATA DARI MODAL POP-UP
  // =====================================
  const executeModalAction = () => {
    if (modalConfig.type === "process") {
      // Logika POST data backend ada di sini nantinya
      console.log("RESTOCK PROCESSED:", {
        header: headerData,
        items: cartItems,
      });
      handleClearAll();
      generateNoTerima();
      showToast(
        "Berhasil! Data restock telah diproses dan disimpan ke sistem.",
        "success",
      );
    } else if (modalConfig.type === "reset") {
      handleClearAll();
      showToast("Formulir berhasil dikosongkan.", "success");
    } else if (modalConfig.type === "deleteRow") {
      setCartItems(
        cartItems.filter((item) => item.kode !== modalConfig.targetId),
      );
      if (editingItemKode === modalConfig.targetId) cancelEditItem();
      showToast("Item obat berhasil dihapus dari daftar.", "success");
    }
    setModalConfig({ ...modalConfig, isOpen: false });
  };

  const grandTotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const totalItems = cartItems.length;

  return (
    <div className="p-8 space-y-6 max-w-[1400px] mx-auto pb-10">
      {/* Header Title */}
      <div className="text-center py-4 mb-2">
        <h1 className="text-2xl font-black tracking-widest text-apomacy-dark uppercase">
          Manajemen Restock Obat
        </h1>
        <p className="mt-1 text-sm text-apomacy-muted font-medium">
          Formulir penerimaan barang masuk dari supplier ke inventaris gudang.
        </p>
      </div>

      {/* MAIN UNIFIED FORM CARD */}
      <div className="rounded-3xl border border-outline-variant bg-white p-6 shadow-md relative">
        <div className="flex justify-between items-center mb-6 border-b border-outline-variant/50 pb-3">
          <h3 className="text-sm font-black uppercase tracking-widest text-apomacy-dark">
            Form Restock & Penerimaan Barang
          </h3>
        </div>

        {/* 1. SECTION HEADER */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start mb-8">
          <div>
            <label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-1.5">
              No. Terima
            </label>
            <div className="relative">
              <Lock
                size={14}
                className="absolute left-4 top-3.5 text-gray-400"
              />
              <input
                type="text"
                readOnly
                disabled
                value={headerData.noTerima}
                className="w-full pl-10 pr-4 py-2.5 text-sm font-bold text-gray-500 rounded-xl border border-outline-variant bg-surface-container-low cursor-not-allowed outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-1.5">
              Tanggal
            </label>
            <input
              type="date"
              value={headerData.tanggal}
              onChange={(e) =>
                setHeaderData({ ...headerData, tanggal: e.target.value })
              }
              className="w-full px-4 py-2.5 text-sm font-bold text-apomacy-dark rounded-xl border border-outline-variant bg-surface-container-low outline-none cursor-pointer focus:border-apomacy-primary"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-1.5">
              Supplier
            </label>
            <SearchableSelect
              options={supplierOptions}
              placeholder={isLoadingMaster ? "Memuat..." : "Pilih Supplier..."}
              value={headerData.supplier}
              disabled={isLoadingMaster}
              onChange={(val) =>
                setHeaderData({ ...headerData, supplier: val })
              }
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-1.5">
              No Faktur Supplier
            </label>
            <input
              type="text"
              placeholder="Contoh: INV-9982"
              value={headerData.noFaktur}
              onChange={(e) =>
                setHeaderData({ ...headerData, noFaktur: e.target.value })
              }
              className="w-full px-4 py-2.5 text-sm font-bold text-apomacy-dark rounded-xl border border-outline-variant bg-surface-container-low outline-none focus:border-apomacy-primary"
            />
          </div>
        </div>

        {/* 2. SECTION INPUT OBAT */}
        <div
          className={`border rounded-2xl p-5 mb-8 transition-colors ${editingItemKode ? "bg-apomacy-primary/5 border-apomacy-primary/40" : "bg-surface-container-low/30 border-outline-variant"}`}
        >
          <div className="flex items-center gap-2 mb-4 text-apomacy-primary">
            {editingItemKode ? (
              <Pencil size={16} strokeWidth={2.5} />
            ) : (
              <PackagePlus size={16} strokeWidth={2.5} />
            )}
            <h4 className="text-xs font-black uppercase tracking-widest text-apomacy-dark">
              {editingItemKode ? "Edit Item Obat" : "Tambahkan Item Obat"}
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-1.5">
                Cari Data Obat
              </label>
              <SearchableObatSelect
                options={obatOptions}
                value={formItem.obat}
                onChange={(val) => setFormItem({ ...formItem, obat: val })}
                disabled={editingItemKode !== null || isLoadingMaster}
                placeholder={
                  isLoadingMaster ? "Memuat..." : "Pilih / Cari Obat..."
                }
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-1.5">
                Harga Beli (Rp)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={formItem.hargaBeli === 0 ? "" : formItem.hargaBeli}
                onChange={(e) =>
                  handleNumberChange("hargaBeli", e.target.value)
                }
                className="w-full px-4 py-2.5 text-sm font-bold text-apomacy-dark rounded-xl border border-outline-variant bg-white outline-none focus:border-apomacy-primary"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-1.5">
                Qty / Jumlah
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={formItem.qty === 0 ? "" : formItem.qty}
                onChange={(e) => handleNumberChange("qty", e.target.value)}
                className="w-full px-4 py-2.5 text-sm font-bold text-apomacy-dark rounded-xl border border-outline-variant bg-white outline-none focus:border-apomacy-primary text-center"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-1.5">
                Tanggal Expired
              </label>
              <input
                type="date"
                value={formItem.expired}
                onChange={(e) =>
                  setFormItem({ ...formItem, expired: e.target.value })
                }
                className="w-full px-3 py-2.5 text-sm font-bold text-apomacy-dark rounded-xl border border-outline-variant bg-white outline-none cursor-pointer focus:border-apomacy-primary"
              />
            </div>
          </div>

          {/* Action Buttons (Tambah / Edit) */}
          <div className="flex justify-end mt-5 gap-3">
            {editingItemKode && (
              <button
                type="button"
                onClick={cancelEditItem}
                className="rounded-xl border border-outline-variant bg-white px-5 py-2.5 text-sm font-bold text-apomacy-dark hover:bg-surface-container-low transition-colors"
              >
                Batal Edit
              </button>
            )}
            <button
              onClick={handleAddToCart}
              className="rounded-xl bg-apomacy-dark px-6 py-2.5 text-sm font-bold text-white shadow hover:bg-apomacy-primary transition-colors flex items-center gap-2"
            >
              {editingItemKode ? (
                <Save size={16} strokeWidth={3} />
              ) : (
                <Plus size={16} strokeWidth={3} />
              )}
              {editingItemKode ? "Simpan Perubahan" : "Tambah Ke Daftar Qty"}
            </button>
          </div>
        </div>

        {/* 3. SECTION TABEL CART */}
        <div className="rounded-2xl border border-outline-variant bg-white overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant text-[11px] font-black uppercase tracking-widest text-outline">
                  <th className="px-5 py-4 w-20 text-center">Aksi</th>
                  <th className="px-5 py-4">Kode Obat</th>
                  <th className="px-5 py-4">Nama Obat</th>
                  <th className="px-5 py-4 text-right">Harga Beli</th>
                  <th className="px-5 py-4 text-center">Qty</th>
                  <th className="px-5 py-4">Expired Date</th>
                  <th className="px-5 py-4 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {cartItems.length > 0 ? (
                  cartItems.map((item, idx) => (
                    <tr
                      key={idx}
                      className={`transition-colors ${editingItemKode === item.kode ? "bg-apomacy-primary/10" : "hover:bg-surface-container-low/50"}`}
                    >
                      <td className="px-5 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleEditItem(item)}
                            className="text-outline hover:text-apomacy-dark transition-colors p-1.5 rounded-lg hover:bg-surface-container-low"
                            title="Edit baris"
                          >
                            <Pencil size={16} strokeWidth={2.5} />
                          </button>
                          <button
                            onClick={() =>
                              requestDeleteRow(item.kode, item.nama)
                            }
                            className="text-red-400 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                            title="Hapus baris"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-mono font-bold text-outline-variant">
                        {item.kode}
                      </td>
                      <td className="px-5 py-3 font-black text-apomacy-dark">
                        {item.nama}
                      </td>
                      <td className="px-5 py-3 font-bold text-apomacy-dark text-right">
                        Rp {item.hargaBeli.toLocaleString("id-ID")}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className="bg-apomacy-primary/10 text-apomacy-primary px-3 py-1 rounded-lg font-black">
                          {item.qty}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-medium text-apomacy-dark">
                        {item.expired}
                      </td>
                      <td className="px-5 py-3 font-black text-apomacy-primary text-right">
                        Rp {item.subtotal.toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-outline">
                        <ShoppingCart size={28} className="mb-3 opacity-50" />
                        <p className="font-bold text-apomacy-dark text-sm">
                          Daftar obat masih kosong.
                        </p>
                        <p className="text-xs mt-1">
                          Silakan cari dan tambahkan obat melalui form di atas.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. SECTION FOOTER TOTAL & TOMBOL SIMPAN */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-t border-outline-variant/50 pt-5">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-[11px] font-bold text-outline uppercase tracking-widest mb-0.5">
                Total Item
              </p>
              <p className="text-lg font-black text-apomacy-dark">
                {totalItems} Jenis Obat
              </p>
            </div>
            <div className="h-10 w-px bg-outline-variant"></div>
            <div>
              <p className="text-[11px] font-bold text-outline uppercase tracking-widest mb-0.5">
                Grand Total
              </p>
              <p className="text-xl font-black text-apomacy-primary">
                Rp {grandTotal.toLocaleString("id-ID")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={requestReset}
              className="flex-1 md:flex-none rounded-xl border border-outline-variant bg-white px-6 py-3 text-sm font-bold text-apomacy-dark hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
            >
              Reset Form
            </button>
            <button
              onClick={requestProcess}
              disabled={cartItems.length === 0}
              className={`flex-1 md:flex-none rounded-xl px-8 py-3 text-sm font-black tracking-wide uppercase transition-all flex items-center justify-center gap-2 ${
                cartItems.length > 0
                  ? "bg-apomacy-primary text-white shadow-md hover:bg-apomacy-dark"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              <CheckCircle2 size={18} strokeWidth={2.5} />
              Proses & Update Stok
            </button>
          </div>
        </div>
      </div>

      {/* MODAL KONFIRMASI DINAMIS (OVERLAY) */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 px-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl scale-in-95 animate-in zoom-in duration-200">
            <div className="flex items-center gap-4 mb-6">
              <div
                className={`p-4 rounded-full shrink-0 ${modalConfig.type === "process" ? "bg-apomacy-primary/10 text-apomacy-primary" : "bg-red-100 text-red-600"}`}
              >
                <AlertTriangle size={28} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-lg font-black text-apomacy-dark uppercase tracking-wide">
                  {modalConfig.title}
                </h3>
              </div>
            </div>

            <p className="text-sm font-medium text-outline mb-6 leading-relaxed">
              {modalConfig.message}
            </p>

            {modalConfig.type === "process" && (
              <div className="bg-surface-container-low p-4 rounded-2xl mb-8 flex justify-between items-center border border-outline-variant/50">
                <span className="text-xs font-bold text-outline uppercase tracking-wider">
                  Total Tagihan
                </span>
                <span className="text-lg font-black text-apomacy-dark">
                  Rp {grandTotal.toLocaleString("id-ID")}
                </span>
              </div>
            )}

            <div
              className={`flex justify-end gap-3 pt-4 border-t border-outline-variant/40 ${modalConfig.type !== "process" ? "mt-8" : ""}`}
            >
              <button
                onClick={() =>
                  setModalConfig({ ...modalConfig, isOpen: false })
                }
                className="rounded-xl border border-outline-variant bg-white px-6 py-2.5 text-sm font-bold text-apomacy-dark hover:bg-surface-container-low transition-colors"
              >
                Batal
              </button>
              <button
                onClick={executeModalAction}
                className={`rounded-xl px-8 py-2.5 text-sm font-bold text-white shadow-md transition-colors ${
                  modalConfig.type === "process"
                    ? "bg-apomacy-primary hover:bg-apomacy-dark"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {modalConfig.type === "process"
                  ? "Proses Sekarang"
                  : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION (DINAMIS) */}
      {toast && (
        <div
          className={`fixed top-10 right-10 z-[200] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-5 fade-in duration-300 max-w-sm ${toast.type === "error" ? "bg-red-600" : "bg-green-600"}`}
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
      )
        setIsOpen(false);
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
        className={`w-full px-4 py-2.5 text-sm font-bold rounded-xl border flex justify-between items-center select-none transition-all ${disabled ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-75" : "bg-surface-container-low border-outline-variant text-apomacy-dark cursor-pointer focus-within:ring-4 focus-within:ring-apomacy-primary/10 focus-within:border-apomacy-primary"}`}
      >
        <span className={value ? "" : "text-outline/60"}>
          {value || placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-outline transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-outline-variant rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-2 border-b border-outline-variant/50 bg-surface-container-low/50">
            <input
              type="text"
              autoFocus
              placeholder="Ketik untuk mencari..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold text-apomacy-dark bg-white border border-outline-variant rounded-xl outline-none focus:border-apomacy-primary"
            />
          </div>
          <ul className="max-h-48 overflow-y-auto p-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <li
                  key={opt}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={`px-4 py-2.5 text-xs font-bold text-apomacy-dark cursor-pointer transition-colors rounded-lg hover:bg-apomacy-primary/10 ${value === opt ? "bg-apomacy-primary text-white hover:bg-apomacy-dark" : ""}`}
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

function SearchableObatSelect({
  options,
  value,
  onChange,
  disabled = false,
  placeholder = "Pilih / Cari Obat...",
}: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(
    (opt: any) =>
      opt.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opt.kode.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      )
        setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <div
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen) setSearchTerm("");
          }
        }}
        className={`w-full h-full min-h-[42px] px-4 py-2.5 text-sm font-bold rounded-xl border flex justify-between items-center select-none transition-all ${disabled ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" : "border-outline-variant bg-white text-apomacy-dark cursor-pointer focus-within:ring-4 focus-within:ring-apomacy-primary/10 focus-within:border-apomacy-primary"}`}
      >
        {value ? (
          <span
            className={`flex items-center gap-2 ${disabled ? "opacity-70" : ""}`}
          >
            {disabled && <Lock size={12} />}
            <span className="text-[10px] font-mono font-black text-apomacy-primary bg-apomacy-primary/10 px-2 py-0.5 rounded-md border border-apomacy-primary/20">
              {value.kode}
            </span>
            {value.nama}
          </span>
        ) : (
          <span className="text-outline/60">{placeholder}</span>
        )}
        <ChevronDown
          size={16}
          className={`text-outline transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full md:w-[400px] mt-2 bg-white border border-outline-variant rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-2 border-b border-outline-variant/50 bg-surface-container-low/50">
            <input
              type="text"
              autoFocus
              placeholder="Cari Kode atau Nama Obat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold text-apomacy-dark bg-white border border-outline-variant rounded-xl outline-none focus:border-apomacy-primary"
            />
          </div>
          <ul className="max-h-60 overflow-y-auto p-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt: any) => (
                <li
                  key={opt.kode}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={`px-4 py-2.5 text-xs cursor-pointer transition-colors rounded-lg hover:bg-apomacy-primary/10 ${value?.kode === opt.kode ? "bg-apomacy-primary/10" : ""}`}
                >
                  <div className="flex flex-col gap-1">
                    <span
                      className={`font-black ${value?.kode === opt.kode ? "text-apomacy-primary" : "text-apomacy-dark"}`}
                    >
                      {opt.nama}
                    </span>
                    <span className="font-mono text-[10px] font-bold text-outline">
                      {opt.kode}
                    </span>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-4 py-4 text-xs font-medium text-outline text-center">
                Data obat tidak ditemukan
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
