"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface ToastProps {
  toast: { message: string; type: "success" | "error" } | null;
}

export default function Toast({ toast }: ToastProps) {
  if (!toast) return null;

  return (
    <div
      className={`fixed top-10 right-10 z-[200] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-5 fade-in duration-300 max-w-md ${toast.type === "error" ? "bg-red-600" : "bg-green-600"}`}
    >
      <div className="shrink-0">
        {toast.type === "error" ? (
          <AlertTriangle size={24} strokeWidth={2.5} />
        ) : (
          <CheckCircle2 size={24} strokeWidth={2.5} />
        )}
      </div>
      <p className="text-sm font-bold tracking-wide leading-snug">
        {toast.message}
      </p>
    </div>
  );
}
