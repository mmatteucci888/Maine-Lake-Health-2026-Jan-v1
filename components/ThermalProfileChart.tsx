
import React, { useMemo } from 'react';
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
  rtrm: number;
}

interface ThermalProfileChartProps {
  lake: LakeData;
}

const ThermalProfileChart: React.FC<ThermalProfileChartProps> = ({ lake }) => {
  const profileData = useMemo(() => {
    const data: DepthDataPoint[] = [];
    
    // Transition modeling (Metalimnion)
    const thermoclineStart = 4;
    const thermoclineEnd = 8;
    
    // Observed profile baseline logic
    const temps: Record<number, number> = {
      0: 27, 1: 27, 2: 26.8, 3: 26.5, 4: 26, 
      5: 22, 6: 18, 7: 15, 8: 13,          
      9: 12, 10: 11.5, 11: 11.2, 12: 11, 13: 10.8, 14: 10.6, 15: 10.5 
    };

    // Generating data from surface (0) to bottom (15)
    for (let d = 0; d <= 15; d++) {
      const temp = temps[d] || (10.5);
      let rtrm = 0;
      if (d > 0) {
        rtrm = Math.abs(temps[d-1] - temps[d]) * 15;
      }

      data.push({ 
        depth: d, 
        temp: parseFloat(temp.toFixed(1)), 
        rtrm: parseFloat(rtrm.toFixed(1)) 
      });
    }
    return { data, thermoclineStart, thermoclineEnd };
  }, [lake.id]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl shadow-2xl backdrop-blur-md z-50">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Depth Coordinate: {payload[0].payload.depth}m</p>
          <div className="space-y-1.5">
            <p className="text-xs font-black text-blue-400">Temperature: {payload[0].payload.temp}°C</p>
            <p className="text-xs font-black text-amber-500">RTRM Index: {payload[0].payload.rtrm}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full flex flex-col bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-6 lg:p-10 overflow-hidden">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Ecological Profile</h3>
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">{lake.name}</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sub-Surface Thermal Gradient</p>
        </div>
        <div className="text-right">
          <div className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest">
            2024 Seasonal Audit
          </div>
        </div>
      </div>

      {/* Primary Chart Container */}
      <div className="h-[550px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            layout="vertical"
            data={profileData.data}
            margin={{ top: 40, right: 60, left: 40, bottom: 40 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#1e293b" opacity={0.3} />
            
            {/* Top X-Axis for RTRM */}
            <XAxis 
              type="number" 
              orientation="top" 
              domain={[0, 100]} 
              stroke="#64748b" 
              tick={{fontSize: 9, fill: '#64748b', fontWeight: 'bold'}}
              axisLine={false}
              tickLine={false}
            >
              <Label value="RTRM (Resistance to Mixing)" position="top" offset={15} style={{fill: '#94a3b8', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase'}} />
            </XAxis>
            
            {/* Bottom X-Axis for Temperature */}
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

            {/* CRITICAL: Y-Axis for Depth. reversed={true} ensures 0 is at the top. */}
            <YAxis 
              dataKey="depth" 
              type="number" 
              reversed={true} 
              domain={[0, 15]}
              stroke="#64748b" 
              tick={{fontSize: 10, fill: '#64748b', fontWeight: 'bold'}}
              axisLine={false}
              tickLine={false}
              tickCount={16}
            >
              <Label value="Depth (meters below surface)" angle={-90} position="left" offset={-10} style={{fill: '#94a3b8', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase'}} />
            </YAxis>

            <Tooltip content={<CustomTooltip />} />

            {/* Thermal Boundary Highlight */}
            <ReferenceArea 
              y1={profileData.thermoclineStart} 
              y2={profileData.thermoclineEnd} 
              fill="#f59e0b" 
              fillOpacity={0.07} 
            />

            {/* Relative Thermal Resistance Area */}
            <Area 
              type="monotone" 
              dataKey="rtrm" 
              stroke="#f59e0b" 
              strokeWidth={2} 
              fill="url(#colorRtrm)" 
            />
            
            {/* Primary Thermal Line */}
            <Line 
              xAxisId="temp" 
              type="monotone" 
              dataKey="temp" 
              stroke="#3b82f6" 
              strokeWidth={5} 
              dot={{ r: 5, fill: '#3b82f6', strokeWidth: 3, stroke: '#0f172a' }} 
              activeDot={{ r: 9, strokeWidth: 0, fill: '#60a5fa' }}
            />

            <defs>
              <linearGradient id="colorRtrm" x1="0" y1="0" x2="1" y2="0">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
            </defs>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="max-w-2xl">
           <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
            <span className="text-white font-bold">Scientific Interpretation:</span> The metalimnetic interface (highlighted) acts as a physical barrier. A steep decline in temperature across this zone indicates high thermal stability, preventing nutrient transport from the benthic layer to the surface during summer stratification.
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Protocol: Birge Standard Depth Audit</p>
        </div>
      </div>
    </div>
  );
};

export default ThermalProfileChart;
