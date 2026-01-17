
import React, { useState, useMemo } from 'react';
import { LakeData } from '../types';

interface BiosecurityMapViewProps {
  lakes: LakeData[];
  onSelectLake: (lake: LakeData) => void;
  onClose: () => void;
  centerLake?: LakeData;
}

const BiosecurityMapView: React.FC<BiosecurityMapViewProps> = ({ lakes, onSelectLake, onClose, centerLake }) => {
  const [hoveredLake, setHoveredLake] = useState<LakeData | null>(null);

  const bounds = useMemo(() => {
    let targetLat = centerLake?.coordinates.lat || lakes.reduce((acc, l) => acc + l.coordinates.lat, 0) / lakes.length;
    let targetLng = centerLake?.coordinates.lng || lakes.reduce((acc, l) => acc + l.coordinates.lng, 0) / lakes.length;
    const spread = 0.5;
    return {
      minLat: targetLat - spread, maxLat: targetLat + spread,
      minLng: targetLng - spread, maxLng: targetLng + spread
    };
  }, [lakes, centerLake]);

  const getPosition = (lat: number, lng: number) => {
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
    const y = 100 - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 100;
    return { x: `${x}%`, y: `${y}%` };
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 animate-fade-in relative overflow-hidden text-white">
      <div className="absolute top-0 left-0 right-0 p-6 z-30 pointer-events-none">
        <div className="flex justify-between items-start">
          <div className="bg-slate-900/95 backdrop-blur-xl p-6 rounded-[2rem] border border-slate-800 pointer-events-auto shadow-2xl">
            <h2 className="text-xl font-black text-white tracking-tighter uppercase mb-2">Invasive Propagule Vectors</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Spatial Invasion Vulnerability Index (SIVI)</p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Active Bio-Threat</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-[10px] font-black uppercase tracking-widest hover:border-blue-500 transition-all pointer-events-auto shadow-2xl">
            Exit Map
          </button>
        </div>
      </div>

      <div className="flex-1 relative mx-10 my-24 rounded-[3rem] border border-slate-800 bg-slate-900/10 shadow-inner overflow-hidden">
        {lakes.map((lake) => {
          const pos = getPosition(lake.coordinates.lat, lake.coordinates.lng);
          const isThreat = lake.invasiveSpeciesStatus !== 'None detected';
          const isHovered = hoveredLake?.id === lake.id;
          
          return (
            <div
              key={lake.id}
              className={`absolute transition-all duration-300 cursor-pointer ${isHovered ? 'z-50' : 'z-20'}`}
              style={{ left: pos.x, top: pos.y, transform: 'translate(-50%, -50%)' }}
              onMouseEnter={() => setHoveredLake(lake)}
              onMouseLeave={() => setHoveredLake(null)}
              onClick={() => onSelectLake(lake)}
            >
              <div className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${isThreat ? 'bg-rose-500 border-rose-200 scale-125' : 'bg-slate-700 border-slate-500 opacity-60'}`} />
              {isHovered && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-48 bg-slate-950 border border-slate-800 p-3 rounded-xl shadow-2xl z-50 pointer-events-none">
                  <h4 className="text-xs font-black text-white">{lake.name}</h4>
                  <p className="text-[8px] font-black text-rose-500 uppercase mt-1">Status: {lake.invasiveSpeciesStatus}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-8 border-t border-slate-900 bg-slate-950 z-30">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] text-slate-300 leading-relaxed italic uppercase tracking-wider font-bold max-w-2xl">
            Propagule Pressure: Composite measure of non-native species individuals released into a region. 
            Risk mapping incorporates Euclidean distance to transport corridors and epilimnetic phosphorus suitability.
          </p>
          <div className="text-right shrink-0">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Maine Vector Authority</span>
             <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest whitespace-nowrap">DEP / Soil & Water District 2024</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiosecurityMapView;
