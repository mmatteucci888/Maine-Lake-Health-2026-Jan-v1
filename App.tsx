
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { LAKES_DATA, Icons, NORWAY_MAINE_COORDS } from './constants';
import { LakeData, ChatMessage, GroundingSource } from './types';
import LakeCard from './components/LakeCard';
import HealthChart from './components/HealthChart';
import { getLakeHealthInsights } from './services/geminiService';
import { calculateDistance } from './utils/geoUtils';

const App: React.FC = () => {
  const [activeLakes, setActiveLakes] = useState<LakeData[]>(LAKES_DATA);
  const [selectedLake, setSelectedLake] = useState<LakeData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentSources, setCurrentSources] = useState<GroundingSource[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const analyzeSectionRef = useRef<HTMLDivElement>(null);

  // Regional analysis within 100 miles
  const regionalLakes = useMemo(() => {
    const centerPoint = selectedLake ? selectedLake.coordinates : NORWAY_MAINE_COORDS;
    return activeLakes.filter(lake => {
      const dist = calculateDistance(
        centerPoint.lat, 
        centerPoint.lng,
        lake.coordinates.lat,
        lake.coordinates.lng
      );
      return dist <= 100; 
    }).sort((a, b) => b.lastSecchiDiskReading - a.lastSecchiDiskReading);
  }, [activeLakes, selectedLake]);

  const getTrophicStatus = (lake: LakeData) => {
    const s = lake.lastSecchiDiskReading;
    const p = lake.phosphorusLevel;
    if (s > 7 && p < 5) return { status: 'Oligotrophic', desc: 'Deep, clear, low nutrients', color: 'text-blue-400', bg: 'bg-blue-500/10' };
    if (s > 4 && p < 12) return { status: 'Mesotrophic', desc: 'Moderate productivity', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    return { status: 'Eutrophic', desc: 'Shallow, nutrient-rich', color: 'text-amber-400', bg: 'bg-amber-500/10' };
  };

  const getDynamicInferences = (lake: LakeData) => {
    const s = lake.lastSecchiDiskReading;
    const p = lake.phosphorusLevel;
    const c = lake.chlorophyllLevel;
    const avgRegionalClarity = regionalLakes.reduce((acc, l) => acc + l.lastSecchiDiskReading, 0) / Math.max(regionalLakes.length, 1);

    const insights = [];

    // 1. Nutrient Load Assessment
    if (p > 15) {
      insights.push({
        title: 'Nutrient Overload',
        status: 'Critical',
        statusColor: 'text-rose-400',
        desc: `At ${p}ppb, phosphorus levels are significantly elevated, posing a high risk for cyanobacteria blooms.`,
        prediction: 'High probability of algal events in late summer.',
        icon: '⚠️'
      });
    } else if (p > 8) {
      insights.push({
        title: 'Runoff Impact',
        status: 'Caution',
        statusColor: 'text-amber-400',
        desc: `Moderate nutrient levels (${p}ppb) suggest localized runoff from developed shorelines or storm events.`,
        prediction: 'Potential for gradual clarity decline without buffer zones.',
        icon: '🌧️'
      });
    } else {
      insights.push({
        title: 'Nutrient Stability',
        status: 'Optimal',
        statusColor: 'text-emerald-400',
        desc: `Exceptional phosphorus control (${p}ppb) indicates a well-forested and protected watershed.`,
        prediction: 'Likely to maintain "Excellent" status through 2030.',
        icon: '💎'
      });
    }

    // 2. Clarity & Thermal Analysis
    if (s < avgRegionalClarity) {
      insights.push({
        title: 'Clarity Deficit',
        status: 'Below Avg',
        statusColor: 'text-blue-300',
        desc: `Clarity of ${s}m is lower than the regional average of ${avgRegionalClarity.toFixed(1)}m. Potential suspended solids issue.`,
        prediction: 'Internal loading from sediment likely during turnover.',
        icon: '🌫️'
      });
    } else {
      insights.push({
        title: 'Optical Health',
        status: 'Superior',
        statusColor: 'text-blue-500',
        desc: `Outstanding Secchi depth of ${s}m exceeds 100-mile regional benchmarks. High UV penetration observed.`,
        prediction: 'Stable deep-water oxygen levels for cold-water fish.',
        icon: '✨'
      });
    }

    // 3. Biotic Balance / Invasive Risk
    if (lake.invasiveSpeciesStatus !== 'None detected') {
      insights.push({
        title: 'Biotic Threat',
        status: lake.invasiveSpeciesStatus === 'Detected' ? 'Active' : 'Managed',
        statusColor: 'text-rose-500',
        desc: `Invasive presence requires continuous monitoring. Ecological niche competition is currently ${lake.invasiveSpeciesStatus === 'Detected' ? 'High' : 'Moderate'}.`,
        prediction: 'Annual management costs likely to increase by 5-10%.',
        icon: '🚫'
      });
    } else {
      const bioStressed = c > (p / 2);
      insights.push({
        title: 'Ecosystem Balance',
        status: bioStressed ? 'Reactive' : 'Resilient',
        statusColor: bioStressed ? 'text-amber-400' : 'text-emerald-500',
        desc: bioStressed 
          ? `High chlorophyll (${c}ppb) relative to nutrients suggests a fast-reacting biological community.`
          : `Biological productivity is well-aligned with nutrient availability.`,
        prediction: bioStressed ? 'Sensitive to minor temperature spikes.' : 'Robust against environmental fluctuations.',
        icon: '⚖️'
      });
    }

    return insights;
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (selectedLake) {
      setTimeout(() => {
        analyzeSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [selectedLake]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg = inputValue;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInputValue('');
    setIsTyping(true);

    const result = await getLakeHealthInsights(userMsg);
    
    if (result.discoveredLake && !activeLakes.find(l => l.id === result.discoveredLake.id)) {
      const newLake: LakeData = {
        id: result.discoveredLake.id || result.discoveredLake.name.toLowerCase().replace(/\s/g, '-'),
        name: result.discoveredLake.name,
        town: result.discoveredLake.town,
        zipCode: '04268',
        coordinates: { lat: result.discoveredLake.lat, lng: result.discoveredLake.lng },
        waterQuality: result.discoveredLake.quality as any || 'Good',
        lastSecchiDiskReading: result.discoveredLake.secchi || 5.0,
        phosphorusLevel: result.discoveredLake.phosphorus || 10.0,
        chlorophyllLevel: 2.0,
        invasiveSpeciesStatus: result.discoveredLake.status as any || 'None detected',
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      setActiveLakes(prev => [...prev, newLake]);
      setSelectedLake(newLake);
    } else if (result.discoveredLake) {
      const existing = activeLakes.find(l => l.id === result.discoveredLake.id || l.name === result.discoveredLake.name);
      if (existing) setSelectedLake(existing);
    }

    setMessages(prev => [...prev, { role: 'model', text: result.text }]);
    setCurrentSources(result.sources);
    setIsTyping(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-950 font-sans selection:bg-blue-500/30">
      <aside className="w-full lg:w-[320px] border-r border-slate-800 bg-slate-900/80 overflow-y-auto h-screen sticky top-0 shadow-2xl z-20 hidden lg:block scrollbar-hide">
        <header className="p-6 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Icons.Droplet />
            </div>
            <h1 className="text-xl font-black text-white tracking-tighter">Lake Guardian</h1>
          </div>
        </header>

        <div className="p-4 space-y-4">
          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">Great Ponds Registry</h2>
          <div className="space-y-3">
            {activeLakes.map(lake => (
              <LakeCard key={lake.id} lake={lake} onClick={setSelectedLake} isSelected={selectedLake?.id === lake.id} />
            ))}
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-950">
        <section className="p-4 md:p-8 overflow-y-auto flex-1 scrollbar-hide scroll-smooth">
          <div className="max-w-5xl mx-auto">
            {selectedLake ? (
              <div ref={analyzeSectionRef} className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
                
                <div className="relative p-8 md:p-12 rounded-[2.5rem] bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <span className={`px-4 py-1.5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest ${getTrophicStatus(selectedLake).bg} ${getTrophicStatus(selectedLake).color}`}>
                          {selectedLake.waterQuality} Grade
                        </span>
                        <span className="text-slate-500 text-[10px] font-black uppercase">ME-{selectedLake.id.slice(0,3).toUpperCase()}</span>
                      </div>
                      <h2 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none">{selectedLake.name}</h2>
                      <div className="flex items-center gap-3 text-slate-400 font-bold text-lg">
                        <Icons.MapPin /> {selectedLake.town}, ME
                      </div>
                    </div>

                    <div className="bg-slate-950/50 p-6 rounded-3xl border border-slate-800 w-full md:w-64">
                       <p className="text-[9px] font-black text-slate-600 uppercase mb-2">Trophic State</p>
                       <p className={`text-2xl font-black ${getTrophicStatus(selectedLake).color}`}>{getTrophicStatus(selectedLake).status}</p>
                       <p className="text-xs text-slate-500 mt-1">{getTrophicStatus(selectedLake).desc}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6 mt-10 border-t border-slate-800 pt-8">
                    <div>
                      <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Clarity</p>
                      <p className="text-3xl font-black text-white">{selectedLake.lastSecchiDiskReading}<small className="text-xs text-slate-500 ml-1">M</small></p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Phosphorus</p>
                      <p className="text-3xl font-black text-white">{selectedLake.phosphorusLevel}<small className="text-xs text-slate-500 ml-1">PPB</small></p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Chlorophyll</p>
                      <p className="text-3xl font-black text-white">{selectedLake.chlorophyllLevel}<small className="text-xs text-slate-500 ml-1">PPB</small></p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {getDynamicInferences(selectedLake).map((insight, idx) => (
                    <div key={idx} className="bg-slate-900/60 p-6 rounded-3xl border border-slate-800 hover:border-blue-500/30 transition-all group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="text-3xl">{insight.icon}</div>
                        <span className={`text-[9px] font-black uppercase px-2 py-1 rounded bg-slate-950 border border-slate-800 ${insight.statusColor}`}>
                          {insight.status}
                        </span>
                      </div>
                      <h4 className="text-lg font-black text-white mb-2">{insight.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed mb-4 min-h-[48px]">{insight.desc}</p>
                      <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800">
                        <p className="text-[9px] font-black text-blue-500 uppercase mb-1">2035 Projection</p>
                        <p className="text-xs text-white font-bold">{insight.prediction}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem]">
                   <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                     <div>
                       <h3 className="text-xl font-black text-white tracking-tight">Macro-Regional Health Distribution</h3>
                       <p className="text-slate-500 text-xs mt-1 font-medium">Analyzing {regionalLakes.length} lakes within a 100-mile radius of {selectedLake.name}</p>
                     </div>
                     <div className="px-4 py-2 bg-slate-950 rounded-xl border border-slate-800">
                       <p className="text-[8px] font-black text-blue-500 uppercase">Geographic Scope</p>
                       <p className="text-[10px] text-white font-bold">Broad Regional Maine Audit (100 Mi.)</p>
                     </div>
                   </div>
                   
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <HealthChart 
                        data={regionalLakes} 
                        metric="lastSecchiDiskReading" 
                        title={`Macro-Clarity Benchmark (M)`} 
                      />
                      <div className="overflow-hidden rounded-2xl border border-slate-800">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-900">
                            <tr>
                              <th className="p-4 font-black text-slate-500 uppercase">Regional Basin</th>
                              <th className="p-4 font-black text-slate-500 uppercase text-center">Clarity</th>
                              <th className="p-4 font-black text-slate-500 uppercase text-center">Phos</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/50">
                            {regionalLakes.map(l => (
                              <tr 
                                key={l.id} 
                                className={l.id === selectedLake.id ? 'bg-blue-600/20' : 'hover:bg-white/5 cursor-pointer group'} 
                                onClick={() => setSelectedLake(l)}
                              >
                                <td className="p-4 font-bold text-slate-200 group-hover:text-blue-400 transition-colors">{l.name}</td>
                                <td className="p-4 text-center text-blue-400 font-mono font-bold">{l.lastSecchiDiskReading}m</td>
                                <td className="p-4 text-center text-rose-400 font-mono font-bold">{l.phosphorusLevel}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                   </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-40 text-center space-y-12">
                <div className="w-24 h-24 bg-slate-900 border border-blue-500/20 rounded-3xl flex items-center justify-center text-blue-500 shadow-2xl">
                   <Icons.Droplet />
                </div>
                <div className="space-y-4">
                  <h2 className="text-6xl font-black text-white tracking-tighter leading-tight">Maine Lake Guardian</h2>
                  <p className="text-slate-400 max-w-xl mx-auto text-xl font-medium">
                    Select a lake from the registry or search for any Maine water body to generate a dynamic health audit.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="bg-slate-900/90 backdrop-blur-3xl border-t border-slate-800 p-6 shadow-3xl z-30">
          <div className="max-w-4xl mx-auto">
            <div className="h-24 overflow-y-auto mb-6 p-4 bg-slate-950 rounded-2xl border border-slate-800 scrollbar-hide">
              {messages.length === 0 && <p className="text-[10px] text-slate-700 font-black uppercase tracking-[0.4em] text-center mt-4">System Online • 100-Mile Macro Audit Mode</p>}
              {messages.slice(-2).map((m, i) => (
                <div key={i} className={`flex mb-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-4 py-2 rounded-xl text-xs font-bold ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200'}`}>{m.text}</div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-4">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Analyze a Maine lake (100-mile context)..."
                className="flex-1 px-6 py-4 rounded-2xl border border-slate-700 bg-slate-950 text-white placeholder-slate-700 focus:border-blue-500 focus:outline-none font-bold shadow-inner"
              />
              <button 
                type="submit"
                disabled={isTyping}
                className="bg-blue-600 text-white px-8 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-500 disabled:opacity-50 transition-all flex items-center gap-3 shadow-lg"
              >
                <Icons.Search /> <span>Analyze</span>
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
