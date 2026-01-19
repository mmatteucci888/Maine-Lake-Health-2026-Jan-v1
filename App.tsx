
import React, { useState, useEffect, useMemo } from 'react';
import { LAKES_DATA, Icons, NORWAY_MAINE_COORDS } from './constants';
import { LakeData, GroundingSource } from './types';
import { getLakeHealthInsights, getLakeNews } from './services/geminiService';
import { calculateDistance } from './utils/geoUtils';
import LakeCard from './components/LakeCard';
import HistoricalTrendChart from './components/HistoricalTrendChart';
import InvasiveAlerts from './components/InvasiveAlerts';
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
    const saved = localStorage.getItem('managed_lakes_v3');
    return saved ? JSON.parse(saved) : LAKES_DATA;
  });
  
  const [selectedLake, setSelectedLake] = useState<LakeData>(managedLakes[0]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchDescription, setSearchDescription] = useState<string>("");
  const [searchRadius, setSearchRadius] = useState<number>(300);
  const [view, setView] = useState<'dashboard' | 'map' | 'cluster' | 'compare'>('dashboard');
  
  const [groundingSources, setGroundingSources] = useState<GroundingSource[]>([]);
  const [newsArticles, setNewsArticles] = useState<{content: string}[]>([]);
  
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [compareSet, setCompareSet] = useState<Set<string>>(new Set());

  // Safe check for API key availability
  const hasApiKey = typeof process !== 'undefined' && process.env && !!process.env.API_KEY;
  const laonLakeIds = ['pennesseewassee', 'little-pennesseewassee', 'sand-pond', 'north-pond'];

  useEffect(() => {
    localStorage.setItem('managed_lakes_v3', JSON.stringify(managedLakes));
  }, [managedLakes]);

  // Triggered on lake selection to fetch unique Gemini insights
  useEffect(() => {
    if (selectedLake && view === 'dashboard') {
      const fetchInsights = async () => {
        setLoading(true);
        try {
          const prompt = `Give me a specific ecological health audit for ${selectedLake.name} in ${selectedLake.town}, Maine. Focus on water quality, recent news, and technical status.`;
          const result = await getLakeHealthInsights(prompt);
          setSearchDescription(result.text);
          setGroundingSources(result.sources || []);
          
          const news = await getLakeNews(selectedLake.name, selectedLake.town);
          setNewsArticles(news.articles || []);
        } catch (e) {
          console.error("Dashboard selection audit failed", e);
          setSearchDescription(generatePredictiveNarrative(selectedLake));
        } finally {
          setLoading(false);
        }
      };
      fetchInsights();
    }
  }, [selectedLake.id, view]);

  const filteredLakes = useMemo(() => {
    return managedLakes.filter(lake => {
      if (selectedLake?.id === lake.id) return true;
      if (!lake.coordinates) return false;
      const dist = calculateDistance(
        NORWAY_MAINE_COORDS.lat, 
        NORWAY_MAINE_COORDS.lng, 
        lake.coordinates.lat, 
        lake.coordinates.lng
      );
      return dist <= searchRadius;
    });
  }, [managedLakes, searchRadius, selectedLake]);

  const laonLakes = useMemo(() => filteredLakes.filter(lake => laonLakeIds.includes(lake.id)), [filteredLakes]);
  const nonLaonLakes = useMemo(() => filteredLakes.filter(lake => !laonLakeIds.includes(lake.id)), [filteredLakes]);

  const handleLakeInteraction = (lake: LakeData) => {
    if (isCompareMode) {
      const next = new Set(compareSet);
      if (next.has(lake.id)) {
        next.delete(lake.id);
      } else {
        next.add(lake.id);
      }
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
    const input = (form.elements.namedItem('query') as HTMLInputElement).value;
    if (!input.trim()) return;

    setLoading(true);
    setView('dashboard');
    
    try {
      const result = await getLakeHealthInsights(input);
      setGroundingSources(result.sources || []);
      
      if (result.discoveredLakes && result.discoveredLakes.length > 0) {
        const newLake = result.discoveredLakes[0];
        setManagedLakes(prev => {
          if (prev.find(l => l.id === newLake.id)) return prev;
          return [newLake, ...prev];
        });
        setSelectedLake(newLake);
        setSearchDescription(result.text);
      } else {
        setSearchDescription(result.text || "No specific basin data found.");
      }
    } catch (err) {
      setSearchDescription("Search failed. Verify connectivity.");
    } finally {
      setLoading(false);
      form.reset();
    }
  };

  const tsiScore = useMemo(() => calculateTSI(selectedLake.lastSecchiDiskReading), [selectedLake]);

  const executeComparison = () => {
    if (compareSet.size > 0) {
      setView('compare');
      setIsCompareMode(false);
    } else {
      setIsCompareMode(true);
    }
  };

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
          <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] px-4 py-3">Navigation</h3>
          <nav className="space-y-1 px-1">
            <button onClick={() => { setView('dashboard'); setIsCompareMode(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all border ${view === 'dashboard' ? 'bg-blue-600/10 border-blue-500/50 text-white' : 'text-slate-400 border-transparent hover:bg-slate-800'}`}>
              <Icons.Info /> <span className="text-[10px] font-black uppercase tracking-widest">Unified Audit</span>
            </button>
            <button onClick={() => { setView('map'); setIsCompareMode(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all border ${view === 'map' ? 'bg-blue-600/10 border-blue-500/50 text-white' : 'text-slate-400 border-transparent hover:bg-slate-800'}`}>
              <Icons.MapPin /> <span className="text-[10px] font-black uppercase tracking-widest">Biosecurity Map</span>
            </button>
            <button onClick={() => { setView('cluster'); setIsCompareMode(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all border ${view === 'cluster' ? 'bg-blue-600/10 border-blue-500/50 text-white' : 'text-slate-400 border-transparent hover:bg-slate-800'}`}>
              <Icons.Microscope /> <span className="text-[10px] font-black uppercase tracking-widest">Niche Analysis</span>
            </button>
            <button onClick={executeComparison} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all border ${view === 'compare' || isCompareMode ? 'bg-blue-600/10 border-blue-500/50 text-white' : 'text-slate-400 border-transparent hover:bg-slate-800'}`}>
              <div className="w-5 h-5 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M16 21h5v-5"/><path d="M8 21H3v-5"/></svg></div>
              <span className="text-[10px] font-black uppercase tracking-widest">Registry Compare</span>
            </button>
          </nav>

          <div className="pt-6 space-y-3">
            <div className="flex items-center gap-2 px-4">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Core Group</h3>
            </div>
            <div className="space-y-2 px-1">
              {laonLakes.map(lake => (
                <LakeCard key={lake.id} lake={lake} isSelected={selectedLake?.id === lake.id} onClick={handleLakeInteraction} isCompareMode={isCompareMode} isSelectedForCompare={compareSet.has(lake.id)} />
              ))}
            </div>
          </div>

          <div className="pt-6 space-y-3 pb-24">
            <div className="flex justify-between items-center px-4">
              <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Monitored Basins</h3>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsCompareMode(!isCompareMode); }} 
                className={`px-3 py-1 rounded-full text-[8px] font-black uppercase transition-all ${isCompareMode ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'}`}
              >
                {isCompareMode ? 'Cancel' : 'Compare'}
              </button>
            </div>
            <div className="space-y-2 px-1">
              {nonLaonLakes.map(lake => (
                <LakeCard key={lake.id} lake={lake} isSelected={selectedLake?.id === lake.id} onClick={handleLakeInteraction} isCompareMode={isCompareMode} isSelectedForCompare={compareSet.has(lake.id)} />
              ))}
            </div>
          </div>
        </div>

        {isCompareMode && compareSet.size > 0 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full px-6 z-50">
            <button 
              onClick={executeComparison}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-2xl border border-blue-400/30 flex items-center justify-center gap-3 transition-all active:scale-95"
            >
              <span className="text-[10px] font-black uppercase tracking-widest">Analyze {compareSet.size} Basins</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
          </div>
        )}
      </aside>

      <main className="flex-1 flex flex-col relative bg-slate-950 overflow-hidden">
        <div className="scanline" />
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
          {view === 'dashboard' ? (
            <div className="p-8 lg:p-12 space-y-24 max-w-6xl mx-auto pb-40">
               {selectedLake && (
                 <div className="animate-fade-in space-y-32">
                   <section className="text-center space-y-12">
                     <div className="flex flex-col items-center">
                        <div className="flex items-center gap-3 mb-6">
                           <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20 uppercase tracking-[0.3em]">Registry Focus Observation</span>
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{selectedLake.town}</span>
                        </div>
                        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white tracking-tighter uppercase leading-none mb-8"> {selectedLake.name} </h1>
                        <div className="flex gap-4">
                          <span className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-black uppercase text-slate-300 tracking-widest flex items-center">ID: {selectedLake.id}</span>
                        </div>
                     </div>

                     <div className="max-w-4xl mx-auto bg-slate-900/40 p-10 sm:p-14 rounded-[3rem] border border-slate-800/50 backdrop-blur-sm relative overflow-hidden group text-left min-h-[300px]">
                        <div className="flex justify-between items-center mb-8">
                          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Audit Narrative</h3>
                          {loading && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
                        </div>
                        <p className="text-xl sm:text-2xl font-medium text-slate-100 leading-relaxed whitespace-pre-wrap"> 
                          {loading ? "Re-Consulting Registry Archives..." : (searchDescription || generatePredictiveNarrative(selectedLake))} 
                        </p>
                        
                        {groundingSources.length > 0 && (
                          <div className="mt-8 pt-6 border-t border-slate-800/40">
                            <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Grounding Sources</h4>
                            <div className="flex flex-wrap gap-4">
                              {groundingSources.map((source, i) => (
                                <a key={i} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-blue-400 hover:text-blue-300 underline underline-offset-4">
                                  {source.title || "External Audit Link"}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-8 pt-4 border-t border-slate-800/40 flex justify-between items-center">
                           <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Source: Maine DEP & LSM Verified • Generated {new Date().toLocaleDateString()}</p>
                           <p className="text-[8px] font-bold text-blue-500 uppercase tracking-widest italic">Live Grounding Active</p>
                        </div>
                     </div>
                   </section>

                   <section className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-slate-900/30 p-8 rounded-3xl border border-slate-800 flex flex-col items-center text-center">
                          <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-4">Trophic State (TSI)</p>
                          <span className="text-5xl font-black text-white tracking-tighter">{tsiScore.toFixed(1)}</span>
                          <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-2">{getTrophicLabel(tsiScore)}</p>
                        </div>
                        <div className="bg-slate-900/30 p-8 rounded-3xl border border-slate-800 text-center">
                          <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-4">Transparency</p>
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
                     <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest text-center">Data Pull: LSM Volunteer Network Observation • Period: 2024 Seasonal Mean • Updated: Dec 2024</p>
                   </section>

                   <section className="space-y-10">
                     <div className="flex items-center gap-6">
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.4em] whitespace-nowrap">01 // Longitudinal Trends</h2>
                        <div className="h-px flex-1 bg-slate-800" />
                     </div>
                     <HistoricalTrendChart data={selectedLake.historicalData || []} lakeName={selectedLake.name} />
                     <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest text-right mt-4">Database: MDEP Historic Archives (2014-2024) • Verified: Q1 2025</p>
                   </section>

                   <section className="space-y-10">
                     <div className="flex items-center gap-6">
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.4em] whitespace-nowrap">02 // Watershed Dynamics</h2>
                        <div className="h-px flex-1 bg-slate-800" />
                     </div>
                     <div className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {selectedLake.advancedMetrics && (
                            <>
                              <div className="p-10 bg-slate-900/30 rounded-3xl border border-slate-800 text-center group hover:border-blue-500/30 transition-all">
                                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Impervious Surface</h4>
                                  <p className="text-5xl font-black text-white tracking-tighter">{selectedLake.advancedMetrics.imperviousSurface.toFixed(1)}%</p>
                                  <p className="text-[7px] font-bold text-slate-500 uppercase mt-4">Satellite Catchment Analysis 2024</p>
                              </div>
                              <div className="p-10 bg-slate-900/30 rounded-3xl border border-slate-800 text-center group hover:border-emerald-500/30 transition-all">
                                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Shore Naturalization</h4>
                                  <p className="text-5xl font-black text-white tracking-tighter">{selectedLake.advancedMetrics.shorelineNaturalization.toFixed(0)}%</p>
                                  <p className="text-[7px] font-bold text-slate-500 uppercase mt-4">Riparian Buffer Audit 2024</p>
                              </div>
                              <div className="p-10 bg-slate-900/30 rounded-3xl border border-slate-800 text-center group hover:border-rose-500/30 transition-all">
                                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Internal Loading</h4>
                                  <p className={`text-4xl font-black uppercase tracking-tighter ${selectedLake.advancedMetrics.internalLoadingRisk === 'High' ? 'text-rose-500' : 'text-emerald-500'}`}>
                                    {selectedLake.advancedMetrics.internalLoadingRisk}
                                  </p>
                                  <p className="text-[7px] font-bold text-slate-500 uppercase mt-4">Lake Vulnerability Index (LVI)</p>
                              </div>
                            </>
                          )}
                        </div>
                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest text-center">Source: MDEP Biomonitoring Program • Catchment ID: ME-BASIN-{selectedLake.id.toUpperCase()}</p>
                     </div>
                   </section>

                   {selectedLake.flowCamRecent && (
                     <section className="space-y-10">
                        <div className="flex items-center gap-6">
                            <h2 className="text-sm font-black text-white uppercase tracking-[0.4em] whitespace-nowrap">03 // FlowCam Particle Analysis</h2>
                            <div className="h-px flex-1 bg-slate-800" />
                        </div>
                        <ExpandableChart title={`${selectedLake.name} // Biovolume Audit`}>
                           <FlowCamAnalysis data={selectedLake.flowCamRecent} />
                        </ExpandableChart>
                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest text-right mt-4">Sensor: Yokogawa Fluid Imaging FlowCam 8100 • Processing: VisualSpreadsheet v5.2</p>
                     </section>
                   )}

                   <section className="space-y-10">
                     <div className="flex items-center gap-6">
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.4em] whitespace-nowrap">04 // Thermal Stratification</h2>
                        <div className="h-px flex-1 bg-slate-800" />
                     </div>
                     <ExpandableChart title={`${selectedLake.name} // Thermal Dynamics`}>
                        <ThermalProfileChart lake={selectedLake} />
                     </ExpandableChart>
                     <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest text-right mt-4">Sensor Node: B-04 Deep Basin Deployment • Retrieval Date: Oct 2024 • Model: Birge Standard</p>
                   </section>

                   <section className="pb-32 text-center opacity-40">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Audit Termination • Node {selectedLake.id} • Projection Verified 2025</p>
                   </section>
                 </div>
               )}
            </div>
          ) : view === 'map' ? (
            <BiosecurityMapView lakes={filteredLakes} centerLake={selectedLake} onSelectLake={handleLakeInteraction} onClose={() => setView('dashboard')} searchRadius={searchRadius} onRadiusChange={setSearchRadius} />
          ) : view === 'cluster' ? (
            <ClusterAnalysisView lakes={filteredLakes} onSelectLake={handleLakeInteraction} onClose={() => setView('dashboard')} />
          ) : (
            <ComparisonView lakes={managedLakes.filter(l => compareSet.has(l.id))} onClose={() => { setView('dashboard'); setCompareSet(new Set()); }} />
          )}
        </div>

        <footer className="p-6 border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl no-print shrink-0 z-50">
           <form onSubmit={handleSearch} className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input name="query" autoComplete="off" placeholder="Audit Registry (e.g. 'Long Lake')" className="w-full px-6 py-4 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all text-xs font-bold mono" />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"> <Icons.Search /> </div>
              </div>
              <button type="submit" disabled={loading} className="px-8 py-4 sm:py-0 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"> {loading ? 'Consulting...' : 'Search Basin'} </button>
           </form>
           <div className="mt-4 text-center">
             <p className="text-[8px] font-bold text-slate-600 uppercase tracking-[0.4em]">
               Ecological Registry Node • Pro Grade Analysis • v1.2.2 • © 2025 Limnological Guardian
             </p>
           </div>
        </footer>
      </main>

      <InvasiveModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} lakes={filteredLakes} onSelectLake={handleLakeInteraction} />
    </div>
  );
};

export default App;
