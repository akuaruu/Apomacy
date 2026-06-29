"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    Search, Plus, Edit2, Trash2, Save, XCircle, Loader2, Briefcase, KeyRound,
    UserCircle, RefreshCw, ShieldCheck, ShieldAlert, AlertTriangle
} from "lucide-react";
import ModalConfirm from "@/components/shared/ModalConfirm";
import api from "@/lib/api";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

interface Karyawan {
    id: number;
    username: string;
    name: string;
    role: string;
    phone: string;
    email: string;
    status: string;
}

export default function KaryawanPage() {
    const router = useRouter();
    const [employees, setEmployees] = useState<Karyawan[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedEmp, setSelectedEmp] = useState<Karyawan | null>(null);
    const [mode, setMode] = useState<"view" | "add" | "edit">("view");
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [roleChecked, setRoleChecked] = useState<boolean>(false);

    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean; type: "tambah" | "edit" | "hapus"; title: string; message: string; action: () => void;
    }>({ isOpen: false, type: "tambah", title: "", message: "", action: () => {} });

    const [formData, setFormData] = useState({
        username: "", password: "", name: "", role: "Kasir", phone: "", email: "", status: "Aktif"
    });

    // Cek role user dari JWT token
    useEffect(() => {
        const token = Cookies.get("apomacy_token");
        if (!token) {
            router.replace("/login");
            return;
        }

        try {
            const decoded: any = jwtDecode(token);
            const role = (decoded.role || decoded.Role || "").toLowerCase();
            if (role.includes("admin")) {
                setIsAdmin(true);
            }
        } catch (error) {
            console.error("Gagal membaca token:", error);
        }
        setRoleChecked(true);
    }, [router]);

    // Fetch data karyawan dari backend
    const fetchEmployees = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/users/staff');
            const rawData = response.data?.data || [];

            const mappedData: Karyawan[] = rawData.map((item: any) => ({
                id: item.id_user,
                username: item.username,
                name: item.nama_lengkap,
                role: item.role,
                phone: item.no_telp || "-",
                email: item.email || "-",
                status: item.status || "Aktif"
            }));

            setEmployees(mappedData);
        } catch (err: any) {
            if (err.response?.status === 403 || err.response?.status === 401) {
                setError("Anda tidak memiliki akses ke halaman ini.");
            } else {
                setError("Gagal memuat data karyawan. Pastikan backend sudah berjalan.");
            }
            console.error("Gagal mengambil data karyawan:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (roleChecked && isAdmin) {
            fetchEmployees();
        }
    }, [roleChecked, isAdmin]);

    const filteredEmployees = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return employees.filter(emp =>
            emp.name.toLowerCase().includes(q) ||
            emp.role.toLowerCase().includes(q) ||
            emp.username.toLowerCase().includes(q) ||
            emp.email.toLowerCase().includes(q)
        );
    }, [employees, searchQuery]);

    const initSelectEmployee = (emp: Karyawan) => {
        setSelectedEmp(emp);
        setMode("view");
        setFormData({
            username: emp.username, password: "",
            name: emp.name, role: emp.role, phone: emp.phone, email: emp.email, status: emp.status
        });
    };

    const handleAddClick = () => {
        setMode("add");
        setSelectedEmp(null);
        setFormData({
            username: "", password: "",
            name: "", role: "Kasir", phone: "", email: "", status: "Aktif"
        });
    };

    const handleEditClick = () => { if (selectedEmp) setMode("edit"); };

    const handleCancelClick = () => {
        setMode("view");
        if (selectedEmp) initSelectEmployee(selectedEmp);
        else {
            setSelectedEmp(null);
            setFormData({ username: "", password: "", name: "", role: "Kasir", phone: "", email: "", status: "Aktif" });
        }
    };

    const handleDeleteClick = () => {
        if (!selectedEmp) return;
        setConfirmModal({
            isOpen: true, type: "hapus", title: "Hapus Data Karyawan",
            message: `Data akun karyawan "${selectedEmp.name}" akan dihapus secara permanen dari database.`,
            action: async () => {
                try {
                    await api.delete(`/users/staff/${selectedEmp.id}`);
                    await fetchEmployees();
                    setSelectedEmp(null);
                    setMode("view");
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                } catch (error: any) {
                    console.error("Gagal menghapus:", error);
                    alert("Gagal menghapus karyawan: " + (error.response?.data?.error || error.message));
                }
            },
        });
    };

    const handleSaveSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) { alert("Nama wajib diisi!"); return; }

        const actionText = mode === "add" ? "didaftarkan" : "diperbarui";

        setConfirmModal({
            isOpen: true, type: mode === "add" ? "tambah" : "edit",
            title: mode === "add" ? "Tambah Karyawan Baru" : "Simpan Perubahan",
            message: `Data karyawan "${formData.name}" akan ${actionText} ke sistem.`,
            action: async () => {
                try {
                    if (mode === "add") {
                        if (!formData.username.trim()) { alert("Username wajib diisi!"); return; }
                        if (!formData.password || formData.password.length < 6) { alert("Password wajib diisi (minimal 6 karakter)!"); return; }

                        const addPayload = {
                            nama_lengkap: formData.name,
                            email: formData.email || "karyawan@apotek.com",
                            username: formData.username,
                            no_telp: formData.phone || "-",
                            password: formData.password
                        };
                        await api.post("/users/register", addPayload);
                        await fetchEmployees();
                        setMode("view");
                        setSelectedEmp(null);

                    } else if (mode === "edit" && selectedEmp) {
                        const editPayload = {
                            nama_lengkap: formData.name,
                            no_telp: formData.phone || "-",
                            email: formData.email || "-",
                            role: formData.role,
                            status: formData.status
                        };
                        await api.put(`/users/staff/${selectedEmp.id}`, editPayload);
                        await fetchEmployees();
                        setMode("view");
                    }

                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                } catch (error: any) {
                    console.error("Error Backend:", error);
                    alert("Gagal memproses data! " + (error.response?.data?.error || "Pastikan Username belum terpakai."));
                }
            },
        });
    };

    const closeModal = () => setConfirmModal({ ...confirmModal, isOpen: false });

    // Tampilkan loading saat cek role
    if (!roleChecked) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-apomacy-primary">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="text-sm font-bold animate-pulse">Memeriksa akses...</p>
                </div>
            </div>
        );
    }

    // Tampilkan pesan ditolak jika bukan Admin
    if (!isAdmin) {
        return (
            <div className="flex h-[80vh] items-center justify-center p-8">
                <div className="bg-discount-red/10 border border-discount-red text-discount-red p-8 rounded-2xl max-w-md text-center space-y-4">
                    <ShieldAlert size={48} className="mx-auto opacity-80" />
                    <h2 className="font-black text-lg">Akses Ditolak</h2>
                    <p className="text-sm font-medium">
                        Halaman Manajemen Karyawan hanya dapat diakses oleh <span className="font-bold">Admin</span>.
                        Silakan hubungi administrator jika Anda memerlukan akses.
                    </p>
                </div>
            </div>
        );
    }

    // Tampilkan error
    if (error) {
        return (
            <div className="flex h-[80vh] items-center justify-center p-8">
                <div className="bg-discount-red/10 border border-discount-red text-discount-red p-6 rounded-2xl max-w-md text-center space-y-3">
                    <AlertTriangle size={32} className="mx-auto" />
                    <h2 className="font-black text-lg">Gagal Memuat Data</h2>
                    <p className="text-sm font-medium">{error}</p>
                    <button onClick={fetchEmployees} className="mt-2 px-4 py-2 bg-apomacy-primary text-white rounded-xl text-sm font-bold hover:bg-apomacy-dark transition-colors">
                        Coba Lagi
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch w-full">
            {/* PANEL KIRI: DATA KARYAWAN */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-outline-variant p-4 md:p-6 shadow-sm flex flex-col justify-between min-w-0 w-full h-[calc(100vh-90px)]">
                <div className="flex flex-col flex-1 min-h-0 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shrink-0 w-full">
                        <div>
                            <h2 className="text-lg md:text-xl font-bold text-apomacy-dark flex items-center gap-2">
                                <Briefcase size={22} className="text-apomacy-primary" />
                                Manajemen Karyawan
                            </h2>
                            <p className="text-[11px] md:text-xs text-on-surface-variant mt-0.5">Data karyawan dari database sistem</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Badge Admin */}
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border bg-blue-50 text-blue-700 border-blue-200 shrink-0">
                                <ShieldCheck size={14} />
                                Admin · Akses Penuh
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mb-4 shrink-0">
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
                            <input type="text" placeholder="Cari nama, username, jabatan..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-xl bg-surface-container-low py-2 pl-10 pr-4 text-sm text-on-surface border border-outline-variant outline-none focus:border-apomacy-primary transition-all" />
                        </div>
                        <button onClick={fetchEmployees} title="Muat ulang data"
                            className="p-2 border border-outline-variant rounded-xl hover:bg-gray-50 text-gray-600 transition-colors shrink-0">
                            <RefreshCw size={18} className={loading ? "animate-spin text-apomacy-primary" : ""} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-auto rounded-xl border border-outline-variant shadow-sm bg-white scrollbar-thin scrollbar-thumb-gray-300 relative min-h-0">
                        {loading ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-apomacy-primary bg-white/80 z-10">
                                <Loader2 className="h-10 w-10 animate-spin" />
                                <p className="text-sm font-medium animate-pulse">Memuat data karyawan...</p>
                            </div>
                        ) : filteredEmployees.length === 0 ? (
                             <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2 min-h-[300px]">
                                 <Search size={40} className="opacity-20" />
                                 <span className="text-sm font-medium">
                                     {searchQuery ? "Tidak ditemukan karyawan yang cocok." : "Belum ada data karyawan."}
                                 </span>
                             </div>
                        ) : (
                            <table className="w-full text-left border-collapse min-w-[700px]">
                                <thead className="sticky top-0 z-10 bg-surface-container-lowest shadow-sm">
                                    <tr className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant border-b border-outline-variant">
                                        <th className="px-4 py-3 whitespace-nowrap w-12">No</th>
                                        <th className="px-4 py-3 whitespace-nowrap">Nama Karyawan</th>
                                        <th className="px-4 py-3 whitespace-nowrap w-32">Username</th>
                                        <th className="px-4 py-3 whitespace-nowrap w-24">Jabatan</th>
                                        <th className="px-4 py-3 whitespace-nowrap w-32">Telepon</th>
                                        <th className="px-4 py-3 whitespace-nowrap text-center w-20">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm text-on-surface bg-white">
                                    {filteredEmployees.map((emp, idx) => (
                                        <tr key={emp.id} onClick={() => { setMode("view"); initSelectEmployee(emp); }}
                                            className={`hover:bg-blue-50/50 cursor-pointer transition-colors ${selectedEmp?.id === emp.id ? 'bg-blue-50 border-l-4 border-l-apomacy-primary' : 'border-l-4 border-l-transparent'}`}>
                                            <td className="px-4 py-3.5 text-gray-400">{idx + 1}</td>
                                            <td className="px-4 py-3.5 font-semibold text-apomacy-dark text-[13px] whitespace-nowrap truncate max-w-[200px]">{emp.name}</td>
                                            <td className="px-4 py-3.5 font-mono text-[12px] text-gray-500 whitespace-nowrap">@{emp.username}</td>
                                            <td className="px-4 py-3.5 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide border ${
                                                    emp.role === 'Admin' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                }`}>
                                                    {emp.role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 font-mono text-[12px] whitespace-nowrap">{emp.phone}</td>
                                            <td className="px-4 py-3.5 whitespace-nowrap text-center">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide border ${emp.status === 'Aktif' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : emp.status === 'cuti' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                                    {emp.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                <div className="flex gap-3 mt-4 border-t border-outline-variant pt-4 shrink-0">
                    <button type="button" onClick={handleAddClick} disabled={mode !== "view"} className="flex items-center gap-2 rounded-xl bg-apomacy-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-apomacy-dark transition-all disabled:opacity-50"><Plus size={16} /> Tambah</button>
                    <button type="button" onClick={handleEditClick} disabled={!selectedEmp || mode !== "view"} className="flex items-center gap-2 rounded-xl bg-white border border-outline px-5 py-2.5 text-sm font-bold text-on-surface hover:bg-surface-container-low transition-all disabled:opacity-50"><Edit2 size={16} className="text-apomacy-teal" /> Edit</button>
                    <button type="button" onClick={handleDeleteClick} disabled={!selectedEmp || mode !== "view"} className="flex items-center gap-2 rounded-xl bg-white border border-error/30 px-5 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-all disabled:opacity-50"><Trash2 size={16} /> Hapus</button>
                </div>
            </div>

            {/* PANEL KANAN: FORM INPUT */}
            <form onSubmit={handleSaveSubmit} className="lg:col-span-1 bg-white rounded-2xl border border-outline-variant p-6 shadow-sm flex flex-col justify-between w-full h-[calc(100vh-90px)] min-h-0">
                <div className="flex flex-col flex-1 min-h-0">
                    <div className="flex items-center gap-2.5 border-b border-outline-variant pb-4 mb-5 shrink-0 bg-surface-container-lowest">
                        <div className="p-2 bg-apomacy-ice rounded-xl text-apomacy-primary"><Briefcase size={20} /></div>
                        <div>
                            <h2 className="text-lg font-bold text-apomacy-dark">{mode === "add" ? "Registrasi Akun Karyawan" : mode === "edit" ? "Edit Profil Akun" : "Detail Akun"}</h2>
                            <p className="text-xs text-on-surface-variant">Data tersimpan di database</p>
                        </div>
                    </div>

                    <div className="space-y-4 overflow-y-auto flex-1 pr-1 custom-scrollbar min-h-0 pb-4">
                        {!selectedEmp && mode === "view" ? (
                             <div className="flex-1 flex flex-col items-center justify-center h-full text-gray-400 gap-3 min-h-[300px]">
                                 <Briefcase size={48} className="opacity-20" />
                                 <p className="text-sm text-center">Pilih staf dari tabel untuk melihat detail profil,<br />atau klik tombol Tambah.</p>
                             </div>
                        ) : (
                            <>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Nama Lengkap</label>
                                    <input type="text" required value={formData.name} disabled={mode === "view"} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full rounded-xl bg-white py-2.5 px-4 text-sm text-apomacy-dark border border-outline outline-none focus:border-apomacy-primary disabled:bg-gray-50 disabled:text-gray-500 transition-all font-medium" />
                                </div>

                                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-4">
                                    <h3 className="text-xs font-black text-blue-800 uppercase flex items-center gap-1.5"><KeyRound size={14}/> Autentikasi Sistem</h3>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5"><UserCircle size={12}/> Username (Login)</label>
                                        <input type="text" required value={formData.username} disabled={mode === "view" || mode === "edit"} onChange={(e) => setFormData({ ...formData, username: e.target.value.replace(/\s/g, "") })} placeholder="contoh: budi_kasir"
                                            className="w-full rounded-xl bg-white py-2.5 px-4 text-sm font-mono text-apomacy-dark border border-outline outline-none focus:border-apomacy-primary disabled:bg-gray-50 disabled:text-gray-500 transition-all font-medium" />
                                    </div>
                                    {mode === "add" && (
                                        <div className="space-y-1">
                                            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5"><KeyRound size={12}/> Password (Login)</label>
                                            <input type="text" required minLength={6} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Minimal 6 karakter..."
                                                className="w-full rounded-xl bg-white py-2.5 px-4 text-sm text-apomacy-dark border border-outline outline-none focus:border-apomacy-primary transition-all font-medium" />
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Jabatan Sistem</label>
                                        <select value={formData.role} disabled={mode === "view"} onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full rounded-xl bg-white py-2.5 px-3 text-sm text-apomacy-dark border border-outline outline-none focus:border-apomacy-primary disabled:bg-gray-50 disabled:text-gray-500 transition-all font-medium">
                                            <option value="Admin">Admin</option>
                                            <option value="Kasir">Kasir</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Status Akun</label>
                                        <select value={formData.status} disabled={mode === "view"} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="w-full rounded-xl bg-white py-2.5 px-3 text-sm text-apomacy-dark border border-outline outline-none focus:border-apomacy-primary disabled:bg-gray-50 disabled:text-gray-500 transition-all font-medium">
                                            <option value="Aktif">Aktif</option>
                                            <option value="cuti">Cuti</option>
                                            <option value="Resign">Resign</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">No. Telepon</label>
                                    <input type="text" required value={formData.phone} disabled={mode === "view"} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="08xxxxxxxx"
                                        className="w-full rounded-xl bg-white py-2.5 px-4 text-sm text-apomacy-dark border border-outline outline-none focus:border-apomacy-primary disabled:bg-gray-50 disabled:text-gray-500 transition-all font-medium" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Email Staf</label>
                                    <input type="email" required value={formData.email} disabled={mode === "view"} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="nama@email.com"
                                        className="w-full rounded-xl bg-white py-2.5 px-4 text-sm text-apomacy-dark border border-outline outline-none focus:border-apomacy-primary disabled:bg-gray-50 disabled:text-gray-500 transition-all font-medium" />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex gap-3 mt-4 border-t border-outline-variant pt-4 shrink-0">
                    <button type="submit" disabled={mode === "view"} className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all border ${ mode === "view" ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" : "bg-apomacy-primary text-white shadow-sm hover:bg-apomacy-dark border-apomacy-primary" }`}><Save size={16} /> Simpan</button>
                    <button type="button" onClick={handleCancelClick} disabled={mode === "view"} className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all border ${ mode === "view" ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" : "bg-white text-apomacy-dark border-outline-variant hover:bg-surface-container-low" }`}><XCircle size={16} /> Batal</button>
                </div>
            </form>

            <ModalConfirm isOpen={confirmModal.isOpen} type={confirmModal.type} title={confirmModal.title} message={confirmModal.message} onConfirm={() => { confirmModal.action(); closeModal(); }} onCancel={closeModal} />
        </div>
    );
}