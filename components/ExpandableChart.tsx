
import React, { useState } from 'react';

interface ExpandableChartProps {
  children: React.ReactNode;
  title: string;
}

const ExpandableChart: React.FC<ExpandableChartProps> = ({ children, title }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <div 
        onClick={() => setIsExpanded(true)}
        className="cursor-zoom-in group relative h-full w-full"
      >
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-slate-900/80 p-2 rounded-lg border border-slate-700 text-blue-500">
           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 3 6 6-6 6"/><path d="M9 21 3 15l6-6"/></svg>
        </div>
        {children}
      </div>

      {isExpanded && (
        <div className="fixed inset-0 z-[2000] bg-slate-950 flex flex-col animate-in fade-in duration-300">
          <header className="flex justify-between items-center px-8 py-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md shrink-0">
            <div>
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">{title}</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1">Full-Scale Diagnostic Overlay // High Fidelity Output</p>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
              className="px-6 py-3 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all shadow-xl border border-slate-700 flex items-center gap-3 group"
            >
              <span className="text-[10px] font-black uppercase tracking-widest">Close Analysis</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-90 transition-transform"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </header>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:p-16 bg-slate-950">
            <div className="max-w-7xl mx-auto bg-slate-900/30 rounded-[3rem] p-10 lg:p-14 border border-slate-800/50 shadow-2xl min-h-fit">
               {children}
            </div>
            <footer className="mt-12 mb-12 text-center">
              <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.6em]">System Audit End • High Resolution Ecological Projection</p>
            </footer>
          </div>
        </div>
      )}
    </>
  );
};

export default ExpandableChart;
