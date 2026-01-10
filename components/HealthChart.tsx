
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { LakeData } from '../types';

interface HealthChartProps {
  data: LakeData[];
  metric: 'lastSecchiDiskReading' | 'phosphorusLevel' | 'chlorophyllLevel';
  title: string;
}

const HealthChart: React.FC<HealthChartProps> = ({ data, metric, title }) => {
  return (
    <div className="h-64 w-full">
      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 text-center">{title}</h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data.slice(0, 12)} margin={{ top: 0, right: 10, left: -20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.3} />
          <XAxis 
            dataKey="name" 
            tick={{fontSize: 8, fill: '#64748b', fontWeight: '900'}} 
            stroke="#334155" 
            angle={-25}
            textAnchor="end"
            interval={0}
          />
          <YAxis 
            stroke="#334155" 
            tick={{fontSize: 9, fill: '#64748b', fontWeight: 'bold'}} 
            axisLine={false}
          />
          <Tooltip 
            cursor={{fill: 'rgba(255,255,255,0.05)'}}
            contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155', color: '#fff', fontSize: '10px', fontWeight: 'bold' }}
            itemStyle={{ color: '#60a5fa' }}
          />
          <Bar dataKey={metric} radius={[4, 4, 0, 0]} barSize={24}>
            {data.slice(0, 12).map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={metric === 'phosphorusLevel' ? '#f43f5e' : '#3b82f6'} 
                fillOpacity={0.8} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HealthChart;
