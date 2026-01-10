
import React from 'react';
import { LakeData } from '../types';
import { Icons, TARGET_ZIP } from '../constants';

interface LakeCardProps {
  lake: LakeData;
  onClick: (lake: LakeData) => void;
  isSelected?: boolean;
}

const LakeCard: React.FC<LakeCardProps> = ({ lake, onClick, isSelected }) => {
  const isLocal = lake.zipCode === TARGET_ZIP;

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'Excellent': return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
      case 'Good': return 'text-blue-400 border-blue-500/20 bg-blue-500/5';
      case 'Fair': return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
      case 'Poor': return 'text-rose-400 border-rose-500/20 bg-rose-500/5';
      default: return 'text-slate-400 border-slate-500/20 bg-slate-500/5';
    }
  };

  return (
    <div 
      onClick={() => onClick(lake)}
      className={`relative rounded-2xl p-5 transition-all cursor-pointer group border ${
        isSelected ? 'border-blue-500 bg-blue-500/10' : 
        'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-800/80'
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className={`font-bold leading-tight group-hover:text-blue-400 transition-colors ${isSelected ? 'text-white' : 'text-slate-300'}`}>
            {lake.name}
          </h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{lake.town}, ME</p>
        </div>
        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter border ${getQualityColor(lake.waterQuality)}`}>
          {lake.waterQuality}
        </span>
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <p className="text-[9px] uppercase tracking-wider text-slate-600 font-black mb-1">Clarity</p>
          <p className="text-sm font-black text-white">{lake.lastSecchiDiskReading}m</p>
        </div>
        <div className="flex-1">
          <p className="text-[9px] uppercase tracking-wider text-slate-600 font-black mb-1">Nutrients</p>
          <p className="text-sm font-black text-white">{lake.phosphorusLevel}ppb</p>
        </div>
      </div>
    </div>
  );
};

export default LakeCard;
