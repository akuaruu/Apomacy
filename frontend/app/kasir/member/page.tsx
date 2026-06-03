"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { 
    Search, Plus, Edit2, Trash2, Save, XCircle, Loader2, User,
} from "lucide-react";
import ModalConfirm from "@/components/shared/ModalConfirm";

interface Member {
    id: number;
    name: string;
    gender: string;
    phone: string;
    email: string;
    address: string;
    birthDate: string;
    joinDate: string;
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────────
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
        isOpen: false,
        type: "tambah",
        title: "",
        message: "",
        action: () => {},
    });

    const [formData, setFormData] = useState({
        id: "", name: "", phone: "", email: "", address: "", gender: "Laki-laki", birthDate: ""
    });

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                setLoading(true);
                const response = await axios.get("https://jsonplaceholder.typicode.com/users");
                const mappedMembers = response.data.map((user: any) => ({
                    id: user.id,
                    name: user.name,
                    gender: user.id % 2 === 0 ? "Perempuan" : "Laki-laki",
                    phone: user.phone.split(" ")[0],
                    email: user.email.toLowerCase(),
                    address: `${user.address.city}, ${user.address.street}`,
                    birthDate: `1995-0${(user.id % 9) + 1}-12`,
                    joinDate: "2026-01-10"
                }));
                setMembers(mappedMembers);
                if (mappedMembers.length > 0) initSelectMember(mappedMembers[0]);
            } catch (error) {
                console.error("Gagal mengambil data member:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMembers();
    }, []);

    const initSelectMember = (member: Member) => {
        setSelectedMember(member);
        setMode("view");
        setFormData({
            id: `MBR-${String(member.id).padStart(3, '0')}`,
            name: member.name, phone: member.phone, email: member.email,
            address: member.address, gender: member.gender, birthDate: member.birthDate
        });
    };

    const handleAddClick = () => {
        setMode("add");
        setSelectedMember(null);
        const nextId = members.length > 0 ? Math.max(...members.map(m => m.id)) + 1 : 1;
        setFormData({ id: `MBR-${String(nextId).padStart(3, '0')}`, name: "", phone: "", email: "", address: "", gender: "Laki-laki", birthDate: "2000-01-01" });
    };

    const handleEditClick = () => { if (selectedMember) setMode("edit"); };

    const handleCancelClick = () => {
        setMode("view");
        if (selectedMember) initSelectMember(selectedMember);
        else if (members.length > 0) initSelectMember(members[0]);
    };

    const handleDeleteClick = () => {
        if (!selectedMember) return;
        setConfirmModal({
            isOpen: true,
            type: "hapus",
            title: "Hapus Data Member",
            message: `Data member "${selectedMember.name}" akan dihapus secara permanen dari sistem. Tindakan ini tidak dapat dibatalkan.`,
            action: () => {
                const updated = members.filter(m => m.id !== selectedMember.id);
                setMembers(updated);
                setSelectedMember(null);
                setMode("view");
                if (updated.length > 0) initSelectMember(updated[0]);
                else setFormData({ id: "", name: "", phone: "", email: "", address: "", gender: "Laki-laki", birthDate: "" });
            },
        });
    };

    const handleSaveSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === "add") {
            setConfirmModal({
                isOpen: true,
                type: "tambah",
                title: "Tambah Member Baru",
                message: `Data member "${formData.name || "Member Baru"}" akan disimpan ke dalam sistem.`,
                action: () => {
                    const generateId = members.length > 0 ? Math.max(...members.map(m => m.id)) + 1 : 1;
                    const newMember: Member = {
                        id: generateId, name: formData.name, gender: formData.gender,
                        phone: formData.phone, email: formData.email, address: formData.address,
                        birthDate: formData.birthDate, joinDate: "2026-05-19"
                    };
                    setMembers([newMember, ...members]);
                    initSelectMember(newMember);
                },
            });
        } else if (mode === "edit" && selectedMember) {
            setConfirmModal({
                isOpen: true,
                type: "edit",
                title: "Simpan Perubahan Data",
                message: `Perubahan data member "${formData.name}" akan diperbarui di sistem.`,
                action: () => {
                    const updated = members.map(m =>
                        m.id === selectedMember.id ? { ...m, name: formData.name, gender: formData.gender, phone: formData.phone, email: formData.email, address: formData.address, birthDate: formData.birthDate } : m
                    );
                    setMembers(updated);
                    setMode("view");
                },
            });
        }
    };

    const closeModal = () => setConfirmModal({ ...confirmModal, isOpen: false });

    const filteredMembers = members.filter(member =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch w-full">

            {/* PANEL Data */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-outline-variant p-6 shadow-sm flex flex-col justify-between min-w-0">
                <div className="flex flex-col flex-1 min-h-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shrink-0">
                        <div>
                            <h2 className="text-xl font-bold text-apomacy-dark">Daftar Member</h2>
                            <p className="text-xs text-on-surface-variant mt-0.5">Status Panel: <span className="font-bold uppercase text-apomacy-primary">{mode}</span></p>
                        </div>
                        <form onSubmit={(e) => e.preventDefault()} className="relative w-full sm:w-72">
                            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
                            <input type="text" placeholder="Cari nama member..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full rounded-xl bg-surface-container-low py-2 pl-10 pr-4 text-sm text-on-surface border border-outline-variant outline-none focus:border-apomacy-primary transition-all" />
                        </form>
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
                                        <th className="px-4 py-3 bg-surface-container">Tanggal Daftar</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant text-sm text-on-surface bg-white">
                                    {filteredMembers.map((member) => (
                                        <tr key={member.id} onClick={() => mode === "view" && initSelectMember(member)}
                                            className={`hover:bg-surface-container-low cursor-pointer transition-colors ${selectedMember?.id === member.id ? 'bg-apomacy-ice/30 font-medium' : ''} ${mode !== 'view' ? 'opacity-40 cursor-not-allowed' : ''}`}>
                                            <td className="px-4 py-3.5 text-apomacy-primary font-mono text-xs font-bold">MBR-{String(member.id).padStart(3, '0')}</td>
                                            <td className="px-4 py-3.5 font-semibold text-apomacy-dark text-[13px]">{member.name}</td>
                                            <td className="px-4 py-3.5">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${member.gender === 'Laki-laki' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'}`}>{member.gender}</span>
                                            </td>
                                            <td className="px-4 py-3.5 font-mono text-xs">{member.phone}</td>
                                            <td className="px-4 py-3.5 text-on-surface-variant text-[12px]">{member.email}</td>
                                            <td className="px-4 py-3.5 text-on-surface-variant text-[12px]">{member.address}</td>
                                            <td className="px-4 py-3.5 font-mono text-xs">{member.birthDate}</td>
                                            <td className="px-4 py-3.5 font-mono text-xs text-on-surface-variant">{member.joinDate}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 mt-6 border-t border-outline-variant pt-4 shrink-0">
                    <button type="button" onClick={handleAddClick} disabled={mode !== "view"} className="flex items-center gap-2 rounded-xl bg-apomacy-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-apomacy-dark transition-all disabled:opacity-50"><Plus size={16} /> Tambah</button>
                    <button type="button" onClick={handleEditClick} disabled={!selectedMember || mode !== "view"} className="flex items-center gap-2 rounded-xl bg-white border border-outline px-5 py-2.5 text-sm font-bold text-on-surface hover:bg-surface-container-low transition-all disabled:opacity-50"><Edit2 size={16} className="text-apomacy-teal" /> Edit</button>
                    <button type="button" onClick={handleDeleteClick} disabled={!selectedMember || mode !== "view"} className="flex items-center gap-2 rounded-xl bg-white border border-error/30 px-5 py-2.5 text-sm font-bold text-error hover:bg-error-container/20 transition-all disabled:opacity-50"><Trash2 size={16} /> Hapus</button>
                </div>
            </div>

            {/* PANEL INPUT*/}
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
                        <div><label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">ID Member</label><input type="text" value={formData.id} disabled className="w-full rounded-xl bg-surface-container py-2.5 px-4 text-sm font-mono text-on-surface-variant border border-outline-variant outline-none cursor-not-allowed" /></div>
                        <div><label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Nama</label><input type="text" required value={formData.name} disabled={mode === "view"} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-xl bg-surface-container-lowest py-2.5 px-4 text-sm text-on-surface border border-outline outline-none focus:border-apomacy-primary disabled:bg-surface-container-low transition-all" /></div>
                        <div><label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Telepon</label><input type="text" required value={formData.phone} disabled={mode === "view"} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full rounded-xl bg-surface-container-lowest py-2.5 px-4 text-sm text-on-surface border border-outline outline-none focus:border-apomacy-primary disabled:bg-surface-container-low transition-all" /></div>
                        <div><label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Tanggal Lahir</label><input type="date" required value={formData.birthDate} disabled={mode === "view"} onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })} className="w-full rounded-xl bg-surface-container-lowest py-2.5 px-4 text-sm text-on-surface border border-outline outline-none focus:border-apomacy-primary disabled:bg-surface-container-low transition-all" /></div>
                        <div><label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Email</label><input type="email" required value={formData.email} disabled={mode === "view"} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full rounded-xl bg-surface-container-lowest py-2.5 px-4 text-sm text-on-surface border border-outline outline-none focus:border-apomacy-primary disabled:bg-surface-container-low transition-all" /></div>
                        <div><label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Alamat Lengkap</label><textarea rows={3} required value={formData.address} disabled={mode === "view"} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full rounded-xl bg-surface-container-lowest py-2.5 px-4 text-sm text-on-surface border border-outline outline-none focus:border-apomacy-primary disabled:bg-surface-container-low transition-all resize-none" /></div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Gender</label>
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 text-sm font-semibold text-on-surface cursor-pointer"><input type="radio" name="gender" value="Laki-laki" disabled={mode === "view"} checked={formData.gender === "Laki-laki"} onChange={() => setFormData({ ...formData, gender: "Laki-laki" })} className="h-4 w-4 text-apomacy-primary border-outline" />Laki-laki</label>
                                <label className="flex items-center gap-2 text-sm font-semibold text-on-surface cursor-pointer"><input type="radio" name="gender" value="Perempuan" disabled={mode === "view"} checked={formData.gender === "Perempuan"} onChange={() => setFormData({ ...formData, gender: "Perempuan" })} className="h-4 w-4 text-apomacy-primary border-outline" />Perempuan</label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-8 border-t border-outline-variant pt-4 shrink-0">
                    <button type="submit" disabled={mode === "view"} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-apomacy-primary py-2.5 text-sm font-bold text-white shadow-sm hover:bg-apomacy-dark transition-all disabled:opacity-50"><Save size={16} /> Simpan</button>
                    <button type="button" onClick={handleCancelClick} disabled={mode === "view"} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white border border-outline py-2.5 text-sm font-bold text-on-surface hover:bg-surface-container-low transition-all disabled:opacity-50"><XCircle size={16} className="text-on-surface-variant" /> Batal</button>
                </div>
            </form>

            {/* MODAL KONFIRMASI  */}
            <ModalConfirm
                isOpen={confirmModal.isOpen}
                type={confirmModal.type}
                title={confirmModal.title}
                message={confirmModal.message}
                onConfirm={() => {
                    confirmModal.action();
                    closeModal();
                }}
                onCancel={closeModal}
            />
        </div>
    );
}
