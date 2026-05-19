"use client";

import { AlertTriangle, Save } from "lucide-react";

interface ModalConfirmProps {
  isOpen: boolean;
  title: string;
  message: string;
  type: "tambah" | "edit" | "hapus" | "batal" | string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ModalConfirm({
  isOpen,
  title,
  message,
  type,
  onConfirm,
  onCancel,
}: ModalConfirmProps) {
  if (!isOpen) return null;

  const isDanger = type === "hapus" || type === "batal";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 px-4">
      <div className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl scale-in-95 animate-in zoom-in duration-200">
        <div className="flex items-center gap-4 mb-5">
          <div
            className={`p-3.5 rounded-full shrink-0 ${isDanger ? "bg-red-100 text-red-600" : "bg-apomacy-primary/10 text-apomacy-primary"}`}
          >
            {isDanger ? (
              <AlertTriangle size={28} strokeWidth={2.5} />
            ) : (
              <Save size={28} strokeWidth={2.5} />
            )}
          </div>
          <div>
            <h3 className="text-lg font-black text-apomacy-dark uppercase tracking-wide">
              {title}
            </h3>
          </div>
        </div>

        <p className="text-sm font-medium text-outline mb-8 leading-relaxed">
          {message}
        </p>

        <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/40">
          <button
            onClick={onCancel}
            className="rounded-xl border border-outline-variant bg-white px-5 py-2.5 text-xs font-bold text-apomacy-dark hover:bg-surface-container-low transition-colors"
          >
            Kembali
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-xl px-6 py-2.5 text-xs font-bold text-white shadow-md transition-colors flex items-center gap-2 ${
              isDanger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-apomacy-primary hover:bg-apomacy-dark"
            }`}
          >
            {type === "hapus"
              ? "Ya, Hapus Data"
              : type === "batal"
                ? "Ya, Batalkan"
                : "Ya, Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
