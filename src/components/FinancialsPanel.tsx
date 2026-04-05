import { useState } from 'react';
import { useFinancialMetrics, useFinancialStatements } from '../api/client';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

interface Props {
  ticker: string;
}

type Tab = 'metrics' | 'statements' | 'charts';

const METRIC_LABELS: Record<string, string> = {
  pe_ratio: 'P/E',
  pb_ratio: 'P/B',
  ps_ratio: 'P/S',
  ev_ebitda: 'EV/EBITDA',
  ev_ebit: 'EV/EBIT',
  roe: 'ROE',
  roa: 'ROA',
  roic: 'ROIC',
  net_margin: 'Margen neto',
  ebitda_margin: 'Margen EBITDA',
  gross_margin: 'Margen bruto',
  debt_to_equity: 'D/E',
  debt_to_ebitda: 'D/EBITDA',
  interest_coverage: 'Cobertura int.',
  current_ratio: 'Razón corriente',
  dividend_yield: 'Dividend yield',
  payout_ratio: 'Payout ratio',
  revenue_cagr: 'CAGR ingresos',
};

const PERCENT_METRICS = new Set([
  'roe', 'roa', 'roic', 'net_margin', 'ebitda_margin',
  'gross_margin', 'dividend_yield', 'payout_ratio', 'revenue_cagr',
]);

function formatMetricValue(key: string, value: number | null): string {
  if (value === null) return '—';
  if (PERCENT_METRICS.has(key)) return `${(value * 100 > 1 ? value : value * 100).toFixed(1)}%`;
  return value.toFixed(2);
}

function formatMillions(value: number | null): string {
  if (value === null) return '—';
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return value.toFixed(0);
}

export function FinancialsPanel({ ticker }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('statements');

  const { data: metricsData, isLoading: metricsLoading, error: metricsError } =
    useFinancialMetrics(ticker);

  const { data: statementsData, isLoading: statementsLoading, error: statementsError } =
    useFinancialStatements(ticker, 8);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'statements', label: 'Estados Financieros' },
    { id: 'metrics', label: 'Métricas' },
    { id: 'charts', label: 'Gráficos' },
  ];

  // Chart data from statements (cronológico)
  const chartData = [...(statementsData?.statements ?? [])]
    .reverse()
    .map((s) => ({
      period: s.period,
      Ingresos: s.revenue,
      EBITDA: s.ebitda,
      'Utilidad neta': s.net_income,
    }));

  const debtCashData = [...(statementsData?.statements ?? [])]
    .reverse()
    .map((s) => ({
      period: s.period,
      Deuda: s.total_debt,
      Caja: s.cash,
    }));

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-slate-700 bg-slate-900">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-800'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4 sm:p-6">
        {/* ── STATES FINANCIEROS ── */}
        {activeTab === 'statements' && (
          <>
            {statementsLoading && (
              <div className="flex items-center justify-center h-40">
                <p className="text-slate-500 text-sm">Cargando estados financieros...</p>
              </div>
            )}
            {statementsError && (
              <div className="text-sm text-red-400 p-4 bg-red-950/40 rounded">
                No se pudieron cargar los estados financieros.
              </div>
            )}
            {!statementsLoading && !statementsError && statementsData && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left py-2 pr-4 text-slate-400 font-medium">Período</th>
                      <th className="text-right py-2 px-3 text-slate-400 font-medium">Ingresos</th>
                      <th className="text-right py-2 px-3 text-slate-400 font-medium">EBITDA</th>
                      <th className="text-right py-2 px-3 text-slate-400 font-medium">Utilidad neta</th>
                      <th className="text-right py-2 px-3 text-slate-400 font-medium">Deuda total</th>
                      <th className="text-right py-2 pl-3 text-slate-400 font-medium">Caja</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {statementsData.statements.map((s) => (
                      <tr key={s.period} className="hover:bg-slate-700/30 transition-colors">
                        <td className="py-2.5 pr-4 font-medium text-slate-300">{s.period}</td>
                        <td className="py-2.5 px-3 text-right text-slate-300">
                          {formatMillions(s.revenue)}
                        </td>
                        <td className={`py-2.5 px-3 text-right font-medium ${
                          s.ebitda !== null && s.ebitda >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {formatMillions(s.ebitda)}
                        </td>
                        <td className={`py-2.5 px-3 text-right font-medium ${
                          s.net_income !== null && s.net_income >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {formatMillions(s.net_income)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-300">
                          {formatMillions(s.total_debt)}
                        </td>
                        <td className="py-2.5 pl-3 text-right text-slate-300">
                          {formatMillions(s.cash)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {statementsData.statements.length === 0 && (
                  <p className="text-center text-slate-500 py-8 text-sm">
                    No hay estados financieros disponibles para {ticker}
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {/* ── MÉTRICAS ── */}
        {activeTab === 'metrics' && (
          <>
            {metricsLoading && (
              <div className="flex items-center justify-center h-40">
                <p className="text-slate-500 text-sm">Cargando métricas...</p>
              </div>
            )}
            {metricsError && (
              <div className="text-sm text-red-400 p-4 bg-red-950/40 rounded">
                No se pudieron cargar las métricas.
              </div>
            )}
            {!metricsLoading && !metricsError && metricsData && (
              <>
                <p className="text-xs text-slate-500 mb-4">Período: {metricsData.period}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {Object.entries(metricsData.metrics).map(([key, value]) => (
                    <div key={key} className="bg-slate-700 rounded-lg p-3">
                      <p className="text-xs text-slate-400 mb-1">
                        {METRIC_LABELS[key] ?? key.replace(/_/g, ' ')}
                      </p>
                      <p className="text-sm font-semibold text-slate-200">
                        {formatMetricValue(key, value as number | null)}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* ── GRÁFICOS ── */}
        {activeTab === 'charts' && (
          <>
            {(statementsLoading) && (
              <div className="flex items-center justify-center h-40">
                <p className="text-slate-500 text-sm">Cargando datos...</p>
              </div>
            )}
            {!statementsLoading && chartData.length === 0 && (
              <p className="text-center text-slate-500 py-8 text-sm">
                Sin datos para graficar
              </p>
            )}
            {!statementsLoading && chartData.length > 0 && (
              <div className="space-y-8">
                {/* P&L chart */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-300 mb-3">
                    Ingresos, EBITDA y Utilidad neta
                  </h4>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis
                        dataKey="period"
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => formatMillions(v)}
                        width={52}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #475569',
                          borderRadius: '6px',
                          fontSize: 12,
                        }}
                        labelStyle={{ color: '#94a3b8' }}
                        formatter={(value) => [formatMillions(Number(value))]}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: 12, color: '#94a3b8' }}
                      />
                      <Bar dataKey="Ingresos" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="EBITDA" fill="#10b981" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="Utilidad neta" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Deuda vs Caja */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-300 mb-3">
                    Deuda total vs Caja
                  </h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={debtCashData} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis
                        dataKey="period"
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => formatMillions(v)}
                        width={52}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #475569',
                          borderRadius: '6px',
                          fontSize: 12,
                        }}
                        labelStyle={{ color: '#94a3b8' }}
                        formatter={(value) => [formatMillions(Number(value))]}
                      />
                      <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                      <Bar dataKey="Deuda" fill="#ef4444" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="Caja" fill="#22c55e" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
