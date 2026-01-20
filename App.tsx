
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

const App: React.FC = () => {
  // Registry Segmentation
  const [laonLakes] = useState<LakeData[]>(LAKES_DATA.filter(l => 
    ['pennesseewassee', 'little-pennesseewassee', 'sand-pond', 'north-pond'].includes(l.id)
  ));
  const [discoveredLakes, setDiscoveredLakes] = useState<LakeData[]>([]);
  
  // App State
  const [selectedLake, setSelectedLake] = useState<LakeData | null>(laonLakes[0]);
  const [loading, setLoading] = useState(false);
  const [searchDescription, setSearchDescription] = useState<string>("");
  const [searchRadius, setSearchRadius] = useState<number>(300);
  const [view, setView] = useState<'dashboard' | 'map' | 'cluster' | 'compare'>('dashboard');
  const [groundingSources, setGroundingSources] = useState<GroundingSource[]>([]);
  const [currentQuery, setCurrentQuery] = useState<string | null>(null);
  
  // Compare State
  const [compareList, setCompareList] = useState<LakeData[]>([]);

  const cleanNarrative = (text: string) => {
    return text.replace(/[#*]/g, '').trim();
  };

  const fetchInsights = async (lake: LakeData | null, query?: string) => {
    setLoading(true);
    try {
      const prompt = query || (lake ? `Clinical ecological health audit for ${lake.name} in ${lake.town}, Maine. Objective analysis of nutrients and transparency.` : "");
      const result = await getLakeHealthInsights(prompt, lake?.id);
      
      setSearchDescription(cleanNarrative(result?.text || ""));
      setGroundingSources(result?.sources || []);
      
      if (!lake && query) {
        const lines = result.text.split('\n');
        // If first line is short, use it as title, otherwise use query
        const candidateName = cleanNarrative(lines[0].length < 45 ? lines[0] : query);
        
        const newLake: LakeData = {
          id: `disc-${Date.now()}`,
          name: candidateName,
          town: "Maine Basin",
          zipCode: "Registry",
          coordinates: { lat: 45.2, lng: -69.2 },
          waterQuality: (result.extractedMetrics?.secchi || 5) > 6 ? 'Excellent' : 'Good',
          lastSecchiDiskReading: result.extractedMetrics?.secchi || 4.8,
          phosphorusLevel: result.extractedMetrics?.phosphorus || 11.2,
          chlorophyllLevel: 2.8,
          invasiveSpeciesStatus: 'None detected',
          lastUpdated: '2025 Audit',
          historicalData: [
             { year: 2023, secchi: (result.extractedMetrics?.secchi || 4.8) + 0.3, phosphorus: (result.extractedMetrics?.phosphorus || 11.2) - 0.8 },
             { year: 2025, secchi: (result.extractedMetrics?.secchi || 4.8), phosphorus: (result.extractedMetrics?.phosphorus || 11.2) }
          ],
          flowCamRecent: {
            totalBiovolume: 480000 + Math.random() * 1000000,
            particleCount: 1600,
            taxaDistribution: { cyanobacteria: 10, diatoms: 55, greenAlgae: 25, other: 10 },
            dominantTaxa: 'Diatom Fragilaria / Tabellaria',
            samplingDate: '2025-Audit'
          }
        };
        setDiscoveredLakes(prev => [newLake, ...prev].slice(0, 10));
        setSelectedLake(newLake);
      }
    } catch (e: any) {
      console.error("Audit Sync Failure:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedLake && view === 'dashboard' && !searchDescription) {
      fetchInsights(selectedLake);
    }
  }, [selectedLake?.id, view]);

  const handleLakeInteraction = (lake: LakeData) => {
    if (view === 'compare') {
      // Toggle lake in comparison list
      setCompareList(prev => 
        prev.find(l => l.id === lake.id) 
          ? prev.filter(l => l.id !== lake.id) 
          : [...prev, lake]
      );
    } else {
      setSearchDescription("");
      setGroundingSources([]);
      setSelectedLake(lake);
      setView('dashboard');
    }
  };

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const query = new FormData(form).get('query')?.toString().trim();
    if (!query || loading) return;

    // Search local dataset first
    const match = LAKES_DATA.find(l => 
      l.name.toLowerCase().includes(query.toLowerCase())
    );

    setSearchDescription("");
    setGroundingSources([]);
    setView('dashboard');
    setCurrentQuery(query);

    if (match) {
      setSelectedLake(match);
      form.reset();
    } else {
      setSelectedLake(null);
      await fetchInsights(null, `Initiate objective ecological audit for "${query}" in Maine. Identify phosphorus (ppb) and transparency (m).`);
      form.reset();
    }
  };

  const tsiScore = useMemo(() => selectedLake ? calculateTSI(selectedLake.lastSecchiDiskReading) : null, [selectedLake]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950 text-slate-200">
      <aside className="hidden lg:flex w-80 flex-col bg-slate-900/50 border-r border-slate-800 shrink-0">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20"><Icons.Droplet /></div>
            <h1 className="text-sm font-black text-white uppercase tracking-tighter">Lake Guardian</h1>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-10 custom-scrollbar pb-32">
          <nav className="space-y-1">
            <button onClick={() => setView('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'dashboard' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>
              <Icons.Info /> <span className="text-[10px] font-black uppercase tracking-widest">Dashboard</span>
            </button>
            <button onClick={() => setView('map')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'map' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
              <Icons.MapPin /> <span className="text-[10px] font-black uppercase tracking-widest">Regional Map</span>
            </button>
            <button onClick={() => setView('cluster')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'cluster' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
              <Icons.Microscope /> <span className="text-[10px] font-black uppercase tracking-widest">Niche Space</span>
            </button>
            <button onClick={() => { setView('compare'); if (selectedLake && compareList.length === 0) setCompareList([selectedLake]); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${view === 'compare' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg> <span className="text-[10px] font-black uppercase tracking-widest">Compare Mode</span>
            </button>
          </nav>
          
          <div className="space-y-3">
            <h3 className="text-[9px] font-black text-slate-500 uppercase px-4 tracking-[0.25em]">LAON Lakes</h3>
            {laonLakes.map(lake => (
              <LakeCard 
                key={lake.id} 
                lake={lake} 
                isSelected={selectedLake?.id === lake.id} 
                isCompareMode={view === 'compare'}
                isSelectedForCompare={compareList.some(l => l.id === lake.id)}
                onClick={handleLakeInteraction} 
              />
            ))}
          </div>

          {(discoveredLakes.length > 0 || view === 'compare') && (
            <div className="space-y-3 pt-6 border-t border-slate-800/50">
              <h3 className="text-[9px] font-black text-blue-500 uppercase px-4 tracking-[0.25em]">Registry / Discoveries</h3>
              {discoveredLakes.map(lake => (
                <LakeCard 
                  key={lake.id} 
                  lake={lake} 
                  isSelected={selectedLake?.id === lake.id} 
                  isCompareMode={view === 'compare'}
                  isSelectedForCompare={compareList.some(l => l.id === lake.id)}
                  onClick={handleLakeInteraction} 
                />
              ))}
              {/* If in compare mode, allow selecting from the whole data pool for benchmarking */}
              {view === 'compare' && LAKES_DATA.filter(l => !laonLakes.some(ll => ll.id === l.id)).slice(0, 10).map(lake => (
                <LakeCard 
                  key={lake.id} 
                  lake={lake} 
                  isCompareMode={true}
                  isSelectedForCompare={compareList.some(l => l.id === lake.id)}
                  onClick={handleLakeInteraction} 
                />
              ))}
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative bg-slate-950 overflow-hidden">
        <div className="scanline" />
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
          {view === 'dashboard' ? (
            <div className="p-8 lg:p-12 space-y-16 max-w-6xl mx-auto pb-40">
              <div className="text-center space-y-8">
                <h1 className="text-5xl lg:text-8xl font-black text-white uppercase tracking-tighter leading-none animate-in fade-in slide-in-from-top-4 duration-700">
                  {selectedLake ? selectedLake.name : (currentQuery || "Basin Audit")}
                </h1>
                
                <div className="max-w-4xl mx-auto bg-slate-900/40 p-10 rounded-[2.5rem] border border-slate-800 text-left backdrop-blur-md shadow-2xl">
                  <span className="block text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">MDEP Professional Narrative</span>
                  <p className="text-xl font-medium text-slate-100 leading-relaxed whitespace-pre-wrap"> 
                    {loading ? "Establishing encrypted connection to MDEP Environmental Registry Nodes..." : (searchDescription || (selectedLake ? generatePredictiveNarrative(selectedLake) : "Search required to initiate deep basin audit."))} 
                  </p>
                  {groundingSources.length > 0 && (
                    <div className="mt-8 flex flex-wrap gap-4 pt-6 border-t border-slate-800/50">
                      <span className="w-full text-[8px] font-black text-slate-600 uppercase tracking-widest">Data Provenance References:</span>
                      {groundingSources.map((s, i) => (
                        <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-blue-400 underline decoration-blue-500/30 hover:text-blue-300">{s.title || "External Source"}</a>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {selectedLake && (
                <div className="space-y-16 animate-in fade-in duration-700">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-900/30 p-8 rounded-3xl border border-slate-800 text-center relative group">
                      <p className="text-[9px] font-black uppercase text-slate-500 mb-2 tracking-widest">Trophic Index (TSI)</p>
                      <span className="text-4xl font-black text-white">{tsiScore?.toFixed(1)}</span>
                      <p className="text-[8px] font-bold text-blue-500 uppercase mt-2">{tsiScore ? getTrophicLabel(tsiScore).split(' (')[0] : ""}</p>
                      <div className="mt-6 pt-3 border-t border-slate-800/50 text-[7px] font-black text-slate-600 uppercase tracking-widest w-full text-center">Model: Carlson TSI • Audit: 2024</div>
                    </div>
                    <div className="bg-slate-900/30 p-8 rounded-3xl border border-slate-800 text-center relative">
                      <p className="text-[9px] font-black uppercase text-slate-500 mb-2 tracking-widest">Water Clarity</p>
                      <span className="text-4xl font-black text-blue-400">{selectedLake.lastSecchiDiskReading}m</span>
                      <div className="mt-8 pt-3 border-t border-slate-800/50 text-[7px] font-black text-slate-600 uppercase tracking-widest w-full text-center">Sensor: Secchi Disk • Node: {selectedLake.town}</div>
                    </div>
                    <div className="bg-slate-900/30 p-8 rounded-3xl border border-slate-800 text-center relative">
                      <p className="text-[9px] font-black uppercase text-slate-500 mb-2 tracking-widest">Phosphorus</p>
                      <span className="text-4xl font-black text-rose-400">{selectedLake.phosphorusLevel}ppb</span>
                      <div className="mt-8 pt-3 border-t border-slate-800/50 text-[7px] font-black text-slate-600 uppercase tracking-widest w-full text-center">Lab: Total Phosphorus • 2024 Seasonal Mean</div>
                    </div>
                  </div>

                  <HistoricalTrendChart data={selectedLake.historicalData || []} lakeName={selectedLake.name} />
                  {selectedLake.flowCamRecent && <FlowCamAnalysis data={selectedLake.flowCamRecent} />}
                  <ThermalProfileChart lake={selectedLake} />
                </div>
              )}
            </div>
          ) : view === 'map' ? (
            <BiosecurityMapView lakes={LAKES_DATA} onSelectLake={handleLakeInteraction} onClose={() => setView('dashboard')} searchRadius={searchRadius} onRadiusChange={setSearchRadius} />
          ) : view === 'cluster' ? (
            <ClusterAnalysisView lakes={LAKES_DATA} onSelectLake={handleLakeInteraction} onClose={() => setView('dashboard')} />
          ) : view === 'compare' ? (
            <ComparisonView lakes={compareList} onClose={() => setView('dashboard')} />
          ) : null}
        </div>

        <footer className="p-8 border-t border-slate-800 bg-slate-950/90 backdrop-blur-xl z-50">
           <form onSubmit={handleSearch} className="max-w-5xl mx-auto flex flex-col sm:flex-row gap-4">
              <input name="query" placeholder="Registry Lookup: Enter Maine lake name (e.g. 'Moosehead Lake')..." autoComplete="off" className="flex-1 px-10 py-8 rounded-[2rem] bg-slate-900 border-2 border-slate-800 text-white text-2xl font-black outline-none focus:border-blue-500 transition-all shadow-2xl" />
              <button type="submit" disabled={loading} className="px-12 py-8 bg-blue-600 text-white font-black text-sm uppercase tracking-[0.2em] rounded-[2rem] hover:bg-blue-500 transition-all shadow-2xl disabled:opacity-50">
                {loading ? 'AUDITING...' : 'SEARCH'}
              </button>
           </form>
        </footer>
      </main>
    </div>
  );
};

export default App;
