import React, { useMemo, useState, memo, useCallback } from 'react';
import { 
  ComposedChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Area, 
  ReferenceArea,
  Label
} from 'recharts';
import { LakeData } from '../types';

interface ThermalProfileChartProps {
  lake: LakeData;
}

// Sub-component to prevent full dashboard re-renders
const ProfileGraph = memo(({ data, maxDepth, activeYear, compareMode }: any) => {
  return (
    <div className="h-[650px] w-full relative bg-slate-950/20 rounded-3xl border border-slate-800/30 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          layout="vertical"
          data={data}
          margin={{ top: 60, right: 60, left: 40, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#1e293b" opacity={0.2} />
          <XAxis type="number" orientation="top" domain={[0, 160]} stroke="#94a3b8" tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 'bold'}} axisLine={false} tickLine={false}>
            <Label value="RTRM (Mixing Resistance)" position="top" offset={25} style={{fill: '#cbd5e1', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase'}} />
          </XAxis>
          <XAxis type="number" xAxisId="temp" orientation="bottom" domain={[0, 30]} stroke="#3b82f6" tick={{fontSize: 9, fill: '#3b82f6', fontWeight: 'bold'}} axisLine={false} tickLine={false}>
            <Label value="Temperature (°C)" position="bottom" offset={15} style={{fill: '#3b82f6', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase'}} />
          </XAxis>
          <YAxis dataKey="depth" type="number" domain={[0, maxDepth]} stroke="#94a3b8" tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 'bold'}} axisLine={false} tickLine={false} reversed>
            <Label value="Depth (meters)" angle={-90} position="left" offset={-10} style={{fill: '#cbd5e1', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase'}} />
          </YAxis>
          <Tooltip />
          <Area type="monotone" dataKey="rtrm" stroke="#f59e0b" strokeWidth={2} fill="url(#colorRtrm)" />
          {compareMode && (
            <Line xAxisId="temp" type="monotone" dataKey="temp_prev" stroke="#475569" strokeWidth={2} strokeDasharray="4 4" dot={false} />
          )}
          <Line xAxisId="temp" type="monotone" dataKey="temp" stroke="#3b82f6" strokeWidth={4} dot={{ r: 3, fill: '#3b82f6', stroke: '#0f172a', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#fff' }} />
          <defs>
            <linearGradient id="colorRtrm" x1="0" y1="0" x2="1" y2="0">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
            </linearGradient>
          </defs>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
});

const ThermalProfileChart: React.FC<ThermalProfileChartProps> = ({ lake }) => {
  const [activeYear, setActiveYear] = useState<number>(2025);
  const [compareMode, setCompareMode] = useState(false);

  // Limnological Constants
  const HYPOLIMNION_TEMP = 7.0; // Maine average deep water
  const K_STEEPNESS = 1.35; // Sigmoid slope factor

  const calculateTempAtDepth = useCallback((depth: number, surfaceTemp: number, thermoclineDepth: number) => {
    // Sigmoid function: T_base + (T_surface - T_base) / (1 + exp(k * (d - d_t)))
    return HYPOLIMNION_TEMP + (surfaceTemp - HYPOLIMNION_TEMP) / (1 + Math.exp(K_STEEPNESS * (depth - thermoclineDepth)));
  }, []);

  const profileData = useMemo(() => {
    const years = [2023, 2024, 2025];
    const dataByYear: Record<number, any[]> = {};
    const maxD = lake.maxDepth || 15;

    years.forEach(year => {
      const yearData: any[] = [];
      const surfaceOffset = (year - 2024) * 1.8;
      const surfaceTemp = 23.5 + surfaceOffset;
      
      // Physics Correction: Warmer years push thermocline deeper
      const thermoclineDepth = (maxD * 0.3) + (surfaceOffset * 0.5); 

      // Dynamic loop based on lake max depth
      const step = maxD > 60 ? 2 : 1;
      for (let d = 0; d <= maxD; d += step) {
        const currentTemp = calculateTempAtDepth(d, surfaceTemp, thermoclineDepth);
        
        // RTRM Physics Fix: Centered difference for top-heavy peak
        const nextTemp = calculateTempAtDepth(d + 0.5, surfaceTemp, thermoclineDepth);
        const tempDiff = Math.abs(currentTemp - nextTemp);
        const rtrm = Math.pow(tempDiff, 1.5) * 50;

        yearData.push({ 
          depth: d, 
          temp: parseFloat(currentTemp.toFixed(1)), 
          rtrm: parseFloat(rtrm.toFixed(1)) 
        });
      }
      dataByYear[year] = yearData;
    });

    const activeData = dataByYear[activeYear];
    const prevData = dataByYear[activeYear - 1] || dataByYear[2024];

    return activeData.map((p, i) => ({
      ...p,
      temp_prev: compareMode ? (prevData[i]?.temp || p.temp) : undefined
    }));
  }, [lake.id, lake.maxDepth, activeYear, compareMode, calculateTempAtDepth]);

  return (
    <div className="w-full flex flex-col bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-6 lg:p-10">
      <div className="flex flex-col md:flex-row justify-between items-start mb-10">
        <div>
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Thermal Column Audit</h2>
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">
            Sigmoid Stratification Model • Scale: {lake.maxDepth}m
          </p>
        </div>
        <div className="flex gap-3">
          <div className="bg-slate-950/50 p-1 rounded-xl flex">
            {[2023, 2024, 2025].map(y => (
              <button 
                key={y} 
                onClick={() => setActiveYear(y)} 
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${activeYear === y ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {y}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setCompareMode(!compareMode)} 
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${compareMode ? 'bg-amber-600/20 text-amber-500' : 'bg-slate-800 text-slate-400'}`}
          >
            Ref Overlay
          </button>
        </div>
      </div>

      <ProfileGraph data={profileData} maxDepth={lake.maxDepth} activeYear={activeYear} compareMode={compareMode} />
    </div>
  );
};

export default ThermalProfileChart;