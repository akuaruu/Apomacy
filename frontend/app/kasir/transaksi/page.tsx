"use client";

import { useState, useEffect, useRef } from "react";
import api from "@/lib/api";
import {
    Search, Plus, Trash2, ShoppingCart, User, Pill, CreditCard, Banknote, QrCode, Receipt, XCircle, Loader2, AlertTriangle
} from "lucide-react";
import Cookies from "js-cookie";
import Toast from "@/components/shared/Toast";
import ModalConfirm from "@/components/shared/ModalConfirm";

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
    isKeras: boolean;
}

interface MedicineApiItem {
    id_obat?: number;
    IDObat?: number;
    id?: number;
    kode_obat?: string;
    KodeObat?: string;
    nama_obat?: string;
    NamaObat?: string;
    jenis_obat?: string;
    JenisObat?: string;
    harga_jual?: number;
    HargaJual?: number;
    stok?: number;
    Stok?: number;
}

interface CustomerApiItem {
    id_customer?: number;
    IDCustomer?: number;
    id?: number;
    nama_customer?: string;
    NamaCustomer?: string;
    nama?: string;
    no_telp?: string;
    NoTelp?: string;
}

const getApiErrorMessage = (error: unknown, fallback: string) => {
    if (typeof error === "object" && error !== null && "response" in error) {
        const response = (error as {
            response?: { data?: { error?: string; detail?: string } };
        }).response;
        return response?.data?.detail || response?.data?.error || fallback;
    }

    return error instanceof Error ? error.message : fallback;
};

export default function TransaksiOfflinePage() {
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [masterDataError, setMasterDataError] = useState<string | null>(null);

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
    const [isSaving, setIsSaving] = useState(false);

    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const toastTimerRef = useRef<number | null>(null);
    const showToast = (message: string, type: "success" | "error" = "success") => {
        setToast({ message, type });
        if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
        toastTimerRef.current = window.setTimeout(() => setToast(null), 3500);
    };

    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: "tambah" | "edit" | "hapus" | "batal";
        onConfirm: () => void;
    }>({ isOpen: false, title: "", message: "", type: "batal", onConfirm: () => { } });

    const closeConfirmModal = () => setConfirmModal((prev) => ({ ...prev, isOpen: false }));

    const [noResep, setNoResep] = useState("");
    const isObatKeras = (category: string) => category.toLowerCase().includes("keras") && !category.toLowerCase().includes("terbatas");
    const cartHasObatKeras = cart.some((item) => item.isKeras);

    useEffect(() => {
        const fetchMasterData = async () => {
            setIsLoadingData(true);
            setMasterDataError(null);

            const [obatResult, customerResult] = await Promise.allSettled([
                api.get("/obat"),
                api.get("/customer"),
            ]);

            setNoTrx(`TRX-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`);

            try {
                if (obatResult.status === "rejected") {
                    throw new Error(getApiErrorMessage(obatResult.reason, "Gagal memuat data obat."));
                }

                const obatRes = obatResult.value;
                const obatRaw = obatRes.data?.data || obatRes.data || [];
                const mappedObat = obatRaw.map((o: MedicineApiItem) => ({
                    id: o.id_obat || o.IDObat || o.id,
                    code: o.kode_obat || o.KodeObat,
                    name: o.nama_obat || o.NamaObat,
                    category: o.jenis_obat || o.JenisObat || "Umum",
                    price: Number(o.harga_jual ?? o.HargaJual ?? 0),
                    stock: Number(o.stok ?? o.Stok ?? 0),
                }));
                setMedicinesData(mappedObat);

                if (customerResult.status === "rejected") {
                    throw new Error(getApiErrorMessage(customerResult.reason, "Gagal memuat data member."));
                }

                const custRes = customerResult.value;
                const custRaw = custRes.data?.data || custRes.data || [];
                const mappedCust = custRaw
                    .map((c: CustomerApiItem) => ({
                        id: String(c.id_customer ?? c.IDCustomer ?? c.id ?? ""),
                        name: c.nama_customer || c.NamaCustomer || c.nama || "Tanpa Nama",
                        phone: c.no_telp || c.NoTelp || "-",
                    }))
                    .filter((customer: Member) => /^\d+$/.test(customer.id));
                setMembersData(mappedCust);
            } catch (error) {
                console.error("Gagal mengambil data referensi:", error);
                const message = getApiErrorMessage(error, "Gagal memuat data referensi transaksi.");
                setMasterDataError(message);
                showToast(message, "error");
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
            showToast(`Stok tidak mencukupi! Stok ${selectedMed.name} tersisa: ${selectedMed.stock}`, "error");
            return;
        }

        const existingItem = cart.find(item => item.id === selectedMed.id);
        if (existingItem) {
            const newQty = existingItem.qty + qty;
            if (newQty > selectedMed.stock) {
                showToast(`Stok tidak mencukupi!`, "error");
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
                subtotal: selectedMed.price * qty,
                isKeras: isObatKeras(selectedMed.category)
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
    const totalItem = cart.reduce((total, item) => total + item.qty, 0);
    const isCashless = paymentMethod === "QRIS" || paymentMethod === "Debit";
    const effectiveAmountPaid = isCashless ? totalTagihan : amountPaid;
    const kembalian = (typeof effectiveAmountPaid === "number" ? effectiveAmountPaid : 0) - totalTagihan;

    const handlePaymentMethodChange = (method: "Tunai" | "QRIS" | "Debit") => {
        setPaymentMethod(method);
        setAmountPaid("");
    };

    // VALIDASI KETAT: Tombol bayar tidak bisa ditekan jika belum pilih member,
    // atau jika ada obat keras tapi nomor resep belum diisi
    const isPaymentValid = typeof effectiveAmountPaid === "number" && effectiveAmountPaid >= totalTagihan && cart.length > 0 && selectedMember !== null && totalTagihan > 0 && (!cartHasObatKeras || noResep.trim() !== "");

    const handleCetakTransaksi = () => {
        if (!isPaymentValid) {
            if (!selectedMember) showToast("Silakan pilih Pelanggan (Member) terlebih dahulu!", "error");
            else if (cart.length === 0) showToast("Keranjang masih kosong!", "error");
            else if (cartHasObatKeras && noResep.trim() === "") showToast("Keranjang berisi obat keras. No. Resep dokter wajib diisi!", "error");
            else showToast("Nominal pembayaran belum mencukupi total tagihan!", "error");
            return;
        }

        if (!Cookies.get("apomacy_token")) {
            showToast("Sesi login tidak valid. Silakan login ulang untuk memproses transaksi.", "error");
            return;
        }

        setConfirmModal({
            isOpen: true,
            title: "Konfirmasi Transaksi",
            message: `Simpan transaksi ${noTrx} untuk ${selectedMember!.name} senilai ${formatRupiah(totalTagihan)} via ${paymentMethod}?`,
            type: "tambah",
            onConfirm: () => {
                closeConfirmModal();
                submitTransaksi();
            },
        });
    };

    const submitTransaksi = async () => {
        if (isSaving || !selectedMember || cart.length === 0) return;

        const customerId = Number(selectedMember.id);
        if (!Number.isInteger(customerId) || customerId <= 0) {
            showToast("ID member tidak valid. Muat ulang data member lalu pilih kembali.", "error");
            return;
        }

        // Struktur payload disesuaikan persis dengan Struct Golang model.Transaksi
        const payload = {
            no_transaksi: noTrx,
            id_customer: customerId,
            nama_customer: selectedMember.name,
            total_item: totalItem,
            subtotal: totalTagihan,
            total_bayar: effectiveAmountPaid,
            metode_pembayaran: paymentMethod,
            status: "Selesai",         // Langsung selesai karena dibayar di kasir
            status_pesanan: "Selesai", // Transaksi offline kasir langsung selesai di tempat
            resep_required: cartHasObatKeras,
            no_resep: cartHasObatKeras ? noResep.trim() : null,
            details: cart.map(c => ({
                id_obat: c.id,
                nama_obat: c.name,
                harga_satuan: c.price,
                qty: c.qty,
                subtotal: c.subtotal
            }))
        };

        try {
            setIsSaving(true);
            await api.post("/transaksi", payload);

            showToast(`Transaksi ${noTrx} berhasil disimpan. Struk sedang dicetak...`, "success");
            setTimeout(() => window.location.reload(), 1200);
        } catch (error: unknown) {
            const errorMsg = getApiErrorMessage(error, "Gagal menyimpan transaksi.");
            console.error("Gagal menyimpan transaksi:", errorMsg);
            showToast(`Transaksi Gagal: ${errorMsg}`, "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleBatalkanTransaksi = () => {
        if (cart.length === 0 && !selectedMember) return;
        setConfirmModal({
            isOpen: true,
            title: "Batalkan Transaksi",
            message: "Keranjang dan data pelanggan yang sudah diisi akan dikosongkan. Lanjutkan?",
            type: "batal",
            onConfirm: () => {
                setCart([]);
                setAmountPaid("");
                setSelectedMember(null);
                setMemberSearch("");
                setNoResep("");
                closeConfirmModal();
                showToast("Transaksi dibatalkan, keranjang dikosongkan.", "success");
            },
        });
    };

    return (
        <div className="flex flex-col w-full h-[calc(100vh-40px)] relative">
            {masterDataError && (
                <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                    <span>{masterDataError}</span>
                </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">

                {/* ================= PANEL KIRI: FORM INPUT ================= */}
                <div className="lg:col-span-5 flex flex-col gap-6 overflow-y-auto pr-2 scrollbar-hide">

                    {/* PANEL IDENTITAS PELANGGAN */}
                    <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm">
                        <h3 className="text-sm font-bold text-apomacy-dark flex items-center justify-between mb-5 border-b border-gray-100 pb-3">
                            <span className="flex items-center gap-2"><User size={18} className="text-apomacy-primary" /> Identitas Pelanggan (Wajib)</span>
                            {isLoadingData && <Loader2 size={16} className="animate-spin text-gray-400" />}
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">No Transaksi</label>
                                <input type="text" value={noTrx} disabled className="w-full rounded-xl bg-gray-50 py-2.5 px-4 text-sm font-mono font-bold text-apomacy-primary border border-gray-200 outline-none cursor-not-allowed" />
                            </div>

                            <div className="relative">
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-red-500 mb-1.5">Cari / Pilih Member *</label>
                                <div className="relative">
                                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder={isLoadingData ? "Memuat data..." : "Ketik Nama atau No. Telepon..."}
                                        value={memberSearch}
                                        disabled={isLoadingData}
                                        onChange={(e) => {
                                            setMemberSearch(e.target.value);
                                            setShowMemberDropdown(true);
                                            if (e.target.value === "") setSelectedMember(null);
                                        }}
                                        onFocus={() => setShowMemberDropdown(true)}
                                        className={`w-full rounded-xl bg-white py-2.5 pl-10 pr-4 text-sm text-gray-800 border outline-none transition-all disabled:bg-gray-50 ${!selectedMember && memberSearch === "" ? "border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500" : "border-gray-300 focus:border-apomacy-primary focus:ring-1 focus:ring-apomacy-primary"}`}
                                    />
                                </div>
                                {showMemberDropdown && memberSearch && (
                                    <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                                        {membersData
                                            // PENCARIAN GANDA: Filter berdasarkan nama ATAU nomor telepon
                                            .filter(m => m.name.toLowerCase().includes(memberSearch.toLowerCase()) || m.phone.includes(memberSearch))
                                            .map(member => (
                                                <li
                                                    key={member.id}
                                                    onClick={() => {
                                                        setSelectedMember(member);
                                                        setMemberSearch(`${member.name} (${member.phone})`);
                                                        setShowMemberDropdown(false);
                                                    }}
                                                    className="px-4 py-2 text-sm hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0"
                                                >
                                                    <p className="font-bold text-gray-800">{member.name}</p>
                                                    <p className="text-xs text-gray-500">{member.phone}</p>
                                                </li>
                                            ))}
                                        {/* Opsi anonim dihapus sepenuhnya sesuai permintaan */}
                                        {membersData.filter(m => m.name.toLowerCase().includes(memberSearch.toLowerCase()) || m.phone.includes(memberSearch)).length === 0 && (
                                            <li className="px-4 py-3 text-sm text-center text-gray-500 italic">
                                                Pelanggan tidak ditemukan. <br /> <span className="text-xs">Silakan daftarkan di menu Customer.</span>
                                            </li>
                                        )}
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
                                                    {isObatKeras(med.category) && (
                                                        <p className="text-[9px] bg-red-100 text-red-600 font-bold inline-block px-2 py-0.5 rounded mt-1 ml-1 uppercase tracking-wide">
                                                            Wajib Resep
                                                        </p>
                                                    )}
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
                        <span className="bg-apomacy-primary text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">{cart.length} Item</span>
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
                                                <p className="font-bold text-sm text-gray-800 flex items-center gap-1.5">
                                                    {item.name}
                                                    {item.isKeras && (
                                                        <span className="text-[8px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">Resep</span>
                                                    )}
                                                </p>
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

                    {/* Panel No. Resep Dokter — muncul jika ada Obat Keras di keranjang */}
                    {cartHasObatKeras && (
                        <div className="px-6 py-4 bg-red-50 border-t border-red-100 shrink-0">
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-red-600 mb-1.5 flex items-center gap-1.5">
                                <AlertTriangle size={14} /> Wajib: No. Resep Dokter
                            </label>
                            <input
                                type="text"
                                placeholder="Masukkan nomor resep dari dokter..."
                                value={noResep}
                                onChange={(e) => setNoResep(e.target.value)}
                                className={`w-full rounded-xl bg-white py-2.5 px-4 text-sm font-medium text-gray-800 border outline-none transition-all ${noResep.trim() === "" ? "border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500" : "border-gray-300 focus:border-apomacy-primary focus:ring-1 focus:ring-apomacy-primary"}`}
                            />
                            <p className="text-[10px] text-red-500 mt-1.5">
                                Keranjang berisi obat golongan keras. Transaksi tidak dapat diproses tanpa nomor resep yang valid.
                            </p>
                        </div>
                    )}

                    {/* Area Checkout & Pembayaran */}
                    <div className="bg-white border-t border-gray-200 shrink-0">
                        <div className="px-6 py-5 bg-gradient-to-r from-apomacy-dark to-apomacy-dark/90 text-white flex justify-between items-center">
                            <div>
                                <p className="text-xs text-gray-300 font-medium uppercase tracking-wider mb-1">Total Tagihan</p>
                                <p className="text-[10px] opacity-70">{totalItem} item dalam keranjang</p>
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
                                                onClick={() => handlePaymentMethodChange(method)}
                                                className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${paymentMethod === method ? "border-apomacy-primary bg-apomacy-primary/10 text-apomacy-primary shadow-sm" : "border-gray-200 text-gray-500 hover:bg-gray-50"
                                                    }`}
                                            >
                                                <span className="flex items-center gap-1.5">
                                                    {method === "Tunai" && <Banknote size={14} />}
                                                    {method === "QRIS" && <QrCode size={14} />}
                                                    {method === "Debit" && <CreditCard size={14} />}
                                                    {method}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-2 leading-relaxed">
                                        {paymentMethod === "Tunai"
                                            ? "Masukkan nominal uang yang diterima dari pelanggan."
                                            : "Nominal otomatis pas dengan total tagihan — pastikan approval di mesin EDC/QRIS sudah berhasil sebelum mencetak."}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2.5">
                                        {isCashless ? "Nominal Dibayar (Otomatis)" : "Nominal Bayar (Rp)"}
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="Masukkan jumlah uang..."
                                        value={effectiveAmountPaid}
                                        disabled={isCashless}
                                        onChange={(e) => setAmountPaid(e.target.value === "" ? "" : Number(e.target.value))}
                                        className={`w-full rounded-xl py-2.5 px-4 text-sm font-bold font-mono border outline-none transition-all ${isCashless ? "bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed" : "bg-white text-gray-800 border-gray-300 focus:border-apomacy-primary focus:ring-1 focus:ring-apomacy-primary"}`}
                                    />

                                    {!isCashless && (
                                        <div className="flex gap-2 mt-2">
                                            <button type="button" onClick={() => setAmountPaid(totalTagihan)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[10px] font-bold rounded-lg border border-gray-200 transition-colors">Uang Pas</button>
                                            <button type="button" onClick={() => setAmountPaid(50000)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[10px] font-bold rounded-lg border border-gray-200 transition-colors">50.000</button>
                                            <button type="button" onClick={() => setAmountPaid(100000)} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[10px] font-bold rounded-lg border border-gray-200 transition-colors">100.000</button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Kembalian & Tombol Aksi */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div>
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Kembalian</p>
                                    {isCashless ? (
                                        <h3 className="text-xl font-bold font-mono text-gray-400">Rp 0 <span className="text-[10px] font-sans font-normal">(Non-Tunai)</span></h3>
                                    ) : (
                                        <h3 className={`text-xl font-bold font-mono ${kembalian < 0 ? "text-red-500" : "text-emerald-600"}`}>
                                            {amountPaid === "" ? "Rp 0" : (kembalian < 0 ? "Kurang " + formatRupiah(Math.abs(kembalian)) : formatRupiah(kembalian))}
                                        </h3>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={handleBatalkanTransaksi}
                                        disabled={isSaving}
                                        className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-300 bg-white text-gray-600 text-sm font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
                                    >
                                        <XCircle size={18} /> Batal
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCetakTransaksi}
                                        disabled={!isPaymentValid || isSaving}
                                        className={`flex items-center gap-2 px-8 py-3 rounded-xl text-white text-sm font-bold shadow-md transition-all ${(!isPaymentValid || isSaving) ? "bg-gray-400 cursor-not-allowed" : "bg-apomacy-primary hover:bg-apomacy-dark"}`}
                                    >
                                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Receipt size={18} />}
                                        {isSaving ? "Menyimpan..." : "Cetak & Simpan"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <Toast toast={toast} />
            <ModalConfirm
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                onConfirm={confirmModal.onConfirm}
                onCancel={closeConfirmModal}
            />
        </div>
    );
}
