import React, { useState, useEffect, useMemo } from 'react';
import { LAKES_DATA, Icons } from './constants';
import { LakeData, GroundingSource } from './types';
import { getLakeHealthInsights } from './services/geminiService';
import LakeCard from './components/LakeCard';
import HistoricalTrendChart from './components/HistoricalTrendChart';
import BiosecurityMapView from './components/BiosecurityMapView';
import ClusterAnalysisView from './components/ClusterAnalysisView';
import ThermalProfileChart from './components/ThermalProfileChart';
import FlowCamAnalysis from './components/FlowCamAnalysis';
import ComparisonView from './components/ComparisonView';
import { generatePredictiveNarrative, calculateTSI, getTrophicLabel } from './utils/analysisUtils';

const SESSION_KEY = 'lake_guardian_pro_v1';

const App: React.FC = () => {
  const [laonLakes] = useState<LakeData[]>(LAKES_DATA.slice(0, 10));
  
  const [discoveredLakes, setDiscoveredLakes] = useState<LakeData[]>(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [selectedLake, setSelectedLake] = useState<LakeData | null>(LAKES_DATA[0]);
  const [loading, setLoading] = useState(false);
  const [pendingSearchQuery, setPendingSearchQuery] = useState<string | null>(null);
  const [searchDescription, setSearchDescription] = useState<string>("");
  const [searchRadius, setSearchRadius] = useState<number>(50);
  const [view, setView] = useState<'dashboard' | 'map' | 'cluster' | 'compare'>('dashboard');
  const [groundingSources, setGroundingSources] = useState<GroundingSource[]>([]);
  const [compareList, setCompareList] = useState<LakeData[]>([]);

  useEffect(() => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(discoveredLakes));
  }, [discoveredLakes]);

  // Utility to clean markdown formatting like ** or #
  const cleanAIText = (text: string) => {
    return text.replace(/[*#]/g, '').trim();
  };

  const fetchInsights = async (lake: LakeData | null, queryText: string) => {
    setLoading(true);
    setSearchDescription("");
    try {
      const prompt = lake 
        ? `Perform a limnological audit for ${lake.name} in ${lake.town}, Maine. Focus on phosphorus and clarity.`
        : `Search registry for "${queryText}" in Maine. Extract Secchi depth and Phosphorus data.`;
      
      const result = await getLakeHealthInsights(prompt, lake?.id);
      setSearchDescription(cleanAIText(result?.text || ""));
      setGroundingSources(result?.sources || []);
      
      if (!lake && result.extractedMetrics) {
        const newLake: LakeData = {
          id: `ext-${Date.now()}`,
          name: queryText,
          town: "Registry Discovery",
          zipCode: "Maine Node",
          coordinates: { lat: 44.5, lng: -70.1 },
          waterQuality: (result.extractedMetrics.secchi || 5) > 6 ? 'Excellent' : 'Good',
          lastSecchiDiskReading: result.extractedMetrics.secchi || 5.0,
          phosphorusLevel: result.extractedMetrics.phosphorus || 10.0,
          chlorophyllLevel: (result.extractedMetrics.phosphorus || 10.0) * 0.3,
          invasiveSpeciesStatus: 'None detected',
          lastUpdated: '2025 AI-Sync',
          historicalData: [],
          flowCamRecent: {
            totalBiovolume: 1500000.5,
            particleCount: 2500,
            taxaDistribution: { cyanobacteria: 15.5, diatoms: 45.0, greenAlgae: 25.0, other: 14.5 },
            dominantTaxa: 'Diatom Fragment',
            samplingDate: '2025-01'
          }
        };
        setDiscoveredLakes(prev => {
            const exists = prev.find(l => l.name.toLowerCase() === queryText.toLowerCase());
            if (exists) return prev;
            return [newLake, ...prev].slice(0, 5);
        });
        setSelectedLake(newLake);
      }
    } catch (e) {
      console.error("Gemini Audit Failed", e);
    } finally {
      setLoading(false);
      setPendingSearchQuery(null);
    }
  };

  const handleLakeInteraction = (lake: LakeData) => {
    if (view === 'compare') {
      setCompareList(prev => 
        prev.find(l => l.id === lake.id) ? prev.filter(l => l.id !== lake.id) : [...prev, lake]
      );
    } else {
      setSearchDescription("");
      setSelectedLake(lake);
      setView('dashboard');
    }
  };

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = new FormData(e.currentTarget).get('query')?.toString();
    if (!query) return;
    
    setPendingSearchQuery(query);
    const match = [...LAKES_DATA, ...discoveredLakes].find(l => l.name.toLowerCase().includes(query.toLowerCase()));
    
    if (match) {
      handleLakeInteraction(match);
      fetchInsights(match, match.name);
    } else {
      setSelectedLake(null);
      await fetchInsights(null, query);
    }
  };

  const tsiScore = useMemo(() => selectedLake ? calculateTSI(selectedLake.lastSecchiDiskReading) : null, [selectedLake]);

  const displayTitle = selectedLake?.name || pendingSearchQuery || "Lake Audit";

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950 text-slate-200">
      <aside className="hidden lg:flex w-80 flex-col bg-slate-900/50 border-r border-slate-800 shrink-0">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white"><Icons.Droplet /></div>
          <h1 className="text-sm font-black uppercase tracking-tighter">Lake Guardian PRO</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          <nav className="space-y-1">
            <button onClick={() => setView('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest ${view === 'dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:bg-slate-800'}`}>
              <Icons.Info /> Dashboard
            </button>
            <button onClick={() => setView('map')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest ${view === 'map' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
              <Icons.MapPin /> Regional Map
            </button>
            <button onClick={() => setView('cluster')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest ${view === 'cluster' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
              <Icons.Microscope /> Niche Space
            </button>
            <button 
                onClick={() => {
                    setView('compare');
                    if (selectedLake && compareList.length === 0) setCompareList([selectedLake]);
                }} 
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest ${view === 'compare' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
              Compare Mode
            </button>
          </nav>
          
          <div className="space-y-3 pt-4">
            <h3 className="text-[9px] font-black text-slate-500 uppercase px-4 tracking-[0.2em]">Registry Basins</h3>
            {laonLakes.map(lake => (
              <LakeCard 
                key={lake.id} 
                lake={lake} 
                isSelected={selectedLake?.id === lake.id} 
                isCompareMode={view === 'compare'}
                isSelectedForCompare={compareList.some(l => l.id === lake.id)}
                onClick={() => handleLakeInteraction(lake)} 
              />
            ))}
          </div>

          {discoveredLakes.length > 0 && (
            <div className="space-y-3 pt-6 border-t border-slate-800">
                <h3 className="text-[9px] font-black text-blue-500 uppercase px-4 tracking-[0.2em]">Recent Discoveries</h3>
                {discoveredLakes.map(lake => (
                    <LakeCard 
                        key={lake.id} 
                        lake={lake} 
                        isSelected={selectedLake?.id === lake.id} 
                        isCompareMode={view === 'compare'}
                        isSelectedForCompare={compareList.some(l => l.id === lake.id)}
                        onClick={() => handleLakeInteraction(lake)} 
                    />
                ))}
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative bg-slate-950 overflow-hidden">
        <header className="p-6 border-b border-slate-900 bg-slate-950/50 backdrop-blur-xl z-20 flex items-center justify-between gap-4">
          <form onSubmit={handleSearch} className="relative w-full max-w-lg">
            <div className={`absolute inset-y-0 left-4 flex items-center transition-colors ${loading ? 'text-blue-500 animate-pulse' : 'text-slate-500'}`}>
              {loading ? <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /> : <Icons.Search />}
            </div>
            <input 
              name="query" 
              type="text" 
              disabled={loading}
              placeholder={loading ? "Analyzing lake registry..." : "Search lake registry..."} 
              className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-xs font-bold text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all disabled:opacity-50" 
            />
          </form>
          {view === 'compare' && (
              <div className="px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-[10px] font-black text-amber-500 uppercase tracking-widest whitespace-nowrap">
                  {compareList.length} Units Selected
              </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {view === 'dashboard' && (selectedLake || loading) ? (
            <div className="p-8 lg:p-12 space-y-12 max-w-6xl mx-auto pb-40">
              <div className="text-center space-y-6">
                <h1 className="text-6xl lg:text-8xl font-black text-white uppercase tracking-tighter italic">
                  {displayTitle}
                </h1>
                <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800 text-left backdrop-blur-md relative overflow-hidden">
                  {loading && <div className="absolute top-0 left-0 w-full h-1 bg-blue-600 animate-pulse" />}
                  <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.3em] mb-4 block">Summary</span>
                  <div className="text-lg font-medium text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {loading && !searchDescription ? (
                      <span className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                        Generating deep basin audit and searching ecological archives...
                      </span>
                    ) : (searchDescription || (selectedLake ? generatePredictiveNarrative(selectedLake) : ""))}
                  </div>
                  {groundingSources.length > 0 && !loading && (
                    <div className="mt-6 pt-6 border-t border-slate-800 flex flex-wrap gap-3">
                      {groundingSources.map((s, i) => (
                        <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="text-[9px] font-black text-blue-400 hover:text-white uppercase tracking-widest border border-blue-500/20 px-3 py-1.5 rounded-lg bg-blue-500/5 transition-colors">
                          Source: {s.title || "MDEP Registry"}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {selectedLake && !loading && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 relative overflow-hidden group">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Trophic State Index</p>
                      <p className="text-3xl font-black text-white">{tsiScore?.toFixed(1)} <span className="text-xs text-slate-500">TSI</span></p>
                      <p className="text-[8px] font-bold text-blue-500 uppercase mt-2">{getTrophicLabel(tsiScore || 0)}</p>
                      <div className="absolute bottom-2 right-4 text-[7px] font-bold text-slate-700 uppercase tracking-tighter text-right opacity-60 group-hover:opacity-100 transition-opacity">
                        <div>Method: Carlson (1977)</div>
                        <div>Aligned: MDEP & EPA Stds</div>
                      </div>
                    </div>
                    <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Clarity (Secchi)</p>
                      <p className="text-3xl font-black text-white">{selectedLake.lastSecchiDiskReading.toFixed(1)} <span className="text-xs text-slate-500">m</span></p>
                    </div>
                    <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Phosphorus</p>
                      <p className="text-3xl font-black text-white">{selectedLake.phosphorusLevel.toFixed(1)} <span className="text-xs text-slate-500">ppb</span></p>
                    </div>
                    <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Chlorophyll-a</p>
                      <p className="text-3xl font-black text-white">{selectedLake.chlorophyllLevel.toFixed(1)} <span className="text-xs text-slate-500">ppb</span></p>
                    </div>
                  </div>

                  <HistoricalTrendChart data={selectedLake.historicalData || []} lakeName={selectedLake.name} />
                  <ThermalProfileChart lake={selectedLake} />
                  {selectedLake.flowCamRecent && <FlowCamAnalysis data={selectedLake.flowCamRecent} />}
                </>
              )}
            </div>
          ) : view === 'map' ? (
             <BiosecurityMapView 
               lakes={[...LAKES_DATA, ...discoveredLakes]} 
               onSelectLake={handleLakeInteraction} 
               onClose={() => setView('dashboard')} 
               searchRadius={searchRadius} 
               onRadiusChange={(r) => setSearchRadius(r)} 
             />
          ) : view === 'cluster' ? (
             <ClusterAnalysisView lakes={[...LAKES_DATA, ...discoveredLakes]} onSelectLake={handleLakeInteraction} onClose={() => setView('dashboard')} />
          ) : view === 'compare' ? (
             <ComparisonView lakes={compareList} onClose={() => setView('dashboard')} />
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500">
              <p className="text-xs font-black uppercase tracking-widest">Select a lake from the registry or search above</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;