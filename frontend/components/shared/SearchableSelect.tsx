"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Lock } from "lucide-react";

interface SearchableSelectProps {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  disabled?: boolean;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen) setSearchTerm("");
          }
        }}
        className={`w-full px-4 py-2.5 text-sm font-bold rounded-xl border flex justify-between items-center select-none transition-all ${disabled ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-75" : "bg-surface-container-low border-outline-variant text-apomacy-dark cursor-pointer focus-within:border-apomacy-primary focus-within:ring-4 focus-within:ring-apomacy-primary/10"}`}
      >
        <span
          className={
            value
              ? "text-apomacy-dark"
              : "text-outline/60 flex items-center gap-1.5"
          }
        >
          {disabled && <Lock size={12} className="text-gray-400" />}
          {value || placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-outline transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1.5 bg-white border border-outline-variant rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="p-2 border-b border-outline-variant/50 bg-gray-50">
            <input
              type="text"
              autoFocus
              placeholder="Ketik untuk mencari..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-bold text-apomacy-dark bg-white border border-outline-variant rounded-lg outline-none focus:border-apomacy-primary"
            />
          </div>
          <ul className="max-h-40 overflow-y-auto divide-y divide-gray-50 p-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <li
                  key={opt}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={`px-4 py-2 text-xs font-bold text-apomacy-dark cursor-pointer transition-colors rounded-lg hover:bg-apomacy-primary/10 ${value === opt ? "bg-apomacy-primary text-white hover:bg-apomacy-dark" : ""}`}
                >
                  {opt}
                </li>
              ))
            ) : (
              <li className="px-4 py-3 text-xs font-medium text-outline text-center">
                Data tidak ditemukan
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
