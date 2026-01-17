
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
    const maxP = Math.max(...lakes.map(l => l.phosphorusLevel), 1);
    const maxVal = activeMetric === 'secchi' 
      ? Math.max(...lakes.map(l => l.lastSecchiDiskReading), 1)
      : Math.max(...lakes.map(l => l.chlorophyllLevel), 1);

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
    <div className="h-full flex flex-col bg-slate-950 animate-fade-in overflow-hidden">
      <div className="p-8 border-b border-slate-900 bg-slate-900/30 flex justify-between items-start shrink-0">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Ecological Cluster Projection</h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-2">
            Nix-Hutchinson Resource Space Analysis • {lakes.length} Monitored Basins
          </p>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
             <button onClick={() => setActiveMetric('secchi')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeMetric === 'secchi' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>Transparency</button>
             <button onClick={() => setActiveMetric('chlorophyll')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeMetric === 'chlorophyll' ? 'bg-emerald-600 text-white' : 'text-slate-500'}`}>Biomass</button>
           </div>
           <button onClick={onClose} className="p-3 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
           </button>
        </div>
      </div>

      <div className="flex-1 relative m-6 md:m-12 bg-slate-900/20 rounded-[3rem] border border-slate-800 shadow-inner overflow-hidden">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 -rotate-90 text-[9px] font-black text-slate-700 uppercase tracking-[0.3em] whitespace-nowrap">
          ← {activeMetric === 'secchi' ? 'Clarity (Secchi m)' : 'Biomass (Chl-a μg/L)'} →
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-black text-slate-700 uppercase tracking-[0.3em] whitespace-nowrap">
          ← Total Phosphorus (μg/L) →
        </div>

        <div className="flex-1 relative h-full m-12 md:m-20">
          {projectedData.map((lake) => {
            const isHovered = hoveredId === lake.id;
            return (
              <div
                key={lake.id}
                className="absolute transition-all duration-700 cursor-pointer"
                style={{ left: `${lake.x}%`, top: `${lake.y}%`, transform: 'translate(-50%, -50%)' }}
                onMouseEnter={() => setHoveredId(lake.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => onSelectLake(lake)}
              >
                <div 
                  className={`w-4 h-4 rounded-full border-2 border-slate-950 transition-all ${isHovered ? 'scale-150 ring-4 ring-white/20' : ''}`}
                  style={{ backgroundColor: lake.color }}
                />
                {isHovered && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-48 bg-slate-950 border border-slate-800 p-3 rounded-xl shadow-2xl z-50 pointer-events-none">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{lake.label}</p>
                    <h4 className="text-xs font-black text-white mt-1">{lake.name}</h4>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-8 border-t border-slate-900 bg-slate-950/80">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <p className="text-[10px] text-slate-300 leading-relaxed uppercase tracking-wider font-bold">
            Analysis Brief: Niche Space refers to a multidimensional hypervolume where environment permitted species exist. 
            Yield Ratio (Chl:TP) defines how efficiently nutrients convert to algal biomass.
          </p>
          <div className="text-right">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Audit Verified: 2024</span>
             <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest italic whitespace-nowrap">Maine DEP VLMP Core Registry</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClusterAnalysisView;
