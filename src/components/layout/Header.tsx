"use client";

import { ShieldAlert, Radio, User, Shield } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePlanningStore } from "@/lib/state/planningStore";

const navLinks = [
  { href: "/", label: "Situation" },
  { href: "/shelters", label: "Shelters" },
  { href: "/population", label: "Population" },
  { href: "/reports", label: "Reports" },
];

export default function Header() {
  const pathname = usePathname();
  const { userRole, setUserRole } = usePlanningStore();

  return (
    <header className="absolute top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 h-[56px] flex items-center px-5">
      <div className="flex items-center gap-2.5">
        <ShieldAlert className="h-6 w-6 text-amber-500" />
        <div className="leading-tight">
          <span className="font-bold text-[15px] tracking-wide text-white">SharanSetuX</span>
        </div>
      </div>

      {/* Role Toggle */}
      <div className="ml-5 flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
        <button
          onClick={() => setUserRole('citizen')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${
            userRole === 'citizen'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <User className="h-3.5 w-3.5" />
          CITIZEN
        </button>
        <button
          onClick={() => setUserRole('authority')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${
            userRole === 'authority'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Shield className="h-3.5 w-3.5" />
          AUTHORITY
        </button>
      </div>

      <nav className="ml-5 flex items-center gap-1 text-[12px] font-medium">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded transition-colors ${
                isActive
                  ? "bg-blue-500/15 text-blue-400 border border-blue-500/25"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="ml-auto flex items-center gap-3 text-[11px]">
        <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1.5 rounded-full border border-emerald-500/30">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-bold text-emerald-400 tracking-wider">SYSTEM LIVE</span>
        </div>
        <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded">
          <Radio className="h-3 w-3" />
          <span className="font-bold">PROTOTYPE</span>
        </div>
      </div>
    </header>
  );
}
