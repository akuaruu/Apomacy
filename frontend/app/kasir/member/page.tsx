"use client";

import { useState, useEffect } from "react";
import { 
    Search, Plus, Edit2, Trash2, Save, XCircle, Loader2, User, RefreshCw
} from "lucide-react";
import ModalConfirm from "@/components/shared/ModalConfirm";
import api from "@/lib/api";

interface Member {
    id: number;
    noMember: string;
    name: string;
    gender: string;
    phone: string;
    email: string;
    address: string;
    birthDate: string;
    joinDate: string;
}

export default function MemberPage() {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
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
        id: "", noMember: "", name: "", phone: "", email: "", address: "", gender: "Laki-laki", birthDate: ""
    });

    // 1. FETCH DATA (DENGAN PENGAMANAN ID MEMBER)
    const fetchMembers = async () => {
        try {
            setLoading(true);
            const response = await api.get("/customer");
            const data = response.data?.data || response.data || [];
            
            const mappedMembers = data.map((item: any) => ({
                id: item.id_customer,
                // Fallback: Jika no_member dari DB kosong, gunakan id_customer sebagai MBR-XXX
                noMember: item.no_member || `MBR-${String(item.id_customer).padStart(3, '0')}`, 
                name: item.nama_customer,
                gender: item.jenis_kelamin === "P" ? "Perempuan" : "Laki-laki",
                phone: item.no_telp,
                email: item.email || "",
                address: item.alamat || "",
                birthDate: item.tanggal_lahir ? item.tanggal_lahir.split("T")[0] : "",
                joinDate: item.tanggal_daftar ? item.tanggal_daftar.split("T")[0] : ""
            }));
            
            setMembers(mappedMembers);
            if (mappedMembers.length > 0 && mode === "view") {
                initSelectMember(mappedMembers[0]);
            } else if (mappedMembers.length === 0) {
                handleClearSelection();
            }
        } catch (error) {
            console.error("Gagal mengambil data member:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const initSelectMember = (member: Member) => {
        setSelectedMember(member);
        setMode("view");
        setFormData({
            id: member.id.toString(),
            noMember: member.noMember,
            name: member.name, phone: member.phone, email: member.email,
            address: member.address, gender: member.gender, birthDate: member.birthDate
        });
    };

    const handleClearSelection = () => {
        setSelectedMember(null);
        setMode("view");
        setFormData({ id: "", noMember: "", name: "", phone: "", email: "", address: "", gender: "Laki-laki", birthDate: "" });
    };

 const handleAddClick = async () => {
    setMode("add");
    setSelectedMember(null);
    
    
    const nextSequence = members.length + 1;
    
    const generatedNo = `MBR-${String(nextSequence).padStart(3, '0')}`;
    
    setFormData({ 
        id: "", 
        noMember: generatedNo, 
        name: "", 
        phone: "", 
        email: "", 
        address: "", 
        gender: "Laki-laki", 
        birthDate: "" 
    });
};

    const handleEditClick = () => { if (selectedMember) setMode("edit"); };

    const handleCancelClick = () => {
        setMode("view");
        if (selectedMember) initSelectMember(selectedMember);
        else if (members.length > 0) initSelectMember(members[0]);
        else handleClearSelection();
    };

    // 2. DELETE ACTION
    const handleDeleteClick = () => {
        if (!selectedMember) return;
        setConfirmModal({
            isOpen: true,
            type: "hapus",
            title: "Hapus Data Member",
            message: `Data member "${selectedMember.name}" akan dihapus permanen.`,
            action: async () => {
                try {
                    await api.delete(`/customer/${selectedMember.id}`);
                    setSelectedMember(null);
                    setMode("view");
                    await fetchMembers();
                } catch (error: any) {
                    console.error("Error Detail:", error);
                    alert("Gagal menghapus! Pastikan API DELETE sudah dibuat di backend Golang.");
                }
            },
        });
    };

    // 3. SAVE ACTION
    const handleSaveSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const isAdd = mode === "add";
        setConfirmModal({
            isOpen: true,
            type: isAdd ? "tambah" : "edit",
            title: isAdd ? "Tambah Member Baru" : "Simpan Perubahan Data",
            message: isAdd ? `Data "${formData.name}" akan disimpan.` : `Perubahan data "${formData.name}" akan diperbarui.`,
            action: async () => {
                try {
                    const genderValue = formData.gender === "Perempuan" ? "P" : "L";
                    const formattedDate = formData.birthDate ? `${formData.birthDate}T00:00:00Z` : null;

                    const payload = {
                        no_member: formData.noMember, 
                        nama_customer: formData.name,
                        jenis_kelamin: genderValue,
                        no_telp: formData.phone,
                        email: formData.email.trim() !== "" ? formData.email : null,
                        alamat: formData.address,
                        tanggal_lahir: formattedDate
                    };

                    if (isAdd) {
                        await api.post("/customer", payload);
                    } else if (!isAdd && selectedMember) {
                        await api.put(`/customer/${selectedMember.id}`, payload);
                    }
                    
                    setMode("view");
                    await fetchMembers(); 
                } catch (error: any) {
                    console.error("Gagal menyimpan data:", error);
                    alert(`Gagal menyimpan data! Error: ${error.response?.data?.error || "500 Internal Server Error"}`);
                }
            },
        });
    };

    const closeModal = () => setConfirmModal({ ...confirmModal, isOpen: false });

    const filteredMembers = members.filter(member =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.phone.includes(searchQuery) ||
        member.noMember.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch w-full">

            {/* PANEL DAFTAR MEMBER */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-outline-variant p-6 shadow-sm flex flex-col justify-between min-w-0">
                <div className="flex flex-col flex-1 min-h-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shrink-0">
                        <div>
                            <h2 className="text-xl font-bold text-apomacy-dark">Daftar Member</h2>
                            <p className="text-xs text-on-surface-variant mt-0.5">Status Panel: <span className="font-bold uppercase text-apomacy-primary">{mode}</span></p>
                        </div>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
                            <input type="text" placeholder="Cari nama atau no member..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full rounded-xl bg-surface-container-low py-2 pl-10 pr-4 text-sm text-on-surface border border-outline-variant outline-none focus:border-apomacy-primary transition-all" />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3 text-apomacy-primary flex-1 bg-white rounded-xl border border-outline-variant h-[545px]">
                            <Loader2 className="h-10 w-10 animate-spin" />
                            <p className="text-sm font-medium animate-pulse">Memuat data member...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto overflow-y-auto h-[545px] rounded-xl border border-outline-variant shadow-sm bg-white">
                            <table className="w-full text-left border-collapse whitespace-nowrap">
                                <thead className="sticky top-0 z-10 bg-surface-container shadow-sm">
                                    <tr className="text-xs font-bold uppercase tracking-wider text-on-surface-variant border-b border-outline-variant">
                                        <th className="px-4 py-3 bg-surface-container">No Member</th>
                                        <th className="px-4 py-3 bg-surface-container">Nama Member</th>
                                        <th className="px-4 py-3 bg-surface-container">Jenis Kelamin</th>
                                        <th className="px-4 py-3 bg-surface-container">Telepon</th>
                                        <th className="px-4 py-3 bg-surface-container">Email</th>
                                        <th className="px-4 py-3 bg-surface-container">Alamat Lengkap</th>
                                        <th className="px-4 py-3 bg-surface-container">Tanggal Lahir</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant text-sm text-on-surface bg-white">
                                    {filteredMembers.map((member) => (
                                        <tr key={member.id} onClick={() => mode === "view" && initSelectMember(member)}
                                            className={`hover:bg-surface-container-low cursor-pointer transition-colors ${selectedMember?.id === member.id ? 'bg-apomacy-ice/30 font-medium' : ''} ${mode !== 'view' ? 'opacity-40 cursor-not-allowed' : ''}`}>
                                            <td className="px-4 py-3.5 text-apomacy-primary font-mono text-xs font-bold">{member.noMember}</td>
                                            <td className="px-4 py-3.5 font-semibold text-apomacy-dark text-[13px]">{member.name}</td>
                                            <td className="px-4 py-3.5">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${member.gender === 'Laki-laki' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'}`}>{member.gender}</span>
                                            </td>
                                            <td className="px-4 py-3.5 font-mono text-xs">{member.phone}</td>
                                            <td className="px-4 py-3.5 text-on-surface-variant text-[12px]">{member.email || "-"}</td>
                                            <td className="px-4 py-3.5 text-on-surface-variant text-[12px] truncate max-w-[200px]">{member.address}</td>
                                            <td className="px-4 py-3.5 font-mono text-xs">{member.birthDate}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="flex justify-between mt-6 border-t border-outline-variant pt-4 shrink-0">
                    <div className="flex gap-3">
                        <button type="button" onClick={handleAddClick} disabled={mode !== "view"} 
                            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all border ${
                                mode !== "view" ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" : "bg-apomacy-primary text-white border-apomacy-primary shadow-sm hover:bg-apomacy-dark"
                            }`}>
                            <Plus size={16} /> Tambah
                        </button>
                        <button type="button" onClick={handleEditClick} disabled={!selectedMember || mode !== "view"} 
                            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all border ${
                                !selectedMember || mode !== "view" ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" : "bg-apomacy-dark text-white border-apomacy-dark shadow-sm hover:bg-apomacy-primary"
                            }`}>
                            <Edit2 size={16} /> Edit
                        </button>
                        <button type="button" onClick={handleDeleteClick} disabled={!selectedMember || mode !== "view"} 
                            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all border ${
                                !selectedMember || mode !== "view" ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" : "bg-white text-error border-outline-variant hover:bg-error-container/20"
                            }`}>
                            <Trash2 size={16} /> Hapus
                        </button>
                    </div>
                    <button type="button" onClick={fetchMembers} disabled={mode !== "view"} 
                        className={`flex items-center justify-center rounded-full border w-10 h-10 transition-colors ${
                            mode !== "view" ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" : "bg-white border-outline-variant text-apomacy-dark hover:bg-surface-container-low"
                        }`}>
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* PANEL FORM INPUT */}
            <form onSubmit={handleSaveSubmit} className="lg:col-span-1 bg-white rounded-2xl border border-outline-variant p-6 shadow-sm flex flex-col justify-between w-full">
                <div className="flex flex-col flex-1 min-h-0">
                    <div className="flex items-center gap-2.5 border-b border-outline-variant pb-4 mb-5 shrink-0">
                        <div className="p-2 bg-apomacy-ice rounded-xl text-apomacy-primary"><User size={20} /></div>
                        <div>
                            <h2 className="text-lg font-bold text-apomacy-dark">{mode === "add" ? "Tambah Member" : mode === "edit" ? "Edit Member" : "Detail Member"}</h2>
                            <p className="text-xs text-on-surface-variant">Kelola data informasi pelanggan</p>
                        </div>
                    </div>

                    <div className="space-y-4 overflow-y-auto flex-1 pr-1 scrollbar-hide min-h-0">
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">ID Member</label>
                            <input type="text" value={formData.noMember} disabled className="w-full rounded-xl py-2.5 px-4 text-sm font-mono font-bold bg-gray-100 text-gray-500 border border-gray-200 outline-none cursor-not-allowed" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Nama</label>
                            <input type="text" required value={formData.name} disabled={mode === "view"} onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                                className={`w-full rounded-xl py-2.5 px-4 text-sm font-bold border outline-none transition-all ${mode === "view" ? "bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed" : "bg-white text-apomacy-dark border-outline focus:border-apomacy-primary"}`} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Telepon</label>
                            <input type="text" required value={formData.phone} disabled={mode === "view"} onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/[^0-9+\-]/g, "") })} 
                                className={`w-full rounded-xl py-2.5 px-4 text-sm font-bold border outline-none transition-all ${mode === "view" ? "bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed" : "bg-white text-apomacy-dark border-outline focus:border-apomacy-primary"}`} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Tanggal Lahir</label>
                            <input type="date" required value={formData.birthDate} disabled={mode === "view"} onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })} 
                                className={`w-full rounded-xl py-2.5 px-4 text-sm font-bold border outline-none transition-all ${mode === "view" ? "bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed" : "bg-white text-apomacy-dark border-outline focus:border-apomacy-primary"}`} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Email</label>
                            <input type="email" value={formData.email} disabled={mode === "view"} onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                                className={`w-full rounded-xl py-2.5 px-4 text-sm font-bold border outline-none transition-all ${mode === "view" ? "bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed" : "bg-white text-apomacy-dark border-outline focus:border-apomacy-primary"}`} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Alamat Lengkap</label>
                            <textarea rows={3} required value={formData.address} disabled={mode === "view"} onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
                                className={`w-full rounded-xl py-2.5 px-4 text-sm font-bold border outline-none transition-all resize-none ${mode === "view" ? "bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed" : "bg-white text-apomacy-dark border-outline focus:border-apomacy-primary"}`} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">Gender</label>
                            <div className="flex gap-6">
                                <label className={`flex items-center gap-2 text-sm font-bold ${mode === "view" ? "text-gray-400 cursor-not-allowed" : "text-apomacy-dark cursor-pointer"}`}>
                                    <input type="radio" name="gender" value="Laki-laki" disabled={mode === "view"} checked={formData.gender === "Laki-laki"} onChange={() => setFormData({ ...formData, gender: "Laki-laki" })} className="h-4 w-4 text-apomacy-primary" />Laki-laki
                                </label>
                                <label className={`flex items-center gap-2 text-sm font-bold ${mode === "view" ? "text-gray-400 cursor-not-allowed" : "text-apomacy-dark cursor-pointer"}`}>
                                    <input type="radio" name="gender" value="Perempuan" disabled={mode === "view"} checked={formData.gender === "Perempuan"} onChange={() => setFormData({ ...formData, gender: "Perempuan" })} className="h-4 w-4 text-apomacy-primary" />Perempuan
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TOMBOL SIMPAN & BATAL FORM (DIPERBAIKI MENJADI SOLID BLUE) */}
                <div className="flex gap-3 mt-8 border-t border-outline-variant pt-4 shrink-0">
                    <button type="submit" disabled={mode === "view"} 
                        className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all border ${
                            mode === "view" ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" : "bg-apomacy-primary text-white shadow-sm hover:bg-apomacy-dark border-apomacy-primary"
                        }`}>
                        <Save size={16} /> Simpan
                    </button>
                    <button type="button" onClick={handleCancelClick} disabled={mode === "view"} 
                        className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all border ${
                            mode === "view" ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" : "bg-white text-apomacy-dark border-outline-variant hover:bg-surface-container-low"
                        }`}>
                        <XCircle size={16} /> Batal
                    </button>
                </div>
            </form>

            <ModalConfirm isOpen={confirmModal.isOpen} type={confirmModal.type} title={confirmModal.title} message={confirmModal.message} onConfirm={() => { confirmModal.action(); closeModal(); }} onCancel={closeModal} />
        </div>
    );
}