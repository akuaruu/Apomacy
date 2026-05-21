"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { 
    Search, Plus, Edit2, Trash2, Save, XCircle, Loader2, Briefcase,
} from "lucide-react";
import ModalConfirm from "@/components/shared/ModalConfirm";

interface Karyawan {
    id: number;
    name: string;
    role: string;
    phone: string;
    email: string;
    address: string;
    status: string;
    joinDate: string;
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function KaryawanPage() {
    const [employees, setEmployees] = useState<Karyawan[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<Karyawan[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedEmp, setSelectedEmp] = useState<Karyawan | null>(null);
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
        id: "", name: "", role: "Apoteker", phone: "", email: "", address: "", status: "Aktif"
    });

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                setLoading(true);
                const response = await axios.get("https://jsonplaceholder.typicode.com/users");
                const rawData = [...response.data, ...response.data];
                const mappedData = rawData.map((user: any, index: number) => ({
                    id: index + 1,
                    name: user.name,
                    role: index % 3 === 0 ? "Apoteker" : index % 3 === 1 ? "Asisten Apoteker" : "Kasir",
                    phone: user.phone.split(" ")[0],
                    email: user.email.toLowerCase(),
                    address: `${user.address.city}, ${user.address.street}`,
                    status: index % 4 === 0 ? "Cuti" : "Aktif",
                    joinDate: "2025-08-12"
                }));
                setEmployees(mappedData);
                setFilteredEmployees(mappedData);
                if (mappedData.length > 0) initSelectEmployee(mappedData[0]);
            } catch (error) {
                console.error("Gagal memuat data karyawan:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEmployees();
    }, []);

    useEffect(() => {
        const query = searchQuery.toLowerCase();
        const filtered = employees.filter(emp =>
            emp.name.toLowerCase().includes(query) ||
            emp.role.toLowerCase().includes(query)
        );
        setFilteredEmployees(filtered);
    }, [searchQuery, employees]);

    const initSelectEmployee = (emp: Karyawan) => {
        setSelectedEmp(emp);
        setMode("view");
        setFormData({
            id: `KRY-${String(emp.id).padStart(3, '0')}`,
            name: emp.name, role: emp.role, phone: emp.phone,
            email: emp.email, address: emp.address, status: emp.status
        });
    };

    const handleAddClick = () => {
        setMode("add");
        setSelectedEmp(null);
        const nextId = employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1;
        setFormData({ id: `KRY-${String(nextId).padStart(3, '0')}`, name: "", role: "Kasir", phone: "", email: "", address: "", status: "Aktif" });
    };

    const handleEditClick = () => { if (selectedEmp) setMode("edit"); };

    const handleCancelClick = () => {
        setMode("view");
        if (selectedEmp) initSelectEmployee(selectedEmp);
        else if (employees.length > 0) initSelectEmployee(employees[0]);
    };

    const handleDeleteClick = () => {
        if (!selectedEmp) return;
        setConfirmModal({
            isOpen: true,
            type: "hapus",
            title: "Hapus Data Karyawan",
            message: `Data karyawan "${selectedEmp.name}" akan dihapus secara permanen dari sistem. Tindakan ini tidak dapat dibatalkan.`,
            action: () => {
                const updated = employees.filter(e => e.id !== selectedEmp.id);
                setEmployees(updated);
                setSelectedEmp(null);
                setMode("view");
                if (updated.length > 0) initSelectEmployee(updated[0]);
            },
        });
    };

    const handleSaveSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === "add") {
            setConfirmModal({
                isOpen: true,
                type: "tambah",
                title: "Tambah Karyawan Baru",
                message: `Data karyawan "${formData.name || "Karyawan Baru"}" akan disimpan ke dalam sistem.`,
                action: () => {
                    const generateId = employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1;
                    const newEmp: Karyawan = {
                        id: generateId, name: formData.name, role: formData.role,
                        phone: formData.phone, email: formData.email, address: formData.address,
                        status: formData.status, joinDate: "2026-05-19"
                    };
                    setEmployees([newEmp, ...employees]);
                    initSelectEmployee(newEmp);
                },
            });
        } else if (mode === "edit" && selectedEmp) {
            setConfirmModal({
                isOpen: true,
                type: "edit",
                title: "Simpan Perubahan Data",
                message: `Perubahan data karyawan "${formData.name}" akan diperbarui di sistem.`,
                action: () => {
                    const updated = employees.map(e =>
                        e.id === selectedEmp.id ? { ...e, ...formData, id: e.id, joinDate: e.joinDate } : e
                    );
                    setEmployees(updated);
                    setMode("view");
                },
            });
        }
    };

    const closeModal = () => setConfirmModal({ ...confirmModal, isOpen: false });

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch w-full">

            {/* PANEL KIRI */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-outline-variant p-6 shadow-sm flex flex-col justify-between min-w-0">
                <div className="flex flex-col flex-1 min-h-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shrink-0">
                        <div>
                            <h2 className="text-xl font-bold text-apomacy-dark">Manajemen Karyawan</h2>
                            <p className="text-xs text-on-surface-variant mt-0.5">Status Panel: <span className="font-bold uppercase text-apomacy-primary">{mode}</span></p>
                        </div>
                        <form onSubmit={(e) => e.preventDefault()} className="relative w-full sm:w-72">
                            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
                            <input type="text" placeholder="Cari nama atau jabatan..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full rounded-xl bg-surface-container-low py-2 pl-10 pr-4 text-sm text-on-surface border border-outline-variant outline-none focus:border-apomacy-primary transition-all" />
                        </form>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3 text-apomacy-primary flex-1 bg-white rounded-xl border border-outline-variant h-[545px]">
                            <Loader2 className="h-10 w-10 animate-spin" />
                            <p className="text-sm font-medium animate-pulse">Memuat data staf...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-hidden overflow-y-auto h-[545px] rounded-xl border border-outline-variant shadow-sm bg-white pr-2">
                            <table className="w-full text-left border-collapse">
                                <thead className="sticky top-0 z-10 bg-surface-container shadow-sm">
                                    <tr className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant border-b border-outline-variant">
                                        <th className="px-3 py-3 bg-surface-container">ID Staf</th>
                                        <th className="px-3 py-3 bg-surface-container w-[140px]">Nama Karyawan</th>
                                        <th className="px-3 py-3 bg-surface-container w-[120px]">Jabatan</th>
                                        <th className="px-3 py-3 bg-surface-container">Telepon</th>
                                        <th className="px-3 py-3 bg-surface-container">Alamat Tinggal</th>
                                        <th className="px-3 py-3 bg-surface-container">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant text-sm text-on-surface bg-white">
                                    {filteredEmployees.map((emp) => (
                                        <tr key={emp.id} onClick={() => mode === "view" && initSelectEmployee(emp)}
                                            className={`hover:bg-surface-container-low cursor-pointer transition-colors ${selectedEmp?.id === emp.id ? 'bg-apomacy-ice/30 font-medium' : ''} ${mode !== 'view' ? 'opacity-40 cursor-not-allowed' : ''}`}>
                                            <td className="px-3 py-3.5 text-apomacy-primary font-mono text-[11px] font-bold whitespace-nowrap">KRY-{String(emp.id).padStart(3, '0')}</td>
                                            <td className="px-3 py-3.5 font-semibold text-apomacy-dark text-[12px] leading-tight">{emp.name}</td>
                                            <td className="px-3 py-3.5 text-on-surface-variant text-[12px] whitespace-nowrap">{emp.role}</td>
                                            <td className="px-3 py-3.5 font-mono text-[12px] whitespace-nowrap">{emp.phone}</td>
                                            <td className="px-3 py-3.5 text-on-surface-variant text-[12px] leading-tight max-w-[200px] truncate">{emp.address}</td>
                                            <td className="px-3 py-3.5 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${emp.status === 'Aktif' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{emp.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="flex gap-3 mt-6 border-t border-outline-variant pt-4 shrink-0">
                    <button type="button" onClick={handleAddClick} disabled={mode !== "view"} className="flex items-center gap-2 rounded-xl bg-apomacy-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-apomacy-dark transition-all disabled:opacity-50"><Plus size={16} /> Tambah</button>
                    <button type="button" onClick={handleEditClick} disabled={!selectedEmp || mode !== "view"} className="flex items-center gap-2 rounded-xl bg-white border border-outline px-5 py-2.5 text-sm font-bold text-on-surface hover:bg-surface-container-low transition-all disabled:opacity-50"><Edit2 size={16} className="text-apomacy-teal" /> Edit</button>
                    <button type="button" onClick={handleDeleteClick} disabled={!selectedEmp || mode !== "view"} className="flex items-center gap-2 rounded-xl bg-white border border-error/30 px-5 py-2.5 text-sm font-bold text-error hover:bg-error-container/20 transition-all disabled:opacity-50"><Trash2 size={16} /> Hapus</button>
                </div>
            </div>

            {/* PANEL KANAN */}
            <form onSubmit={handleSaveSubmit} className="lg:col-span-1 bg-white rounded-2xl border border-outline-variant p-6 shadow-sm flex flex-col justify-between w-full">
                <div className="flex flex-col flex-1 min-h-0">
                    <div className="flex items-center gap-2.5 border-b border-outline-variant pb-4 mb-5 shrink-0">
                        <div className="p-2 bg-apomacy-ice rounded-xl text-apomacy-primary"><Briefcase size={20} /></div>
                        <div>
                            <h2 className="text-lg font-bold text-apomacy-dark">{mode === "add" ? "Pendaftaran Staf" : mode === "edit" ? "Edit Data Staf" : "Detail Staf"}</h2>
                            <p className="text-xs text-on-surface-variant">Parameter data internal apotek</p>
                        </div>
                    </div>

                    <div className="space-y-4 overflow-y-auto flex-1 pr-1 scrollbar-hide min-h-0">
                        <div><label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">ID Karyawan</label><input type="text" value={formData.id} disabled className="w-full rounded-xl bg-surface-container py-2.5 px-4 text-sm font-mono text-on-surface-variant border border-outline-variant outline-none cursor-not-allowed" /></div>
                        <div><label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Nama Lengkap</label><input type="text" required value={formData.name} disabled={mode === "view"} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-xl bg-surface-container-lowest py-2.5 px-4 text-sm text-on-surface border border-outline outline-none focus:border-apomacy-primary disabled:bg-surface-container-low transition-all" /></div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Jabatan / Otoritas</label>
                            <select value={formData.role} disabled={mode === "view"} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full rounded-xl bg-surface-container-lowest py-2.5 px-4 text-sm text-on-surface border border-outline outline-none focus:border-apomacy-primary disabled:bg-surface-container-low transition-all">
                                <option value="Apoteker">Apoteker</option>
                                <option value="Asisten Apoteker">Asisten Apoteker</option>
                                <option value="Kasir">Kasir</option>
                            </select>
                        </div>
                        <div><label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">No. Telepon</label><input type="text" required value={formData.phone} disabled={mode === "view"} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full rounded-xl bg-surface-container-lowest py-2.5 px-4 text-sm text-on-surface border border-outline outline-none focus:border-apomacy-primary disabled:bg-surface-container-low transition-all" /></div>
                        <div><label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Email Staf</label><input type="email" required value={formData.email} disabled={mode === "view"} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full rounded-xl bg-surface-container-lowest py-2.5 px-4 text-sm text-on-surface border border-outline outline-none focus:border-apomacy-primary disabled:bg-surface-container-low transition-all" /></div>
                        <div><label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Alamat Tinggal</label><textarea rows={3} required value={formData.address} disabled={mode === "view"} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full rounded-xl bg-surface-container-lowest py-2.5 px-4 text-sm text-on-surface border border-outline outline-none focus:border-apomacy-primary disabled:bg-surface-container-low transition-all resize-none" /></div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Status Kontrak</label>
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 text-sm font-semibold text-on-surface cursor-pointer"><input type="radio" name="status" value="Aktif" disabled={mode === "view"} checked={formData.status === "Aktif"} onChange={() => setFormData({ ...formData, status: "Aktif" })} className="h-4 w-4 text-apomacy-primary border-outline" />Aktif</label>
                                <label className="flex items-center gap-2 text-sm font-semibold text-on-surface cursor-pointer"><input type="radio" name="status" value="Cuti" disabled={mode === "view"} checked={formData.status === "Cuti"} onChange={() => setFormData({ ...formData, status: "Cuti" })} className="h-4 w-4 text-apomacy-primary border-outline" />Cuti</label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-8 border-t border-outline-variant pt-4 shrink-0">
                    <button type="submit" disabled={mode === "view"} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-apomacy-primary py-2.5 text-sm font-bold text-white shadow-sm hover:bg-apomacy-dark transition-all disabled:opacity-50"><Save size={16} /> Simpan</button>
                    <button type="button" onClick={handleCancelClick} disabled={mode === "view"} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white border border-outline py-2.5 text-sm font-bold text-on-surface hover:bg-surface-container-low transition-all disabled:opacity-50"><XCircle size={16} className="text-on-surface-variant" /> Batal</button>
                </div>
            </form>

            {/* MODAL KONFIRMASI — menggunakan komponen global ModalConfirm */}
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
