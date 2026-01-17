
import React, { useState } from 'react';
import { LakeData } from '../types';
import { Icons } from '../constants';
import HistoricalTrendChart from './HistoricalTrendChart';
import ThermalProfileChart from './ThermalProfileChart';
import { 
  generatePredictiveNarrative, 
  calculateTSI, 
  getTrophicLabel, 
} from '../utils/analysisUtils';

interface LakeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lake: LakeData;
}

const LakeDetailsModal: React.FC<LakeDetailsModalProps> = ({ isOpen, onClose, lake }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'deep' | 'ecology' | 'biological'>('summary');
  if (!isOpen) return null;

  const tsiScore = calculateTSI(lake.lastSecchiDiskReading);
  const tsiLabel = getTrophicLabel(tsiScore);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-12 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="fixed inset-0" onClick={onClose} />
      
      <div className="bg-slate-900 w-full max-w-6xl max-h-[90vh] rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden flex flex-col relative z-10">
        
        <header className="p-8 border-b border-slate-800 flex justify-between items-start bg-slate-950/50 shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-2">
               <span className="text-[9px] font-black uppercase text-blue-500 tracking-[0.2em] border border-blue-500/30 px-3 py-1 rounded-md">Deep Audit Sequence</span>
               <span className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em]">{lake.town}, ME</span>
            </div>
            <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">{lake.name}</h2>
          </div>
          <button onClick={onClose} className="p-3 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </header>

        <nav className="flex px-8 border-b border-slate-800 bg-slate-900 shrink-0 gap-6 overflow-x-auto scrollbar-hide">
          {(['summary', 'biological', 'deep', 'ecology'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 text-[10px] font-black uppercase tracking-[0.2em] border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab ? 'border-blue-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab === 'summary' ? 'Overview' : 
               tab === 'biological' ? 'FlowCam Analysis' : 
               tab === 'deep' ? 'Thermal Stratification' : 
               'Watershed Metrics'}
            </button>
          ))}
        </nav>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-950">
          {activeTab === 'summary' && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-900 p-8 rounded-3xl border border-slate-800">
                  <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Diagnostic Profile</h3>
                  <p className="text-lg font-bold text-slate-300 leading-relaxed italic mono">
                    "{generatePredictiveNarrative(lake)}"
                  </p>
                </div>
                <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 flex flex-col justify-center text-center">
                   <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Trophic State Index</h3>
                   <div className="flex items-baseline justify-center gap-2 mb-1">
                      <span className="text-6xl font-black text-white tracking-tighter">{tsiScore.toFixed(1)}</span>
                   </div>
                   <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{tsiLabel}</p>
                </div>
              </div>
              <HistoricalTrendChart data={lake.historicalData || []} lakeName={lake.name} />
            </div>
          )}

          {activeTab === 'biological' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              {lake.flowCamRecent ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800">
                    <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Imaging Flow Cytometry Data</h3>
                    <div className="space-y-6">
                      <div>
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Dominant Taxa</p>
                        <p className="text-2xl font-black text-emerald-400 italic">{lake.flowCamRecent.dominantTaxa}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                          <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Total Biovolume</p>
                          <p className="text-lg font-black text-white">{lake.flowCamRecent.totalBiovolume.toLocaleString()} <span className="text-[8px]">μm³/mL</span></p>
                        </div>
                        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                          <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Particle Count</p>
                          <p className="text-lg font-black text-white">{lake.flowCamRecent.particleCount.toLocaleString()} <span className="text-[8px]">Particles</span></p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800">
                    <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Taxa Distribution (%)</h3>
                    <div className="space-y-4">
                      {Object.entries(lake.flowCamRecent.taxaDistribution).map(([taxa, percent]) => (
                        <div key={taxa} className="space-y-1">
                          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                            <span className="text-slate-400">{taxa}</span>
                            <span className={taxa === 'cyanobacteria' && percent > 20 ? 'text-rose-500' : 'text-slate-200'}>{percent}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-1000 ${taxa === 'cyanobacteria' ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center bg-slate-900/40 rounded-3xl border border-dashed border-slate-800">
                   <Icons.Microscope />
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-4">FlowCam Imaging Not Available for this Basin</p>
                </div>
              )}
              <div className="p-6 bg-blue-900/10 border border-blue-500/20 rounded-2xl">
                <p className="text-[10px] text-blue-400 leading-relaxed italic uppercase font-bold">
                  Technical Note: Imaging Flow Cytometry (FlowCam) provides higher resolution biomass data than chlorophyll-a alone, capturing specific phytoplankton community shifts that precede harmful algal blooms.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'deep' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
               <ThermalProfileChart lake={lake} />
            </div>
          )}
          
          {activeTab === 'ecology' && lake.advancedMetrics && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {[
                   { label: 'Bio-Buffer Naturalization', val: `${Number(lake.advancedMetrics.shorelineNaturalization).toFixed(0)}%`, desc: 'Shoreline Naturalization' },
                   { label: 'Surface Hardening', val: `${Number(lake.advancedMetrics.imperviousSurface).toFixed(1)}%`, desc: 'Impervious Surface Area' },
                   { label: 'Hydraulic Turn-over', val: `${Number(lake.advancedMetrics.flushingRate).toFixed(1)}x`, desc: 'Annual Flushing Rate' }
                 ].map((m, i) => (
                   <div key={i} className="p-8 bg-slate-900 rounded-3xl border border-slate-800">
                      <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">{m.label}</h4>
                      <p className="text-4xl font-black text-white tracking-tighter">{m.val}</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-2 italic">{m.desc}</p>
                   </div>
                 ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-8 bg-slate-900 rounded-3xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Internal Loading Risk</h4>
                    <p className={`text-xl font-black uppercase ${lake.advancedMetrics.internalLoadingRisk === 'High' ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {lake.advancedMetrics.internalLoadingRisk} RISK
                    </p>
                  </div>
                  <Icons.Warning />
                </div>
                <div className="p-8 bg-slate-900 rounded-3xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Benthic Integrity</h4>
                    <p className="text-xl font-black text-blue-400 uppercase">
                      {lake.advancedMetrics.benthicHealth}
                    </p>
                  </div>
                  <Icons.Droplet />
                </div>
              </div>
            </div>
          )}
        </div>

        <footer className="p-6 border-t border-slate-800 bg-slate-900 flex justify-between items-center text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
           <div className="flex gap-4">
              <span>Registry Source: Maine DEP Great Ponds</span>
              <span className="hidden sm:inline opacity-30">|</span>
              <span className="hidden sm:inline">Station Code: ME-{lake.id.slice(0,4).toUpperCase()}</span>
           </div>
           <span>Last Audit Update: 2024 Seasonal Cycle</span>
        </footer>
      </div>
    </div>
  );
};

export default LakeDetailsModal;
