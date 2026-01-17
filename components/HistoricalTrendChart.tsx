
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

const CustomTooltip = ({ active, payload, label, unit, color }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl shadow-xl">
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Audit Year: {label}</p>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
          <p className="text-xs font-black text-white">
            {payload[0].value} <span className="text-[9px] text-slate-500 uppercase tracking-widest">{unit}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const HistoricalTrendChart: React.FC<HistoricalTrendChartProps> = ({ data, lakeName }) => {
  const sortedData = [...data]
    .sort((a, b) => Number(a.year) - Number(b.year))
    .slice(-11);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="flex flex-col h-[300px] w-full p-6 bg-slate-900/10 rounded-2xl border border-slate-800/50">
        <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Transparency Velocity (m)</h4>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sortedData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.2} />
              <XAxis dataKey="year" tick={{fontSize: 9, fill: '#64748b', fontWeight: 'bold'}} stroke="transparent" />
              <YAxis stroke="transparent" tick={{fontSize: 10, fill: '#64748b', fontWeight: 'bold'}} />
              <Tooltip content={<CustomTooltip unit="m" color="#3b82f6" />} />
              <Line type="monotone" dataKey="secchi" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#0f172a', stroke: '#3b82f6', strokeWidth: 2, r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex flex-col h-[300px] w-full p-6 bg-slate-900/10 rounded-2xl border border-slate-800/50">
        <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Phosphorus Accumulation (ppb)</h4>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sortedData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.2} />
              <XAxis dataKey="year" tick={{fontSize: 9, fill: '#64748b', fontWeight: 'bold'}} stroke="transparent" />
              <YAxis stroke="transparent" tick={{fontSize: 10, fill: '#64748b', fontWeight: 'bold'}} />
              <Tooltip content={<CustomTooltip unit="ppb" color="#ef4444" />} />
              <Line type="monotone" dataKey="phosphorus" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#0f172a', stroke: '#ef4444', strokeWidth: 2, r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default HistoricalTrendChart;
