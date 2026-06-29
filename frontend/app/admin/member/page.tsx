"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    Search, Plus, Edit2, Trash2, Save, XCircle, Loader2, User, RefreshCw,
    Users, ShieldCheck, Phone, Cake, BadgeCheck, AlertTriangle
} from "lucide-react";
import ModalConfirm from "@/components/shared/ModalConfirm";
import api from "@/lib/api";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

interface Member {
    id: number;
    noMember: string;
    name: string;
    gender: string;
    phone: string;
    age: number | string;
    rawBirthDate: string;
    address: string;
    email: string | null;
    source: "customer" | "user";
}

export default function MemberPage() {
    const router = useRouter();
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [mode, setMode] = useState<"view" | "add" | "edit">("view");

    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        type: "tambah" | "edit" | "hapus";
        title: string;
        message: string;
        action: () => void;
    }>({
        isOpen: false, type: "tambah", title: "", message: "", action: () => {},
    });

    const [formData, setFormData] = useState({
        noMember: "",
        name: "",
        gender: "L",
        phone: "",
        age: ""
    });

    // Admin selalu bisa delete
    const canDelete = true;

    useEffect(() => {
        const token = Cookies.get("apomacy_token");
        if (!token) {
            router.replace("/login");
            return;
        }
        fetchMembers();
    }, [router]);

    const fetchMembers = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/customer');
            const rawData = response.data?.data || response.data || [];

            const mappedData: Member[] = rawData.map((item: any) => {
                let calculatedAge: number | string = "";

                if (item.tanggal_lahir) {
                    const birthYear = new Date(item.tanggal_lahir).getFullYear();
                    const currentYear = new Date().getFullYear();
                    calculatedAge = currentYear - birthYear;
                }

                return {
                    id: item.id_customer,
                    noMember: item.no_member || `MBR-${String(item.id_customer).padStart(3, '0')}`,
                    name: item.nama_customer,
                    gender: item.jenis_kelamin || "L",
                    phone: item.no_telp || "-",
                    age: calculatedAge,
                    rawBirthDate: item.tanggal_lahir || "",
                    address: item.alamat || "-",
                    email: item.email || null,
                    source: "customer" as const
                };
            });

            setMembers(mappedData);
        } catch (err: any) {
            console.error("Gagal mengambil data:", err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                setError("Akses ditolak. Silakan login kembali.");
            } else {
                setError("Gagal memuat data customer. Pastikan server berjalan.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAddClick = () => {
        setMode("add");

        let nextSequence = 1;
        if (members.length > 0) {
            const numbers = members.map(m => {
                const match = m.noMember.match(/\d+/);
                return match ? parseInt(match[0], 10) : 0;
            });
            nextSequence = Math.max(...numbers) + 1;
        }

        const generatedNo = `MBR-${String(nextSequence).padStart(3, '0')}`;

        setFormData({
            noMember: generatedNo,
            name: "",
            gender: "L",
            phone: "",
            age: ""
        });
        setSelectedMember(null);
    };

    const handleRowClick = (member: Member) => {
        setMode("view");
        setSelectedMember(member);
        setFormData({
            noMember: member.noMember,
            name: member.name,
            gender: member.gender,
            phone: member.phone,
            age: member.age.toString()
        });
    };

    const handleEditClick = (member: Member) => {
        setMode("edit");
        setSelectedMember(member);
        setFormData({
            noMember: member.noMember,
            name: member.name,
            gender: member.gender,
            phone: member.phone,
            age: member.age.toString()
        });
    };

    const handleDeleteClick = (member: Member) => {
        if (!canDelete) return;

        setConfirmModal({
            isOpen: true,
            type: "hapus",
            title: "Hapus Member",
            message: `Apakah Anda yakin ingin menghapus member ${member.name}?`,
            action: async () => {
                try {
                    await api.delete(`/customer/${member.id}`);
                    fetchMembers();
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                    setMode("view");
                    setSelectedMember(null);
                } catch (error) {
                    console.error("Gagal menghapus:", error);
                    alert("Gagal menghapus member!");
                }
            }
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.age || isNaN(Number(formData.age))) {
            alert("Umur harus berupa angka valid!");
            return;
        }

        const actionText = mode === "add" ? "menambahkan" : "memperbarui";

        setConfirmModal({
            isOpen: true,
            type: mode === "add" ? "tambah" : "edit",
            title: mode === "add" ? "Tambah Member Baru" : "Simpan Perubahan",
            message: `Apakah Anda yakin ingin ${actionText} data member ini?`,
            action: async () => {
                try {
                    const birthYear = new Date().getFullYear() - Number(formData.age);
                    const birthDatePayload = `${birthYear}-01-01T00:00:00Z`;

                    const payload = {
                        no_member: formData.noMember,
                        nama_customer: formData.name,
                        no_telp: formData.phone,
                        jenis_kelamin: formData.gender,
                        tanggal_lahir: birthDatePayload,
                        alamat: selectedMember?.address || "-",
                        email: selectedMember?.email || null
                    };

                    if (mode === "add") {
                        await api.post('/customer', payload);
                    } else if (mode === "edit" && selectedMember) {
                        await api.put(`/customer/${selectedMember.id}`, payload);
                    }

                    fetchMembers();
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                    setMode("view");
                    setSelectedMember(null);
                } catch (error) {
                    console.error("Gagal menyimpan:", error);
                    alert("Gagal menyimpan data member!");
                }
            }
        });
    };

    const filteredMembers = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return members.filter(m =>
            m.name.toLowerCase().includes(q) ||
            m.noMember.toLowerCase().includes(q) ||
            m.phone.toLowerCase().includes(q)
        );
    }, [members, searchQuery]);

    // Error state
    if (error && !loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center p-8">
                <div className="bg-discount-red/10 border border-discount-red text-discount-red p-6 rounded-2xl max-w-md text-center space-y-3">
                    <AlertTriangle size={32} className="mx-auto" />
                    <h2 className="font-black text-lg">Gagal Memuat Data</h2>
                    <p className="text-sm font-medium">{error}</p>
                    <button onClick={fetchMembers} className="mt-2 px-4 py-2 bg-apomacy-primary text-white rounded-xl text-sm font-bold hover:bg-apomacy-dark transition-colors">
                        Coba Lagi
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-90px)] bg-background relative max-w-full overflow-hidden p-6 gap-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-apomacy-dark flex items-center gap-2">
                        <Users className="text-apomacy-primary" size={28} />
                        Manajemen Customer
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Kelola data Customer apotek.
                    </p>
                </div>

                {/* Badge Role Admin */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border shrink-0 bg-blue-50 text-blue-700 border-blue-200">
                    <ShieldCheck size={14} />
                    Admin · Akses Penuh
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 h-full min-h-0 overflow-hidden">
                {/* Bagian Kiri: Tabel */}
                <div className="w-full lg:w-7/12 flex flex-col bg-white rounded-2xl shadow-sm border border-outline-variant overflow-hidden min-h-0">
                    <div className="p-4 border-b border-outline-variant flex flex-col sm:flex-row gap-3 shrink-0 bg-surface-container-lowest">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Cari ID, nama, atau no. telepon..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-apomacy-primary focus:ring-1 focus:ring-apomacy-primary transition-all"
                            />
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <button
                                onClick={fetchMembers}
                                title="Muat ulang data"
                                className="p-2 border border-outline-variant rounded-xl hover:bg-gray-50 text-gray-600 transition-colors"
                            >
                                <RefreshCw size={18} className={loading ? "animate-spin text-apomacy-primary" : ""} />
                            </button>
                            <button
                                onClick={handleAddClick}
                                className="flex items-center gap-2 bg-apomacy-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-apomacy-dark transition-colors shadow-sm whitespace-nowrap"
                            >
                                <Plus size={18} /> Tambah
                            </button>
                        </div>
                    </div>

                    <div className="px-4 py-2 border-b border-outline-variant bg-white text-xs text-gray-500 flex justify-between items-center shrink-0">
                        <span>
                            Menampilkan <span className="font-semibold text-apomacy-dark">{filteredMembers.length}</span> dari{" "}
                            <span className="font-semibold text-apomacy-dark">{members.length}</span> member
                        </span>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="text-apomacy-primary hover:underline font-medium"
                            >
                                Reset pencarian
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-auto custom-scrollbar">
                        <table className="w-full text-sm border-collapse">
                            <thead className="sticky top-0 z-10 bg-gray-50 text-gray-500 text-xs uppercase tracking-wider shadow-sm">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold w-12">No</th>
                                    <th className="px-4 py-3 text-left font-semibold w-28">No. Member</th>
                                    <th className="px-4 py-3 text-left font-semibold">Nama Customer</th>
                                    <th className="px-4 py-3 text-center font-semibold w-24">Gender</th>
                                    <th className="px-4 py-3 text-left font-semibold w-36">No. Telepon</th>
                                    <th className="px-4 py-3 text-center font-semibold w-16">Usia</th>
                                    <th className="px-4 py-3 text-center font-semibold w-24">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="py-16 text-center text-gray-400">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <Loader2 className="animate-spin text-apomacy-primary" size={32} />
                                                <span className="text-sm font-medium">Memuat data customer...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredMembers.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-16 text-center text-gray-400">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Search size={40} className="opacity-20" />
                                                <span className="text-sm font-medium">Tidak ada data customer.</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredMembers.map((member, idx) => {
                                        const isSelected = selectedMember?.id === member.id;
                                        return (
                                            <tr
                                                key={member.id}
                                                onClick={() => handleRowClick(member)}
                                                className={`cursor-pointer transition-colors ${
                                                    isSelected
                                                        ? "bg-blue-50/70 hover:bg-blue-50"
                                                        : "hover:bg-gray-50"
                                                }`}
                                            >
                                                <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 whitespace-nowrap">
                                                        {member.noMember}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 font-semibold text-apomacy-dark max-w-[180px] truncate" title={member.name}>
                                                    {member.name}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                                        member.gender === "P"
                                                            ? "bg-pink-50 text-pink-600 border border-pink-100"
                                                            : "bg-sky-50 text-sky-600 border border-sky-100"
                                                    }`}>
                                                        {member.gender === "P" ? "Perempuan" : "Laki-laki"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{member.phone}</td>
                                                <td className="px-4 py-3 text-center text-gray-600">
                                                    {member.age ? `${member.age}` : "-"}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleEditClick(member); }}
                                                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteClick(member); }}
                                                            className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Bagian Kanan: Form */}
                <div className="w-full lg:w-5/12 bg-white rounded-2xl shadow-sm border border-outline-variant flex flex-col min-h-0">
                    <div className="p-4 border-b border-outline-variant bg-surface-container-lowest shrink-0">
                        <h2 className="font-bold text-apomacy-dark flex items-center gap-2">
                            {mode === "add" && <Plus size={18} className="text-apomacy-primary" />}
                            {mode === "edit" && <Edit2 size={18} className="text-blue-600" />}
                            {mode === "view" && <User size={18} className="text-gray-500" />}
                            {mode === "add" ? "Tambah Member Baru" : mode === "edit" ? "Edit Data Member" : "Detail Member"}
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="p-5 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4">
                        {!selectedMember && mode === "view" ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
                                <User size={48} className="opacity-20" />
                                <p className="text-sm text-center">Pilih member dari daftar untuk melihat detail,<br />atau klik Tambah.</p>
                            </div>
                        ) : (
                            <>
                                {mode === "view" && selectedMember && (
                                    <div className="flex items-center gap-3 mb-2 p-3 rounded-xl bg-surface-container-lowest border border-outline-variant">
                                        <div className="w-10 h-10 rounded-full bg-apomacy-primary/10 flex items-center justify-center text-apomacy-primary shrink-0">
                                            <User size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-apomacy-dark truncate">{selectedMember.name}</p>
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <BadgeCheck size={12} /> {selectedMember.noMember}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">ID Member</label>
                                    <input type="text"
                                        value={formData.noMember}
                                        disabled
                                        className="w-full px-3 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed font-medium"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Lengkap</label>
                                    <input type="text" required disabled={mode === "view"}
                                        value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Masukkan nama member"
                                        className="w-full px-3 py-2.5 bg-white border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-apomacy-primary focus:ring-1 focus:ring-apomacy-primary disabled:bg-gray-50 disabled:text-gray-500 transition-all font-medium"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                            <Cake size={12} /> Umur
                                        </label>
                                        <div className="relative">
                                            <input type="number" required disabled={mode === "view"} min="1" max="120"
                                                value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                                placeholder="Contoh: 25"
                                                className="w-full px-3 py-2.5 bg-white border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-apomacy-primary focus:ring-1 focus:ring-apomacy-primary disabled:bg-gray-50 disabled:text-gray-500 transition-all pr-12 font-medium"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">Tahun</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Gender</label>
                                        <select disabled={mode === "view"}
                                            value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                            className="w-full px-3 py-2.5 bg-white border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-apomacy-primary focus:ring-1 focus:ring-apomacy-primary disabled:bg-gray-50 disabled:text-gray-500 transition-all font-medium"
                                        >
                                            <option value="L">Laki-laki</option>
                                            <option value="P">Perempuan</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                        <Phone size={12} /> No. Telepon / WA
                                    </label>
                                    <input type="tel" required disabled={mode === "view"}
                                        value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="08xxxxxxxxxx"
                                        className="w-full px-3 py-2.5 bg-white border border-outline-variant rounded-xl text-sm focus:outline-none focus:border-apomacy-primary focus:ring-1 focus:ring-apomacy-primary disabled:bg-gray-50 disabled:text-gray-500 transition-all font-medium"
                                    />
                                </div>

                                <div className="flex gap-3 mt-8 border-t border-outline-variant pt-4 shrink-0">
                                    <button type="submit" disabled={mode === "view"}
                                        className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all border ${
                                            mode === "view" ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" : "bg-apomacy-primary text-white shadow-sm hover:bg-apomacy-dark border-apomacy-primary"
                                        }`}>
                                        <Save size={16} /> Simpan
                                    </button>
                                    <button type="button" onClick={() => { setMode("view"); setSelectedMember(null); }} disabled={mode === "view"}
                                        className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all border ${
                                            mode === "view" ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" : "bg-white text-apomacy-dark border-outline-variant hover:bg-surface-container-low"
                                        }`}>
                                        <XCircle size={16} /> Batal
                                    </button>
                                </div>
                            </>
                        )}
                    </form>

                    <ModalConfirm isOpen={confirmModal.isOpen} type={confirmModal.type} title={confirmModal.title} message={confirmModal.message}
                        onConfirm={confirmModal.action} onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} />
                </div>
            </div>
        </div>
    );
}