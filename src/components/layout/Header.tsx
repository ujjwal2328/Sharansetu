"use client";

import { ShieldAlert, Radio, User, Shield, Building2, ChevronDown, Activity } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePlanningStore } from "@/lib/state/planningStore";

const navLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/conditions", label: "Conditions" },
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
        <div className="leading-tight flex flex-col">
          <span className="font-bold text-[15px] tracking-wide text-white">SharanSetuX</span>
          <span className="text-[8px] font-bold text-slate-400 tracking-widest uppercase mt-0.5">Disaster Management</span>
        </div>
      </div>

      <div className="ml-6 flex items-center gap-4 border-l border-slate-700/60 pl-6">
        {/* Role Toggle */}
        <div className="flex items-center bg-[#0f172a] rounded-md p-1 border border-slate-700/50 shadow-inner">
          <button
            onClick={() => setUserRole('citizen')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-sm text-[10px] font-bold tracking-wider transition-all ${
              userRole === 'citizen'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm'
                : 'text-slate-500 hover:text-slate-300 border border-transparent'
            }`}
          >
            <User className="h-3 w-3" />
            CITIZEN
          </button>
          <button
            onClick={() => setUserRole('authority')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-sm text-[10px] font-bold tracking-wider transition-all ${
              userRole === 'authority'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-sm'
                : 'text-slate-500 hover:text-slate-300 border border-transparent'
            }`}
          >
            <Shield className="h-3 w-3" />
            AUTHORITY
          </button>
        </div>

        {/* Operation Center Section */}
        <div className="flex items-center gap-2.5 bg-slate-800/40 border border-slate-700/50 rounded-md px-3 py-1 cursor-pointer hover:bg-slate-700/50 transition-colors shadow-sm group">
          <div className="bg-slate-900 p-1.5 rounded border border-slate-700/50 group-hover:border-slate-600 transition-colors">
            <Building2 className="h-3.5 w-3.5 text-slate-300" />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">
              Operation Center
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-200 leading-none">Raipur EOC (Alpha)</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </div>
          </div>
          <div className="ml-2 flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
        </div>
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
