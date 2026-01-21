import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';
import { LakeData } from '../types';
import ThermalProfileChart from './ThermalProfileChart';

interface ComparisonViewProps {
  lakes: LakeData[];
  onClose: () => void;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({ lakes, onClose }) => {
  const [metric, setMetric] = useState<'secchi' | 'phosphorus' | 'chlorophyll'>('secchi');

  const chartData = useMemo(() => lakes.map(lake => ({
    name: lake.name,
    secchi: lake.lastSecchiDiskReading,
    phosphorus: lake.phosphorusLevel,
    chlorophyll: lake.chlorophyllLevel,
  })), [lakes]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl shadow-xl">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-sm font-black text-white">
            {payload[0].value} <span className="text-[10px] text-slate-400">{metric === 'secchi' ? 'm' : 'µg/L'}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-950 animate-in fade-in duration-500">
      <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/30 backdrop-blur-md">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tighter italic uppercase">Universal Comparative Audit</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
            Comparing {lakes.length} Selected Water Bodies • {metric} Focus
          </p>
        </div>
        <button 
          onClick={onClose}
          className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest transition-all border border-slate-700"
        >
          Exit Comparison
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-12">
        <div className="max-w-7xl mx-auto space-y-16 pb-32">
          
          {lakes.length === 0 ? (
             <div className="h-96 flex flex-col items-center justify-center text-slate-600 space-y-6">
                <div className="p-8 rounded-full bg-slate-900 border border-slate-800 animate-pulse">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                </div>
                <div className="text-center">
                    <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">Selection Basket Empty</p>
                    <p className="text-[10px] uppercase tracking-widest text-slate-600 mt-2 max-w-xs mx-auto">
                        Add basins to your comparison basket from the sidebar using the "compare" toggle to activate this engine.
                    </p>
                </div>
             </div>
          ) : (
          <>
            <div className="bg-slate-900/20 border border-slate-800 rounded-[3rem] p-10">
              <div className="flex justify-center mb-10">
                <div className="inline-flex bg-slate-950 p-1 rounded-2xl border border-slate-800 shadow-inner">
                  {(['secchi', 'phosphorus', 'chlorophyll'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMetric(m)}
                      className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                        metric === m ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.3} />
                    <XAxis 
                      dataKey="name" 
                      tick={{fontSize: 9, fill: '#64748b', fontWeight: 'bold'}} 
                      stroke="#334155" 
                      angle={-20}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis 
                      stroke="#334155" 
                      tick={{fontSize: 10, fill: '#64748b', fontWeight: 'bold'}} 
                      axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: '#1e293b', opacity: 0.4}} />
                    <Bar dataKey={metric} radius={[8, 8, 0, 0]} animationDuration={1000}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={metric === 'secchi' ? '#3b82f6' : metric === 'phosphorus' ? '#f43f5e' : '#10b981'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {lakes.length >= 2 && (
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Stratification Side-by-Side</h3>
                  <div className="h-px flex-1 bg-slate-800" />
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {lakes.slice(0, 2).map(lake => (
                    <ThermalProfileChart key={lake.id} lake={lake} />
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lakes.map(lake => (
                <div key={lake.id} className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 hover:border-blue-500/30 transition-all flex flex-col justify-between group">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h4 className="text-xl font-black text-white uppercase italic tracking-tight leading-none mb-2">{lake.name}</h4>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{lake.town}, ME</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${lake.waterQuality === 'Excellent' ? 'text-emerald-400 border-emerald-400/20' : 'text-blue-400 border-blue-400/20'}`}>
                        {lake.waterQuality}
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-end pb-3 border-b border-slate-800">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Clarity</span>
                        <span className="text-lg font-black text-white">{lake.lastSecchiDiskReading}m</span>
                      </div>
                      <div className="flex justify-between items-end pb-3 border-b border-slate-800">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Phosphorus</span>
                        <span className="text-lg font-black text-white">{lake.phosphorusLevel}ppb</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Algae (CHL-A)</span>
                        <span className="text-lg font-black text-white">{lake.chlorophyllLevel}ppb</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-800">
                    <div className={`text-[9px] font-black uppercase py-2 rounded-xl text-center border ${lake.invasiveSpeciesStatus === 'None detected' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
                      {lake.invasiveSpeciesStatus}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComparisonView;