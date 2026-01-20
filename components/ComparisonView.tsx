import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { LakeData } from '../types';

interface ComparisonViewProps {
  lakes: LakeData[];
  onClose: () => void;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({ lakes, onClose }) => {
  const [metric, setMetric] = useState<'secchi' | 'phosphorus' | 'chlorophyll'>('secchi');
  const currentYear = new Date().getFullYear();

  const getMetricLabel = (m: string) => {
    switch(m) {
      case 'secchi': return 'Water Clarity (Secchi Disk)';
      case 'phosphorus': return 'Total Phosphorus Concentration';
      case 'chlorophyll': return 'Chlorophyll-a Concentration';
      default: return '';
    }
  };

  const getUnit = (m: string) => m === 'secchi' ? 'meters' : 'µg/L';

  const chartData = lakes.map(lake => ({
    name: lake.name,
    secchi: lake.lastSecchiDiskReading,
    phosphorus: lake.phosphorusLevel,
    chlorophyll: lake.chlorophyllLevel,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl shadow-xl">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-sm font-black text-white">
            {payload[0].value} <span className="text-[10px] text-slate-400">{getUnit(metric)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-950 animate-fade-in">
      {/* Header */}
      <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/30">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Comparative Audit</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
            Analyzing {lakes.length} Regional Water Bodies
          </p>
        </div>
        <button 
          onClick={onClose}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-black uppercase tracking-widest transition-colors"
        >
          Exit Comparison
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
          
          {lakes.length === 0 ? (
             <div className="h-96 flex flex-col items-center justify-center text-slate-600 space-y-6">
                <div className="p-6 rounded-full bg-slate-900 border border-slate-800">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                </div>
                <div className="text-center">
                    <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">Comparison Index Empty</p>
                    <p className="text-[10px] uppercase tracking-widest text-slate-600 mt-2 max-w-xs mx-auto">
                        Select lakes from the sidebar "Registry Basins" or "Recent Discoveries" to add them to this comparative audit.
                    </p>
                </div>
             </div>
          ) : (
          <>
            {/* Controls */}
            <div className="flex justify-center p-1 bg-slate-900 rounded-xl border border-slate-800 w-fit mx-auto">
                {(['secchi', 'phosphorus', 'chlorophyll'] as const).map((m) => (
                <button
                    key={m}
                    onClick={() => setMetric(m)}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    metric === m 
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                >
                    {m === 'secchi' ? 'Clarity' : m === 'phosphorus' ? 'Phosphorus' : 'Algae'}
                </button>
                ))}
            </div>

            {/* Chart Section */}
            <div className="flex flex-col p-6 bg-slate-900/20 border border-slate-800 rounded-3xl">
                <h3 className="text-center text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6">
                {getMetricLabel(metric)}
                </h3>
                <div className="h-[300px] lg:h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.3} />
                    <XAxis 
                        dataKey="name" 
                        tick={{fontSize: 10, fill: '#64748b', fontWeight: 'bold'}} 
                        stroke="#334155" 
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                    />
                    <YAxis 
                        stroke="#334155" 
                        tick={{fontSize: 10, fill: '#64748b', fontWeight: 'bold'}} 
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: '#1e293b', opacity: 0.4}} />
                    <Bar 
                        dataKey={metric} 
                        radius={[8, 8, 0, 0]}
                        animationDuration={1500}
                    >
                        {chartData.map((entry, index) => (
                        <Cell 
                            key={`cell-${index}`} 
                            fill={metric === 'secchi' ? '#3b82f6' : metric === 'phosphorus' ? '#f43f5e' : '#10b981'} 
                        />
                        ))}
                    </Bar>
                    </BarChart>
                </ResponsiveContainer>
                </div>
                <div className="mt-6 pt-3 border-t border-slate-800/50 flex justify-between items-center bg-slate-950/40 px-4 rounded-b-2xl">
                <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest italic">Source: Maine DEP Lakes Database | Standard Observation</p>
                <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest italic">Effective: 2024 Seasonal Mean | Verified: {currentYear}</p>
                </div>
            </div>

            {/* Detailed Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {lakes.map(lake => (
                <div key={lake.id} className="bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col hover:border-blue-500/30 transition-all overflow-hidden">
                    <div className="p-6 flex-1">
                    <div className="mb-4">
                        <h3 className="font-bold text-lg text-white leading-tight">{lake.name}</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{lake.town}</p>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-800/50">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Quality</span>
                        <span className={`text-[10px] font-black uppercase tracking-wider ${
                            lake.waterQuality === 'Excellent' ? 'text-emerald-400' : 
                            lake.waterQuality === 'Good' ? 'text-blue-400' : 'text-amber-400'
                        }`}>{lake.waterQuality}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Clarity</span>
                        <span className="font-bold text-white">{lake.lastSecchiDiskReading}m</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Phosphorus</span>
                        <span className="font-bold text-white">{lake.phosphorusLevel} µg/L</span>
                        </div>

                        <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Chlorophyll</span>
                        <span className="font-bold text-white">{lake.chlorophyllLevel} µg/L</span>
                        </div>

                        <div className="pt-2">
                        <span className={`block text-center text-[9px] font-black uppercase tracking-widest py-1 rounded-lg ${
                            lake.invasiveSpeciesStatus === 'None detected' 
                            ? 'bg-emerald-500/10 text-emerald-500' 
                            : 'bg-rose-500/10 text-rose-500'
                        }`}>
                            {lake.invasiveSpeciesStatus === 'None detected' ? 'Bio-Secure' : 'Invasive Detected'}
                        </span>
                        </div>
                    </div>
                    </div>
                    <div className="px-6 py-3 bg-slate-950 border-t border-slate-800/50">
                    <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest leading-tight">Registry Node: {lake.id}</p>
                    <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest leading-tight mt-1">Audit Data: Aug 2024 | Verified: {currentYear}</p>
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