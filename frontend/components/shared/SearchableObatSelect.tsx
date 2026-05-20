"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Lock } from "lucide-react";

interface SearchableObatSelectProps {
  options: any[];
  value: any;
  onChange: (val: any) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function SearchableObatSelect({
  options,
  value,
  onChange,
  disabled = false,
  placeholder = "Pilih / Cari Obat...",
}: SearchableObatSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(
    (opt: any) =>
      opt.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opt.kode.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      )
        setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <div
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen) setSearchTerm("");
          }
        }}
        className={`w-full h-full min-h-[42px] px-4 py-2.5 text-sm font-bold rounded-xl border flex justify-between items-center select-none transition-all ${disabled ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" : "border-outline-variant bg-white text-apomacy-dark cursor-pointer focus-within:ring-4 focus-within:ring-apomacy-primary/10 focus-within:border-apomacy-primary"}`}
      >
        {value ? (
          <span
            className={`flex items-center gap-2 ${disabled ? "opacity-70" : ""}`}
          >
            {disabled && <Lock size={12} />}
            <span className="text-[10px] font-mono font-black text-apomacy-primary bg-apomacy-primary/10 px-2 py-0.5 rounded-md border border-apomacy-primary/20">
              {value.kode}
            </span>
            {value.nama}
          </span>
        ) : (
          <span className="text-outline/60">{placeholder}</span>
        )}
        <ChevronDown
          size={16}
          className={`text-outline transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full md:w-[400px] mt-2 bg-white border border-outline-variant rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-2 border-b border-outline-variant/50 bg-surface-container-low/50">
            <input
              type="text"
              autoFocus
              placeholder="Cari Kode atau Nama Obat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold text-apomacy-dark bg-white border border-outline-variant rounded-xl outline-none focus:border-apomacy-primary"
            />
          </div>
          <ul className="max-h-60 overflow-y-auto p-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt: any) => (
                <li
                  key={opt.kode}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={`px-4 py-2.5 text-xs cursor-pointer transition-colors rounded-lg hover:bg-apomacy-primary/10 ${value?.kode === opt.kode ? "bg-apomacy-primary/10" : ""}`}
                >
                  <div className="flex flex-col gap-1">
                    <span
                      className={`font-black ${value?.kode === opt.kode ? "text-apomacy-primary" : "text-apomacy-dark"}`}
                    >
                      {opt.nama}
                    </span>
                    <span className="font-mono text-[10px] font-bold text-outline">
                      {opt.kode}
                    </span>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-4 py-4 text-xs font-medium text-outline text-center">
                Data obat tidak ditemukan
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
