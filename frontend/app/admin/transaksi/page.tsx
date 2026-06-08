"use client";

import { useState, useEffect, useRef } from "react";
import api from "@/lib/api";
import {
    Search, Plus, Trash2, ShoppingCart, User, Pill, CreditCard, Banknote, QrCode, Receipt, XCircle, Loader2
} from "lucide-react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

interface MyTokenPayload {
    id_user: number;
    role: string;
    exp: number;
}
interface Member {
    id: string;
    name: string;
    phone: string;
}

interface Medicine {
    id: number;
    code: string;
    name: string;
    category: string;
    price: number;
    stock: number;
}

interface CartItem {
    id: number;
    code: string;
    name: string;
    price: number;
    qty: number;
    subtotal: number;
}

export default function TransaksiOfflinePage() {
    const [isMounted, setIsMounted] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    const [noTrx, setNoTrx] = useState("");

    const [membersData, setMembersData] = useState<Member[]>([]);
    const [medicinesData, setMedicinesData] = useState<Medicine[]>([]);

    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [memberSearch, setMemberSearch] = useState("");
    const [showMemberDropdown, setShowMemberDropdown] = useState(false);

    const [selectedMed, setSelectedMed] = useState<Medicine | null>(null);
    const [medSearch, setMedSearch] = useState("");
    const [showMedDropdown, setShowMedDropdown] = useState(false);

    const medSearchInputRef = useRef<HTMLInputElement>(null);

    const [qty, setQty] = useState<number>(1);
    const handleQtyChange = (value: string) => {
        const numericValue = value.replace(/[^0-9]/g, "");
        setQty(numericValue === "" ? 0 : Number(numericValue));
    };

    const [cart, setCart] = useState<CartItem[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<"Tunai" | "QRIS" | "Debit">("Tunai");
    const [amountPaid, setAmountPaid] = useState<number | "">("");

    useEffect(() => {
        setIsMounted(true);
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
        setNoTrx(`TRX-${dateStr}-${randomNum}`);

        const token = Cookies.get("apomacy_token");

        if (token) {
            try {
                // Bedah token persis seperti di halaman login
                const decoded = jwtDecode<MyTokenPayload>(token);
                console.log("Data Token Kasir:", decoded);

                if (decoded.id_user) {
                    setCurrentUserId(decoded.id_user);
                } else {
                    console.warn("ID Kasir tidak ditemukan di dalam Payload JWT!");
                }
            } catch (error) {
                console.error("Gagal membedah token kasir", error);
            }
        } else {
            console.warn("Cookie apomacy_token tidak ditemukan!");
        }

        const fetchMasterData = async () => {
            setIsLoadingData(true);
            try {
                // Fetch Data dari API Backend Golang
                const [obatRes, custRes] = await Promise.all([
                    api.get("/obat/").catch(() => ({ data: { data: [] } })),
                    api.get("/customer/").catch(() => ({ data: { data: [] } }))
                ]);

                // Mapping Data Obat
                const obatRaw = obatRes.data?.data || obatRes.data || [];
                const mappedObat = obatRaw.map((o: any) => ({
                    id: o.id_obat || o.IDObat || o.id,
                    code: o.kode_obat || o.KodeObat,
                    name: o.nama_obat || o.NamaObat,
                    category: o.jenis_obat || o.JenisObat || "Umum",
                    price: o.harga_jual || o.HargaJual || 0,
                    stock: o.stok || o.Stok || 0,
                }));
                setMedicinesData(mappedObat);

                // Mapping Data Customer (Member)
                const custRaw = custRes.data?.data || custRes.data || [];
                const mappedCust = custRaw.map((c: any) => ({
                    id: c.id_customer?.toString() || c.IDCustomer?.toString() || c.id?.toString(),
                    name: c.nama_customer || c.NamaCustomer || c.nama || "Tanpa Nama",
                    phone: c.no_telp || c.NoTelp || "-",
                }));
                setMembersData(mappedCust);

            } catch (error) {
                console.error("Gagal mengambil data referensi:", error);
            } finally {
                setIsLoadingData(false);
                if (medSearchInputRef.current) {
                    medSearchInputRef.current.focus();
                }
            }
        };

        fetchMasterData();
    }, []);

    const formatRupiah = (num: number) => "Rp " + num.toLocaleString("id-ID");

    const handleAddToCart = () => {
        if (!selectedMed || qty < 1) return;

        if (qty > selectedMed.stock) {
            alert(`Stok tidak mencukupi! Stok ${selectedMed.name} tersisa: ${selectedMed.stock}`);
            return;
        }

        const existingItem = cart.find(item => item.id === selectedMed.id);
        if (existingItem) {
            const newQty = existingItem.qty + qty;
            if (newQty > selectedMed.stock) {
                alert(`Stok tidak mencukupi!`);
                return;
            }
            setCart(cart.map(item =>
                item.id === selectedMed.id
                    ? { ...item, qty: newQty, subtotal: newQty * item.price }
                    : item
            ));
        } else {
            setCart([...cart, {
                id: selectedMed.id,
                code: selectedMed.code,
                name: selectedMed.name,
                price: selectedMed.price,
                qty: qty,
                subtotal: selectedMed.price * qty
            }]);
        }

        setSelectedMed(null);
        setMedSearch("");
        setQty(1);
    };

    const handleQtyKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedMed && qty > 0) {
                handleAddToCart();
                if (medSearchInputRef.current) {
                    medSearchInputRef.current.focus();
                }
            }
        }
    };

    const handleRemoveFromCart = (id: number) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const totalTagihan = cart.reduce((total, item) => total + item.subtotal, 0);
    const kembalian = (typeof amountPaid === "number" ? amountPaid : 0) - totalTagihan;
    const isPaymentValid = typeof amountPaid === "number" && amountPaid >= totalTagihan && cart.length > 0;

    const handleCetakTransaksi = async () => {
        if (!isPaymentValid) return;

        if (!currentUserId) {
            alert("Sesi login tidak valid. Silakan login ulang untuk memproses transaksi.");
            return; // Hentikan proses jika kasir belum terdeteksi
        }

        const payload = {
            no_transaksi: noTrx,
            id_user: currentUserId,
            id_customer: selectedMember ? parseInt(selectedMember.id) : 0,
            total_bayar: totalTagihan,
            metode_pembayaran: paymentMethod,
            nominal_bayar: amountPaid,
            kembalian: kembalian,
            status_transaksi: "Selesai",
            details: cart.map(c => ({
                id_obat: c.id,
                jumlah: c.qty,
                harga_satuan: c.price,
                subtotal: c.subtotal
            }))
        };

        try {
            // 2. Gunakan api.ts (Hapus pemanggilan axios langsung)
            await api.post("/transaksi/", payload);

            alert(`Transaksi Berhasil Disimpan!\n\nNo Trx: ${noTrx}\nTotal: ${formatRupiah(totalTagihan)}\nKembalian: ${formatRupiah(kembalian)}\n\n(Struk Sedang Dicetak...)`);
            window.location.reload();
        } catch (error: any) {
            // Coba tangkap error dari Golang agar kita tahu pesan pastinya
            const errorMsg = error.response?.data?.error || error.message;
            console.error("Gagal menyimpan transaksi:", errorMsg);
            alert(`Transaksi Gagal: ${errorMsg}`);
        }
    };

    if (!isMounted) return null;

    return (
        <div className="flex flex-col w-full h-[calc(100vh-40px)] relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">

                {/* ================= PANEL KIRI: FORM INPUT ================= */}
                <div className="lg:col-span-5 flex flex-col gap-6 overflow-y-auto pr-2 scrollbar-hide">

                    {/* PANEL IDENTITAS PELANGGAN */}
                    <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm">
                        <h3 className="text-sm font-bold text-apomacy-dark flex items-center justify-between mb-5 border-b border-gray-100 pb-3">
                            <span className="flex items-center gap-2"><User size={18} className="text-apomacy-primary" /> Identitas Pelanggan</span>
                            {isLoadingData && <Loader2 size={16} className="animate-spin text-gray-400" />}
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">No Transaksi</label>
                                <input type="text" value={noTrx} disabled className="w-full rounded-xl bg-gray-50 py-2.5 px-4 text-sm font-mono font-bold text-apomacy-primary border border-gray-200 outline-none cursor-not-allowed" />
                            </div>

                            <div className="relative">
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Cari / Pilih Member (Opsional)</label>
                                <div className="relative">
                                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder={isLoadingData ? "Memuat data..." : "Ketik nama atau ketik 'Anonim'..."}
                                        value={memberSearch}
                                        disabled={isLoadingData}
                                        onChange={(e) => {
                                            setMemberSearch(e.target.value);
                                            setShowMemberDropdown(true);
                                            if (e.target.value === "") setSelectedMember(null);
                                        }}
                                        onFocus={() => setShowMemberDropdown(true)}
                                        className="w-full rounded-xl bg-white py-2.5 pl-10 pr-4 text-sm text-gray-800 border border-gray-300 outline-none focus:border-apomacy-primary focus:ring-1 focus:ring-apomacy-primary transition-all disabled:bg-gray-50"
                                    />
                                </div>
                                {showMemberDropdown && memberSearch && (
                                    <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                                        {membersData.filter(m => m.name.toLowerCase().includes(memberSearch.toLowerCase())).map(member => (
                                            <li
                                                key={member.id}
                                                onClick={() => {
                                                    setSelectedMember(member);
                                                    setMemberSearch(member.name);
                                                    setShowMemberDropdown(false);
                                                }}
                                                className="px-4 py-2 text-sm hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0"
                                            >
                                                <p className="font-bold text-gray-800">{member.name} <span className="text-blue-600 text-xs font-normal ml-1">(Member)</span></p>
                                                <p className="text-xs text-gray-500">{member.id} - {member.phone}</p>
                                            </li>
                                        ))}
                                        <li
                                            onClick={() => { setSelectedMember(null); setMemberSearch("Anonim / Pembeli Umum"); setShowMemberDropdown(false); }}
                                            className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer text-gray-600 italic"
                                        >
                                            Pilih sebagai Anonim / Umum
                                        </li>
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* PILIH OBAT & INPUT QTY */}
                    <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm">
                        <h3 className="text-sm font-bold text-apomacy-dark flex items-center gap-2 mb-5 border-b border-gray-100 pb-3">
                            <Pill size={18} className="text-apomacy-teal" /> Tambah Item Obat
                        </h3>

                        <div className="space-y-4">
                            <div className="relative">
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Nama Obat / Kode Obat</label>
                                <div className="relative">
                                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <input
                                        ref={medSearchInputRef}
                                        type="text"
                                        placeholder={isLoadingData ? "Memuat obat..." : "Ketik nama atau kode obat..."}
                                        value={medSearch}
                                        disabled={isLoadingData}
                                        onChange={(e) => {
                                            setMedSearch(e.target.value);
                                            setShowMedDropdown(true);
                                            setSelectedMed(null);
                                        }}
                                        className="w-full rounded-xl bg-white py-2.5 pl-10 pr-4 text-sm text-gray-800 border border-gray-300 outline-none focus:border-apomacy-primary focus:ring-1 focus:ring-apomacy-primary transition-all disabled:bg-gray-50"
                                    />
                                </div>
                                {showMedDropdown && medSearch && !selectedMed && (
                                    <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                        {medicinesData.filter(m => m.name.toLowerCase().includes(medSearch.toLowerCase()) || m.code.toLowerCase().includes(medSearch.toLowerCase())).map(med => (
                                            <li
                                                key={med.id}
                                                onClick={() => {
                                                    setSelectedMed(med);
                                                    setMedSearch(med.name);
                                                    setShowMedDropdown(false);
                                                }}
                                                className={`px-4 py-2 cursor-pointer border-b border-gray-50 last:border-0 flex justify-between items-center ${med.stock > 0 ? "hover:bg-blue-50" : "bg-gray-50 opacity-60 cursor-not-allowed"}`}
                                            >
                                                <div>
                                                    <p className="text-sm font-bold text-gray-800">{med.name}</p>
                                                    <p className="text-[10px] bg-gray-100 text-gray-600 inline-block px-2 rounded mt-1">
                                                        {med.code} | Stok: <span className={med.stock > 0 ? "text-emerald-600 font-bold" : "text-red-500 font-bold"}>{med.stock}</span>
                                                    </p>
                                                </div>
                                                <p className="text-sm font-bold text-apomacy-teal font-mono">{formatRupiah(med.price)}</p>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Harga Satuan</label>
                                    <input type="text" value={selectedMed ? formatRupiah(selectedMed.price) : "-"} disabled className="w-full rounded-xl bg-gray-50 py-2.5 px-4 text-sm font-bold text-gray-600 border border-gray-200" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                                        Quantity
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={qty === 0 ? "" : qty}
                                        onChange={(e) => handleQtyChange(e.target.value)}
                                        onKeyDown={handleQtyKeyDown}
                                        disabled={!selectedMed || selectedMed.stock <= 0}
                                        className="w-full rounded-xl bg-white py-2.5 px-4 text-sm font-bold text-gray-800 border border-gray-300 outline-none focus:border-apomacy-primary disabled:bg-gray-50 transition-all"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={!selectedMed || qty < 1 || selectedMed.stock <= 0}
                                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-apomacy-primary py-3 text-sm font-bold text-white shadow-sm hover:bg-apomacy-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Plus size={18} /> Tambah Item ke Keranjang
                                </button>
                            </div>
                        </div>
                    </div>

                </div>

                {/* ================= PANEL KANAN: KERANJANG & CHECKOUT ================= */}
                <div className="lg:col-span-7 bg-white rounded-2xl border border-outline-variant shadow-sm flex flex-col h-full overflow-hidden">

                    {/* Header Keranjang */}
                    <div className="bg-surface-container px-6 py-4 border-b border-gray-200 flex justify-between items-center shrink-0">
                        <h3 className="font-bold text-apomacy-dark flex items-center gap-2">
                            <ShoppingCart size={18} className="text-apomacy-primary" /> Daftar Belanjaan
                        </h3>
                        <span className="bg-apomacy-primary text-white text-[10px] font-bold px-2.5 py-1 rounded-full">{cart.length} Item</span>
                    </div>

                    {/* Tabel Keranjang  */}
                    <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                                <ShoppingCart size={64} className="mb-4" />
                                <p className="font-bold text-lg">Keranjang Masih Kosong</p>
                                <p className="text-sm">Silakan cari dan tambah obat dari panel kiri</p>
                            </div>
                        ) : (
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                                        <th className="pb-3 w-[45%]">Nama Obat</th>
                                        <th className="pb-3 text-center">Harga</th>
                                        <th className="pb-3 text-center">Qty</th>
                                        <th className="pb-3 text-right">Subtotal</th>
                                        <th className="pb-3 text-center w-[50px]">Hapus</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {cart.map((item) => (
                                        <tr key={item.id} className="hover:bg-white transition-colors">
                                            <td className="py-4">
                                                <p className="font-bold text-sm text-gray-800">{item.name}</p>
                                                <p className="text-[10px] font-mono text-gray-400 mt-0.5">{item.code}</p>
                                            </td>
                                            <td className="py-4 text-center text-xs font-mono text-gray-500">{formatRupiah(item.price)}</td>
                                            <td className="py-4 text-center font-bold text-sm text-gray-800">{item.qty}x</td>
                                            <td className="py-4 text-right font-bold text-sm font-mono text-apomacy-primary">{formatRupiah(item.subtotal)}</td>
                                            <td className="py-4 text-center">
                                                <button onClick={() => handleRemoveFromCart(item.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Area Checkout & Pembayaran */}
                    <div className="bg-white border-t border-gray-200 shrink-0">
                        <div className="px-6 py-5 bg-apomacy-dark text-white flex justify-between items-center">
                            <div>
                                <p className="text-xs text-gray-300 font-medium uppercase tracking-wider mb-1">Total Tagihan</p>
                                <p className="text-[10px] opacity-70">Termasuk PPN jika ada</p>
                            </div>
                            <h2 className="text-3xl font-bold font-mono text-apomacy-ice">{formatRupiah(totalTagihan)}</h2>
                        </div>

                        {/* Form Pembayaran */}
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2.5">Metode Pembayaran</label>
                                    <div className="flex gap-2">
                                        {(["Tunai", "QRIS", "Debit"] as const).map((method) => (
                                            <button
                                                key={method}
                                                type="button"
                                                onClick={() => setPaymentMethod(method)}
                                                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold border transition-all ${paymentMethod === method ? "border-apomacy-primary bg-apomacy-primary/10 text-apomacy-primary" : "border-gray-200 text-gray-500 hover:bg-gray-50"
                                                    }`}
                                            >
                                                {method === "Tunai" && <Banknote size={14} />}
                                                {method === "QRIS" && <QrCode size={14} />}
                                                {method === "Debit" && <CreditCard size={14} />}
                                                {method}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2.5">Nominal Bayar (Rp)</label>
                                    <input
                                        type="number"
                                        placeholder="Masukkan jumlah uang..."
                                        value={amountPaid}
                                        onChange={(e) => setAmountPaid(e.target.value === "" ? "" : Number(e.target.value))}
                                        className="w-full rounded-xl bg-white py-2.5 px-4 text-sm font-bold font-mono text-gray-800 border border-gray-300 outline-none focus:border-apomacy-primary focus:ring-1 focus:ring-apomacy-primary transition-all"
                                    />

                                    <div className="flex gap-2 mt-2">
                                        <button type="button" onClick={() => setAmountPaid(totalTagihan)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[10px] font-bold rounded-lg border border-gray-200 transition-colors">Uang Pas</button>
                                        <button type="button" onClick={() => setAmountPaid(50000)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[10px] font-bold rounded-lg border border-gray-200 transition-colors">50.000</button>
                                        <button type="button" onClick={() => setAmountPaid(100000)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[10px] font-bold rounded-lg border border-gray-200 transition-colors">100.000</button>
                                    </div>
                                </div>
                            </div>

                            {/* Kembalian & Tombol Aksi */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Kembalian</p>
                                    <h3 className={`text-xl font-bold font-mono ${kembalian < 0 ? "text-red-500" : "text-emerald-600"}`}>
                                        {amountPaid === "" ? "Rp 0" : (kembalian < 0 ? "Kurang " + formatRupiah(Math.abs(kembalian)) : formatRupiah(kembalian))}
                                    </h3>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => { setCart([]); setAmountPaid(""); setSelectedMember(null); setMemberSearch(""); }}
                                        className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-300 bg-white text-gray-600 text-sm font-bold hover:bg-gray-50 transition-colors"
                                    >
                                        <XCircle size={18} /> Batal
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCetakTransaksi}
                                        disabled={!isPaymentValid}
                                        className="flex items-center gap-2 px-8 py-3 rounded-xl bg-apomacy-primary text-white text-sm font-bold shadow-md hover:bg-apomacy-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Receipt size={18} /> Cetak & Simpan
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}