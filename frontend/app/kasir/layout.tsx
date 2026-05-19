import SidebarKasir from "@/components/kasir/SidebarKasir";
import TopHeader from "@/components/kasir/TopHeaderKasir";


export default function KasirLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-apomacy-bg flex">
            {/* 1. Sidebar di sebelah kiri */}
            <SidebarKasir />

            {/* 2. Area Kanan  */}
            <div className="flex-1 flex flex-col pl-[260px]">
                {/* Header menempel di atas */}
                <TopHeader />

                {/* 3. Konten Halaman Utama */}
                <main className="flex-1 p-6 md:p-8 pt-24">
                    {children}
                </main>

            </div>
        </div>
    );
}