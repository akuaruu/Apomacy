import Sidebar from "@/components/admin/Sidebar";
import TopHeader from "@/components/admin/TopHeader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-apomacy-bg flex">
            {/* Sidebar di sebelah kiri */}
            <Sidebar />

            {/* Area Kanan */}
            <div className="flex-1 flex flex-col pl-[260px]">
                {/* Header menempel di atas */}
                <TopHeader />

                {/* Konten Halaman (Dashboard, Data Obat, dll akan muncul di sini otomatis) */}
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}