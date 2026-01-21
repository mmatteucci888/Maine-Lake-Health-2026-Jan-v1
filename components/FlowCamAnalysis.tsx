import React, { useEffect, useRef, useState, useMemo } from 'react';
import { FlowCamData, FlowCamParticle } from '../types';

interface FlowCamAnalysisProps {
  data: FlowCamData;
}

const MAX_PARTICLES = 200;

/**
 * Scientific Classification Logic based on FlowCam Morphology and Lake-Specific Taxa
 * Ensures particle types are weighted by the lake's unique distribution profile.
 */
const classifyFlowCamParticle = (p: Partial<FlowCamParticle>, dist: FlowCamData['taxaDistribution']): FlowCamParticle['type'] => {
  if (!p.esd || !p.aspectRatio || !p.transparency) return 'Detritus';
  
  const total = dist.cyanobacteria + dist.diatoms + dist.greenAlgae + dist.other;
  const rand = Math.random() * total;

  if (rand < dist.cyanobacteria) return 'Cyanobacteria';
  if (rand < dist.cyanobacteria + dist.diatoms) return 'Diatom';
  if (rand < dist.cyanobacteria + dist.diatoms + dist.greenAlgae) return 'Zooplankton';
  
  return 'Detritus';
};

const FlowCamAnalysis: React.FC<FlowCamAnalysisProps> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particles, setParticles] = useState<FlowCamParticle[]>([]);
  const requestRef = useRef<number>();

  // RESET LOGIC: When data (lake) changes, clear the buffer to show new profile immediately
  useEffect(() => {
    setParticles([]);
  }, [data.concentration, data.taxaDistribution]);

  const createParticle = (canvasWidth: number, canvasHeight: number): FlowCamParticle => {
    const esd = 10 + Math.random() * 80;
    const aspectRatio = 0.1 + Math.random() * 0.9;
    const transparency = 0.2 + Math.random() * 0.7;
    const length = esd * (1 / aspectRatio);
    const width = esd * aspectRatio;
    
    const partial: Partial<FlowCamParticle> = { esd, aspectRatio, transparency };
    const type = classifyFlowCamParticle(partial, data.taxaDistribution);

    return {
      id: Math.random().toString(36).substr(2, 9),
      esd,
      area: Math.PI * Math.pow(esd / 2, 2),
      length,
      width,
      aspectRatio,
      transparency,
      type,
      x: -50,
      y: Math.random() * canvasHeight,
      velocity: 0.8 + Math.random() * 2.5 // Slightly faster for modern feel
    };
  };

  const animate = () => {
    setParticles((prevParticles) => {
      // 1. Update positions and filter out-of-bounds
      const updated = prevParticles
        .map(p => ({ ...p, x: p.x + p.velocity }))
        .filter(p => p.x < (canvasRef.current?.width || 2000));

      // 2. Probabilistic spawning based on lake concentration
      // Logic: Higher concentration = higher chance to spawn per frame
      const spawnChance = data.concentration / 400; 
      if (updated.length < MAX_PARTICLES && Math.random() < spawnChance) {
        updated.push(createParticle(canvasRef.current?.width || 800, canvasRef.current?.height || 200));
      }

      return updated;
    });
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [data.concentration, data.taxaDistribution]);

  // DRAWING LOGIC: Runs on every particle state change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Blue-print Grid
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 40) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
    }
    for (let j = 0; j < canvas.height; j += 40) {
      ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(canvas.width, j); ctx.stroke();
    }

    particles.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);

      // Color Palette Mapped to Morphology
      let color = 'rgba(148, 163, 184, 0.35)'; // Detritus (Grey)
      if (p.type === 'Diatom') color = `rgba(16, 185, 129, ${1.2 - p.transparency})`; // Green
      if (p.type === 'Cyanobacteria') color = `rgba(244, 63, 94, ${1.2 - p.transparency})`; // Red/Warning
      if (p.type === 'Zooplankton') color = `rgba(59, 130, 246, ${1.2 - p.transparency})`; // Blue

      ctx.fillStyle = color;
      ctx.strokeStyle = color.replace(/[\d\.]+\)$/g, '0.8)');
      ctx.lineWidth = 1.5;

      const drawSize = p.esd / 5;
      
      if (p.type === 'Diatom') {
        ctx.strokeRect(-drawSize * 2, -drawSize / 2, drawSize * 4, drawSize);
        ctx.fillRect(-drawSize * 2, -drawSize / 2, drawSize * 4, drawSize);
      } else if (p.type === 'Cyanobacteria') {
        ctx.beginPath();
        ctx.arc(0, 0, drawSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (p.type === 'Zooplankton') {
        ctx.beginPath();
        ctx.moveTo(-drawSize * 2, -drawSize);
        ctx.lineTo(drawSize * 2, 0);
        ctx.lineTo(-drawSize * 2, drawSize);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.beginPath();
        for(let k=0; k<4; k++) {
          const r = drawSize * (0.4 + Math.random() * 0.4);
          const a = (Math.PI * 2 / 4) * k;
          ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    });
  }, [particles]);

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 lg:p-12 overflow-hidden relative group">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8 z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">FlowCam Imaging Stream</h3>
              <div className="h-px w-8 bg-slate-800" />
              <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Live Pulse</span>
            </div>
            <h4 className="text-3xl font-black text-white uppercase italic tracking-tighter">Taxonomic Manifold</h4>
          </div>

          <div className="relative">
            <div className="text-7xl font-black text-white tracking-tighter leading-none">
              {data.concentration.toFixed(1)}
              <span className="text-lg text-slate-500 ml-4 font-bold uppercase tracking-normal">particles/mL</span>
            </div>
            <div className="mt-4 flex items-center gap-3">
               <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Sampled: {data.particleCount.toLocaleString()} cells</span>
               </div>
               <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">{data.samplingDate}</div>
            </div>
          </div>

          <div className="h-48 w-full bg-slate-950/50 rounded-3xl border border-slate-800/50 relative overflow-hidden">
             <canvas 
               ref={canvasRef} 
               width={800} 
               height={200} 
               className="w-full h-full"
             />
             <div className="absolute top-4 left-4 flex gap-4 pointer-events-none">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500" />
                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Diatoms</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-rose-500" />
                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Cyano</span>
                </div>
             </div>
             <div className="absolute inset-0 border border-blue-500/10 pointer-events-none group-hover:border-blue-500/30 transition-colors" />
          </div>
        </div>

        <div className="space-y-10 bg-black/20 p-8 rounded-[2rem] border border-slate-800/50 shadow-inner z-10">
           <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Dominant Genus</p>
              <p className="text-xl font-black text-blue-400 uppercase italic tracking-tight">{data.dominantTaxa}</p>
           </div>

           <div className="space-y-6">
              {[
                { label: 'Bacillariophyta (Diatoms)', val: data.taxaDistribution.diatoms, color: 'bg-emerald-500' },
                { label: 'Cyanobacteria (Blue-Green)', val: data.taxaDistribution.cyanobacteria, color: 'bg-rose-500' },
                { label: 'Chlorophyta (Greens)', val: data.taxaDistribution.greenAlgae, color: 'bg-blue-500' },
                { label: 'Other / Detritus', val: data.taxaDistribution.other, color: 'bg-slate-700' }
              ].map((item) => (
                <div key={item.label} className="space-y-2">
                   <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                      <span className="text-slate-400">{item.label}</span>
                      <span className="text-white">{item.val.toFixed(1)}%</span>
                   </div>
                   <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.color} transition-all duration-1000 ease-out`} 
                        style={{ width: `${item.val}%` }} 
                      />
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
      
      <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-500/5 blur-[100px] pointer-events-none rounded-full" />
    </div>
  );
};

export default FlowCamAnalysis;