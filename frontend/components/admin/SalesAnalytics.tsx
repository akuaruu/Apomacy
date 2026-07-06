"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChevronDown } from "lucide-react";

interface SalesAnalyticsProps {
  weeklyData?: number[];
  monthlyData?: number[];
}

const DAYS = ["SEN", "SEL", "RAB", "KAM", "JUM", "SAB", "MIN"];
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGS", "SEP", "OKT", "NOV", "DES"];

export default function SalesAnalytics({ 
  weeklyData = [0, 0, 0, 0, 0, 0, 0],
  monthlyData = new Array(12).fill(0)
}: SalesAnalyticsProps) {
  // State untuk menyimpan opsi yang dipilih user
  const [period, setPeriod] = useState<"mingguan" | "bulanan">("mingguan");

  // Logika penentuan data dan sumbu X berdasarkan dropdown
  const data = period === "mingguan"
    ? DAYS.map((day, index) => ({ name: day, total: weeklyData[index] || 0 }))
    : MONTHS.map((month, index) => ({ name: month, total: monthlyData[index] || 0 }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-outline-variant p-3 rounded-xl shadow-md">
          <p className="text-xs font-bold text-outline mb-1">{label}</p>
          <p className="text-sm font-black text-apomacy-dark">
            Rp {payload[0].value.toLocaleString("id-ID")}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-3xl border border-outline-variant bg-white shadow-sm p-6 flex flex-col h-full min-h-[380px]">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-black text-apomacy-dark">Analitik Penjualan</h2>
        
        {/* Dropdown UI yang sudah terhubung dengan State */}
        <div className="relative">
          <select 
            value={period}
            onChange={(e) => setPeriod(e.target.value as "mingguan" | "bulanan")}
            className="appearance-none bg-surface-container-low border border-outline-variant/60 text-sm font-bold text-apomacy-dark py-2 pl-5 pr-10 rounded-full focus:outline-none focus:ring-2 focus:ring-apomacy-primary/20 transition-all cursor-pointer"
          >
            <option value="mingguan">Mingguan</option>
            <option value="bulanan">Bulanan</option>
          </select>
          <ChevronDown
            size={16}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-apomacy-dark pointer-events-none"
          />
        </div>
      </div>

      <div className="flex-1 w-full h-full min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0B2F52" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#0B2F52" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fontWeight: 700, fill: '#6B7280' }}
              dy={15}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }} />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#0B2F52"
              strokeWidth={4}
              fillOpacity={1}
              fill="url(#colorTotal)"
              activeDot={{ r: 6, fill: "#0B2F52", stroke: "#fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}