"use client";

import { useState, useEffect } from "react";
import {
  Lock,
  ShoppingCart,
  PackagePlus,
  CheckCircle2,
  Pencil,
  Trash2,
  Plus,
  Save,
} from "lucide-react";

import SearchableSelect from "@/components/shared/SearchableSelect";
import SearchableObatSelect from "@/components/shared/SearchableObatSelect";
import Toast from "@/components/shared/Toast";
import ModalConfirm from "@/components/shared/ModalConfirm";
import api from "@/lib/api";

export default function RestockPage() {
  // Master Data State
  const [supplierList, setSupplierList] = useState<any[]>([]);
  const [supplierOptions, setSupplierOptions] = useState<string[]>([]);

  // Membutuhkan 2 state untuk obat: satu master asli, satu untuk hasil filter dropdown
  const [allObatList, setAllObatList] = useState<any[]>([]);
  const [obatOptions, setObatOptions] = useState<any[]>([]);

  const [isLoadingMaster, setIsLoadingMaster] = useState(true);

  // Header State
  const [headerData, setHeaderData] = useState({
    noTerima: "",
    tanggal: new Date().toISOString().split("T")[0],
    supplier: "",
    noFaktur: "",
  });

  // Default State Form Item
  const [formItem, setFormItem] = useState({
    obat: null as any,
    hargaBeli: 0,
    qty: 0,
    expired: "",
  });

  const [editingItemKode, setEditingItemKode] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);

  // Modal & Toast
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "tambah",
    title: "",
    message: "",
    targetId: "",
  });

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // FETCH MASTER DATA
  useEffect(() => {
    generateNoTerima();
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    setIsLoadingMaster(true);
    try {
      const [resObat, resSupplier] = await Promise.all([
        api.get("/obat/").catch(() => ({ data: { data: [] } })),
        api.get("/supplier/").catch(() => ({ data: { data: [] } })),
      ]);

      const obatData = resObat.data?.data || resObat.data || [];
      const supData = resSupplier.data?.data || resSupplier.data || [];

      // Mapping data obat, pastikan id_supplier ikut terbawa untuk keperluan filter
      const mappedObat = obatData.map((o: any) => ({
        ...o,
        id: o.id_obat,
        kode: o.kode_obat,
        nama: o.nama_obat,
        id_supplier: o.id_supplier,
      }));

      setAllObatList(mappedObat);
      setObatOptions(mappedObat); // Set awal tampilkan semua

      setSupplierList(supData);
      setSupplierOptions(supData.map((sup: any) => sup.nama_supplier));

    } catch (error) {
      showToast("Gagal terhubung ke server untuk memuat data master.", "error");
    } finally {
      setIsLoadingMaster(false);
    }
  };

  const generateNoTerima = () => {
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const randomNum = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0");
    setHeaderData((prev) => ({
      ...prev,
      noTerima: `REC-${yyyy}${mm}${dd}-${randomNum}`,
    }));
  };

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // --- LOGIKA FILTER TWO-WAY BINDING ---

  // 1. Saat Supplier Dipilih Manual
  const handleSupplierChange = (val: string) => {
    setHeaderData({ ...headerData, supplier: val });

    if (!val) {
      setObatOptions(allObatList); // Jika supplier dikosongkan, tampilkan semua obat lagi
      return;
    }

    const selectedSup = supplierList.find(s => s.nama_supplier === val);
    if (selectedSup) {
      // Filter list obat hanya yang id_supplier-nya cocok
      const filteredObat = allObatList.filter(o => o.id_supplier === selectedSup.id_supplier);
      setObatOptions(filteredObat);

      // Jika user sudah memilih obat, tapi obat tersebut bukan milik supplier ini, kosongkan form obatnya
      if (formItem.obat && formItem.obat.id_supplier !== selectedSup.id_supplier) {
        setFormItem({ obat: null, hargaBeli: 0, qty: 0, expired: "" });
      }
    }
  };

  // 2. Saat Obat Dipilih Manual
  const handleObatChange = (val: any) => {
    setFormItem({ ...formItem, obat: val });

    if (val) {
      // Cari supplier dari obat ini
      const linkedSup = supplierList.find(s => s.id_supplier === val.id_supplier);
      if (linkedSup) {
        // Otomatis ubah header supplier ke supplier milik obat ini
        setHeaderData(prev => ({ ...prev, supplier: linkedSup.nama_supplier }));

        // Langsung filter dropdown obat agar sesuai dengan supplier yang baru saja ter-set otomatis
        const filteredObat = allObatList.filter(o => o.id_supplier === linkedSup.id_supplier);
        setObatOptions(filteredObat);
      }
    }
  };

  // -------------------------------------

  const handleNumberChange = (field: string, val: string) => {
    const cleanDigits = val.replace(/\D/g, "");
    setFormItem({
      ...formItem,
      [field]: cleanDigits === "" ? 0 : parseInt(cleanDigits, 10),
    });
  };

  const handleAddToCart = () => {
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
      const existingIndex = cartItems.findIndex(
        (item) => item.kode === formItem.obat.kode,
      );
      if (existingIndex >= 0) {
        return showToast(
          "Data obat sudah terdapat di dalam daftar. Silakan gunakan fitur edit pada baris tabel.",
          "error",
        );
      }
      const newItem = {
        kode: formItem.obat.kode,
        nama: formItem.obat.nama,
        obat: formItem.obat,
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
      obat: item.obat,
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
    setObatOptions(allObatList); // Kembalikan filter dropdown obat ke daftar semula
  };

  const requestProcess = () => {
    if (cartItems.length === 0)
      return showToast("Daftar obat masih kosong! Masukkan minimal 1 obat.", "error");
    setModalConfig({
      isOpen: true,
      type: "tambah",
      targetId: "",
      title: "Konfirmasi Restock",
      message: `Apakah Anda yakin ingin memproses penerimaan barang ini? Stok sebanyak ${cartItems.length} jenis obat akan otomatis ditambahkan ke database.`,
    });
  };

  const requestReset = () => {
    setModalConfig({
      isOpen: true,
      type: "batal",
      targetId: "",
      title: "Konfirmasi Reset Form",
      message: "Apakah Anda yakin ingin mengosongkan seluruh formulir? Semua data yang belum diproses akan hilang tanpa tersimpan.",
    });
  };

  const requestDeleteRow = (kode: string, nama: string) => {
    setModalConfig({
      isOpen: true,
      type: "hapus",
      targetId: kode,
      title: "Hapus Item Obat",
      message: `Apakah Anda yakin ingin menghapus data ${nama} dari daftar penerimaan sementara ini?`,
    });
  };

  const executeModalAction = async () => {
    const actionType = modalConfig.type;
    setModalConfig({ ...modalConfig, isOpen: false });

    if (actionType === "tambah") {
      try {
        const selectedSupplier = supplierList.find(s => s.nama_supplier === headerData.supplier);
        const supplierId = selectedSupplier ? selectedSupplier.id_supplier : 0;

        if (supplierId === 0) {
          return showToast("Gagal memvalidasi supplier, pastikan supplier telah dipilih.", "error");
        }

        const payload = {
          id_supplier: supplierId,
          id_user: 1,
          no_faktur_supplier: headerData.noFaktur,
          no_penerimaan_internal: headerData.noTerima,
          tanggal_restock: new Date(headerData.tanggal).toISOString(),
          total_bayar: grandTotal,
          keterangan: "Restock Barang Gudang",
          details: cartItems.map(item => ({
            id_obat: item.obat.id,
            harga_beli: item.hargaBeli,
            jumlah: item.qty,
            tanggal_kadaluarsa: new Date(item.expired).toISOString(),
            subtotal: item.subtotal
          }))
        };

        // Menghapus slash '/' di akhir URL agar sesuai dengan routing Golang
        await api.post("/restock/", payload);

        handleClearAll();
        generateNoTerima();
        showToast("Berhasil! Data restock telah diproses dan stok obat di-update.", "success");
      } catch (error: any) {
        const errMsg = error.response?.data?.error || "Gagal memproses transaksi restock ke server.";
        showToast(errMsg, "error");
      }
    } else if (actionType === "batal") {
      handleClearAll();
      showToast("Formulir berhasil dikosongkan.", "success");
    } else if (actionType === "hapus") {
      const newCartItems = cartItems.filter((item) => item.kode !== modalConfig.targetId);
      setCartItems(newCartItems);

      // Jika keranjang kosong karena item terakhir dihapus, buka kunci dropdown supplier
      if (newCartItems.length === 0) {
        setObatOptions(allObatList);
      }

      if (editingItemKode === modalConfig.targetId) cancelEditItem();
      showToast("Item obat berhasil dihapus dari daftar.", "success");
    }
  };

  const grandTotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const totalItems = cartItems.length;

  return (
    <div className="p-8 space-y-6 max-w-[1400px] mx-auto pb-10">
      <div className="text-center py-4 mb-2">
        <h1 className="text-2xl font-black tracking-widest text-apomacy-dark uppercase">
          Manajemen Restock Obat
        </h1>
        <p className="mt-1 text-sm text-apomacy-muted font-medium">
          Formulir penerimaan barang masuk dari supplier ke inventaris gudang.
        </p>
      </div>

      <div className="rounded-3xl border border-outline-variant bg-white p-6 shadow-md relative">
        <div className="flex justify-between items-center mb-6 border-b border-outline-variant/50 pb-3">
          <h3 className="text-sm font-black uppercase tracking-widest text-apomacy-dark">
            Form Restock & Penerimaan Barang
          </h3>
        </div>

        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start mb-8">
          <div>
            <label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-1.5">
              No. Terima
            </label>
            <div className="relative">
              <Lock size={14} className="absolute left-4 top-3.5 text-gray-400" />
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
              onChange={(e) => setHeaderData({ ...headerData, tanggal: e.target.value })}
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
              // LOCK otomatis aktif jika sedang memuat atau keranjang sudah ada isinya
              disabled={isLoadingMaster || cartItems.length > 0}
              onChange={handleSupplierChange}
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
              onChange={(e) => setHeaderData({ ...headerData, noFaktur: e.target.value })}
              className="w-full px-4 py-2.5 text-sm font-bold text-apomacy-dark rounded-xl border border-outline-variant bg-surface-container-low outline-none focus:border-apomacy-primary"
            />
          </div>
        </div>

        {/* Section Input Data */}
        <div className={`border rounded-2xl p-5 mb-8 transition-colors ${editingItemKode ? "bg-apomacy-primary/5 border-apomacy-primary/40" : "bg-surface-container-low/30 border-outline-variant"}`}>
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
                onChange={handleObatChange}
                disabled={editingItemKode !== null || isLoadingMaster}
                placeholder={isLoadingMaster ? "Memuat..." : "Pilih / Cari Obat..."}
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
                onChange={(e) => handleNumberChange("hargaBeli", e.target.value)}
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
                onChange={(e) => setFormItem({ ...formItem, expired: e.target.value })}
                className="w-full px-3 py-2.5 text-sm font-bold text-apomacy-dark rounded-xl border border-outline-variant bg-white outline-none cursor-pointer focus:border-apomacy-primary"
              />
            </div>
          </div>

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

        {/* Tabel Sementara */}
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
                            onClick={() => requestDeleteRow(item.kode, item.nama)}
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

        {/* Footer Total */}
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
              className={`flex-1 md:flex-none rounded-xl px-8 py-3 text-sm font-black tracking-wide uppercase transition-all flex items-center justify-center gap-2 ${cartItems.length > 0 ? "bg-apomacy-primary text-white shadow-md hover:bg-apomacy-dark" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
            >
              <CheckCircle2 size={18} strokeWidth={2.5} /> Proses & Update Stok
            </button>
          </div>
        </div>
      </div>

      <ModalConfirm
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onConfirm={executeModalAction}
        onCancel={() => setModalConfig({ ...modalConfig, isOpen: false })}
      />
      <Toast toast={toast} />
    </div>
  );
}