import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';
import type { RankedCompany } from '../types/api';

interface Props {
  ranking: RankedCompany[];
}

type MetricKey = 'score' | 'pe_ratio' | 'ev_ebitda' | 'roe' | 'margin_of_safety' | 'debt_to_equity';

interface MetricOption {
  key: MetricKey;
  label: string;
  type: 'higher' | 'lower';
}

export function MetricsHistory({ ranking }: Props) {
  const metricOptions: MetricOption[] = [
    { key: 'score', label: 'Investment Score', type: 'higher' },
    { key: 'pe_ratio', label: 'P/E Ratio', type: 'lower' },
    { key: 'ev_ebitda', label: 'EV/EBITDA', type: 'lower' },
    { key: 'roe', label: 'ROE (%)', type: 'higher' },
    { key: 'margin_of_safety', label: 'Margin of Safety (%)', type: 'higher' },
    { key: 'debt_to_equity', label: 'Debt/Equity', type: 'lower' },
  ];

  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('score');

  const currentMetric = metricOptions.find((m) => m.key === selectedMetric)!;

  const getSignalColor = (signal: string): string => {
    switch (signal) {
      case 'BUY':
        return '#16a34a';
      case 'HOLD':
        return '#d97706';
      case 'SELL':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  // Prepare chart data
  const chartData = ranking
    .map((company) => ({
      ticker: company.ticker,
      value: company[selectedMetric] ?? 0,
      signal: company.signal,
    }))
    .sort((a, b) => {
      if (currentMetric.type === 'higher') {
        return b.value - a.value;
      }
      return a.value - b.value;
    });

  const formatValue = (value: number): string => {
    if (selectedMetric === 'roe' || selectedMetric === 'margin_of_safety') {
      return `${value.toFixed(1)}%`;
    }
    return value.toFixed(1);
  };

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
      <div className="flex flex-col gap-4 mb-6">
        <h3 className="text-lg font-semibold text-slate-200">Metrics Comparison</h3>
        <div className="flex flex-wrap gap-2">
          {metricOptions.map((option) => (
            <button
              key={option.key}
              onClick={() => setSelectedMetric(option.key)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                selectedMetric === option.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-80 text-slate-400">
          No data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis type="number" stroke="#64748b" />
            <YAxis
              dataKey="ticker"
              type="category"
              width={75}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            <Tooltip
              wrapperStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '6px',
                color: '#e2e8f0',
              }}
              formatter={(value) => [formatValue(value as number), 'Value']}
              cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
            />
            <Bar dataKey="value" fill="#3b82f6" radius={[0, 8, 8, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getSignalColor(entry.signal)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Legend */}
      <div className="flex gap-4 mt-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#16a34a' }}></div>
          <span className="text-slate-300">BUY</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#d97706' }}></div>
          <span className="text-slate-300">HOLD</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#dc2626' }}></div>
          <span className="text-slate-300">SELL</span>
        </div>
      </div>
    </div>
  );
}
