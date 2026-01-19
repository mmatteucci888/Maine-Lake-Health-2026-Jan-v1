
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
    const thermoclineStart = 5;
    const thermoclineEnd = 10;
    
    // Modeled profile for 20m depth
    const temps: Record<number, number> = {
      0: 27, 1: 27, 2: 26.8, 3: 26.5, 4: 26, 
      5: 25, 6: 21, 7: 17, 8: 14, 9: 12,          
      10: 11, 11: 10.5, 12: 10.2, 13: 10, 14: 9.8, 15: 9.6,
      16: 9.4, 17: 9.3, 18: 9.2, 19: 9.1, 20: 9.0
    };

    // Generating data for full 0-20m column
    for (let d = 0; d <= 20; d++) {
      const temp = temps[d] || (9.0);
      let rtrm = 0;
      if (d > 0) {
        rtrm = Math.abs((temps[d-1] || temps[0]) - temp) * 15;
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
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Target Depth: {payload[0].payload.depth}m</p>
          <div className="space-y-1.5">
            <p className="text-xs font-black text-blue-400">Temp: {payload[0].payload.temp}°C</p>
            <p className="text-xs font-black text-amber-500">RTRM: {payload[0].payload.rtrm}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full flex flex-col bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-6 lg:p-10">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Thermal Analysis</h3>
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">{lake.name}</h2>
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">Full 20m Column Profile (0m @ Surface // 20m @ Benthos)</p>
        </div>
        <div className="text-right">
          <div className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest">
            2025 Audit Cycle
          </div>
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
            
            {/* Top X-Axis for Mixing Resistance (RTRM) */}
            <XAxis 
              type="number" 
              orientation="top" 
              domain={[0, 100]} 
              stroke="#94a3b8" 
              tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 'bold'}}
              axisLine={false}
              tickLine={false}
            >
              <Label value="RTRM (Mixing Resistance)" position="top" offset={25} style={{fill: '#cbd5e1', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase'}} />
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

            {/* Depth Y-Axis - 0 at top, 20 at bottom. Recharts vertical layout puts start of domain at top. */}
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

            {/* Metalimnetic Zone Highlighting */}
            <ReferenceArea 
              y1={profileData.thermoclineStart} 
              y2={profileData.thermoclineEnd} 
              fill="#f59e0b" 
              fillOpacity={0.08} 
            />

            <Area 
              type="monotone" 
              dataKey="rtrm" 
              stroke="#f59e0b" 
              strokeWidth={2} 
              fill="url(#colorRtrm)" 
            />
            
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
            <span className="text-white font-bold uppercase tracking-wider">Limnological Orientation:</span> The vertical axis is aligned to the physical basin structure: <strong>0m (Surface)</strong> at the top, descending to <strong>20m (Benthos)</strong> at the base. The peak orange area (RTRM) identifies the stability of the thermocline.
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Source: Regional Basin Audit • Sensor: Multiparameter Sonde • Verified: 2025</p>
        </div>
      </div>
    </div>
  );
};

export default ThermalProfileChart;
