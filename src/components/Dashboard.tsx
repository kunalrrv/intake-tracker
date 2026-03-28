import React from 'react';
import { Bottle, BottleStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DollarSign, Package, CheckCircle, TrendingUp } from 'lucide-react';

interface DashboardProps {
  bottles: Bottle[];
}

export default function Dashboard({ bottles }: DashboardProps) {
  const totalSpent = bottles.reduce((sum, b) => sum + b.price, 0);
  const totalBottles = bottles.length;
  const finishedBottles = bottles.filter((b) => b.status === BottleStatus.FINISHED).length;
  const activeBottles = totalBottles - finishedBottles;

  // Prepare data for chart: Spending by type
  const spendingByType = bottles.reduce((acc: any, b) => {
    acc[b.type] = (acc[b.type] || 0) + b.price;
    return acc;
  }, {});

  const chartData = Object.keys(spendingByType).map((type) => ({
    name: type,
    value: spendingByType[type],
  }));

  const COLORS = ['#8B0000', '#D4AF37', '#5A5A40', '#151619', '#F27D26', '#00FF00', '#FF4444', '#000000'];

  return (
    <div className="space-y-6 mb-8">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 text-red-800 mb-1">
            <DollarSign size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Total Spent</span>
          </div>
          <div className="text-2xl font-black text-gray-900">${totalSpent.toFixed(2)}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 text-amber-600 mb-1">
            <Package size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Inventory</span>
          </div>
          <div className="text-2xl font-black text-gray-900">{activeBottles}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <CheckCircle size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Finished</span>
          </div>
          <div className="text-2xl font-black text-gray-900">{finishedBottles}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <TrendingUp size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Total Count</span>
          </div>
          <div className="text-2xl font-black text-gray-900">{totalBottles}</div>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">Spending by Type</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
