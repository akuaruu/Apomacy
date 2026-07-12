"use client";

import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";

import Toast from "@/components/shared/Toast";
import api from "@/lib/api";

export default function DataObatPage() {
  const [obatList, setObatList] = useState<any[]>([]);
  const [supplierList, setSupplierList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedObat, setSelectedObat] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const itemsPerPage = 25;

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const getSupplierNameFromId = (id: number) => {
    const supplier = supplierList.find((item) => item.id_supplier === id);
    return supplier ? supplier.nama_supplier : "-";
  };

  const fetchSupplierData = async () => {
    try {
      const response = await api.get("/supplier");
      setSupplierList(response.data?.data || response.data || []);
    } catch {
      setSupplierList([]);
    }
  };

  const fetchObatData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/obat");
      const data = response.data?.data || response.data || [];

      const mappedData = data.map((item: any) => ({
        id: item.id_obat,
        kode: item.kode_obat,
        nama: item.nama_obat,
        jenis: item.jenis_obat,
        kategori: item.kategori || [],
        bentuk: item.bentuk_obat,
        satuan: item.satuan,
        supplier: item.id_supplier,
        hargaJual: item.harga_jual,
        stok: item.stok,
        minimal: item.stok_minimum,
      }));

      setObatList(mappedData);
    } catch {
      showToast("Data obat gagal dimuat. Silakan coba refresh halaman.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSupplierData();
    fetchObatData();
  }, []);

  const filteredObatList = obatList.filter((obat) => {
    const keyword = search.toLowerCase();
    const supplierName = getSupplierNameFromId(obat.supplier).toLowerCase();

    return (
      obat.kode?.toLowerCase().includes(keyword) ||
      obat.nama?.toLowerCase().includes(keyword) ||
      obat.jenis?.toLowerCase().includes(keyword) ||
      obat.bentuk?.toLowerCase().includes(keyword) ||
      supplierName.includes(keyword) ||
      obat.stok?.toString().includes(keyword) ||
      obat.hargaJual?.toString().includes(keyword) ||
      (Array.isArray(obat.kategori) &&
        obat.kategori.some((kategori: string) =>
          kategori.toLowerCase().includes(keyword),
        ))
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
            setSelectedObat(null);
            fetchSupplierData();
            fetchObatData();
          }}
          className="rounded-xl border border-outline-variant bg-white px-4 py-2.5 text-sm font-bold text-apomacy-dark hover:bg-surface-container-low transition-colors flex items-center gap-2"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

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
                    colSpan={8}
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
                    onClick={() => setSelectedObat(obat)}
                    className={`cursor-pointer transition-colors ${
                      selectedObat?.kode === obat.kode
                        ? "bg-apomacy-primary/10 hover:bg-apomacy-primary/15"
                        : "hover:bg-surface-container-low/50"
                    }`}
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
                        {obat.kategori?.map((kategori: string, index: number) => (
                          <span
                            key={`${obat.kode}-${kategori}-${index}`}
                            className="bg-surface-container-low border border-outline-variant text-apomacy-dark text-[10px] font-bold px-2 py-0.5 rounded-md"
                          >
                            {kategori}
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
                      Rp {Number(obat.hargaJual || 0).toLocaleString("id-ID")}
                    </td>
                    <td className="px-5 py-4 font-medium text-apomacy-muted">
                      {getSupplierNameFromId(obat.supplier)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-outline font-bold"
                  >
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
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1 || isLoading}
              className="p-1.5 rounded-lg border border-outline-variant bg-white text-apomacy-dark hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-xs font-black text-apomacy-dark px-3">
              Hal {currentPage} / {totalPages || 1}
            </span>
            <button
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
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

      <Toast toast={toast} />
    </div>
  );
}
