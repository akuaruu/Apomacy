const TOP_SELLING = [
  {
    name: "Paracetamol 500mg",
    qty: "1.250 Box",
    revenue: "Rp 15.000.000",
    percentage: 100,
    color: "bg-apomacy-primary",
    text: "text-apomacy-primary",
  },
  {
    name: "Vitamin C 1000mg",
    qty: "850 Botol",
    revenue: "Rp 10.200.000",
    percentage: 70,
    color: "bg-apomacy-teal",
    text: "text-apomacy-teal",
  },
  {
    name: "Amoxicillin 250mg",
    qty: "640 Strip",
    revenue: "Rp 8.500.000",
    percentage: 45,
    color: "bg-apomacy-muted",
    text: "text-apomacy-muted",
  },
];

export default function TopSellingMedicine() {
  return (
    <div className="rounded-3xl border border-outline-variant bg-white p-6 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 border-b border-outline-variant/50 pb-4">
        <div>
          <h2 className="text-lg font-black text-apomacy-dark">
            Obat Terlaris
          </h2>
          <p className="text-[11px] font-semibold text-outline mt-0.5">
            Berdasarkan kuantitas penjualan bulan ini
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-4 flex-1">
        {TOP_SELLING.map((item, i) => (
          <div
            key={i}
            className="relative p-3 rounded-xl border border-outline-variant bg-white overflow-hidden shadow-sm hover:shadow transition-shadow"
          >
            <div
              className={`absolute top-0 left-0 bottom-0 opacity-10 transition-all duration-1000 ease-out ${item.color}`}
              style={{ width: `${item.percentage}%` }}
            ></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-lg shadow-inner text-xs font-black text-white ${item.color}`}
                >
                  #{i + 1}
                </div>
                <div>
                  <span className="text-xs font-bold text-apomacy-dark">
                    {item.name}
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider ${item.text}`}
                    >
                      {item.qty}
                    </span>
                    <span className="text-[10px] text-outline font-medium">
                      terjual
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-xs font-black text-apomacy-dark">
                {item.revenue}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
