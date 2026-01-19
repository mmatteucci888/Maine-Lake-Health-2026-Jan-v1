
import React, { useState, useEffect } from 'react';

interface ExpandableChartProps {
  children: React.ReactNode;
  title: string;
}

const ExpandableChart: React.FC<ExpandableChartProps> = ({ children, title }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Prevent background scrolling when expanded
  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isExpanded]);

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
        <div className="fixed inset-0 z-[5000] bg-slate-950 flex flex-col animate-in fade-in duration-300">
          {/* Close Button - Persistent Upper Right */}
          <button 
            onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
            className="fixed top-8 right-8 z-[6000] px-6 py-4 rounded-2xl bg-white text-slate-950 hover:bg-blue-500 hover:text-white transition-all shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_30px_rgba(255,255,255,0.2)] border-2 border-white flex items-center gap-3 group scale-100 hover:scale-105 active:scale-95"
            aria-label="Close Analysis"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Close Analysis</span>
            <div className="w-6 h-6 rounded-full bg-slate-950 flex items-center justify-center text-white group-hover:bg-white group-hover:text-slate-950 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-90 transition-transform"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </div>
          </button>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:p-20 bg-slate-950 relative">
            <div className="max-w-7xl mx-auto mb-10">
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">{title}</h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em] mt-2 mb-12">High Fidelity Ecological Projection // System Audit</p>
              
              <div className="bg-slate-900/30 rounded-[3rem] p-10 lg:p-14 border border-slate-800/50 shadow-2xl min-h-fit">
                {children}
              </div>
            </div>
            
            <footer className="mt-20 mb-12 text-center opacity-30">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.6em]">Audit Termination • Secure Data Stream • Q1 2025</p>
            </footer>
          </div>
        </div>
      )}
    </>
  );
};

export default ExpandableChart;
