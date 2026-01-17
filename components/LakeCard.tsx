
import React from 'react';
import { LakeData } from '../types';
import { Icons, TARGET_ZIP } from '../constants';

interface LakeCardProps {
  lake: LakeData;
  onClick: (lake: LakeData) => void;
  isSelected?: boolean;
  isCompareMode?: boolean;
  isSelectedForCompare?: boolean;
  isFieldMode?: boolean;
}

const LakeCard: React.FC<LakeCardProps> = ({ 
  lake, 
  onClick, 
  isSelected, 
  isCompareMode, 
  isSelectedForCompare,
  isFieldMode
}) => {
  const getQualityStyle = (quality: string) => {
    switch (quality) {
      case 'Excellent': return 'text-emerald-400 border-emerald-400/30 bg-emerald-400/5';
      case 'Good': return 'text-blue-400 border-blue-400/30 bg-blue-400/5';
      case 'Fair': return 'text-amber-400 border-amber-400/30 bg-amber-400/5';
      case 'Poor': return 'text-rose-400 border-rose-400/30 bg-rose-400/5';
      default: return 'text-slate-400 border-slate-400/30 bg-slate-400/5';
    }
  };

  const cardClasses = isSelected && !isCompareMode 
    ? 'bg-blue-600/10 border-blue-500 shadow-lg shadow-blue-500/10' 
    : isSelectedForCompare 
    ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-500/20' 
    : 'bg-slate-900/30 border-slate-800 hover:border-slate-700';

  return (
    <div 
      onClick={() => onClick(lake)}
      className={`relative rounded-xl p-4 transition-all cursor-pointer group border ${cardClasses}`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 min-w-0">
          <h3 className={`font-black text-xs truncate leading-tight transition-colors ${isSelected && !isCompareMode ? 'text-white' : 'text-slate-200'}`}>
            {lake.name}
          </h3>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">
            {lake.town}, ME
          </p>
        </div>
        {!isCompareMode && (
          <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter border ${getQualityStyle(lake.waterQuality)}`}>
            {lake.waterQuality}
          </span>
        )}
        {isCompareMode && (
          <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
            isSelectedForCompare ? 'bg-white border-white text-blue-600' : 'border-slate-700 bg-slate-950'
          }`}>
            {isSelectedForCompare && <div className="w-1.5 h-1.5 bg-blue-600 rounded-sm" />}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/50">
        <div>
          <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Clarity</p>
          <p className="text-[10px] font-black text-slate-300">{lake.lastSecchiDiskReading}m</p>
        </div>
        <div>
          <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Phos</p>
          <p className="text-[10px] font-black text-slate-300">{lake.phosphorusLevel}ppb</p>
        </div>
      </div>
    </div>
  );
};

export default LakeCard;
