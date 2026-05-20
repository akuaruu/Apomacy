"use client";

import { useState } from "react";

const SALES_DATA = {
  mingguan: [
    { label: "Sen", value: 30 },
    { label: "Sel", value: 45 },
    { label: "Rab", value: 25 },
    { label: "Kam", value: 60 },
    { label: "Jum", value: 80 },
    { label: "Sab", value: 95 },
    { label: "Min", value: 50 },
  ],
  bulanan: [
    { label: "Mg 1", value: 40 },
    { label: "Mg 2", value: 70 },
    { label: "Mg 3", value: 55 },
    { label: "Mg 4", value: 90 },
  ],
  tahunan: [
    { label: "Jan", value: 30 },
    { label: "Feb", value: 45 },
    { label: "Mar", value: 60 },
    { label: "Apr", value: 40 },
    { label: "Mei", value: 75 },
    { label: "Jun", value: 85 },
  ],
};

export default function SalesAnalytics() {
  const [filter, setFilter] = useState<"mingguan" | "bulanan" | "tahunan">(
    "mingguan",
  );
  const data = SALES_DATA[filter];

  return (
    <div className="rounded-3xl border border-outline-variant bg-white p-6 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-lg font-black text-apomacy-dark">
          Analitik Penjualan
        </h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="rounded-lg border border-outline-variant bg-surface-container-low px-3 py-1.5 text-xs font-bold text-apomacy-dark outline-none cursor-pointer"
        >
          <option value="mingguan">Mingguan</option>
          <option value="bulanan">Bulanan</option>
          <option value="tahunan">Tahunan</option>
        </select>
      </div>
      <div className="flex-1 flex items-end justify-between gap-2 h-48 mt-auto pt-6 border-b border-outline-variant/50 relative">
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
          <div className="w-full border-t border-dashed border-outline-variant h-0"></div>
          <div className="w-full border-t border-dashed border-outline-variant h-0"></div>
          <div className="w-full border-t border-dashed border-outline-variant h-0"></div>
        </div>
        {data.map((item, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-3 w-full group relative z-10"
          >
            <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-apomacy-dark text-white text-[10px] font-bold py-1 px-2 rounded shadow">
              {item.value}%
            </div>
            <div
              className="w-full max-w-[40px] rounded-t-lg bg-apomacy-dark transition-all duration-500 group-hover:bg-apomacy-primary"
              style={{ height: `${item.value}%` }}
            ></div>
            <span className="text-[10px] font-bold text-outline uppercase">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
