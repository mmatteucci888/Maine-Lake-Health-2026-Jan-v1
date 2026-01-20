
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
    if (!lake) return;
    setLoading(true);
    setAiStatus('syncing');
    setRetryCountdown(null);
    try {
      const prompt = query || `Ecological health audit for ${lake.name} in ${lake.town}, Maine. Focus on phosphorus levels and recent environmental news.`;
      const result = await getLakeHealthInsights(
        prompt, 
        lake.id, 
        0, 
        (seconds) => {
          setRetryCountdown(seconds);
          setAiStatus('rate-limited');
        }
      );

      setSearchDescription(result?.text || "");
      setGroundingSources(Array.isArray(result?.sources) ? result.sources : []);
      setAiStatus('idle');
    } catch (e: any) {
      setSearchDescription(generatePredictiveNarrative(lake));
      setAiStatus('error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedLake && view === 'dashboard' && !isCompareMode) {
      fetchInsights(selectedLake);
    }
  }, [selectedLake?.id, view, isCompareMode]);

  const filteredLakes = useMemo(() => {
    const safeLakes = Array.isArray(managedLakes) ? managedLakes : [];
    return safeLakes.filter(lake => {
      if (!lake) return false;
      const dist = calculateDistance(NORWAY_MAINE_COORDS.lat, NORWAY_MAINE_COORDS.lng, lake.coordinates.lat, lake.coordinates.lng);
      return dist <= searchRadius;
    });
  }, [managedLakes, searchRadius]);

  const handleLakeInteraction = (lake: LakeData) => {
    if (!lake) return;
    if (isCompareMode) {
      setCompareSet(prev => {
        const next = new Set(prev);
        if (next.has(lake.id)) {
          next.delete(lake.id);
        } else {
          next.add(lake.id);
        }
        return next;
      });
    } else {
      setSelectedLake(lake);
      setSearchDescription(""); 
      setGroundingSources([]);
      setView('dashboard');
      setIsCompareMode(false);
    }
  };

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const inputElement = form.elements.namedItem('query') as HTMLInputElement;
    const input = inputElement?.value;
    if (!input?.trim() || loading) return;

    const searchTerm = input.toLowerCase().trim();
    
    // 1. LOCAL SEARCH: Find by exact or partial name/town match
    const localMatch = managedLakes.find(l => 
      l.name.toLowerCase().includes(searchTerm) || 
      l.town.toLowerCase().includes(searchTerm)
    );

    if (localMatch) {
      setSelectedLake(localMatch);
      setView('dashboard');
      setIsCompareMode(false);
      setSearchDescription("");
      form.reset();
      return;
    }

    // 2. REMOTE AUDIT: AI fallback
    setView('dashboard');
    setIsCompareMode(false);
    if (selectedLake) {
      await fetchInsights(selectedLake, input);
    } else if (managedLakes.length > 0) {
      await fetchInsights(managedLakes[0], input);
    }
    form.reset();
  };

  const tsiScore = useMemo(() => calculateTSI(selectedLake?.lastSecchiDiskReading || 5), [selectedLake]);

  const comparisonLakes = useMemo(() => 
    managedLakes.filter(l => compareSet.has(l.id)), 
    [managedLakes, compareSet]
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950 text-slate-200">
      <aside className="hidden lg:flex w-80 flex-col bg-slate-900/50 border-r border-slate-800 shrink-0 relative">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20"><Icons.Droplet /></div>
            <div>
              <h1 className="text-sm font-black text-white uppercase tracking-tighter leading-none">Lake Guardian</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Registry Node</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          <nav className="space-y-1 mt-4">
            <button onClick={() => { setView('dashboard'); setIsCompareMode(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${view === 'dashboard' && !isCompareMode ? 'bg-blue-600/10 border-blue-500/50 text-white' : 'text-slate-400 border-transparent hover:bg-slate-800'}`}>
              <Icons.Info /> <span className="text-[10px] font-black uppercase tracking-widest">Dashboard</span>
            </button>
            <button onClick={() => { setView('map'); setIsCompareMode(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${view === 'map' ? 'bg-blue-600/10 border-blue-500/50 text-white' : 'text-slate-400 border-transparent hover:bg-slate-800'}`}>
              <Icons.MapPin /> <span className="text-[10px] font-black uppercase tracking-widest">Map View</span>
            </button>
            <button onClick={() => { setView('cluster'); setIsCompareMode(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${view === 'cluster' ? 'bg-blue-600/10 border-blue-500/50 text-white' : 'text-slate-400 border-transparent hover:bg-slate-800'}`}>
              <Icons.Microscope /> <span className="text-[10px] font-black uppercase tracking-widest">Niche Space</span>
            </button>
            <button onClick={() => { setIsCompareMode(!isCompareMode); if(!isCompareMode) setView('dashboard'); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${isCompareMode ? 'bg-amber-600/10 border-amber-500/50 text-amber-400' : 'text-slate-400 border-transparent hover:bg-slate-800'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18"/><path d="M3 6h18"/><path d="M3 18h18"/></svg> 
              <span className="text-[10px] font-black uppercase tracking-widest">{isCompareMode ? 'Cancel Selection' : 'Compare Basins'}</span>
            </button>
          </nav>

          <div className="pt-6 space-y-3 pb-32">
            <h3 className="text-[9px] font-black text-slate-400 uppercase px-4 tracking-[0.3em]">{isCompareMode ? 'Select for comparison' : 'Monitored Basins'}</h3>
            <div className="space-y-2">
              {(Array.isArray(filteredLakes) ? filteredLakes : []).map(lake => (
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

        {isCompareMode && compareSet.size >= 1 && (
          <div className="absolute bottom-6 left-4 right-4 animate-in slide-in-from-bottom-4 duration-300">
            <button 
              onClick={() => setView('compare')}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2"
            >
              Run Audit Comparison ({compareSet.size})
            </button>
          </div>
        )}
      </aside>

      <main className="flex-1 flex flex-col relative bg-slate-950 overflow-hidden">
        <div className="scanline" />
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
          {view === 'dashboard' && selectedLake ? (
            <div className="p-8 lg:p-12 space-y-24 max-w-6xl mx-auto pb-40">
               <div className="animate-fade-in space-y-32">
                 <section className="text-center space-y-12">
                   <h1 className="text-5xl lg:text-8xl font-black text-white tracking-tighter uppercase leading-none mb-8"> {selectedLake.name} </h1>
                   <div className="max-w-4xl mx-auto bg-slate-900/40 p-10 rounded-[3rem] border border-slate-800/50 backdrop-blur-sm text-left min-h-[350px]">
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Limnological Narrative</span>
                        {aiStatus === 'error' && <span className="text-[8px] font-black text-rose-500 bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20 uppercase tracking-widest">Local Mode</span>}
                        {aiStatus === 'syncing' && <span className="text-[8px] font-black text-blue-500 animate-pulse uppercase tracking-widest">Syncing Registry...</span>}
                      </div>
                      <p className="text-xl sm:text-2xl font-medium text-slate-100 leading-relaxed whitespace-pre-wrap"> 
                        {loading ? "Initializing connection to Maine Lake Registry..." : (searchDescription || generatePredictiveNarrative(selectedLake))} 
                      </p>
                      {(Array.isArray(groundingSources) ? groundingSources : []).length > 0 && (
                        <div className="mt-8 pt-6 border-t border-slate-800/40 flex flex-wrap gap-4">
                          {groundingSources.map((source, i) => (
                            <a key={i} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-blue-400 underline underline-offset-4 decoration-blue-500/30 hover:decoration-blue-400 transition-all">
                              {source.title || "External Audit Link"}
                            </a>
                          ))}
                        </div>
                      )}
                   </div>
                 </section>

                 <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-900/30 p-8 rounded-3xl border border-slate-800 text-center hover:border-blue-500/30 transition-all group">
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2 group-hover:text-blue-400 transition-colors">Trophic Index</p>
                      <span className="text-4xl font-black text-white">{tsiScore.toFixed(1)}</span>
                      <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-2">{getTrophicLabel(tsiScore)}</p>
                    </div>
                    <div className="bg-slate-900/30 p-8 rounded-3xl border border-slate-800 text-center hover:border-blue-500/30 transition-all group">
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2 group-hover:text-blue-400 transition-colors">Clarity (m)</p>
                      <span className="text-4xl font-black text-blue-400">{selectedLake.lastSecchiDiskReading}</span>
                    </div>
                    <div className="bg-slate-900/30 p-8 rounded-3xl border border-slate-800 text-center hover:border-blue-500/30 transition-all group">
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-2 group-hover:text-rose-400 transition-colors">Phos (ppb)</p>
                      <span className="text-4xl font-black text-rose-400">{selectedLake.phosphorusLevel}</span>
                    </div>
                 </section>

                 <section className="space-y-10">
                   <div className="flex items-center gap-6">
                      <h2 className="text-sm font-black text-white uppercase tracking-[0.4em] whitespace-nowrap">Longitudinal Trends</h2>
                      <div className="h-px flex-1 bg-slate-800" />
                   </div>
                   <HistoricalTrendChart data={Array.isArray(selectedLake?.historicalData) ? selectedLake.historicalData : []} lakeName={selectedLake.name} />
                 </section>

                 <section className="space-y-10 pb-32">
                   <div className="flex items-center gap-6">
                      <h2 className="text-sm font-black text-white uppercase tracking-[0.4em] whitespace-nowrap">Thermal Profile</h2>
                      <div className="h-px flex-1 bg-slate-800" />
                   </div>
                   <ExpandableChart title={`${selectedLake.name} // Thermal Dynamics`}>
                      <ThermalProfileChart lake={selectedLake} />
                   </ExpandableChart>
                 </section>
               </div>
            </div>
          ) : view === 'map' ? (
            <BiosecurityMapView lakes={filteredLakes} centerLake={selectedLake || undefined} onSelectLake={handleLakeInteraction} onClose={() => setView('dashboard')} searchRadius={searchRadius} onRadiusChange={setSearchRadius} />
          ) : view === 'cluster' ? (
            <ClusterAnalysisView lakes={filteredLakes} onSelectLake={handleLakeInteraction} onClose={() => setView('dashboard')} />
          ) : view === 'compare' ? (
            <ComparisonView lakes={comparisonLakes} onClose={() => { setView('dashboard'); setIsCompareMode(false); setCompareSet(new Set()); }} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-slate-500 font-black uppercase tracking-widest">Select a basin to view analytics</p>
            </div>
          )}
        </div>

        <footer className="p-8 border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl shrink-0 z-50">
           <form onSubmit={handleSearch} className="max-w-5xl mx-auto flex flex-col sm:flex-row gap-4">
              <input 
                name="query" 
                placeholder="Find a lake (e.g. 'Sebago') or ask a question..." 
                autoComplete="off"
                className="flex-1 px-8 py-6 rounded-2xl bg-slate-900 border border-slate-800 text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all text-xl font-black tracking-tight placeholder:text-slate-700" 
              />
              <button 
                type="submit" 
                disabled={loading} 
                className="px-12 py-6 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all disabled:opacity-50 shadow-2xl shadow-blue-500/20 active:scale-95 whitespace-nowrap"
              > 
                {loading ? 'Consulting...' : 'Search Basin'} 
              </button>
           </form>
        </footer>
      </main>
      <InvasiveModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} lakes={filteredLakes} onSelectLake={handleLakeInteraction} />
    </div>
  );
};

export default App;
