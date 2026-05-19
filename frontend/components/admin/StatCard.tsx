import { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  isHighlight?: boolean;
  icon: ReactNode;
}

export default function StatCard({
  label,
  value,
  isHighlight = false,
  icon,
}: StatCardProps) {
  return (
    <div
      className={`rounded-3xl p-6 shadow-sm flex flex-col justify-center border ${isHighlight ? "bg-apomacy-dark text-white border-apomacy-dark" : "bg-white border-outline-variant"}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl mb-4 ${isHighlight ? "bg-apomacy-primary/40" : "bg-apomacy-bg"}`}
          >
            {icon}
          </div>
          <p
            className={`text-[11px] font-bold uppercase tracking-widest ${isHighlight ? "text-apomacy-ice" : "text-outline"}`}
          >
            {label}
          </p>
          <p
            className={`mt-1 text-3xl font-black tracking-tight ${isHighlight ? "text-white" : "text-apomacy-dark"}`}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
