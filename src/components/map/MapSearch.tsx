"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { mockPopulationZones, mockShelters, mockRoads } from "@/lib/services/mockData";

interface SearchResult {
  type: 'zone' | 'shelter' | 'road';
  id: string;
  name: string;
  lat: number;
  lng: number;
}

interface MapSearchProps {
  onSelect: (lat: number, lng: number, zoom?: number) => void;
  className?: string;
}

export default function MapSearch({ onSelect, className }: MapSearchProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const allItems: SearchResult[] = [
    ...mockPopulationZones.map(z => ({ type: 'zone' as const, id: z.id, name: z.name, lat: z.location.lat, lng: z.location.lng })),
    ...mockShelters.map(s => ({ type: 'shelter' as const, id: s.id, name: s.name, lat: s.location.lat, lng: s.location.lng })),
    ...mockRoads.map(r => {
      const zone = mockPopulationZones.find(z => z.id === r.source_zone_id);
      return { type: 'road' as const, id: r.id, name: r.name, lat: zone?.location.lat || 21.25, lng: zone?.location.lng || 81.63 };
    }),
  ];

  const filtered = query.length > 0
    ? allItems.filter(i => i.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  const handleSelect = (item: SearchResult) => {
    onSelect(item.lat, item.lng, 15);
    setQuery("");
    setOpen(false);
  };

  const typeLabels = { zone: 'Zone', shelter: 'Shelter', road: 'Road' };
  const typeColors = { zone: 'text-blue-600', shelter: 'text-emerald-600', road: 'text-slate-600' };

  return (
    <div className={className || "absolute top-[96px] left-[336px] z-30"}>
      <div className="relative">
        <div className="flex items-center bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 overflow-hidden">
          <Search className="h-3.5 w-3.5 text-slate-400 ml-2.5 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search location..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            className="w-[180px] px-2 py-1.5 text-xs bg-transparent focus:outline-none placeholder:text-slate-400"
          />
          {query && (
            <button onClick={() => { setQuery(""); setOpen(false); }} className="p-1 mr-1 hover:bg-slate-100 rounded">
              <X className="h-3 w-3 text-slate-400" />
            </button>
          )}
        </div>

        {open && filtered.length > 0 && (
          <div className="absolute top-full left-0 mt-1 w-[250px] bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-slate-200 max-h-[200px] overflow-y-auto">
            {filtered.map(item => (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-slate-50 border-b border-slate-100 last:border-0"
              >
                <span className={`text-[9px] font-bold uppercase ${typeColors[item.type]}`}>{typeLabels[item.type]}</span>
                <span className="text-slate-800 font-medium">{item.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
