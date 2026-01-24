import React, { useState, useEffect, useRef } from 'react';
import { LakeData } from '../types';

// Access the Leaflet global loaded in index.html
declare const L: any;

interface SatelliteAnalysisOverlayProps {
  lake: LakeData;
  onClose: () => void;
}

type Layer = 'base' | 'erosion' | 'littoral' | 'impervious';

const SatelliteAnalysisOverlay: React.FC<SatelliteAnalysisOverlayProps> = ({ 
  lake, 
  onClose 
}) => {
  const [activeLayer, setActiveLayer] = useState<Layer>('base');
  const [scanPos, setScanPos] = useState({ x: 0, y: 0 });
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapInstance = useRef<any>(null);

  const layerInfo = {
    erosion: {
      label: 'Erosion Vulnerability',
      color: 'rgba(244, 63, 94, 0.4)',
      glow: 'rgba(244, 63, 94, 0.2)',
      def: 'Identifies steep-slope segments (>15%) directly abutting the high water mark where sediment transport is highest.'
    },
    littoral: {
      label: 'Littoral Zone Health',
      color: 'rgba(16, 185, 129, 0.4)',
      glow: 'rgba(16, 185, 129, 0.2)',
      def: 'The shore-adjacent shelf where sunlight penetrates to the benthos, providing essential nursery habitat.'
    },
    impervious: {
      label: 'Impervious Surface',
      color: 'rgba(245, 158, 11, 0.4)',
      glow: 'rgba(245, 158, 11, 0.2)',
      def: 'Hardened surfaces in the immediate catchment area that amplify runoff velocity and thermal loading.'
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstance.current) return;

    // Create Leaflet Map instance
    mapInstance.current = L.map(mapContainerRef.current, {
      center: [lake.coordinates.lat, lake.coordinates.lng],
      zoom: 14,
      zoomControl: false,
      attributionControl: true
    });

    // Add Esri Satellite Imagery (Free & Unrestricted)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EBP, and the GIS User Community',
      maxZoom: 18
    }).addTo(mapInstance.current);

    return () => {
      // Fix: cast to any during cleanup to avoid TypeScript 'unknown' inference issues during component unmount
      const currentMap = mapInstance.current as any;
      if (currentMap) {
        currentMap.remove();
        mapInstance.current = null;
      }
    };
  }, [lake]);

  // Handle Precise Canvas Overlays (The "HUD" effects)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || activeLayer === 'base') return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const info = layerInfo[activeLayer as keyof typeof layerInfo];
    const seed = lake.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.save();
    ctx.beginPath();
    
    // Abstract procedural "lake shape" for the hud scan
    for (let i = 0; i < 360; i += 1) {
      const angle = (i * Math.PI) / 180;
      const wave1 = Math.sin(angle * (seed % 7 + 3)) * 40;
      const wave2 = Math.cos(angle * (seed % 5 + 2)) * 60;
      const wave3 = Math.sin(angle * 15) * 15;
      const radius = 280 + wave1 + wave2 + wave3;
      
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();

    if (activeLayer === 'littoral') {
      ctx.lineWidth = 45;
      ctx.strokeStyle = info.color;
      ctx.shadowBlur = 35;
      ctx.shadowColor = info.glow;
      ctx.stroke();
    } else if (activeLayer === 'erosion') {
      ctx.setLineDash([30, 60]);
      ctx.lineWidth = 70;
      ctx.strokeStyle = info.color;
      ctx.shadowBlur = 50;
      ctx.shadowColor = info.glow;
      ctx.stroke();
    } else if (activeLayer === 'impervious') {
      for (let i = 0; i < 10; i++) {
        const angle = (seed * i * 137.5) % 360;
        const dist = 320 + (Math.sin(i) * 50);
        const x = centerX + Math.cos(angle) * dist;
        const y = centerY + Math.sin(angle) * dist;
        
        const grad = ctx.createRadialGradient(x, y, 0, x, y, 90);
        grad.addColorStop(0, info.color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(x - 90, y - 90, 180, 180);
      }
    }
    ctx.restore();
  }, [activeLayer, lake.id, lake.name]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setScanPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-950 flex flex-col animate-in fade-in zoom-in-95 duration-500 overflow-hidden font-mono">
      {/* HUD Header */}
      <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/95 backdrop-blur-2xl z-50">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic flex items-center gap-3">
              <span className="w-3 h-3 bg-blue-500 animate-pulse rounded-sm" />
              {lake.name} <span className="text-blue-500 not-italic font-medium text-[9px] border border-blue-500/40 px-2 py-0.5 rounded ml-2 tracking-widest uppercase">
                Esri-World-Imager Connected
              </span>
            </h2>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                Spectral Sensor Active
              </span>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                Target: {lake.coordinates.lat.toFixed(6)} / {lake.coordinates.lng.toFixed(6)}
              </span>
            </div>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="px-8 py-4 rounded-xl bg-slate-800 hover:bg-red-600 text-white text-[10px] font-black uppercase tracking-widest transition-all border border-slate-700 hover:border-red-500 shadow-xl"
        >
          Exit HUD
        </button>
      </div>

      <div className="flex-1 relative overflow-hidden flex">
        {/* Control HUD Side Panel */}
        <div className="w-80 border-r border-slate-800 p-8 flex flex-col gap-8 bg-slate-900/95 backdrop-blur-md z-40 overflow-y-auto custom-scrollbar shadow-2xl">
          <section>
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center justify-between">
              Spectral Layers <span className="text-blue-500 animate-pulse">●</span>
            </h3>
            <div className="space-y-4">
              {(['base', 'erosion', 'littoral', 'impervious'] as Layer[]).map((layer) => (
                <button
                  key={layer}
                  onClick={() => setActiveLayer(layer)}
                  className={`w-full p-5 rounded-xl border text-left transition-all relative overflow-hidden group ${
                    activeLayer === layer 
                      ? 'bg-blue-600 border-blue-400 text-white shadow-xl' 
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <div className="relative z-10 flex justify-between items-center">
                    <span className="text-[11px] font-black uppercase tracking-widest">
                      {layer === 'base' ? 'Raw Satellite' : layerInfo[layer as keyof typeof layerInfo].label}
                    </span>
                    {activeLayer === layer && <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />}
                  </div>
                  {activeLayer === layer && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
                  )}
                </button>
              ))}
            </div>
          </section>

          <section className="mt-auto space-y-4">
            <div className="p-5 rounded-2xl border border-slate-800 bg-black/40">
              <div className="flex justify-between items-center mb-4">
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Telemetry</span>
                 <span className="text-[9px] font-black text-emerald-500">OPTIMAL</span>
              </div>
              <div className="flex gap-1 h-8 items-end">
                 {[30, 80, 40, 95, 50, 85, 45, 90].map((h, i) => (
                   <div 
                    key={i} 
                    className="flex-1 rounded-t-sm animate-pulse bg-blue-500/30" 
                    style={{ height: `${h}%`, animationDelay: `${i * 0.15}s` }} 
                   />
                 ))}
              </div>
            </div>
          </section>
        </div>

        {/* Tactical Map Area */}
        <div 
          className="flex-1 relative bg-black cursor-none group"
          onMouseMove={handleMouseMove}
        >
          {/* Leaflet Map Container */}
          <div 
            ref={mapContainerRef} 
            className={`absolute inset-0 transition-all duration-1000 ${activeLayer !== 'base' ? 'brightness-[0.3] grayscale-[1]' : 'brightness-[0.85]'}`} 
          />
          
          {/* HUD Visual Overlay Canvas */}
          <canvas 
            ref={canvasRef} 
            width={1600} 
            height={1000} 
            className="absolute inset-0 w-full h-full pointer-events-none z-10 mix-blend-screen opacity-90"
          />

          {/* Scanning Reticle */}
          <div 
            className="absolute pointer-events-none z-30 transition-opacity duration-300 group-hover:opacity-100 opacity-0"
            style={{ left: scanPos.x, top: scanPos.y }}
          >
            <div className="absolute -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-blue-500/40 rounded-full" />
            <div className="absolute -translate-x-1/2 -translate-y-px w-32 h-px bg-blue-500/30" />
            <div className="absolute -translate-x-px -translate-y-1/2 w-px h-32 bg-blue-500/30" />
            
            <div className="absolute top-10 left-10 p-4 bg-slate-900/95 border border-slate-700 rounded-xl backdrop-blur-md shadow-2xl min-w-[150px]">
               <div className="text-[8px] font-black text-slate-500 uppercase mb-2 tracking-[0.2em]">Target Coordinates</div>
               <div className="text-[10px] font-bold text-white flex justify-between gap-4">
                  <span className="opacity-50">LAT</span> <span>{lake.coordinates.lat.toFixed(4)}</span>
               </div>
               <div className="text-[10px] font-bold text-white flex justify-between gap-4">
                  <span className="opacity-50">LNG</span> <span>{lake.coordinates.lng.toFixed(4)}</span>
               </div>
            </div>
          </div>

          {/* HUD Frames */}
          <div className="absolute inset-0 pointer-events-none z-20 border-[40px] border-slate-950/20" />
          <div className="absolute inset-0 pointer-events-none z-20 opacity-[0.05] bg-[linear-gradient(to_right,#888_1px,transparent_1px),linear-gradient(to_bottom,#888_1px,transparent_1px)] bg-[size:100px_100px]" />
          
          <div className="absolute bottom-12 left-12 z-40">
            <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl backdrop-blur-md text-[9px] font-black uppercase text-slate-500 space-y-1.5 shadow-2xl">
              <p className="flex justify-between gap-8"><span>Engine</span> <span className="text-white">Leaflet/Esri</span></p>
              <p className="flex justify-between gap-8"><span>Telemetry</span> <span className="text-emerald-500">LOCKED</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SatelliteAnalysisOverlay;