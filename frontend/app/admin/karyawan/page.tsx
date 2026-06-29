"use client";

import { useState, useEffect } from "react";
import { 
    Search, Plus, Edit2, Trash2, Save, XCircle, Loader2, Briefcase, KeyRound, UserCircle
} from "lucide-react";
import ModalConfirm from "@/components/shared/ModalConfirm";
import api from "@/lib/api";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

interface Karyawan {
    id: number;
    userIdStr: string;
    username: string;
    name: string;
    role: string;
    phone: string;
    email: string;
    status: string;
}

export default function KaryawanPage() {
    const [employees, setEmployees] = useState<Karyawan[]>([]);
    const [filteredEmployees, setFilteredEmployees] = useState<Karyawan[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedEmp, setSelectedEmp] = useState<Karyawan | null>(null);
    const [mode, setMode] = useState<"view" | "add" | "edit">("view");

    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean; type: "tambah" | "edit" | "hapus"; title: string; message: string; action: () => void;
    }>({ isOpen: false, type: "tambah", title: "", message: "", action: () => {} });

    const [formData, setFormData] = useState({
        userIdStr: "", username: "", password: "", name: "", role: "Kasir", phone: "", email: "", status: "Aktif"
    });

    // --- BAGIAN YANG DIUBAH: Fungsi fetchEmployees ---
    // Mengambil Admin dari Token JWT & Profile API + Menggabungkannya dengan LocalStorage
    const fetchEmployees = async () => {
        try {
            setLoading(true);
            
            // 1. Ambil data karyawan tambahan dari Local Storage
            const savedDataStr = localStorage.getItem("apomacy_karyawan_data");
            let localEmployees: Karyawan[] = savedDataStr ? JSON.parse(savedDataStr) : [];

            // 2. Ambil data Admin yang sedang login saat ini
            const token = Cookies.get("apomacy_token"); 
            if (token) {
                const decoded: any = jwtDecode(token);
                // Di user_usecase.go, payload JWT berisi id_user, role, dan nama
                const adminId = decoded.id_user || decoded.id; 
                const adminRole = decoded.role || decoded.Role || "Admin";
                const adminUsername = decoded.username || `admin_${adminId}`;

                try {
                    // Tembak endpoint yang benar-benar ada di backend untuk ambil data profilnya
                    const profileRes = await api.get("/users/profile");
                    const profileData = profileRes.data?.data || {};

                    const adminData: Karyawan = {
                        id: adminId,
                        userIdStr: `KRY-${String(adminId).padStart(3, '0')}`,
                        username: adminUsername,
                        name: profileData.nama || decoded.nama || "Admin",
                        role: adminRole,
                        phone: profileData.telepon || "-",
                        email: profileData.email || "-",
                        status: "Aktif"
                    };

                    // Mencegah duplikasi data admin di tabel
                    const isAdminExist = localEmployees.find(e => e.id === adminId);
                    if (!isAdminExist) {
                        localEmployees = [adminData, ...localEmployees];
                    } else {
                        // Update data admin di local storage jika ada perubahan profil
                        localEmployees = localEmployees.map(e => e.id === adminId ? adminData : e);
                    }
                } catch (profileErr) {
                    console.log("Admin profile fetch terlewati (Mungkin belum diset)", profileErr);
                }
            }

            setEmployees(localEmployees);
            setFilteredEmployees(localEmployees);
        } catch (error) {
            console.error("Gagal memuat data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    // Menyimpan data tambahan ke Local Storage
    const saveToLocalStorage = (data: Karyawan[]) => {
        setEmployees(data);
        localStorage.setItem("apomacy_karyawan_data", JSON.stringify(data));
    };

    useEffect(() => {
        const query = searchQuery.toLowerCase();
        const filtered = employees.filter(emp =>
            emp.name.toLowerCase().includes(query) ||
            emp.role.toLowerCase().includes(query) ||
            emp.userIdStr.toLowerCase().includes(query)
        );
        setFilteredEmployees(filtered);
    }, [searchQuery, employees]);

    const initSelectEmployee = (emp: Karyawan) => {
        setSelectedEmp(emp);
        setMode("view");
        setFormData({
            userIdStr: emp.userIdStr, username: emp.username, password: "", 
            name: emp.name, role: emp.role, phone: emp.phone, email: emp.email, status: emp.status
        });
    };

    const handleAddClick = () => {
        setMode("add");
        setSelectedEmp(null);
        setFormData({ 
            userIdStr: "Otomatis dari Sistem", username: "", password: "", 
            name: "", role: "Kasir", phone: "", email: "", status: "Aktif" 
        });
    };

    const handleEditClick = () => { if (selectedEmp) setMode("edit"); };

    const handleCancelClick = () => {
        setMode("view");
        if (selectedEmp) initSelectEmployee(selectedEmp);
        else {
            setSelectedEmp(null);
            setFormData({ userIdStr: "", username: "", password: "", name: "", role: "Kasir", phone: "", email: "", status: "Aktif" });
        }
    };

    const handleDeleteClick = () => {
        if (!selectedEmp) return;
        setConfirmModal({
            isOpen: true, type: "hapus", title: "Hapus Data Karyawan",
            message: `Data akun karyawan "${selectedEmp.name}" akan dihapus dari layar.`,
            action: () => {
                const updated = employees.filter(e => e.id !== selectedEmp.id);
                saveToLocalStorage(updated);
                setSelectedEmp(null);
                setMode("view");
            },
        });
    };

    const handleSaveSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.username.trim()) { alert("Username wajib diisi!"); return; }

        const actionText = mode === "add" ? "didaftarkan" : "diperbarui";

        setConfirmModal({
            isOpen: true, type: mode === "add" ? "tambah" : "edit",
            title: mode === "add" ? "Tambah Karyawan Baru" : "Simpan Perubahan",
            message: `Data karyawan "${formData.name}" akan ${actionText} ke sistem.`,
            action: async () => {
                try {
                    if (mode === "add") {
                        if (!formData.password) { alert("Password wajib diisi!"); return; }
                        
                        // KONEKSI ASLI KE BACKEND: Mengirim data registrasi karyawan ke Supabase
                        const addPayload = {
                            nama_lengkap: formData.name,
                            email: formData.email || "karyawan@apotek.com", 
                            username: formData.username,
                            no_telp: formData.phone || "-", 
                            password: formData.password
                        };
                        await api.post("/users/register", addPayload);

                        // --- BAGIAN YANG DIUBAH: Pembuatan ID Karyawan Baru ---
                        // Karena API tidak mereturn ID baru, kita membuat simulasi ID untuk tabel
                        const token = Cookies.get("apomacy_token"); 
                        const adminId = token ? (jwtDecode<any>(token).id_user || 1) : 1;
                        
                        // Pastikan ID baru tidak bentrok dengan ID Admin atau ID lain
                        const maxId = employees.length > 0 ? Math.max(...employees.map(e => e.id)) : adminId;
                        const newId = maxId + 1;
                        
                        const newEmp: Karyawan = {
                            id: newId,
                            userIdStr: `KRY-${String(newId).padStart(3, '0')}`,
                            username: formData.username,
                            name: formData.name,
                            role: formData.role, // Tampilan layar tetap sesuai yang diinput
                            phone: formData.phone,
                            email: formData.email,
                            status: formData.status
                        };
                        
                        const updatedList = [newEmp, ...employees];
                        saveToLocalStorage(updatedList);
                        initSelectEmployee(newEmp);

                    } else if (mode === "edit" && selectedEmp) {
                        const updatedList = employees.map(emp => 
                            emp.id === selectedEmp.id ? { ...emp, ...formData, userIdStr: emp.userIdStr } : emp
                        );
                        saveToLocalStorage(updatedList);
                        
                        // Tembak Profile API (jika yang diedit adalah akun Admin sendiri)
                        const token = Cookies.get("apomacy_token"); 
                        if (token) {
                            const decoded: any = jwtDecode(token);
                            if (decoded.id_user === selectedEmp.id) {
                                await api.put(`/users/profile`, {
                                    nama_lengkap: formData.name,
                                    no_telp: formData.phone || "-",
                                    email: formData.email || "karyawan@apotek.com",
                                }).catch(() => console.log("Skip update DB, API bermasalah"));
                            }
                        }
                        
                        setMode("view");
                    }
                    
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                } catch (error) {
                    console.error("Error Backend:", error);
                    alert("Gagal memproses data! Pastikan Username belum terpakai.");
                }
            },
        });
    };

    const closeModal = () => setConfirmModal({ ...confirmModal, isOpen: false });

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch w-full">
            {/* PANEL KIRI: DATA KARYAWAN */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-outline-variant p-4 md:p-6 shadow-sm flex flex-col justify-between min-w-0 w-full h-[calc(100vh-90px)]">
                <div className="flex flex-col flex-1 min-h-0 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shrink-0 w-full">
                        <div>
                            <h2 className="text-lg md:text-xl font-bold text-apomacy-dark">Manajemen Karyawan</h2>
                            <p className="text-[11px] md:text-xs text-on-surface-variant mt-0.5">Mode Hybrid (Database + Profil Admin)</p>
                        </div>
                        <form onSubmit={(e) => e.preventDefault()} className="relative w-full sm:w-72 shrink-0">
                            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
                            <input type="text" placeholder="Cari ID, Nama, Jabatan..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full rounded-xl bg-surface-container-low py-2 pl-10 pr-4 text-sm text-on-surface border border-outline-variant outline-none focus:border-apomacy-primary transition-all" />
                        </form>
                    </div>

                    <div className="flex-1 overflow-auto rounded-xl border border-outline-variant shadow-sm bg-white scrollbar-thin scrollbar-thumb-gray-300 relative min-h-0">
                        {loading ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-apomacy-primary bg-white/80 z-10">
                                <Loader2 className="h-10 w-10 animate-spin" />
                                <p className="text-sm font-medium animate-pulse">Menyiapkan data profil...</p>
                            </div>
                        ) : filteredEmployees.length === 0 ? (
                             <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2 min-h-[300px]">
                                 <Search size={40} className="opacity-20" />
                                 <span className="text-sm font-medium">Tabel kosong. Silakan tambah karyawan baru.</span>
                             </div>
                        ) : (
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead className="sticky top-0 z-10 bg-surface-container-lowest shadow-sm">
                                    <tr className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant border-b border-outline-variant">
                                        <th className="px-4 py-3 whitespace-nowrap w-24">ID Staf</th>
                                        <th className="px-4 py-3 whitespace-nowrap w-48">Nama Karyawan</th>
                                        <th className="px-4 py-3 whitespace-nowrap w-32">Username</th>
                                        <th className="px-4 py-3 whitespace-nowrap w-32">Jabatan</th>
                                        <th className="px-4 py-3 whitespace-nowrap w-32">Telepon</th>
                                        <th className="px-4 py-3 whitespace-nowrap text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm text-on-surface bg-white">
                                    {filteredEmployees.map((emp) => (
                                        <tr key={emp.id} onClick={() => { setMode("view"); initSelectEmployee(emp); }}
                                            className={`hover:bg-blue-50/50 cursor-pointer transition-colors ${selectedEmp?.id === emp.id ? 'bg-blue-50 border-l-4 border-l-apomacy-primary' : 'border-l-4 border-l-transparent'}`}>
                                            <td className="px-4 py-3.5"><span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">{emp.userIdStr}</span></td>
                                            <td className="px-4 py-3.5 font-semibold text-apomacy-dark text-[13px] whitespace-nowrap truncate max-w-[200px]">{emp.name}</td>
                                            <td className="px-4 py-3.5 font-mono text-[12px] text-gray-500 whitespace-nowrap">@{emp.username}</td>
                                            <td className="px-4 py-3.5 text-on-surface-variant text-[12px] whitespace-nowrap font-medium">{emp.role}</td>
                                            <td className="px-4 py-3.5 font-mono text-[12px] whitespace-nowrap">{emp.phone}</td>
                                            <td className="px-4 py-3.5 whitespace-nowrap text-center">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide border ${emp.status === 'Aktif' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : emp.status === 'Cuti' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
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
                            <p className="text-xs text-on-surface-variant">Data masuk ke Supabase Database</p>
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
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">ID Karyawan</label>
                                    <input type="text" value={formData.userIdStr} disabled className="w-full rounded-xl bg-gray-100 py-2.5 px-4 text-sm font-mono font-medium text-gray-500 border border-gray-200 outline-none cursor-not-allowed" />
                                </div>
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
                                            <option value="Cuti">Cuti</option>
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