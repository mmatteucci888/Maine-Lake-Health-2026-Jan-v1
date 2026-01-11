
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface HistoricalReading {
  year: number | string;
  secchi: number;
  phosphorus: number;
}

interface HistoricalTrendChartProps {
  data: HistoricalReading[];
  lakeName: string;
}

const HistoricalTrendChart: React.FC<HistoricalTrendChartProps> = ({ data, lakeName }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500">
        <p className="text-sm font-black uppercase tracking-widest">No Historical Data Available</p>
        <p className="text-[10px] mt-2 opacity-50">Upload monitoring files to generate timeline charts.</p>
      </div>
    );
  }

  // Sort data by year to ensure line continuity
  const sortedData = [...data].sort((a, b) => {
    const yearA = String(a.year).match(/\d+/)?.[0] || '0';
    const yearB = String(b.year).match(/\d+/)?.[0] || '0';
    return Number(yearA) - Number(yearB);
  });

  return (
    <div className="space-y-12 py-4">
      <div className="h-64 w-full">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Water Clarity Timeline (m)</h4>
          <span className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-md font-black uppercase tracking-widest">Historical Secchi</span>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sortedData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.3} />
            <XAxis 
              dataKey="year" 
              tick={{fontSize: 10, fill: '#64748b', fontWeight: 'bold'}} 
              stroke="#334155" 
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="#334155" 
              tick={{fontSize: 10, fill: '#64748b', fontWeight: 'bold'}} 
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: '#fff' }}
              itemStyle={{ color: '#3b82f6' }}
              labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
            />
            <Line 
              type="monotone" 
              dataKey="secchi" 
              stroke="#3b82f6" 
              strokeWidth={4} 
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5, stroke: '#0f172a' }} 
              activeDot={{ r: 8, strokeWidth: 0 }}
              name="Secchi Depth"
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="h-64 w-full">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Nutrient Loading Trend (ppb)</h4>
          <span className="text-[9px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-md font-black uppercase tracking-widest">Phosphorus Total</span>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sortedData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.3} />
            <XAxis 
              dataKey="year" 
              tick={{fontSize: 10, fill: '#64748b', fontWeight: 'bold'}} 
              stroke="#334155" 
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="#334155" 
              tick={{fontSize: 10, fill: '#64748b', fontWeight: 'bold'}} 
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: '#fff' }}
              itemStyle={{ color: '#f43f5e' }}
              labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
            />
            <Line 
              type="monotone" 
              dataKey="phosphorus" 
              stroke="#f43f5e" 
              strokeWidth={4} 
              dot={{ fill: '#f43f5e', strokeWidth: 2, r: 5, stroke: '#0f172a' }} 
              activeDot={{ r: 8, strokeWidth: 0 }}
              name="Phosphorus Level"
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HistoricalTrendChart;
