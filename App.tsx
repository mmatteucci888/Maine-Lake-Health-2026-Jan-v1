
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
import { generatePredictiveNarrative, calculateTSI, getTrophicLabel } from './utils/analysisUtils';

const App: React.FC = () => {
  const [managedLakes, setManagedLakes] = useState<LakeData[]>(() => {
    const saved = localStorage.getItem('managed_lakes_v2');
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

  const hasApiKey = !!process.env.API_KEY;
  const laonLakeIds = ['pennesseewassee', 'little-pennesseewassee', 'sand-pond', 'north-pond'];

  useEffect(() => {
    localStorage.setItem('managed_lakes_v2', JSON.stringify(managedLakes));
  }, [managedLakes]);

  useEffect(() => {
    if (selectedLake) {
      const loadNews = async () => {
        const news = await getLakeNews(selectedLake.name, selectedLake.town);
        setNewsArticles(news.articles);
      };
      loadNews();
    }
  }, [selectedLake]);

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
      setCompareSet(prev => {
        const newSet = new Set(prev);
        if (newSet.has(lake.id)) newSet.delete(lake.id);
        else newSet.add(lake.id);
        return newSet;
      });
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

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950 text-slate-200">
      <aside className="hidden lg:flex w-80 flex-col bg-slate-900/50 border-r border-slate-800 no-print">
        <div className="p-6 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/20">
              <Icons.Droplet />
            </div>
            <div>
              <h1 className="text-sm font-black text-white uppercase tracking-tighter leading-none">Lake Guardian</h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Maine Registry Node</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar relative">
          <h3 className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] px-4 py-3">Navigation</h3>
          <nav className="space-y-1 px-1">
            <button 
              onClick={() => setView('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all border ${view === 'dashboard' ? 'bg-blue-600/10 border-blue-500/50 text-white' : 'text-slate-500 border-transparent hover:bg-slate-800'}`}
            >
              <Icons.Info /> <span className="text-[10px] font-black uppercase tracking-widest">Unified Audit</span>
            </button>
            <button 
              onClick={() => setView('map')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all border ${view === 'map' ? 'bg-blue-600/10 border-blue-500/50 text-white' : 'text-slate-500 border-transparent hover:bg-slate-800'}`}
            >
              <Icons.MapPin /> <span className="text-[10px] font-black uppercase tracking-widest">Biosecurity Map</span>
            </button>
            <button 
              onClick={() => setView('cluster')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all border ${view === 'cluster' ? 'bg-blue-600/10 border-blue-500/50 text-white' : 'text-slate-500 border-transparent hover:bg-slate-800'}`}
            >
              <Icons.Microscope /> <span className="text-[10px] font-black uppercase tracking-widest">Niche Analysis</span>
            </button>
            <button 
              onClick={() => {
                if(compareSet.size > 0) setView('compare');
                else setIsCompareMode(true);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all border ${view === 'compare' ? 'bg-blue-600/10 border-blue-500/50 text-white' : 'text-slate-500 border-transparent hover:bg-slate-800'}`}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M16 21h5v-5"/><path d="M8 21H3v-5"/></svg>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">Registry Compare</span>
            </button>
          </nav>

          <div className="pt-6 space-y-3">
            <div className="flex items-center gap-2 px-4">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">LAON Lakes</h3>
            </div>
            <div className="space-y-2 px-1">
              {laonLakes.map(lake => (
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

          <div className="pt-6 space-y-3">
            <div className="flex justify-between items-center px-4">
              <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Managed Basins</h3>
              <button 
                onClick={() => setIsCompareMode(!isCompareMode)}
                className={`px-3 py-1 rounded-full text-[8px] font-black uppercase transition-all ${isCompareMode ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
              >
                {isCompareMode ? 'Cancel' : 'Compare'}
              </button>
            </div>
            <div className="space-y-2 px-1">
              {nonLaonLakes.map(lake => (
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

      <main className="flex-1 flex flex-col relative overflow-hidden bg-slate-950">
        <div className="scanline" />
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-md z-20 shrink-0 no-print">
          <div className="flex items-center gap-6">
             <InvasiveAlerts lakes={filteredLakes} onSelectLake={handleLakeInteraction} onOpenModal={() => setIsModalOpen(true)} />
          </div>
          <div className="flex items-center gap-2">
             <div className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-blue-500 animate-pulse' : 'bg-rose-500'}`} />
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
               Registry Link: {hasApiKey ? 'Active' : 'Missing Key'}
             </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {view === 'dashboard' ? (
            <div className="p-8 lg:p-12 space-y-20 max-w-6xl mx-auto">
               {selectedLake && (
                 <div className="animate-fade-in space-y-24">
                   <section className="text-center space-y-12">
                     <div className="flex flex-col items-center">
                        <div className="flex items-center gap-3 mb-6">
                           <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20 uppercase tracking-[0.3em]">Registry Focus Observation</span>
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">{selectedLake.town}, ME</span>
                        </div>
                        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black text-white tracking-tighter uppercase leading-none mb-8">
                          {selectedLake.name}
                        </h1>
                        <div className="flex gap-4">
                          <span className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center">ID: {selectedLake.id}</span>
                        </div>
                     </div>

                     <div className="max-w-4xl mx-auto bg-slate-900/40 p-10 sm:p-14 rounded-[3rem] border border-slate-800/50 backdrop-blur-sm relative overflow-hidden group text-left">
                        <div className="absolute top-0 left-0 p-8 opacity-10"><Icons.Info /></div>
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mb-8">Technician Audit Narrative</h3>
                        <p className="text-xl sm:text-2xl font-medium text-slate-100 leading-relaxed">
                          {loading ? "Decrypting registry data..." : (searchDescription || generatePredictiveNarrative(selectedLake))}
                        </p>
                     </div>
                   </section>

                   <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-slate-900/30 p-8 rounded-3xl border border-slate-800 flex flex-col items-center text-center">
                        <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-4">Trophic State (TSI)</p>
                        <span className="text-5xl font-black text-white tracking-tighter">{tsiScore.toFixed(1)}</span>
                        <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-2">{getTrophicLabel(tsiScore)}</p>
                      </div>
                      <div className="bg-slate-900/30 p-8 rounded-3xl border border-slate-800 text-center">
                        <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-4">Transparency</p>
                        <span className="text-5xl font-black text-blue-400 tracking-tighter">{selectedLake.lastSecchiDiskReading}m</span>
                      </div>
                      <div className="bg-slate-900/30 p-8 rounded-3xl border border-slate-800 text-center">
                        <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-4">Nutrient (P)</p>
                        <span className="text-5xl font-black text-rose-400 tracking-tighter">{selectedLake.phosphorusLevel}ppb</span>
                      </div>
                      <div className="bg-slate-900/30 p-8 rounded-3xl border border-slate-800 text-center">
                        <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-4">Biomass (Chl)</p>
                        <span className="text-5xl font-black text-emerald-400 tracking-tighter">{selectedLake.chlorophyllLevel}ppb</span>
                      </div>
                   </section>

                   <section className="space-y-10">
                     <div className="flex items-center gap-6">
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.4em] whitespace-nowrap">01 // Longitudinal Projections</h2>
                        <div className="h-px flex-1 bg-slate-800" />
                     </div>
                     <div className="bg-slate-900/20 p-8 rounded-[3rem] border border-slate-800/50 shadow-2xl">
                        <HistoricalTrendChart data={selectedLake.historicalData || []} lakeName={selectedLake.name} />
                     </div>
                   </section>

                   <section className="space-y-10">
                     <div className="flex items-center gap-6">
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.4em] whitespace-nowrap">02 // Thermal Stratification</h2>
                        <div className="h-px flex-1 bg-slate-800" />
                     </div>
                     <ThermalProfileChart lake={selectedLake} />
                   </section>

                   <section className="space-y-10">
                     <div className="flex items-center gap-6">
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.4em] whitespace-nowrap">03 // Watershed Dynamics</h2>
                        <div className="h-px flex-1 bg-slate-800" />
                     </div>
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                       {selectedLake.advancedMetrics && (
                         <>
                           <div className="p-10 bg-slate-900/30 rounded-3xl border border-slate-800 text-center group hover:border-blue-500/30 transition-all">
                              <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Impervious Surface</h4>
                              <p className="text-5xl font-black text-white tracking-tighter">{selectedLake.advancedMetrics.imperviousSurface.toFixed(1)}%</p>
                           </div>
                           <div className="p-10 bg-slate-900/30 rounded-3xl border border-slate-800 text-center group hover:border-emerald-500/30 transition-all">
                              <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Shore Naturalization</h4>
                              <p className="text-5xl font-black text-white tracking-tighter">{selectedLake.advancedMetrics.shorelineNaturalization.toFixed(0)}%</p>
                           </div>
                           <div className="p-10 bg-slate-900/30 rounded-3xl border border-slate-800 text-center group hover:border-rose-500/30 transition-all">
                              <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Internal Loading</h4>
                              <p className={`text-4xl font-black uppercase tracking-tighter ${selectedLake.advancedMetrics.internalLoadingRisk === 'High' ? 'text-rose-500' : 'text-emerald-500'}`}>
                                {selectedLake.advancedMetrics.internalLoadingRisk}
                              </p>
                           </div>
                         </>
                       )}
                     </div>
                   </section>

                   {groundingSources.length > 0 && (
                     <section className="space-y-10">
                       <div className="flex items-center gap-6">
                          <h2 className="text-sm font-black text-white uppercase tracking-[0.4em] whitespace-nowrap">04 // Verification Grounding</h2>
                          <div className="h-px flex-1 bg-slate-800" />
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                         {groundingSources.map((source, idx) => (
                           <a 
                             key={idx} 
                             href={source.uri} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="p-5 bg-slate-900/40 border border-slate-800 rounded-2xl hover:border-blue-500/50 transition-all flex items-center justify-between group"
                           >
                             <div className="flex flex-col overflow-hidden">
                               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">CITED SOURCE</span>
                               <span className="text-xs font-bold text-white truncate">{source.title || 'Live Registry Link'}</span>
                             </div>
                             <div className="text-blue-500 opacity-50 group-hover:opacity-100 transition-opacity">
                               <Icons.Search />
                             </div>
                           </a>
                         ))}
                       </div>
                     </section>
                   )}

                   <section className="space-y-10">
                     <div className="flex items-center gap-6">
                        <h2 className="text-sm font-black text-white uppercase tracking-[0.4em] whitespace-nowrap">05 // Regional News Aggregator</h2>
                        <div className="h-px flex-1 bg-slate-800" />
                     </div>
                     <div className="bg-slate-900/40 border border-slate-800 rounded-[3rem] p-8 lg:p-12 space-y-8 text-left">
                        {newsArticles.length > 0 ? (
                          newsArticles.map((article, idx) => (
                            <div key={idx} className="pb-8 border-b border-slate-800 last:border-0 last:pb-0">
                               <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-medium">
                                 {article.content}
                               </p>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-10">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No recent specific news bulletins for this basin.</p>
                          </div>
                        )}
                     </div>
                   </section>

                   <section className="pb-32 text-center">
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em]">Audit Stream Termination • Node {selectedLake.id} • Maine Registry</p>
                   </section>
                 </div>
               )}
            </div>
          ) : view === 'map' ? (
            <BiosecurityMapView 
              lakes={filteredLakes} 
              centerLake={selectedLake} 
              onSelectLake={handleLakeInteraction} 
              onClose={() => setView('dashboard')}
              searchRadius={searchRadius}
              onRadiusChange={setSearchRadius}
            />
          ) : view === 'cluster' ? (
            <ClusterAnalysisView lakes={filteredLakes} onSelectLake={handleLakeInteraction} onClose={() => setView('dashboard')} />
          ) : (
            <ComparisonView lakes={managedLakes.filter(l => compareSet.has(l.id))} onClose={() => setView('dashboard')} />
          )}
        </div>

        <footer className="p-4 sm:p-6 border-t border-slate-800 bg-slate-950 no-print shrink-0">
           <form onSubmit={handleSearch} className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input 
                  name="query" 
                  autoComplete="off"
                  placeholder="Registry Terminal (e.g. 'Audit Long Lake in Harrison')" 
                  className="w-full px-6 py-4 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all text-xs font-bold mono" 
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <Icons.Search />
                </div>
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="px-8 py-4 sm:py-0 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
              >
                {loading ? 'Consulting...' : 'Search Maine Lakes'}
              </button>
           </form>
        </footer>
      </main>

      <InvasiveModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} lakes={filteredLakes} onSelectLake={handleLakeInteraction} />
    </div>
  );
};

export default App;
