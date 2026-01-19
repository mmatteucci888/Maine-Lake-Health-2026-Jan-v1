
import React, { useState, useEffect, useMemo } from 'react';
import { LAKES_DATA, Icons, NORWAY_MAINE_COORDS } from './constants';
import { LakeData, GroundingSource } from './types';
import { getLakeHealthInsights } from './services/geminiService';
import { calculateDistance } from './utils/geoUtils';
import LakeCard from './components/LakeCard';
import HistoricalTrendChart from './components/HistoricalTrendChart';
import InvasiveModal from './components/InvasiveModal';
import ComparisonView from './components/ComparisonView';
import BiosecurityMapView from './components/BiosecurityMapView';
import ClusterAnalysisView from './components/ClusterAnalysisView';
import ThermalProfileChart from './components/ThermalProfileChart';
import ExpandableChart from './components/ExpandableChart';
import FlowCamAnalysis from './components/FlowCamAnalysis';
import { generatePredictiveNarrative, calculateTSI, getTrophicLabel } from './utils/analysisUtils';

const App: React.FC = () => {
  const [managedLakes, setManagedLakes] = useState<LakeData[]>(() => {
    try {
      const saved = localStorage.getItem('managed_lakes_v3');
      const parsed = saved ? JSON.parse(saved) : LAKES_DATA;
      return Array.isArray(parsed) ? parsed : LAKES_DATA;
    } catch (e) {
      return LAKES_DATA;
    }
  });
  
  const [selectedLake, setSelectedLake] = useState<LakeData | null>(managedLakes?.[0] || null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchDescription, setSearchDescription] = useState<string>("");
  const [searchRadius, setSearchRadius] = useState<number>(300);
  const [view, setView] = useState<'dashboard' | 'map' | 'cluster' | 'compare'>('dashboard');
  
  const [groundingSources, setGroundingSources] = useState<GroundingSource[]>([]);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [compareSet, setCompareSet] = useState<Set<string>>(new Set());
  
  const [retryCountdown, setRetryCountdown] = useState<number | null>(null);
  const [aiStatus, setAiStatus] = useState<'idle' | 'syncing' | 'rate-limited' | 'error'>('idle');

  useEffect(() => {
    let timer: any;
    if (retryCountdown !== null && retryCountdown > 0) {
      timer = setInterval(() => setRetryCountdown(prev => (prev && prev > 0 ? prev - 1 : null)), 1000);
    }
    return () => clearInterval(timer);
  }, [retryCountdown]);

  const fetchInsights = async (lake: LakeData, query?: string) => {
    if (!lake && !query) return;
    setLoading(true);
    setAiStatus('syncing');
    setRetryCountdown(null);
    try {
      const prompt = query || `Give me a specific ecological health audit for ${lake?.name || 'this lake'} in ${lake?.town || 'Maine'}. Focus on water quality, recent news, and technical status.`;
      const result = await getLakeHealthInsights(
        prompt, 
        lake?.id, 
        0, 
        (seconds) => {
          setRetryCountdown(seconds);
          setAiStatus('rate-limited');
        }
      );

      if (query && result?.discoveredLakes && Array.isArray(result.discoveredLakes) && result.discoveredLakes.length > 0) {
        const newLake = result.discoveredLakes[0];
        if (newLake) {
          setManagedLakes(prev => {
            const current = Array.isArray(prev) ? prev : [];
            if (current.find(l => l && l.id === newLake.id)) return current;
            const updated = [newLake, ...current];
            localStorage.setItem('managed_lakes_v3', JSON.stringify(updated));
            return updated;
          });
          setSelectedLake(newLake);
        }
      }

      setSearchDescription(result?.text || "Audit synchronized from registry archives.");
      setGroundingSources(Array.isArray(result?.sources) ? result.sources : []);
      setAiStatus('idle');
    } catch (e: any) {
      console.warn("AI busy or search error, fallback engaged.", e);
      if (lake) {
        setSearchDescription(generatePredictiveNarrative(lake));
      } else {
        setSearchDescription("Basin not found in immediate registry. Broadening search parameters...");
      }
      setAiStatus('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedLake && view === 'dashboard') {
      fetchInsights(selectedLake);
    }
  }, [selectedLake?.id, view]);

  const filteredLakes = useMemo(() => {
    const safeLakes = Array.isArray(managedLakes) ? managedLakes : [];
    return safeLakes.filter(lake => {
      if (!lake) return false;
      if (selectedLake && selectedLake.id === lake.id) return true;
      if (!lake.coordinates) return false;
      const dist = calculateDistance(NORWAY_MAINE_COORDS.lat, NORWAY_MAINE_COORDS.lng, lake.coordinates.lat, lake.coordinates.lng);
      return dist <= searchRadius;
    });
  }, [managedLakes, searchRadius, selectedLake]);

  const handleLakeInteraction = (lake: LakeData) => {
    if (!lake) return;
    if (isCompareMode) {
      const next = new Set(compareSet);
      next.has(lake.id) ? next.delete(lake.id) : next.add(lake.id);
      setCompareSet(next);
    } else {
      setSelectedLake(lake);
      setSearchDescription(""); 
      setGroundingSources([]);
      setView('dashboard');
    }
  };

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const inputElement = form.elements.namedItem('query') as HTMLInputElement;
    const input = inputElement?.value;
    if (!input?.trim() || loading) return;

    setView('dashboard');
    if (selectedLake) {
        await fetchInsights(selectedLake, input);
    } else if (Array.isArray(managedLakes) && managedLakes.length > 0) {
        await fetchInsights(managedLakes[0], input);
    }
    form.reset();
  };

  const tsiScore = useMemo(() => calculateTSI(selectedLake?.lastSecchiDiskReading || 5), [selectedLake]);

  if (!selectedLake) {
    return (
      <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 rounded-full border-t-2 border-blue-500 animate-spin" />
        <div className="text-center space-y-2">
          <p className="font-black text-white uppercase tracking-[0.5em] text-xs">Registry Node Offline</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">Re-initializing Data Stream...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950 text-slate-200">
      <aside className="hidden lg:flex w-80 flex-col bg-slate-900/50 border-r border-slate-800 no-print shrink-0 relative">
        <div className="p-6 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/20">
              <Icons.Droplet />
            </div>
            <div>
              <h1 className="text-sm font-black text-white uppercase tracking-tighter leading-none">Lake Guardian</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Global Registry Node</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar relative">
          <nav className="space-y-1 px-1 mt-4">
            <button onClick={() => { setView('dashboard'); setIsCompareMode(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${view === 'dashboard' && !isCompareMode ? 'bg-blue-600/10 border-blue-500/50 text-white' : 'text-slate-400 border-transparent hover:bg-slate-800'}`}>
              <Icons.Info /> <span className="text-[10px] font-black uppercase tracking-widest">Unified Audit</span>
            </button>
            <button onClick={() => { setIsCompareMode(true); setView('dashboard'); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${isCompareMode ? 'bg-blue-600/10 border-blue-500/50 text-white' : 'text-slate-400 border-transparent hover:bg-slate-800'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></svg> 
              <span className="text-[10px] font-black uppercase tracking-widest">Compare Mode</span>
            </button>
            <button onClick={() => { setView('map'); setIsCompareMode(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${view === 'map' ? 'bg-blue-600/10 border-blue-500/50 text-white' : 'text-slate-400 border-transparent hover:bg-slate-800'}`}>
              <Icons.MapPin /> <span className="text-[10px] font-black uppercase tracking-widest">Biosecurity Map</span>
            </button>
            <button onClick={() => { setView('cluster'); setIsCompareMode(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${view === 'cluster' ? 'bg-blue-600/10 border-blue-500/50 text-white' : 'text-slate-400 border-transparent hover:bg-slate-800'}`}>
              <Icons.Microscope /> <span className="text-[10px] font-black uppercase tracking-widest">Niche Analysis</span>
            </button>
          </nav>

          <div className="pt-6 space-y-3 pb-24">
            <div className="flex justify-between items-center px-4">
              <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Monitored Basins</h3>
              {isCompareMode && (
                <button 
                  onClick={() => setView('compare')}
                  disabled={compareSet.size < 2}
                  className="px-3 py-1 bg-blue-600 text-[8px] font-black uppercase rounded-lg disabled:opacity-30"
                >
                  Run Audit ({compareSet.size})
                </button>
              )}
            </div>
            <div className="space-y-2 px-1">
              {Array.isArray(filteredLakes) && filteredLakes.map(lake => (
                <LakeCard 
                  key={lake.id} 
                  lake={lake} 
                  isSelected={selectedLake?.id === lake.id} 
                  onClick={handleLakeInteraction} 
                  isCompareMode={isCompareMode} 
                  isSelectedForCompare={compareSet.has(lake.id)} 
                />
              ))}
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative bg-slate-950 overflow-hidden">
        <div className="scanline" />
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
          {view === 'dashboard' ? (
            <div className="p-8 lg:p-12 space-y-24 max-w-6xl mx-auto pb-40">
               <div className="animate-fade-in space-y-32">
                 <section className="text-center space-y-12">
                   <div className="flex flex-col items-center">
                      <div className="flex items-center gap-3 mb-6">
                         <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20 uppercase tracking-[0.3em]">Registry Focus Observation</span>
                      </div>
                      <h1 className="text-5xl lg:text-8xl font-black text-white tracking-tighter uppercase leading-none mb-8"> {selectedLake.name} </h1>
                   </div>

                   <div className="max-w-4xl mx-auto bg-slate-900/40 p-10 sm:p-14 rounded-[3rem] border border-slate-800/50 backdrop-blur-sm relative overflow-hidden group text-left min-h-[350px]">
                      <div className="flex justify-between items-center mb-8">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Audit Narrative</h3>
                        
                        <div className="flex items-center gap-3">
                           {aiStatus === 'syncing' && (
                             <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
                               <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                               <span className="text-[8px] font-black text-blue-400 uppercase">Consulting Registry...</span>
                             </div>
                           )}
                           {aiStatus === 'rate-limited' && (
                             <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20">
                               <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" />
                               <span className="text-[8px] font-black text-amber-500 uppercase">Queueing: {retryCountdown}s</span>
                             </div>
                           )}
                           {aiStatus === 'error' && (
                             <div className="flex items-center gap-2 px-3 py-1 bg-rose-500/10 rounded-full border border-rose-500/20">
                               <span className="text-[8px] font-black text-rose-500 uppercase">Local Baseline Active</span>
                             </div>
                           )}
                        </div>
                      </div>

                      <p className="text-xl sm:text-2xl font-medium text-slate-100 leading-relaxed whitespace-pre-wrap transition-all duration-500"> 
                        {loading && aiStatus === 'syncing' ? "Initializing Registry Protocol..." : (searchDescription || generatePredictiveNarrative(selectedLake))} 
                      </p>
                      
                      {Array.isArray(groundingSources) && groundingSources.length > 0 && (
                        <div className="mt-8 pt-6 border-t border-slate-800/40">
                          <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Verified Grounding</h4>
                          <div className="flex flex-wrap gap-4">
                            {groundingSources.map((source, i) => (
                              <a key={i} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-blue-400 hover:text-blue-300 underline underline-offset-4">
                                {source.title || "External Audit Link"}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                   </div>
                 </section>

                 <section className="space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-slate-900/30 p-8 rounded-3xl border border-slate-800 text-center">
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-4">Trophic State (TSI)</p>
                        <span className="text-5xl font-black text-white tracking-tighter">{tsiScore.toFixed(1)}</span>
                        <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-2">{getTrophicLabel(tsiScore)}</p>
                      </div>
                      <div className="bg-slate-900/30 p-8 rounded-3xl border border-slate-800 text-center">
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-4">Clarity</p>
                        <span className="text-5xl font-black text-blue-400 tracking-tighter">{selectedLake.lastSecchiDiskReading}m</span>
                      </div>
                      <div className="bg-slate-900/30 p-8 rounded-3xl border border-slate-800 text-center">
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-4">Nutrient (P)</p>
                        <span className="text-5xl font-black text-rose-400 tracking-tighter">{selectedLake.phosphorusLevel}ppb</span>
                      </div>
                      <div className="bg-slate-900/30 p-8 rounded-3xl border border-slate-800 text-center">
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-4">Biomass (Chl)</p>
                        <span className="text-5xl font-black text-emerald-400 tracking-tighter">{selectedLake.chlorophyllLevel}ppb</span>
                      </div>
                   </div>
                 </section>

                 <section className="space-y-10">
                   <div className="flex items-center gap-6">
                      <h2 className="text-sm font-black text-white uppercase tracking-[0.4em] whitespace-nowrap">01 // Longitudinal Trends</h2>
                      <div className="h-px flex-1 bg-slate-800" />
                   </div>
                   <HistoricalTrendChart data={Array.isArray(selectedLake?.historicalData) ? selectedLake.historicalData : []} lakeName={selectedLake.name} />
                 </section>

                 {selectedLake?.flowCamRecent && (
                   <section className="space-y-10">
                      <div className="flex items-center gap-6">
                          <h2 className="text-sm font-black text-white uppercase tracking-[0.4em] whitespace-nowrap">02 // FlowCam Particle Analysis</h2>
                          <div className="h-px flex-1 bg-slate-800" />
                      </div>
                      <ExpandableChart title={`${selectedLake.name} // Biovolume Audit`}>
                         <FlowCamAnalysis data={selectedLake.flowCamRecent} />
                      </ExpandableChart>
                   </section>
                 )}

                 <section className="space-y-10 pb-32">
                   <div className="flex items-center gap-6">
                      <h2 className="text-sm font-black text-white uppercase tracking-[0.4em] whitespace-nowrap">03 // Thermal Profile</h2>
                      <div className="h-px flex-1 bg-slate-800" />
                   </div>
                   <ExpandableChart title={`${selectedLake.name} // Thermal Dynamics`}>
                      <ThermalProfileChart lake={selectedLake} />
                   </ExpandableChart>
                 </section>
               </div>
            </div>
          ) : view === 'map' ? (
            <BiosecurityMapView lakes={filteredLakes} centerLake={selectedLake} onSelectLake={handleLakeInteraction} onClose={() => setView('dashboard')} searchRadius={searchRadius} onRadiusChange={setSearchRadius} />
          ) : view === 'cluster' ? (
            <ClusterAnalysisView lakes={filteredLakes} onSelectLake={handleLakeInteraction} onClose={() => setView('dashboard')} />
          ) : (
            <ComparisonView lakes={Array.isArray(managedLakes) ? managedLakes.filter(l => l && compareSet.has(l.id)) : []} onClose={() => setView('dashboard')} />
          )}
        </div>

        <footer className="p-6 border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl no-print shrink-0 z-50">
           <form onSubmit={handleSearch} className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input 
                  name="query" 
                  autoComplete="off" 
                  placeholder="Audit Registry (e.g. 'Search Sebago' or 'Compare Clarity')" 
                  disabled={loading}
                  className={`w-full px-6 py-4 rounded-xl bg-slate-900 border text-white outline-none focus:ring-2 transition-all text-xs font-bold mono ${
                    aiStatus === 'rate-limited' ? 'border-amber-500/50 focus:ring-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'border-slate-800 focus:ring-blue-500'
                  }`} 
                />
                <div className={`absolute right-4 top-1/2 -translate-y-1/2 ${aiStatus === 'rate-limited' ? 'text-amber-500' : 'text-slate-400'}`}> 
                   {loading ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Icons.Search />}
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading} 
                className={`px-8 py-4 sm:py-0 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg disabled:opacity-50 ${
                  aiStatus === 'rate-limited' 
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/20' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20'
                }`}
              > 
                {loading ? (aiStatus === 'rate-limited' ? `Queued (${retryCountdown}s)` : 'Consulting...') : 'Search Basin'} 
              </button>
           </form>
           <div className="mt-4 text-center">
             <p className="text-[8px] font-bold text-slate-600 uppercase tracking-[0.4em]">
               Ecological Registry Node • Pro Grade Analysis • v1.3.1 • Sync: {aiStatus.toUpperCase()}
             </p>
           </div>
        </footer>
      </main>

      <InvasiveModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} lakes={filteredLakes} onSelectLake={handleLakeInteraction} />
    </div>
  );
};

export default App;
