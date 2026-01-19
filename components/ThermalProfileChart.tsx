
import React, { useMemo, useState } from 'react';
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

interface DepthDataPoint {
  depth: number;
  temp: number;
  temp_prev?: number;
  rtrm: number;
}

interface ThermalProfileChartProps {
  lake: LakeData;
}

const ThermalProfileChart: React.FC<ThermalProfileChartProps> = ({ lake }) => {
  const [activeYear, setActiveYear] = useState<number>(2025);
  const [compareMode, setCompareMode] = useState(false);

  // Generate multi-year modeled data based on lake seed
  const profileData = useMemo(() => {
    const years = [2023, 2024, 2025];
    const dataByYear: Record<number, DepthDataPoint[]> = {};
    const seed = lake.id.length;

    years.forEach(year => {
      const yearData: DepthDataPoint[] = [];
      // Seasonal variance: 2025 is warmer, 2023 is cooler
      const surfaceOffset = (year - 2024) * 0.8;
      const thermoclineDepth = 5 + (seed % 3); 

      for (let d = 0; d <= 20; d++) {
        let temp: number;
        if (d < thermoclineDepth) {
          // Epilimnion
          temp = (25 + surfaceOffset) - (d * 0.2);
        } else if (d < thermoclineDepth + 5) {
          // Metalimnion (Thermocline)
          const progress = (d - thermoclineDepth) / 5;
          temp = (25 + surfaceOffset - (thermoclineDepth * 0.2)) - (progress * 12);
        } else {
          // Hypolimnion
          temp = 8.5 + (20 - d) * 0.1;
        }

        let rtrm = 0;
        if (d > 0) {
          const prevTemp = yearData[d-1].temp;
          rtrm = Math.abs(prevTemp - temp) * 18;
        }

        yearData.push({ 
          depth: d, 
          temp: parseFloat(temp.toFixed(1)), 
          rtrm: parseFloat(rtrm.toFixed(1)) 
        });
      }
      dataByYear[year] = yearData;
    });

    // Merge active and comparative data for the chart
    const combinedData = dataByYear[activeYear].map((point, idx) => ({
      ...point,
      temp_prev: compareMode ? dataByYear[activeYear - 1 === 2022 ? 2024 : activeYear - 1][idx].temp : undefined
    }));

    return { 
      data: combinedData, 
      thermoclineStart: 5 + (seed % 3), 
      thermoclineEnd: 10 + (seed % 3) 
    };
  }, [lake.id, activeYear, compareMode]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl shadow-2xl backdrop-blur-md z-50">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Target Depth: {payload[0].payload.depth}m</p>
          <div className="space-y-1.5">
            <p className="text-xs font-black text-blue-400">{activeYear} Temp: {payload[0].payload.temp}°C</p>
            {compareMode && (
               <p className="text-xs font-black text-slate-500">Ref Temp: {payload[0].payload.temp_prev}°C</p>
            )}
            <p className="text-xs font-black text-amber-500">RTRM: {payload[0].payload.rtrm}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full flex flex-col bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-6 lg:p-10">
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
        <div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Thermal Analysis Registry</h3>
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">{lake.name}</h2>
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">Multi-Year Column Profile (0m @ Surface // 20m @ Benthos)</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-950/50 p-1 rounded-xl border border-slate-800 flex">
            {[2023, 2024, 2025].map(year => (
              <button 
                key={year}
                onClick={() => setActiveYear(year)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeYear === year ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {year}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setCompareMode(!compareMode)}
            className={`px-4 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${compareMode ? 'bg-amber-500/10 border-amber-500/40 text-amber-500' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
          >
            {compareMode ? 'Comparison Active' : 'Enable Ref Overlay'}
          </button>
        </div>
      </div>

      <div className="h-[700px] w-full relative bg-slate-950/20 rounded-3xl border border-slate-800/30 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            layout="vertical"
            data={profileData.data}
            margin={{ top: 60, right: 60, left: 40, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#1e293b" opacity={0.3} />
            
            <XAxis 
              type="number" 
              orientation="top" 
              domain={[0, 150]} 
              stroke="#94a3b8" 
              tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 'bold'}}
              axisLine={false}
              tickLine={false}
            >
              <Label value="RTRM (Mixing Resistance)" position="top" offset={25} style={{fill: '#cbd5e1', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase'}} />
            </XAxis>
            
            <XAxis 
              type="number" 
              xAxisId="temp" 
              orientation="bottom" 
              domain={[0, 30]} 
              stroke="#3b82f6" 
              tick={{fontSize: 9, fill: '#3b82f6', fontWeight: 'bold'}}
              axisLine={false}
              tickLine={false}
            >
              <Label value="Temperature (°C)" position="bottom" offset={15} style={{fill: '#3b82f6', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase'}} />
            </XAxis>

            <YAxis 
              dataKey="depth" 
              type="number" 
              domain={[0, 20]}
              stroke="#94a3b8" 
              tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 'bold'}}
              axisLine={false}
              tickLine={false}
              tickCount={21}
            >
              <Label value="Depth (meters)" angle={-90} position="left" offset={-10} style={{fill: '#cbd5e1', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase'}} />
            </YAxis>

            <Tooltip content={<CustomTooltip />} />

            <ReferenceArea 
              y1={profileData.thermoclineStart} 
              y2={profileData.thermoclineEnd} 
              fill="#f59e0b" 
              fillOpacity={0.05} 
            />

            <Area 
              type="monotone" 
              dataKey="rtrm" 
              stroke="#f59e0b" 
              strokeWidth={2} 
              fill="url(#colorRtrm)" 
            />

            {compareMode && (
              <Line 
                xAxisId="temp" 
                type="monotone" 
                dataKey="temp_prev" 
                stroke="#475569" 
                strokeWidth={2} 
                strokeDasharray="5 5"
                dot={false}
                activeDot={false}
              />
            )}
            
            <Line 
              xAxisId="temp" 
              type="monotone" 
              dataKey="temp" 
              stroke="#3b82f6" 
              strokeWidth={5} 
              dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#0f172a' }} 
              activeDot={{ r: 7, strokeWidth: 0, fill: '#fff' }}
            />

            <defs>
              <linearGradient id="colorRtrm" x1="0" y1="0" x2="1" y2="0">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
            </defs>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-10 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-start gap-8">
        <div className="max-w-xl">
           <p className="text-[11px] text-slate-300 leading-relaxed">
            <span className="text-white font-bold uppercase tracking-wider">Historical Comparison:</span> Comparing multiple audit cycles reveals shifts in the <strong>Thermocline Stability Index</strong>. Persistent high-temperature surface layers in 2025 increase the RTRM, effectively trapping nutrients in the hypolimnion and increasing anoxia risk.
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Node Data Sync: Maine-Thermal-Node-B4 • Verified Archive: 2023-2025</p>
        </div>
      </div>
    </div>
  );
};

export default ThermalProfileChart;
