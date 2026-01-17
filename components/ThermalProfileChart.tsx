
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
  ReferenceLine,
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
  // Accuracy Check: Procedurally generate profile based on specific lake clarity and quality
  const profileData = useMemo(() => {
    const data: DepthDataPoint[] = [];
    const surfaceTemp = lake.waterQuality === 'Excellent' ? 26 : 28.5; // Clearer lakes often have slightly lower surface temps
    const bottomTemp = 6.5;
    
    // Calculate thermocline depth based on Secchi reading (typically 1.5x - 2x Secchi depth in Maine)
    const thermoclineDepth = Math.min(Math.max(lake.lastSecchiDiskReading * 1.5, 4), 11);
    
    for (let d = 0; d <= 15; d++) {
      let temp: number;
      let rtrm: number;

      // Sigmoid-ish temperature curve for stratification
      if (d < thermoclineDepth - 2) {
        // Epilimnion
        temp = surfaceTemp - (d * 0.2);
        rtrm = 5 + (d * 5);
      } else if (d > thermoclineDepth + 2) {
        // Hypolimnion
        temp = bottomTemp + (15 - d) * 0.1;
        rtrm = Math.max(0, 15 - (d - thermoclineDepth) * 5);
      } else {
        // Metalimnion (Thermocline transition)
        const transitionFactor = (d - (thermoclineDepth - 2)) / 4;
        temp = surfaceTemp - (surfaceTemp - bottomTemp) * transitionFactor;
        // RTRM Peak Calculation
        rtrm = 120 - Math.abs(d - thermoclineDepth) * 30;
      }

      data.push({ 
        depth: d, 
        temp: parseFloat(temp.toFixed(1)), 
        rtrm: parseFloat(rtrm.toFixed(1)) 
      });
    }
    return { data, thermoclineDepth };
  }, [lake]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl shadow-2xl backdrop-blur-md">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Depth: {payload[0].payload.depth}m</p>
          <div className="space-y-1">
            <p className="text-xs font-bold text-blue-400">Temp: {payload[0].payload.temp}°C</p>
            <p className="text-xs font-bold text-amber-500">RTRM: {payload[0].payload.rtrm} g/m³</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-6 lg:p-10">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Thermal Stratification Analysis</h3>
          <h2 className="text-2xl font-black text-white uppercase italic">{lake.name} Depth Profile</h2>
        </div>
        <div className="text-right">
          <span className="text-[9px] font-black text-blue-400 uppercase bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">Audit-Specific Projection</span>
        </div>
      </div>

      <div className="h-[500px] w-full relative">
        <div className="absolute right-4 top-0 bottom-0 flex flex-col justify-between py-10 pointer-events-none z-10">
          <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest [writing-mode:vertical-lr]">Epilimnion</div>
          <div className="text-[9px] font-black text-amber-500 uppercase tracking-widest [writing-mode:vertical-lr] border-l border-amber-500/30 pl-2">Metalimnion</div>
          <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest [writing-mode:vertical-lr]">Hypolimnion</div>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            layout="vertical"
            data={profileData.data}
            margin={{ top: 20, right: 60, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#1e293b" opacity={0.3} />
            
            <XAxis 
              type="number" 
              orientation="top" 
              domain={[0, 130]} 
              stroke="#64748b" 
              tick={{fontSize: 10, fill: '#64748b', fontWeight: 'bold'}}
              axisLine={false}
              tickLine={false}
            >
              <Label value="RTRM (g/m³)" position="top" offset={10} style={{fill: '#94a3b8', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase'}} />
            </XAxis>
            
            <XAxis 
              type="number" 
              xAxisId="temp" 
              orientation="bottom" 
              domain={[0, 35]} 
              stroke="#3b82f6" 
              tick={{fontSize: 10, fill: '#3b82f6', fontWeight: 'bold'}}
              axisLine={false}
              tickLine={false}
            >
              <Label value="Temperature (°C)" position="bottom" offset={10} style={{fill: '#3b82f6', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase'}} />
            </XAxis>

            <YAxis 
              dataKey="depth" 
              type="number" 
              reversed 
              domain={[0, 15]} 
              stroke="#64748b" 
              tick={{fontSize: 10, fill: '#64748b', fontWeight: 'bold'}}
              axisLine={false}
              tickLine={false}
            >
              <Label value="Depth (m)" angle={-90} position="left" style={{fill: '#94a3b8', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase'}} />
            </YAxis>

            <Tooltip content={<CustomTooltip />} />

            <Area 
              type="monotoneX" 
              dataKey="rtrm" 
              stroke="#f59e0b" 
              strokeWidth={3} 
              fill="url(#colorRtrm)" 
              animationDuration={2000}
            />
            
            <Line 
              xAxisId="temp" 
              type="monotoneX" 
              dataKey="temp" 
              stroke="#3b82f6" 
              strokeWidth={4} 
              dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#0f172a' }} 
              activeDot={{ r: 8, strokeWidth: 0, fill: '#60a5fa' }}
              animationDuration={2500}
            />

            <ReferenceLine y={profileData.thermoclineDepth} stroke="#f43f5e" strokeDasharray="5 5" strokeWidth={2}>
              <Label value={`Thermocline @ ${profileData.thermoclineDepth}m`} position="right" fill="#f43f5e" fontSize={9} fontWeight="bold" />
            </ReferenceLine>

            <defs>
              <linearGradient id="colorRtrm" x1="0" y1="0" x2="1" y2="0">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
            </defs>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[10px] text-slate-400 leading-relaxed max-w-xl">
          <span className="text-white font-bold">Accuracy Check:</span> RTRM peak shifts dynamically. In {lake.name}, the predicted thermocline sits at {profileData.thermoclineDepth}m based on current Secchi clarity ({lake.lastSecchiDiskReading}m).
        </p>
        <div className="shrink-0 text-right">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Derived Profile</p>
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">Station ID: {lake.id}</p>
        </div>
      </div>
    </div>
  );
};

export default ThermalProfileChart;
