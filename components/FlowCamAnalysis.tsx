import React from 'react';
import { FlowCamData } from '../types';

interface FlowCamAnalysisProps {
  data: FlowCamData;
}

const FlowCamAnalysis: React.FC<FlowCamAnalysisProps> = ({ data }) => {
  const taxa = data.taxaDistribution;
  
  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 lg:p-12 overflow-hidden relative">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Col: Biovolume Metric */}
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Automated Imaging Audit</h3>
              <div className="h-px w-8 bg-slate-800" />
              <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Sensor: FC-8100</span>
            </div>
            <h4 className="text-3xl font-black text-white uppercase italic tracking-tighter">Particle Biovolume</h4>
          </div>

          <div className="relative inline-block">
            <div className="text-7xl font-black text-white tracking-tighter leading-none">
              {data.totalBiovolume.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              <span className="text-lg text-slate-500 ml-4 font-bold tracking-normal uppercase">μm³/mL</span>
            </div>
            <div className="mt-4 flex items-center gap-3">
               <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Count: {data.particleCount} particles</span>
               </div>
               <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Retrieval: {data.samplingDate}</div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/50 space-y-4">
             <p className="text-[11px] text-slate-400 leading-relaxed max-w-sm">
               High-resolution FlowCam imaging identifies the total 3D biovolume of suspended solids and phytoplankton, providing a more accurate biomass proxy than chlorophyll-a alone.
             </p>
             <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Data Provenance</p>
                <p className="text-[10px] font-bold text-slate-300">Yokogawa Fluid Imaging FlowCam 8100</p>
                <p className="text-[9px] font-medium text-slate-500 italic mt-0.5">VisualSpreadsheet v5.2 / 10X Field of View</p>
             </div>
          </div>
        </div>

        {/* Right Col: Taxa Distribution */}
        <div className="space-y-10 bg-black/20 p-8 rounded-[2rem] border border-slate-800/50 shadow-inner">
           <div className="flex justify-between items-end">
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Dominant Taxa</p>
                <p className="text-xl font-black text-blue-400 uppercase italic tracking-tight">{data.dominantTaxa}</p>
              </div>
           </div>

           <div className="space-y-6">
              {[
                { label: 'Diatoms', val: taxa.diatoms, color: 'bg-emerald-500' },
                { label: 'Cyanobacteria', val: taxa.cyanobacteria, color: 'bg-rose-500' },
                { label: 'Green Algae', val: taxa.greenAlgae, color: 'bg-blue-500' },
                { label: 'Other', val: taxa.other, color: 'bg-slate-700' }
              ].map((item) => (
                <div key={item.label} className="space-y-2">
                   <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                      <span className="text-slate-400">{item.label}</span>
                      <span className="text-white">{item.val.toFixed(1)}%</span>
                   </div>
                   <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.color} transition-all duration-1000 ease-out`} 
                        style={{ width: `${item.val}%` }} 
                      />
                   </div>
                </div>
              ))}
           </div>
           
           <div className="mt-4 text-center">
              <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Spectral Identification Algorithm v4.1</p>
           </div>
        </div>
      </div>
      
      {/* Visual Background Element */}
      <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-500/5 blur-[100px] pointer-events-none rounded-full" />
    </div>
  );
};

export default FlowCamAnalysis;