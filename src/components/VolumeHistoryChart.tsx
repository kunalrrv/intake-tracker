import React from 'react';
import { Bottle } from '../types';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Droplets } from 'lucide-react';

interface VolumeHistoryChartProps {
  bottles: Bottle[];
}

export default function VolumeHistoryChart({ bottles }: VolumeHistoryChartProps) {
  const chartData = bottles
    .map(bottle => {
      const localDate = new Date(bottle.purchaseDate.split('T')[0] + 'T12:00:00');
      return {
        name: bottle.name,
        date: format(localDate, 'MMM d'),
        sortKey: format(localDate, 'yyyy-MM-dd'),
        volume: bottle.volume
      };
    })
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey));

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-6">
      <div className="flex items-center gap-2 text-gray-400 mb-4">
        <Droplets size={18} />
        <h3 className="text-sm font-bold uppercase tracking-wider">Volume per Bottle (ml)</h3>
      </div>
      <div className="h-48 w-full">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                dx={-10}
              />
              <Tooltip 
                cursor={{ fill: '#f3f4f6' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number, name: string, props: any) => [`${value} ml`, props.payload.name]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Bar 
                dataKey="volume" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-300">
            <Droplets size={32} className="mb-2 opacity-20" />
            <p className="text-[10px] font-bold uppercase tracking-widest">No data to display</p>
          </div>
        )}
      </div>
    </div>
  );
}
