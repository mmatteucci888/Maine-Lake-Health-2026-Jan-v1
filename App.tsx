
import React, { useState, useEffect, useMemo } from 'react';
import { LAKES_DATA, Icons, NORWAY_MAINE_COORDS } from './constants';
import { LakeData } from './types';
import { getLakeHealthInsights } from './services/geminiService';
import { calculateDistance } from './utils/geoUtils';
import LakeCard from './components/LakeCard';
import HistoricalTrendChart from './components/HistoricalTrendChart';
import InvasiveAlerts from './components/InvasiveAlerts';
import InvasiveModal from './components/InvasiveModal';
import ComparisonView from './components/ComparisonView';
import LakeDetailsModal from './components/LakeDetailsModal';
import BiosecurityMapView from './components/BiosecurityMapView';
import ClusterAnalysisView from './components/ClusterAnalysisView';
import { generatePredictiveNarrative } from './utils/analysisUtils';

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
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [compareSet, setCompareSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    localStorage.setItem('managed_lakes_v2', JSON.stringify(managedLakes));
  }, [managedLakes]);

  const filteredLakes = useMemo(() => {
    return managedLakes.filter(lake => {
      if (!lake.coordinates) return false;
      const dist = calculateDistance(
        NORWAY_MAINE_COORDS.lat, 
        NORWAY_MAINE_COORDS.lng, 
        lake.coordinates.lat, 
        lake.coordinates.lng
      );
      return dist <= searchRadius;
    });
  }, [managedLakes, searchRadius]);

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
      setIsDetailsModalOpen(true);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-950 text-slate-200">
      {/* Sidebar - Registry Node */}
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

        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar relative">
          <nav className="space-y-1">
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
              <Icons.Microscope /> <span className="text-[10px] font-black uppercase tracking-widest">Niche Space Analysis</span>
            </button>
          </nav>

          <div className="pt-4 space-y-3">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Managed Basins ({filteredLakes.length})</h3>
              <button 
                onClick={() => setIsCompareMode(!isCompareMode)}
                className={`px-3 py-1 rounded-full text-[8px] font-black uppercase transition-all ${isCompareMode ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
              >
                {isCompareMode ? 'Cancel' : 'Compare'}
              </button>
            </div>
            
            <div className="space-y-2">
              {filteredLakes.map(lake => (
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
        
        {isCompareMode && compareSet.size >= 2 && (
          <div className="p-4 bg-blue-600">
             <button 
              onClick={() => setView('compare')}
              className="w-full py-2 bg-white text-blue-600 rounded-lg font-black text-[10px] uppercase tracking-widest shadow-lg"
             >
                Execute Compare ({compareSet.size})
             </button>
          </div>
        )}
      </aside>

      <main className="flex-1 flex flex-col relative overflow-hidden bg-slate-950">
        <div className="scanline" />
        
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-md z-20 shrink-0 no-print">
          <div className="flex items-center gap-6">
             <InvasiveAlerts lakes={filteredLakes} onSelectLake={handleLakeInteraction} onOpenModal={() => setIsModalOpen(true)} />
          </div>
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Registry Link: Active</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {view === 'dashboard' ? (
            <div className="p-8 lg:p-12 space-y-12">
               {selectedLake && (
                 <div className="animate-fade-in space-y-12 max-w-6xl mx-auto">
                   <div className="flex flex-col items-center text-center">
                      <div className="flex items-center gap-3 mb-4">
                         <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 uppercase tracking-[0.2em]">Focus Observation</span>
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{selectedLake.town}, ME</span>
                      </div>
                      <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter uppercase italic leading-none mb-6">
                        {selectedLake.name}
                      </h1>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-[9px] font-black uppercase text-slate-400">Node ID: {selectedLake.id}</span>
                        <span className="px-3 py-1 rounded-md bg-slate-900 border border-slate-800 text-[9px] font-black uppercase text-slate-400">Status: Verified</span>
                      </div>
                   </div>

                   {/* Centered Audit Narrative */}
                   <div className="w-full max-w-4xl mx-auto bg-slate-900/40 p-10 rounded-[3rem] border border-slate-800/50 backdrop-blur-sm relative overflow-hidden group text-center">
                      <div className="absolute top-0 left-0 p-6 opacity-5">
                        <Icons.Info />
                      </div>
                      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-6">Technician Audit Narrative</h3>
                      <p className="text-xl font-bold text-slate-200 leading-relaxed italic mono max-w-3xl mx-auto">
                        {`"${searchDescription || generatePredictiveNarrative(selectedLake)}"`}
                      </p>
                      <div className="absolute bottom-0 right-0 p-6 opacity-5 transform rotate-180">
                        <Icons.Info />
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { label: 'Transparency', val: selectedLake.lastSecchiDiskReading, unit: 'm', color: 'text-blue-400' },
                        { label: 'Nutrients (P)', val: selectedLake.phosphorusLevel, unit: 'ppb', color: 'text-rose-400' },
                        { label: 'Biomass (Chl)', val: selectedLake.chlorophyllLevel, unit: 'ppb', color: 'text-emerald-400' }
                      ].map((stat, i) => (
                        <div key={i} className="bg-slate-900/20 p-8 rounded-3xl border border-slate-800 hover:border-slate-700 transition-all cursor-pointer text-center" onClick={() => setIsDetailsModalOpen(true)}>
                          <p className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4">{stat.label}</p>
                          <div className="flex items-baseline justify-center gap-2">
                            <span className={`text-5xl font-black ${stat.color} tracking-tighter`}>{stat.val}</span>
                            <span className="text-[10px] font-black text-slate-500 uppercase">{stat.unit}</span>
                          </div>
                        </div>
                      ))}
                   </div>

                   <div className="bg-slate-900/20 p-8 rounded-[3rem] border border-slate-800/50">
                     <div className="flex items-center justify-between mb-8">
                       <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Longitudinal Trend Map</h2>
                       <button onClick={() => setIsDetailsModalOpen(true)} className="px-4 py-1.5 rounded-full border border-slate-700 text-[9px] font-black uppercase text-slate-400 hover:bg-slate-800 transition-all">Deep Diagnostics</button>
                     </div>
                     <HistoricalTrendChart data={selectedLake.historicalData || []} lakeName={selectedLake.name} />
                   </div>
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

        <footer className="p-6 border-t border-slate-800 bg-slate-950 no-print">
           <form onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              const input = (e.currentTarget.elements.namedItem('query') as HTMLInputElement).value;
              const result = await getLakeHealthInsights(input);
              if (result.discoveredLakes.length > 0) {
                setManagedLakes(prev => [result.discoveredLakes[0], ...prev]);
                setSelectedLake(result.discoveredLakes[0]);
              }
              setSearchDescription(result.text);
              setLoading(false);
           }} className="max-w-4xl mx-auto flex gap-3">
              <div className="relative flex-1">
                <input 
                  name="query" 
                  placeholder="Query Registry Terminal (e.g. 'Audit Sebago Lake clarity')" 
                  className="w-full px-6 py-4 rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all text-xs font-bold mono" 
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                  <Icons.Search />
                </div>
              </div>
              <button 
                disabled={loading}
                className="px-8 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20"
              >
                {loading ? 'Consulting...' : 'Execute Audit'}
              </button>
           </form>
        </footer>
      </main>

      {isDetailsModalOpen && <LakeDetailsModal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} lake={selectedLake} />}
      <InvasiveModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} lakes={filteredLakes} onSelectLake={handleLakeInteraction} />
    </div>
  );
};

export default App;
