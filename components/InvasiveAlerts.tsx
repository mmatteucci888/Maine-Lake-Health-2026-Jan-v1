import React from 'react';
import { LakeData } from '../types';

interface InvasiveAlertsProps {
  lakes: LakeData[];
  onSelectLake: (lake: LakeData) => void;
  onOpenModal: () => void;
  compact?: boolean;
}

const InvasiveAlerts: React.FC<InvasiveAlertsProps> = ({ lakes, onOpenModal, compact }) => {
  const detectedLakes = lakes.filter(l => l.invasiveSpeciesStatus === 'Detected');

  if (detectedLakes.length === 0) return null;

  if (compact) {
    return (
       <div 
        onClick={onOpenModal}
        className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 border border-rose-500/30 rounded-full cursor-pointer"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
        <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">
          {detectedLakes.length} Threats
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between w-full">
      <div 
        onClick={onOpenModal}
        className="group relative flex items-center gap-3 px-4 py-2 bg-rose-500/10 border border-rose-500/30 rounded-full cursor-pointer hover:bg-rose-500/20 transition-all duration-300 shadow-lg shadow-rose-500/10"
      >
        <div className="relative">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute inset-0" />
          <div className="w-2 h-2 rounded-full bg-rose-500 relative" />
        </div>
        
        <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] hidden sm:block">
          {detectedLakes.length} Regional Bio-Threats Active
        </span>
        <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] sm:hidden">
          {detectedLakes.length} Threats
        </span>

        <div className="hidden md:flex -space-x-2 ml-2">
          {detectedLakes.slice(0, 3).map((lake) => (
            <div 
              key={lake.id} 
              className="w-5 h-5 rounded-full border border-slate-900 bg-slate-800 flex items-center justify-center text-[8px] font-black text-white"
              title={lake.name}
            >
              {lake.name[0]}
            </div>
          ))}
          {detectedLakes.length > 3 && (
            <div className="w-5 h-5 rounded-full border border-slate-900 bg-slate-700 flex items-center justify-center text-[8px] font-black text-white">
              +{detectedLakes.length - 3}
            </div>
          )}
        </div>

        <div className="ml-2 pl-3 border-l border-rose-500/20 group-hover:translate-x-1 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500"><path d="m9 18 6-6-6-6"/></svg>
        </div>
      </div>
    </div>
  );
};

export default InvasiveAlerts;