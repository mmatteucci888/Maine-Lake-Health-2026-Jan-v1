
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';
import { generateForecast } from '../utils/analysisUtils';
// Fix: Added missing import for Icons
import { Icons } from '../constants';

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
    const isForecast = payload[0].payload.isForecast;
    return (
      <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl shadow-xl">
        <div className="flex justify-between items-center mb-2 gap-4">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Audit Year: {label}</p>
          {isForecast && (
            <span className="text-[7px] font-black text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded bg-blue-500/5">FORECAST</span>
          )}
        </div>
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
  // 1. Process and limit historical data to last 10 years
  const processedHistorical = useMemo(() => {
    return [...data]
      .sort((a, b) => Number(a.year) - Number(b.year))
      .slice(-10)
      .map(d => ({ ...d, isForecast: false }));
  }, [data]);

  const lastHistoricalYear = processedHistorical.length > 0 
    ? Number(processedHistorical[processedHistorical.length - 1].year) 
    : new Date().getFullYear();

  // 2. Generate 5-year forecasts
  const secchiForecast = useMemo(() => 
    generateForecast(processedHistorical.map(d => ({ year: d.year, val: d.secchi })), 5), 
    [processedHistorical]
  );

  const phosphorusForecast = useMemo(() => 
    generateForecast(processedHistorical.map(d => ({ year: d.year, val: d.phosphorus })), 5), 
    [processedHistorical]
  );

  // 3. Merge for chart display
  const secchiChartData = [...processedHistorical, ...secchiForecast.map((f, i) => ({
    year: f.year,
    secchi: f.val,
    phosphorus: 0, // Placeholder
    isForecast: true
  }))];

  const phosChartData = [...processedHistorical, ...phosphorusForecast.map((f, i) => ({
    year: f.year,
    secchi: 0, // Placeholder
    phosphorus: f.val,
    isForecast: true
  }))];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Transparency Chart */}
      <div className="flex flex-col h-[350px] w-full p-6 bg-slate-900/20 rounded-3xl border border-slate-800">
        <div className="flex justify-between items-start mb-6">
          <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Transparency (m) + 5yr Projection</h4>
          {/* Fix: Icons component is now available via import */}
          <Icons.Info />
        </div>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={secchiChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.2} />
              <XAxis dataKey="year" tick={{fontSize: 9, fill: '#64748b', fontWeight: 'bold'}} stroke="transparent" />
              <YAxis stroke="transparent" tick={{fontSize: 10, fill: '#64748b', fontWeight: 'bold'}} />
              <Tooltip content={<CustomTooltip unit="m" color="#3b82f6" />} />
              
              <ReferenceArea x1={lastHistoricalYear} x2={lastHistoricalYear + 5} fill="#3b82f6" fillOpacity={0.03} />
              
              {/* Actual Data */}
              <Line 
                type="monotone" 
                dataKey="secchi" 
                stroke="#3b82f6" 
                strokeWidth={3} 
                dot={{ fill: '#0f172a', stroke: '#3b82f6', strokeWidth: 2, r: 3 }} 
                activeDot={{ r: 5 }}
                connectNulls
                strokeDasharray={(d: any) => d.isForecast ? "5 5" : "0"}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Phosphorus Chart */}
      <div className="flex flex-col h-[350px] w-full p-6 bg-slate-900/20 rounded-3xl border border-slate-800">
        <div className="flex justify-between items-start mb-6">
          <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Phosphorus (ppb) + 5yr Projection</h4>
          {/* Fix: Icons component is now available via import */}
          <Icons.Warning />
        </div>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={phosChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.2} />
              <XAxis dataKey="year" tick={{fontSize: 9, fill: '#64748b', fontWeight: 'bold'}} stroke="transparent" />
              <YAxis stroke="transparent" tick={{fontSize: 10, fill: '#64748b', fontWeight: 'bold'}} />
              <Tooltip content={<CustomTooltip unit="ppb" color="#ef4444" />} />
              
              <ReferenceArea x1={lastHistoricalYear} x2={lastHistoricalYear + 5} fill="#ef4444" fillOpacity={0.03} />

              {/* Actual Data */}
              <Line 
                type="monotone" 
                dataKey="phosphorus" 
                stroke="#ef4444" 
                strokeWidth={3} 
                dot={{ fill: '#0f172a', stroke: '#ef4444', strokeWidth: 2, r: 3 }} 
                activeDot={{ r: 5 }}
                connectNulls
                strokeDasharray={(d: any) => d.isForecast ? "5 5" : "0"}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default HistoricalTrendChart;
