"use client";

import { usePlanningStore } from "@/lib/state/planningStore";
import { Plus, Minus, Layers, Navigation, Ruler, AlertTriangle, Search } from "lucide-react";

interface MapToolbarProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onLocate: () => void;
}

export default function MapToolbar({ onZoomIn, onZoomOut, onLocate }: MapToolbarProps) {
  const { layerManagerOpen, setLayerManagerOpen } = usePlanningStore();

  const tools = [
    { icon: Plus, label: 'Zoom In', onClick: onZoomIn },
    { icon: Minus, label: 'Zoom Out', onClick: onZoomOut },
    { icon: Navigation, label: 'Reset View', onClick: onLocate },
    { icon: Layers, label: 'Layers', onClick: () => setLayerManagerOpen(!layerManagerOpen), active: layerManagerOpen },
  ];

  return (
    <div className="absolute left-3 z-30 flex flex-col gap-0.5 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 overflow-hidden" style={{ top: 'calc(50% + 40px)', transform: 'translateY(-50%)' }}>
      {tools.map(({ icon: Icon, label, onClick, active }) => (
        <button
          key={label}
          onClick={onClick}
          title={label}
          className={`p-2 hover:bg-slate-100 transition-colors border-b border-slate-100 last:border-0 ${active ? 'bg-blue-50 text-blue-600' : 'text-slate-600'}`}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}
