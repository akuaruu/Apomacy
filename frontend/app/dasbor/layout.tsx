import SidebarClient from "@/components/client/SidebarClient";

export default function DasborLayout({ children }: { children: React.ReactNode }) {
  return (
    // min-h-screen biarkan saja agar background putihnya full sampai bawah
    <div className="min-h-screen bg-apomacy-white flex font-sans">
      
      <SidebarClient />

      {/* AREA KANAN: Hapus class 'h-screen' dari div ini */}
      <div className="flex-1 flex flex-col">
        
        {/* MAIN: Hapus class 'overflow-y-auto' dari sini */}
        <main className="flex-1 p-8 bg-apomacy-white">
          {children}
        </main>
        
      </div>
      
    </div>
  );
}