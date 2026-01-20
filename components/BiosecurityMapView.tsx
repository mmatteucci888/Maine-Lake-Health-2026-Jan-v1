import React, { useState, useMemo } from 'react';
import { LakeData } from '../types';

interface BiosecurityMapViewProps {
  lakes: LakeData[];
  onSelectLake: (lake: LakeData) => void;
  onClose: () => void;
  centerLake?: LakeData;
  searchRadius: number;
  onRadiusChange: (radius: number) => void;
}

const BiosecurityMapView: React.FC<BiosecurityMapViewProps> = ({ 
  lakes, 
  onSelectLake, 
  onClose, 
  centerLake,
  searchRadius,
  onRadiusChange 
}) => {
  const [hoveredLake, setHoveredLake] = useState<LakeData | null>(null);

  const bounds = useMemo(() => {
    // If we have no lakes, default to Maine center
    if (lakes.length === 0) return { minLat: 44, maxLat: 46, minLng: -71, maxLng: -67 };
    
    // 1. Calculate Centroid of the dataset
    const sumLat = lakes.reduce((sum, lake) => sum + lake.coordinates.lat, 0);
    const sumLng = lakes.reduce((sum, lake) => sum + lake.coordinates.lng, 0);
    const centerLat = sumLat / lakes.length;
    const centerLng = sumLng / lakes.length;

    // 2. Determine Viewport Size based strictly on Slider Radius (Zoom)
    // Approx conversions for Maine Latitudes (44-47N)
    // 1 deg Lat ~= 69 miles
    // 1 deg Lng ~= 49 miles (at 45deg N)
    
    const latRadiusDeg = searchRadius / 69;
    const lngRadiusDeg = searchRadius / 49;

    return {
      minLat: centerLat - latRadiusDeg,
      maxLat: centerLat + latRadiusDeg,
      minLng: centerLng - lngRadiusDeg,
      maxLng: centerLng + lngRadiusDeg
    };
  }, [lakes, searchRadius]);

  const getPosition = (lat: number, lng: number) => {
    // Maps coordinates to percentage of parent container
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
    const y = 100 - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 100;
    return { x, y };
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col overflow-hidden text-white animate-in fade-in duration-500">
      {/* Top HUD - Floating Overlay */}
      <div className="absolute top-8 left-8 right-8 z-50 pointer-events-none flex justify-between items-start">
        <div className="bg-slate-900/90 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-slate-800 pointer-events-auto shadow-2xl flex items-center gap-10">
          <div className="flex items-center gap-4 shrink-0">
             <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
             </div>
             <div>
               <h2 className="text-xl font-black text-white tracking-tighter uppercase italic leading-tight">Biosecurity View</h2>
               <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">Spatial Vector Distribution • {lakes.length} Monitored Basins</p>
             </div>
          </div>

          <div className="h-10 w-px bg-slate-800 hidden md:block" />

          {/* RADIUS SLIDER */}
          <div className="flex flex-col min-w-[240px] pointer-events-auto">
             <div className="flex justify-between items-center mb-1.5 px-1">
                <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Viewport Scale (Zoom)</span>
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{searchRadius}mi</span>
             </div>
             <input 
                type="range" 
                min="5" 
                max="200" 
                step="5" 
                value={searchRadius} 
                onInput={(e) => onRadiusChange(parseInt((e.target as HTMLInputElement).value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-colors"
              />
             <div className="flex justify-between mt-1 px-0.5">
                <span className="text-[8px] font-bold text-slate-600 uppercase">Micro</span>
                <span className="text-[8px] font-bold text-slate-600 uppercase">Regional</span>
             </div>
          </div>
        </div>
        
        <button onClick={onClose} className="p-4 px-8 rounded-2xl bg-slate-900 border border-slate-800 text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all pointer-events-auto shadow-2xl">
          Return to Dashboard
        </button>
      </div>

      {/* Main Field - No Scroll */}
      <div className="flex-1 relative m-8 mt-40 mb-24 bg-slate-900/10 rounded-[3rem] border border-slate-800/50 shadow-inner overflow-hidden">
        {/* Dynamic Grid */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
           {[...Array(11)].map((_, i) => (
             <React.Fragment key={i}>
                <div className="absolute w-px h-full bg-blue-400" style={{ left: `${i * 10}%` }} />
                <div className="absolute h-px w-full bg-blue-400" style={{ top: `${i * 10}%` }} />
             </React.Fragment>
           ))}
        </div>

        {/* Axis Labels - Fixed to edges */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-black text-slate-700 uppercase tracking-[0.5em] whitespace-nowrap pointer-events-none">
          LATITUDE GRADIENT: {bounds.minLat.toFixed(2)}° N TO {bounds.maxLat.toFixed(2)}° N
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-700 uppercase tracking-[0.5em] whitespace-nowrap pointer-events-none">
          LONGITUDE GRADIENT: {bounds.minLng.toFixed(2)}° W TO {bounds.maxLng.toFixed(2)}° W
        </div>

        {/* The Markers */}
        <div className="absolute inset-0 m-12 overflow-hidden">
          {lakes.map((lake) => {
            const pos = getPosition(lake.coordinates.lat, lake.coordinates.lng);
            const isThreat = lake.invasiveSpeciesStatus !== 'None detected';
            const isHovered = hoveredLake?.id === lake.id;
            
            // Don't render if way off screen to keep DOM light
            if (pos.x < -10 || pos.x > 110 || pos.y < -10 || pos.y > 110) return null;

            return (
              <div
                key={lake.id}
                className={`absolute transition-all duration-300 cursor-pointer ${isHovered ? 'z-50' : 'z-20'}`}
                style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
                onMouseEnter={() => setHoveredLake(lake)}
                onMouseLeave={() => setHoveredLake(null)}
                onClick={() => onSelectLake(lake)}
              >
                <div className="relative flex flex-col items-center group">
                  <div className={`w-6 h-6 rounded-full border-4 flex items-center justify-center transition-all ${
                    isThreat 
                      ? 'bg-rose-500 border-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-pulse' 
                      : 'bg-slate-800 border-slate-700 hover:border-blue-500 shadow-lg'
                  }`}>
                    {isThreat && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>

                  {/* Proportional Persistent Label - Hides if zoomed out too far (radius > 100) unless hovered */}
                  <div className={`mt-2 text-center pointer-events-none max-w-[120px] transition-opacity ${searchRadius > 100 && !isHovered ? 'opacity-0' : 'opacity-100'}`}>
                    <span className="text-[9px] font-black text-white uppercase tracking-tighter bg-slate-900/60 px-2 py-0.5 rounded backdrop-blur-sm border border-slate-800/50 block truncate">
                      {lake.name}
                    </span>
                    <span className={`text-[7px] font-black uppercase mt-0.5 ${isThreat ? 'text-rose-400' : 'text-slate-500'}`}>
                      {lake.town}
                    </span>
                  </div>

                  {/* Detail Glance Panel (Hover) */}
                  {isHovered && (
                    <div className="absolute bottom-full mb-6 left-1/2 -translate-x-1/2 w-56 bg-slate-950 border border-blue-500/50 p-5 rounded-3xl shadow-2xl z-[100] animate-in slide-in-from-bottom-2 duration-200">
                      <h4 className="text-lg font-black text-white mb-2 italic uppercase truncate">{lake.name}</h4>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                          <p className="text-[8px] font-black text-slate-500 uppercase">Clarity</p>
                          <p className="text-xs font-black text-white">{lake.lastSecchiDiskReading}m</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-slate-500 uppercase">Phos</p>
                          <p className="text-xs font-black text-white">{lake.phosphorusLevel}ppb</p>
                        </div>
                      </div>
                      <div className={`text-[9px] font-black uppercase p-2 rounded-xl text-center border ${isThreat ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'}`}>
                        {lake.invasiveSpeciesStatus}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Footer - Sticky Overlay */}
      <div className="h-16 border-t border-slate-900 bg-slate-950/80 backdrop-blur-xl px-8 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-rose-500" /><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Bio-Threat</span></div>
           <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-slate-800" /><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Baseline Monitoring</span></div>
        </div>
        <div className="text-right">
           <span className="text-[9px] font-black text-slate-200 uppercase tracking-[0.2em] italic">Centroid-Based Zoom • {searchRadius}mi Radius</span>
        </div>
      </div>
    </div>
  );
};

export default BiosecurityMapView;