
import React, { useMemo, useState } from 'react';
import { LakeData } from '../types';
import { performEcologicalClustering } from '../utils/analysisUtils';

interface ClusterAnalysisViewProps {
  lakes: LakeData[];
  onSelectLake: (lake: LakeData) => void;
  onClose: () => void;
}

const ClusterAnalysisView: React.FC<ClusterAnalysisViewProps> = ({ lakes, onSelectLake, onClose }) => {
  const [activeMetric, setActiveMetric] = useState<'secchi' | 'chlorophyll'>('secchi');
  const clusters = useMemo(() => performEcologicalClustering(lakes), [lakes]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const projectedData = useMemo(() => {
    // 25% padding on max values ensures nodes never touch the container edges
    const maxP = Math.max(...lakes.map(l => l.phosphorusLevel), 1) * 1.25;
    const maxVal = (activeMetric === 'secchi' 
      ? Math.max(...lakes.map(l => l.lastSecchiDiskReading), 1)
      : Math.max(...lakes.map(l => l.chlorophyllLevel), 1)) * 1.25;

    return lakes.map(lake => {
      const x = (lake.phosphorusLevel / maxP) * 100;
      const val = activeMetric === 'secchi' ? lake.lastSecchiDiskReading : lake.chlorophyllLevel;
      const y = (1 - (val / maxVal)) * 100;
      const originalCluster = clusters.find(c => c.lakeId === lake.id);
      return { 
        ...lake, 
        x, 
        y, 
        color: originalCluster?.color || '#334155',
        label: originalCluster?.label || 'Unknown'
      };
    });
  }, [lakes, clusters, activeMetric]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-950 animate-in fade-in duration-500 overflow-hidden">
      {/* Header HUD */}
      <div className="p-8 border-b border-slate-900 bg-slate-950/80 backdrop-blur-xl flex justify-between items-center z-50 shrink-0">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 1 1-2-2V6h6v8l1.5 1.5"/><path d="M12 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/></svg>
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none">Niche Space Analysis</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-2">
              Resource Manifold Visualization • Fit-to-Screen
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
             <button onClick={() => setActiveMetric('secchi')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeMetric === 'secchi' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}>Transparency</button>
             <button onClick={() => setActiveMetric('chlorophyll')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeMetric === 'chlorophyll' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500'}`}>Biomass</button>
           </div>
           <button onClick={onClose} className="p-4 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all shadow-xl">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
           </button>
        </div>
      </div>

      {/* Main Field - Fixed Viewport */}
      <div className="flex-1 relative m-8 mt-12 mb-20 bg-slate-900/10 rounded-[3rem] border border-slate-800/50 shadow-inner overflow-hidden">
        
        {/* Trophic Zone Backgrounds - Scaled to Viewport */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
           <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-500/5 border-b border-l border-blue-500/10 rounded-bl-[4rem]">
              <span className="absolute bottom-6 left-6 text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] italic">Oligotrophic</span>
           </div>
           <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-rose-500/5 border-t border-r border-rose-500/10 rounded-tr-[4rem]">
              <span className="absolute top-6 right-6 text-[10px] font-black text-rose-500 uppercase tracking-[0.5em] italic">Eutrophic</span>
           </div>
        </div>

        {/* Axis Labels */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-black text-slate-700 uppercase tracking-[0.5em] whitespace-nowrap pointer-events-none">
          {activeMetric === 'secchi' ? 'TRANSPARENCY (m)' : 'BIOMASS (ppb)'} AXIS
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-700 uppercase tracking-[0.5em] whitespace-nowrap pointer-events-none">
          PHOSPHORUS LOADING (ppb) AXIS
        </div>

        {/* Data Field Mapping */}
        <div className="absolute inset-0 m-16">
          {projectedData.map((lake) => {
            const isHovered = hoveredId === lake.id;
            return (
              <div
                key={lake.id}
                className="absolute transition-all duration-500 cursor-pointer"
                style={{ left: `${lake.x}%`, top: `${lake.y}%`, transform: 'translate(-50%, -50%)' }}
                onMouseEnter={() => setHoveredId(lake.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => onSelectLake(lake)}
              >
                <div className="relative group flex flex-col items-center">
                  <div 
                    className={`w-5 h-5 rounded-full border-4 border-slate-950 transition-all ${
                      isHovered ? 'scale-150 ring-8 ring-white/10 z-50 shadow-2xl' : 'z-20 shadow-lg'
                    }`}
                    style={{ backgroundColor: lake.color }}
                  />
                  
                  {/* Persistent Identity Tag */}
                  <div className="mt-2 text-center pointer-events-none">
                     <p className="text-[9px] font-black text-white uppercase bg-slate-900/60 px-2 py-0.5 rounded backdrop-blur-sm border border-slate-800/50 whitespace-nowrap">
                       {lake.name}
                     </p>
                  </div>

                  {/* Desktop Hover Glance */}
                  {isHovered && (
                    <div className="absolute bottom-full mb-6 left-1/2 -translate-x-1/2 w-60 bg-slate-950 border-2 border-slate-800 p-6 rounded-[2rem] shadow-2xl z-[100] animate-in zoom-in-95 duration-200">
                      <span className="block text-[8px] font-black text-blue-500 uppercase tracking-widest mb-2">{lake.label}</span>
                      <h4 className="text-xl font-black text-white uppercase italic truncate mb-4">{lake.name}</h4>
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-900">
                        <div>
                          <p className="text-[8px] font-black text-slate-500 uppercase">Phos</p>
                          <p className="text-lg font-black text-white">{lake.phosphorusLevel}ppb</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-slate-500 uppercase">{activeMetric === 'secchi' ? 'Secchi' : 'Algae'}</p>
                          <p className="text-lg font-black text-white">{activeMetric === 'secchi' ? lake.lastSecchiDiskReading : lake.chlorophyllLevel}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info HUD */}
      <div className="h-16 border-t border-slate-900 bg-slate-950/80 backdrop-blur-xl px-10 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Oligotrophic Index</span></div>
           <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mesotrophic Index</span></div>
           <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-rose-500" /><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Eutrophic Index</span></div>
        </div>
        <div className="text-right">
           <span className="text-[9px] font-black text-slate-200 uppercase tracking-[0.2em] italic">Projection Field Verified: 2024 Seasonal Cycle</span>
        </div>
      </div>
    </div>
  );
};

export default ClusterAnalysisView;
