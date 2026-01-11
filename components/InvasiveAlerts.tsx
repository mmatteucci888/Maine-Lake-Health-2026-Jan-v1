
import React from 'react';
import { LakeData } from '../types';
import { Icons } from '../constants';

interface InvasiveAlertsProps {
  lakes: LakeData[];
  onSelectLake: (lake: LakeData) => void;
}

const InvasiveAlerts: React.FC<InvasiveAlertsProps> = ({ lakes, onSelectLake }) => {
  const detectedLakes = lakes.filter(l => l.invasiveSpeciesStatus === 'Detected');

  if (detectedLakes.length === 0) return null;

  return (
    <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
        <h3 className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Active Invasive Threats</h3>
      </div>
      
      {detectedLakes.map(lake => (
        <div 
          key={lake.id}
          className="group relative flex items-center justify-between p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl overflow-hidden"
        >
          {/* Background Glow */}
          <div className="absolute inset-0 bg-rose-500/5 group-hover:bg-rose-500/10 transition-colors" />
          
          <div className="relative flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-500">
              <Icons.Warning />
            </div>
            <div>
              <p className="text-white font-black tracking-tight">{lake.name}</p>
              <p className="text-[10px] text-rose-400 font-bold uppercase tracking-tighter">Invasive Species Confirmed • {lake.town}</p>
            </div>
          </div>

          <button 
            onClick={() => onSelectLake(lake)}
            className="relative px-4 py-2 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-rose-400 transition-colors shadow-lg shadow-rose-500/20"
          >
            Review Mitigation
          </button>
        </div>
      ))}
    </div>
  );
};

export default InvasiveAlerts;
