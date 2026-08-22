"use client";

import { ShieldAlert, Radio } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/", label: "Situation" },
  { href: "/shelters", label: "Shelters" },
  { href: "/population", label: "Population" },
  { href: "/reports", label: "Reports" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="absolute top-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-sm border-b border-slate-700/50 h-[44px] flex items-center px-4">
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-5 w-5 text-amber-500" />
        <div className="leading-tight">
          <span className="font-bold text-[13px] tracking-wide text-white">SharanSetuX</span>
        </div>
      </div>

      <nav className="ml-6 flex items-center gap-0.5 text-[11px] font-medium">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-2.5 py-1 rounded transition-colors ${
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

      <div className="ml-auto flex items-center gap-3 text-[10px]">
        <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded">
          <Radio className="h-2.5 w-2.5" />
          <span className="font-bold">SIMULATION</span>
        </div>
        <span className="text-slate-500 hidden lg:inline">Admin</span>
      </div>
    </header>
  );
}
