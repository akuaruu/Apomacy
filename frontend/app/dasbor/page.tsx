export default function DasborPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-apomacy-blue">Ringkasan Dasbor</h1>
        <p className="text-apomacy-muted-blue mt-1">Pantau aktivitas kesehatan dan pesanan obat Anda di sini.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-apomacy-white p-6 rounded-xl shadow-sm border border-apomacy-border flex flex-col hover:border-apomacy-teal transition">
          <h3 className="text-apomacy-muted-blue text-sm font-medium">Pesanan Obat Aktif</h3>
          <p className="text-3xl font-bold text-apomacy-blue mt-2">2</p>
          <a href="/dasbor/pesanan" className="text-sm text-apomacy-teal font-medium hover:underline mt-4">
            Lihat detail pesanan &rarr;
          </a>
        </div>

        {/* Card 2 */}
        <div className="bg-apomacy-white p-6 rounded-xl shadow-sm border border-apomacy-border flex flex-col hover:border-apomacy-teal transition">
          <h3 className="text-apomacy-muted-blue text-sm font-medium">Konsultasi Mendatang</h3>
          <p className="text-3xl font-bold text-apomacy-blue mt-2">1</p>
          <a href="/dasbor/konsultasi" className="text-sm text-apomacy-teal font-medium hover:underline mt-4">
            Lihat jadwal &rarr;
          </a>
        </div>

        {/* Card 3 */}
        <div className="bg-apomacy-white p-6 rounded-xl shadow-sm border border-apomacy-border flex flex-col hover:border-apomacy-teal transition">
          <h3 className="text-apomacy-muted-blue text-sm font-medium">Kelengkapan Profil</h3>
          <p className="text-3xl font-bold text-apomacy-teal mt-2">85%</p>
          <a href="/dasbor/profil" className="text-sm text-apomacy-muted-blue hover:text-apomacy-blue hover:underline mt-4">
            Lengkapi profil &rarr;
          </a>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-apomacy-white rounded-xl shadow-sm border border-apomacy-border p-6 mt-8">
        <h2 className="text-xl font-bold text-apomacy-dark mb-4">Aktivitas Terakhir</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b border-apomacy-border last:border-0">
            <div>
              <p className="font-medium text-apomacy-dark">Pembelian Obat: Paracetamol 500mg</p>
              <p className="text-sm text-apomacy-muted-blue">20 Okt 2023 - Sedang Dikirim</p>
            </div>
            <span className="px-3 py-1 bg-apomacy-light-blue/40 text-apomacy-blue text-xs font-semibold rounded-full">
              Proses
            </span>
          </div>
          
          <div className="flex justify-between items-center py-3 border-b border-apomacy-border last:border-0">
            <div>
              <p className="font-medium text-apomacy-dark">Konsultasi dengan dr. Budi</p>
              <p className="text-sm text-apomacy-muted-blue">18 Okt 2023 - Selesai</p>
            </div>
            <span className="px-3 py-1 bg-apomacy-teal/20 text-apomacy-teal text-xs font-bold rounded-full">
              Selesai
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}