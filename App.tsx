import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { LAKES_DATA, Icons, generateHistory, generateAdvancedMetrics } from './constants';
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
const CORE_LAON_IDS = ['pennesseewassee', 'little-pennesseewassee', 'sand-pond', 'north-pond'];

const App: React.FC = () => {
  const [allRegistryLakes] = useState<LakeData[]>(LAKES_DATA);
  const [discoveredLakes, setDiscoveredLakes] = useState<LakeData[]>(() => {
    const saved = sessionStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [selectedLake, setSelectedLake] = useState<LakeData | null>(LAKES_DATA[0]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchDescription, setSearchDescription] = useState<string>("");
  const [groundingSources, setGroundingSources] = useState<GroundingSource[]>([]);
  const [view, setView] = useState<'dashboard' | 'map' | 'cluster' | 'compare'>('dashboard');
  const [compareBasket, setCompareBasket] = useState<string[]>([]);
  
  // Persistent Map State
  const [searchRadius, setSearchRadius] = useState<number>(50);
  
  const searchTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(discoveredLakes));
  }, [discoveredLakes]);

  // Section 1: LAON CORE BASINS - Permanent Sidebar List
  const coreLakes = useMemo(() => 
    allRegistryLakes.filter(l => CORE_LAON_IDS.includes(l.id)), 
    [allRegistryLakes]
  );

  // Section 2: SEARCH & DISCOVERY - Dynamically Filtered Registry
  const discoveryLakes = useMemo(() => {
    const others = allRegistryLakes.filter(l => !CORE_LAON_IDS.includes(l.id));
    const combined = [...others, ...discoveredLakes];
    if (!searchQuery) return combined;
    return combined.filter(l => 
      l.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allRegistryLakes, discoveredLakes, searchQuery]);

  const fetchInsights = useCallback(async (lake: LakeData | null, queryText: string) => {
    setLoading(true);
    setSearchDescription("");
    try {
      const prompt = lake 
        ? `Perform a limnological audit for ${lake.name} in ${lake.town}, Maine. Focus on phosphorus and clarity.`
        : `Search registry for "${queryText}" in Maine. Extract Secchi depth and Phosphorus data.`;
      
      const result = await getLakeHealthInsights(prompt, lake?.id);
      setSearchDescription(result?.text?.replace(/[*#]/g, '').trim() || "");
      setGroundingSources(result?.sources || []);
      
      if (!lake && result.extractedMetrics) {
        const baseSecchi = result.extractedMetrics.secchi || 5.0;
        const basePhos = result.extractedMetrics.phosphorus || 10.0;
        const derivedQuality = baseSecchi > 6 ? 'Excellent' : baseSecchi > 4 ? 'Good' : 'Fair';

        const newLake: LakeData = {
          id: `ext-${Date.now()}`,
          name: queryText,
          town: "Registry Discovery",
          zipCode: "Maine Node",
          coordinates: { lat: 44.5, lng: -70.1 },
          waterQuality: derivedQuality,
          lastSecchiDiskReading: baseSecchi,
          phosphorusLevel: basePhos,
          chlorophyllLevel: parseFloat((basePhos * 0.3).toFixed(1)),
          invasiveSpeciesStatus: 'None detected',
          lastUpdated: '2025 AI-Sync',
          maxDepth: 15.0,
          historicalData: generateHistory(baseSecchi, basePhos),
          advancedMetrics: generateAdvancedMetrics(derivedQuality),
          flowCamRecent: {
            totalBiovolume: 1200000,
            particleCount: 4500,
            concentration: 85,
            taxaDistribution: { cyanobacteria: 15, diatoms: 55, greenAlgae: 20, other: 10 },
            dominantTaxa: 'Unknown Diatom',
            samplingDate: '2025 Prediction'
          }
        };
        setDiscoveredLakes(prev => [newLake, ...prev].slice(0, 10));
        setSelectedLake(newLake);
      }
    } catch (e) {
      console.error("Audit Failed", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (searchTimeoutRef.current) window.clearTimeout(searchTimeoutRef.current);
    
    if (value.length > 2) {
      searchTimeoutRef.current = window.setTimeout(() => {
        const match = [...allRegistryLakes, ...discoveredLakes].find(l => 
          l.name.toLowerCase().includes(value.toLowerCase())
        );
        if (match) {
          handleLakeSelection(match);
        } else {
          fetchInsights(null, value);
        }
      }, 500);
    }
  };

  const handleLakeSelection = (lake: LakeData) => {
    setSelectedLake(lake);
    if (view !== 'compare') setView('dashboard');
    const cached = localStorage.getItem(`lake_audit_pro_v6_${lake.id}`);
    if (!cached) fetchInsights(lake, lake.name);
    else {
      const parsed = JSON.parse(cached);
      setSearchDescription(parsed.data.text.replace(/[*#]/g, '').trim());
      setGroundingSources(parsed.data.sources || []);
    }
  };

  const toggleCompare = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompareBasket(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectedCompareLakes = useMemo(() => 
    [...allRegistryLakes, ...discoveredLakes].filter(l => compareBasket.includes(l.id)),
    [allRegistryLakes, discoveredLakes, compareBasket]
  );

  const tsiScore = useMemo(() => selectedLake ? calculateTSI(selectedLake.lastSecchiDiskReading) : null, [selectedLake]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950 text-slate-200 font-inter">
      <aside className="hidden lg:flex w-80 flex-col bg-slate-900/50 border-r border-slate-800 shrink-0">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg"><Icons.Droplet /></div>
          <h1 className="text-sm font-black uppercase tracking-tighter italic">Maine Lake Guardian</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          <nav className="space-y-1">
            <button onClick={() => setView('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'dashboard' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>
              <Icons.Info /> Dashboard
            </button>
            <button onClick={() => setView('compare')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'compare' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>
              <Icons.Search /> Universal Compare ({compareBasket.length})
            </button>
            <button onClick={() => setView('map')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'map' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>
              <Icons.MapPin /> Regional Map
            </button>
          </nav>

          <div className="space-y-3 pt-4">
            <h3 className="text-[9px] font-black text-slate-500 uppercase px-4 tracking-[0.3em]">LAON Core Basins</h3>
            {coreLakes.map(lake => (
              <div key={lake.id} className="relative group">
                <LakeCard 
                  lake={lake} 
                  isSelected={selectedLake?.id === lake.id} 
                  onClick={() => handleLakeSelection(lake)} 
                />
                <button 
                  onClick={(e) => toggleCompare(lake.id, e)}
                  className={`absolute top-4 right-4 p-1.5 rounded-lg border transition-all ${compareBasket.includes(lake.id) ? 'bg-blue-600 border-blue-400 text-white opacity-100' : 'bg-slate-950/80 border-slate-700 text-slate-500 opacity-0 group-hover:opacity-100'}`}
                >
                   <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/></svg>
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-800/50">
            <div className="flex justify-between items-center px-4">
              <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Registry & Discovery</h3>
              {discoveredLakes.length > 0 && (
                <button 
                  onClick={() => {setDiscoveredLakes([]); sessionStorage.removeItem(SESSION_KEY);}}
                  className="text-[8px] font-black text-rose-500 uppercase hover:underline"
                >
                  Clear Discovery
                </button>
              )}
            </div>
            {discoveryLakes.map(lake => (
              <div key={lake.id} className="relative group">
                <LakeCard 
                  lake={lake} 
                  isSelected={selectedLake?.id === lake.id} 
                  onClick={() => handleLakeSelection(lake)} 
                />
                <button 
                  onClick={(e) => toggleCompare(lake.id, e)}
                  className={`absolute top-4 right-4 p-1.5 rounded-lg border transition-all ${compareBasket.includes(lake.id) ? 'bg-blue-600 border-blue-400 text-white opacity-100' : 'bg-slate-950/80 border-slate-700 text-slate-500 opacity-0 group-hover:opacity-100'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/></svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative bg-slate-950 overflow-hidden">
        <header className="p-6 border-b border-slate-900 bg-slate-950/50 backdrop-blur-xl z-20 flex items-center justify-between">
          <div className="relative w-full max-w-lg">
            <div className={`absolute inset-y-0 left-4 flex items-center ${loading ? 'text-blue-500 animate-spin' : 'text-slate-500'}`}>
              {loading ? <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" /> : <Icons.Search />}
            </div>
            <input 
              value={searchQuery}
              onChange={handleSearchInput}
              placeholder="Filter Discovery or Search New Basin..." 
              className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-xs font-bold text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all" 
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {view === 'dashboard' && selectedLake ? (
            <div className="p-8 lg:p-12 space-y-12 max-w-6xl mx-auto pb-40">
              <div className="text-center space-y-6">
                <h1 className="text-6xl lg:text-8xl font-black text-white uppercase tracking-tighter italic">
                  {selectedLake.name}
                </h1>
                <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800 text-left backdrop-blur-md">
                  <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.3em] mb-4 block">Limnological Audit</span>
                  <div className="text-lg font-medium text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {loading ? "Synthesizing regional datasets..." : (searchDescription || generatePredictiveNarrative(selectedLake))}
                  </div>
                  
                  {/* Correct Method: Render grounding sources to comply with Google Search grounding requirements */}
                  {!loading && groundingSources.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-slate-800/50">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-3">Verification Sources:</p>
                      <div className="flex flex-wrap gap-3">
                        {groundingSources.map((source, idx) => (
                          <a 
                            key={idx} 
                            href={source.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[9px] font-bold text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/5 px-2 py-1 rounded border border-blue-500/10 flex items-center gap-2"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                            {source.title || 'Source'}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Trophic Index</p>
                  <p className="text-3xl font-black text-white">{tsiScore?.toFixed(1)} <span className="text-xs text-slate-500">TSI</span></p>
                  <p className="text-[8px] font-bold text-blue-500 uppercase mt-2">{getTrophicLabel(tsiScore || 0)}</p>
                </div>
                <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Transparency</p>
                  <p className="text-3xl font-black text-white">{selectedLake.lastSecchiDiskReading}m</p>
                </div>
                <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Max Depth</p>
                  <p className="text-3xl font-black text-white">{selectedLake.maxDepth}m</p>
                </div>
                <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Phosphorus</p>
                  <p className="text-3xl font-black text-white">{selectedLake.phosphorusLevel}ppb</p>
                </div>
              </div>
              <HistoricalTrendChart data={selectedLake.historicalData || []} lakeName={selectedLake.name} />
              <ThermalProfileChart lake={selectedLake} />
              {selectedLake.flowCamRecent && <FlowCamAnalysis data={selectedLake.flowCamRecent} />}
            </div>
          ) : view === 'map' ? (
             <BiosecurityMapView 
               lakes={[...allRegistryLakes, ...discoveredLakes]} 
               onSelectLake={handleLakeSelection} 
               onClose={() => setView('dashboard')} 
               searchRadius={searchRadius} 
               onRadiusChange={setSearchRadius} 
             />
          ) : view === 'cluster' ? (
             <ClusterAnalysisView lakes={[...allRegistryLakes, ...discoveredLakes]} onSelectLake={handleLakeSelection} onClose={() => setView('dashboard')} />
          ) : view === 'compare' ? (
            <ComparisonView lakes={selectedCompareLakes} onClose={() => setView('dashboard')} />
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default App;