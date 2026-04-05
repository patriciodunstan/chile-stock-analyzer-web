import type { AnalysisResult } from '../types/api';
import { SignalBadge } from './SignalBadge';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import { usePriceHistory } from '../api/client';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface Props {
  analysis: AnalysisResult | null;
  isLoading?: boolean;
}

export function CompanyDetail({ analysis, isLoading }: Props) {
  const { data: priceHistory, isLoading: historyLoading } = usePriceHistory(
    analysis?.ticker ?? ''
  );

  if (isLoading) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 animate-pulse">
        <div className="h-8 bg-slate-700 rounded mb-4 w-1/3"></div>
        <div className="space-y-4">
          <div className="h-4 bg-slate-700 rounded w-2/3"></div>
          <div className="h-4 bg-slate-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 text-center">
        <p className="text-slate-400">Selecciona una empresa para ver el detalle</p>
      </div>
    );
  }

  const mosPercent = analysis.dcf?.margin_of_safety ?? 0;
  const mosColor =
    mosPercent > 30 ? 'bg-green-600' : mosPercent > 10 ? 'bg-amber-600' : 'bg-red-600';
  const signalOverride = analysis.scoring?.signal_override === true;

  const formatCurrency = (value: number | null): string => {
    if (value === null) return '—';
    return `CLP ${value.toLocaleString('es-CL')}`;
  };

  const formatPercent = (value: number | null): string => {
    if (value === null) return '—';
    return `${value.toFixed(1)}%`;
  };

  const formatMetric = (value: number | null): string => {
    if (value === null) return '—';
    return value.toFixed(2);
  };

  const scoreComponents = analysis.scoring?.components ?? {};

  // Prepare chart data: last 60 points max for readability
  const chartData = (priceHistory?.history ?? [])
    .slice(-60)
    .map((p) => ({
      date: p.date.slice(5), // MM-DD
      price: p.close,
    }));

  const priceMin = chartData.length
    ? Math.floor(Math.min(...chartData.map((d) => d.price)) * 0.97)
    : undefined;
  const priceMax = chartData.length
    ? Math.ceil(Math.max(...chartData.map((d) => d.price)) * 1.03)
    : undefined;

  return (
    <div className="space-y-4">
      {/* Signal Override Alert — prominente */}
      {signalOverride && (
        <div className="bg-red-950 border border-red-600 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-400 text-sm">⚠️ Señal anulada por alerta crítica</p>
            <p className="text-xs text-red-300 mt-0.5">
              El modelo detectó condiciones que invalidan la señal calculada. Revisar warnings antes de operar.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 sm:p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100">{analysis.ticker}</h2>
            <p className="text-sm text-slate-400 mt-1">Período: {analysis.period}</p>
          </div>
          <SignalBadge signal={analysis.scoring.signal} score={analysis.scoring.score} />
        </div>

        {/* Price cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="bg-slate-700 rounded p-3">
            <p className="text-xs text-slate-400 mb-1">Precio de Mercado</p>
            <p className="text-base sm:text-lg font-semibold text-slate-200">
              {formatCurrency(analysis.market_price)}
            </p>
          </div>
          <div className="bg-slate-700 rounded p-3">
            <p className="text-xs text-slate-400 mb-1">Valor Intrínseco</p>
            <p className="text-base sm:text-lg font-semibold text-slate-200">
              {formatCurrency(analysis.dcf?.intrinsic_value ?? null)}
            </p>
          </div>
          <div className="bg-slate-700 rounded p-3">
            <p className="text-xs text-slate-400 mb-1">Margen de Seguridad</p>
            <p className={`text-base sm:text-lg font-semibold ${
              mosPercent > 30
                ? 'text-green-400'
                : mosPercent > 10
                ? 'text-amber-400'
                : 'text-red-400'
            }`}>
              {formatPercent(mosPercent)}
            </p>
          </div>
        </div>

        {/* MoS bar */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-400">Margen de seguridad</p>
          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full ${mosColor} transition-all`}
              style={{ width: `${Math.min(Math.max(mosPercent, 0), 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Price History Chart */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-slate-200 mb-4">
          Precio histórico — últimos 60 días
        </h3>
        {historyLoading && (
          <div className="h-48 flex items-center justify-center">
            <p className="text-slate-500 text-sm">Cargando historial...</p>
          </div>
        )}
        {!historyLoading && chartData.length === 0 && (
          <div className="h-48 flex items-center justify-center">
            <p className="text-slate-500 text-sm">Sin datos de precio disponibles</p>
          </div>
        )}
        {!historyLoading && chartData.length > 0 && (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={priceMin !== undefined && priceMax !== undefined ? [priceMin, priceMax] : ['auto', 'auto']}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) =>
                  v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                }
                width={48}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '6px',
                  fontSize: 12,
                }}
                labelStyle={{ color: '#94a3b8' }}
                itemStyle={{ color: '#60a5fa' }}
                formatter={(value) => [
                  `CLP ${Number(value).toLocaleString('es-CL')}`,
                  'Precio',
                ]}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#60a5fa"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#60a5fa' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-slate-200 mb-4">Métricas clave</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Valuation */}
          <div className="space-y-3 pb-4 border-b md:border-b-0 md:border-r border-slate-700 md:pr-4">
            <h4 className="text-sm font-semibold text-slate-300">Valoración</h4>
            <div className="space-y-2 text-sm">
              {[
                ['P/E', formatMetric(analysis.metrics.pe_ratio)],
                ['EV/EBITDA', formatMetric(analysis.metrics.ev_ebitda)],
                ['P/B', formatMetric(analysis.metrics.pb_ratio)],
                ['P/S', formatMetric(analysis.metrics.ps_ratio)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-slate-400">{label}</span>
                  <span className="text-slate-200 font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Profitability */}
          <div className="space-y-3 pb-4 border-b md:border-b-0 md:border-r border-slate-700 md:pr-4">
            <h4 className="text-sm font-semibold text-slate-300">Rentabilidad</h4>
            <div className="space-y-2 text-sm">
              {[
                ['ROE', formatPercent(analysis.metrics.roe)],
                ['ROA', formatPercent(analysis.metrics.roa)],
                ['ROIC', formatPercent(analysis.metrics.roic)],
                ['Margen neto', formatPercent(analysis.metrics.net_margin)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-slate-400">{label}</span>
                  <span className="text-slate-200 font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Leverage */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-300">Apalancamiento</h4>
            <div className="space-y-2 text-sm">
              {[
                ['D/E', formatMetric(analysis.metrics.debt_to_equity)],
                ['D/EBITDA', formatMetric(analysis.metrics.debt_to_ebitda)],
                ['Cobertura int.', formatMetric(analysis.metrics.interest_coverage)],
                ['Razón corriente', formatMetric(analysis.metrics.current_ratio)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-slate-400">{label}</span>
                  <span className="text-slate-200 font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* DCF Assumptions */}
      {analysis.dcf?.assumptions && Object.keys(analysis.dcf.assumptions).length > 0 && (
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-slate-200 mb-4">Supuestos DCF</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(analysis.dcf.assumptions).map(([key, value]) => (
              <div key={key} className="bg-slate-700 rounded p-3">
                <p className="text-xs text-slate-400 mb-1 capitalize">
                  {key.replace(/_/g, ' ')}
                </p>
                <p className="text-sm font-semibold text-slate-200">
                  {typeof value === 'number'
                    ? value > 1
                      ? value.toFixed(0)
                      : `${(value * 100).toFixed(1)}%`
                    : '—'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scoring Breakdown */}
      {Object.keys(scoreComponents).length > 0 && (
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-slate-200 mb-4">
            Desglose de scoring
          </h3>
          <div className="space-y-3">
            {Object.entries(scoreComponents).map(([component, value]) => (
              <div key={component}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-slate-300 capitalize">
                    {component.replace(/_/g, ' ')}
                  </span>
                  <span className="text-sm font-semibold text-slate-200">{value}/100</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${Math.min(value, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reasons */}
      {analysis.scoring?.reasons && analysis.scoring.reasons.length > 0 && (
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-slate-200 mb-3">
            Fundamentos del análisis
          </h3>
          <ul className="space-y-2">
            {analysis.scoring.reasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-blue-400 mt-0.5 flex-shrink-0">•</span>
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {analysis.warnings && analysis.warnings.length > 0 && (
        <div className="bg-slate-800 rounded-lg border border-red-900/50 p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-400 mb-2">Advertencias</h3>
              <ul className="space-y-1">
                {analysis.warnings.map((warning, idx) => (
                  <li key={idx} className="text-sm text-slate-300">
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
