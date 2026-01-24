import React, { useState, useMemo, useEffect, useRef } from 'react';
import { LakeData } from '../types';

// Access Leaflet from the global script loaded in index.html
declare const L: any;

interface BiosecurityMapViewProps {
  lakes: LakeData[];
  onSelectLake: (lake: LakeData) => void;
  onClose: () => void;
  searchRadius: number;
  onRadiusChange: (radius: number) => void;
}

/**
 * Converts radius in miles to Leaflet zoom level.
 * Calibrated for Maine latitudes:
 * ~5mi  -> Zoom 12
 * ~50mi -> Zoom 9
 * ~200mi -> Zoom 7
 */
const milesToZoom = (miles: number): number => {
  // Base zoom of 14 at ~3 miles, decreasing logarithmically as miles increase
  return Math.round(14 - Math.log2(miles / 3));
};

const BiosecurityMapView: React.FC<BiosecurityMapViewProps> = ({ 
  lakes, 
  onSelectLake, 
  onClose, 
  searchRadius,
  onRadiusChange 
}) => {
  const [hoveredLake, setHoveredLake] = useState<LakeData | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});

  // 1. Calculate Centroid of the dataset for initial focus and persistent centering
  const centroid = useMemo(() => {
    if (lakes.length === 0) return { lat: 44.2, lng: -70.5 };
    const sumLat = lakes.reduce((sum, lake) => sum + lake.coordinates.lat, 0);
    const sumLng = lakes.reduce((sum, lake) => sum + lake.coordinates.lng, 0);
    return { lat: sumLat / lakes.length, lng: sumLng / lakes.length };
  }, [lakes]);

  // 2. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstance.current) return;

    mapInstance.current = L.map(mapContainerRef.current, {
      center: [centroid.lat, centroid.lng],
      zoom: milesToZoom(searchRadius),
      zoomControl: false,
      attributionControl: false
    });

    // Dark styled basemap for the Guardian PRO aesthetic
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{y}/{x}{r}.png', {
      maxZoom: 19
    }).addTo(mapInstance.current);

    return () => {
      // Fix: Cast the map instance to any during cleanup to ensure 'remove' method is accessible
      if (mapInstance.current) {
        (mapInstance.current as any).remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // 3. Sync searchRadius with Leaflet Zoom and Re-center viewport
  useEffect(() => {
    if (mapInstance.current) {
      const targetZoom = milesToZoom(searchRadius);
      // setView ensures the viewport stays centered on the centroid while zooming
      (mapInstance.current as any).setView([centroid.lat, centroid.lng], targetZoom, {
        animate: true,
        duration: 0.5
      });
    }
  }, [searchRadius, centroid]);

  // 4. Manage Custom Markers with Adaptive Labels
  useEffect(() => {
    if (!mapInstance.current) return;

    // Remove old markers to refresh view state
    // Fix: Cast Object.values to any[] to avoid 'unknown' type error for m.remove() (Line 89 reported error)
    (Object.values(markersRef.current) as any[]).forEach(m => m.remove());
    markersRef.current = {};

    lakes.forEach(lake => {
      const isThreat = lake.invasiveSpeciesStatus !== 'None detected';
      // Label Threshold: Only show persistent labels if radius is small (zoomed in)
      const hideLabels = searchRadius > 80;
      
      const customIcon = L.divIcon({
        className: 'custom-lake-marker',
        html: `
          <div class="relative flex flex-col items-center group">
            <div class="w-5 h-5 rounded-full border-[3px] flex items-center justify-center transition-all duration-300 ${
              isThreat 
                ? 'bg-rose-500 border-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.6)] scale-110' 
                : 'bg-slate-800 border-slate-700 hover:border-blue-500 hover:scale-125'
            }">
              ${isThreat ? '<div class="w-1 h-1 rounded-full bg-white"></div>' : ''}
            </div>
            <div class="mt-2 text-center pointer-events-none transition-all duration-300 ${
              hideLabels ? 'opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100' : 'opacity-100'
            }">
              <span class="text-[8px] font-black text-white uppercase tracking-tighter bg-slate-950/90 px-2 py-0.5 rounded-full backdrop-blur-sm border border-slate-800/50 block truncate max-w-[100px] shadow-lg">
                ${lake.name}
              </span>
            </div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const marker = L.marker([lake.coordinates.lat, lake.coordinates.lng], { icon: customIcon })
        .addTo(mapInstance.current as any)
        .on('click', () => onSelectLake(lake))
        .on('mouseover', () => {
          setHoveredLake(lake);
          // Bring threat markers to front on hover
          if (markersRef.current[lake.id]) markersRef.current[lake.id].setZIndexOffset(1000);
        })
        .on('mouseout', () => {
          setHoveredLake(null);
          if (markersRef.current[lake.id]) markersRef.current[lake.id].setZIndexOffset(0);
        });

      markersRef.current[lake.id] = marker;
    });
  }, [lakes, searchRadius]);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col overflow-hidden text-white animate-in fade-in duration-500">
      {/* HUD Header */}
      <div className="absolute top-8 left-8 right-8 z-50 pointer-events-none flex justify-between items-start">
        <div className="bg-slate-900/95 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-slate-800 pointer-events-auto shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] flex items-center gap-10">
          <div className="flex items-center gap-4 shrink-0">
             <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
             </div>
             <div>
               <h2 className="text-xl font-black text-white tracking-tighter uppercase italic leading-tight">Biosecurity View</h2>
               <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">Live Regional Map • {lakes.length} Monitored Basins</p>
             </div>
          </div>

          <div className="h-10 w-px bg-slate-800 hidden md:block" />

          {/* VIEWPORT SCALE SLIDER */}
          <div className="flex flex-col min-w-[260px] pointer-events-auto">
             <div className="flex justify-between items-center mb-1.5 px-1">
                <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Viewport Scale (Radius)</span>
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest mono">{searchRadius}mi</span>
             </div>
             <input 
                type="range" 
                min="5" 
                max="200" 
                step="5" 
                value={searchRadius} 
                onChange={(e) => onRadiusChange(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all shadow-inner"
              />
             <div className="flex justify-between mt-1.5 px-0.5">
                <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">Micro (Hyper-Local)</span>
                <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">Macro (Oxford County)</span>
             </div>
          </div>
        </div>
        
        <button 
          onClick={onClose} 
          className="p-4 px-10 rounded-[1.5rem] bg-slate-900 border border-slate-800 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-rose-600 hover:border-rose-400 text-slate-200 hover:text-white transition-all pointer-events-auto shadow-2xl active:scale-95"
        >
          Close Map HUD
        </button>
      </div>

      {/* Main Map Area */}
      <div className="flex-1 relative">
        <div ref={mapContainerRef} className="absolute inset-0 z-0 bg-slate-950" />
        
        {/* Stylized HUD Overlays */}
        <div className="absolute inset-0 pointer-events-none z-10 border-[3rem] border-slate-950/25" />
        
        {/* Dynamic Scanning Grid (Scales with Zoom) */}
        <div 
          className="absolute inset-0 opacity-[0.04] pointer-events-none z-10 transition-all duration-1000 ease-in-out"
          style={{ 
            backgroundImage: `radial-gradient(circle, #3b82f6 1px, transparent 1px)`,
            backgroundSize: `${Math.max(25, 120 - (searchRadius / 2))}px ${Math.max(25, 120 - (searchRadius / 2))}px`
          }} 
        />

        {/* Floating Detail Glance Panel */}
        {hoveredLake && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-64 bg-slate-950/95 border border-blue-500/40 p-6 rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.9)] z-50 animate-in fade-in slide-in-from-bottom-6 duration-300 backdrop-blur-2xl">
             <div className="flex justify-between items-start mb-5">
               <div className="flex-1 min-w-0">
                  <h4 className="text-xl font-black text-white uppercase italic tracking-tight truncate leading-none mb-1.5">{hoveredLake.name}</h4>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{hoveredLake.town}, ME</p>
               </div>
               <span className={`shrink-0 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border ${
                 hoveredLake.waterQuality === 'Excellent' ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5' : 'text-blue-400 border-blue-400/20 bg-blue-400/5'
               }`}>
                 {hoveredLake.waterQuality}
               </span>
             </div>

             <div className="grid grid-cols-2 gap-5 mb-5 pt-4 border-t border-slate-900">
                <div>
                   <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Transparency</p>
                   <p className="text-lg font-black text-white mono">{hoveredLake.lastSecchiDiskReading}m</p>
                </div>
                <div>
                   <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Nutrients</p>
                   <p className="text-lg font-black text-white mono">{hoveredLake.phosphorusLevel}<span className="text-[9px] ml-0.5 opacity-50">ppb</span></p>
                </div>
             </div>

             <div className={`text-[9px] font-black uppercase p-2.5 rounded-xl text-center border transition-colors ${
               hoveredLake.invasiveSpeciesStatus === 'None detected' 
                 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' 
                 : 'bg-rose-500/10 border-rose-500/30 text-rose-500'
             }`}>
               {hoveredLake.invasiveSpeciesStatus}
             </div>
          </div>
        )}
      </div>

      {/* Bottom Footer Info HUD */}
      <div className="h-16 border-t border-slate-900 bg-slate-950/90 backdrop-blur-xl px-10 flex justify-between items-center shrink-0 z-50">
        <div className="flex items-center gap-8">
           <div className="flex items-center gap-3">
             <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)] animate-pulse" />
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Active Regional Bio-Threat</span>
           </div>
           <div className="flex items-center gap-3">
             <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700" />
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Baseline Monitoring Node</span>
           </div>
        </div>
        <div className="text-right">
           <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] italic opacity-60">
             Real-Time Spatial Distribution • Grid-Sync: ON • Zoom: {Math.round(milesToZoom(searchRadius))}
           </span>
        </div>
      </div>
    </div>
  );
};

export default BiosecurityMapView;