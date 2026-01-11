
import React from 'react';
import { LakeData } from '../types';
import { Icons } from '../constants';

interface InvasiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  lakes: LakeData[];
  onSelectLake: (lake: LakeData) => void;
}

const InvasiveModal: React.FC<InvasiveModalProps> = ({ isOpen, onClose, lakes, onSelectLake }) => {
  if (!isOpen) return null;

  const detectedLakes = lakes.filter(l => l.invasiveSpeciesStatus === 'Detected' || l.invasiveSpeciesStatus === 'Under Management');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-rose-500/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center text-rose-500">
              <Icons.Warning />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Regional Biosecurity Review</h2>
              <p className="text-[10px] text-rose-400 font-bold uppercase tracking-[0.2em] mt-1">
                {detectedLakes.length} ACTIVE THREATS IN 50-MILE RADIUS
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div className="p-8 max-h-[60vh] overflow-y-auto scrollbar-hide space-y-6">
          {detectedLakes.map(lake => (
            <div key={lake.id} className="p-6 bg-slate-800/40 border border-slate-700 rounded-3xl group hover:border-rose-500/30 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{lake.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">{lake.town}, Maine • {lake.zipCode}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  lake.invasiveSpeciesStatus === 'Detected' 
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                }`}>
                  {lake.invasiveSpeciesStatus}
                </span>
              </div>
              
              <div className="bg-slate-950/40 rounded-2xl p-4 mb-4">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Management Plan</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Mitigation efforts include localized bottom barriers and targeted manual harvesting. 
                  Boaters are required to drain and dry all equipment before leaving the ramp.
                </p>
              </div>

              <button 
                onClick={() => { onSelectLake(lake); onClose(); }}
                className="w-full py-3 bg-slate-700 hover:bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
              >
                Focus Data Analysis
              </button>
            </div>
          ))}
        </div>

        <div className="p-6 bg-slate-950 text-center border-t border-slate-800">
          <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">
            REPORT SIGHTINGS TO MAINE DEP • 207-287-7688
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvasiveModal;
