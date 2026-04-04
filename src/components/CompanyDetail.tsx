import type { AnalysisResult } from '../types/api';
import { SignalBadge } from './SignalBadge';
import { AlertCircle } from 'lucide-react';

interface Props {
  analysis: AnalysisResult | null;
  isLoading?: boolean;
}

export function CompanyDetail({ analysis, isLoading }: Props) {
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
        <p className="text-slate-400">Select a company to view details</p>
      </div>
    );
  }

  const mosPercent = analysis.dcf.margin_of_safety ?? 0;
  const mosColor =
    mosPercent > 30 ? 'bg-green-600' : mosPercent > 10 ? 'bg-amber-600' : 'bg-red-600';

  const formatCurrency = (value: number | null): string => {
    if (value === null) return 'N/A';
    return `CLP ${value.toLocaleString()}`;
  };

  const formatPercent = (value: number | null): string => {
    if (value === null) return 'N/A';
    return `${value.toFixed(1)}%`;
  };

  const formatMetric = (value: number | null): string => {
    if (value === null) return 'N/A';
    return value.toFixed(2);
  };

  const scoreComponents = analysis.scoring.components || {};

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-100">{analysis.ticker}</h2>
            <p className="text-sm text-slate-400 mt-1">Period: {analysis.period}</p>
          </div>
          <SignalBadge signal={analysis.scoring.signal} score={analysis.scoring.score} />
        </div>

        {/* Price Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-slate-700 rounded p-3">
            <p className="text-xs text-slate-400 mb-1">Market Price</p>
            <p className="text-lg font-semibold text-slate-200">
              {formatCurrency(analysis.market_price)}
            </p>
          </div>
          <div className="bg-slate-700 rounded p-3">
            <p className="text-xs text-slate-400 mb-1">Intrinsic Value</p>
            <p className="text-lg font-semibold text-slate-200">
              {formatCurrency(analysis.dcf.intrinsic_value)}
            </p>
          </div>
          <div className="bg-slate-700 rounded p-3">
            <p className="text-xs text-slate-400 mb-1">Margin of Safety</p>
            <p className={`text-lg font-semibold ${
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

        {/* Margin of Safety Bar */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-400">Safety Bar</p>
          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full ${mosColor} transition-all`}
              style={{ width: `${Math.min(mosPercent, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-200 mb-4">Key Metrics</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Valuation */}
          <div className="space-y-3 pb-4 border-b md:border-b-0 md:border-r border-slate-700">
            <h4 className="text-sm font-semibold text-slate-300">Valuation</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">P/E Ratio</span>
                <span className="text-slate-200 font-medium">
                  {formatMetric(analysis.metrics.pe_ratio)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">EV/EBITDA</span>
                <span className="text-slate-200 font-medium">
                  {formatMetric(analysis.metrics.ev_ebitda)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">P/B Ratio</span>
                <span className="text-slate-200 font-medium">
                  {formatMetric(analysis.metrics.pb_ratio)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">P/S Ratio</span>
                <span className="text-slate-200 font-medium">
                  {formatMetric(analysis.metrics.ps_ratio)}
                </span>
              </div>
            </div>
          </div>

          {/* Profitability */}
          <div className="space-y-3 pb-4 border-b md:border-b-0 md:border-r border-slate-700">
            <h4 className="text-sm font-semibold text-slate-300">Profitability</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">ROE</span>
                <span className="text-slate-200 font-medium">
                  {formatPercent(analysis.metrics.roe)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">ROA</span>
                <span className="text-slate-200 font-medium">
                  {formatPercent(analysis.metrics.roa)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">ROIC</span>
                <span className="text-slate-200 font-medium">
                  {formatPercent(analysis.metrics.roic)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Net Margin</span>
                <span className="text-slate-200 font-medium">
                  {formatPercent(analysis.metrics.net_margin)}
                </span>
              </div>
            </div>
          </div>

          {/* Leverage & Liquidity */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-300">Leverage</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">D/E Ratio</span>
                <span className="text-slate-200 font-medium">
                  {formatMetric(analysis.metrics.debt_to_equity)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">D/EBITDA</span>
                <span className="text-slate-200 font-medium">
                  {formatMetric(analysis.metrics.debt_to_ebitda)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Interest Coverage</span>
                <span className="text-slate-200 font-medium">
                  {formatMetric(analysis.metrics.interest_coverage)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Ratio</span>
                <span className="text-slate-200 font-medium">
                  {formatMetric(analysis.metrics.current_ratio)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DCF Assumptions */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-200 mb-4">DCF Assumptions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(analysis.dcf.assumptions || {}).map(([key, value]) => (
            <div key={key} className="bg-slate-700 rounded p-3">
              <p className="text-xs text-slate-400 mb-1 capitalize">
                {key.replace(/_/g, ' ')}
              </p>
              <p className="text-sm font-semibold text-slate-200">
                {typeof value === 'number' ? (
                  value > 1 ? value.toFixed(0) : `${(value * 100).toFixed(1)}%`
                ) : (
                  'N/A'
                )}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Scoring Breakdown */}
      {Object.keys(scoreComponents).length > 0 && (
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">Scoring Breakdown</h3>
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
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {analysis.warnings && analysis.warnings.length > 0 && (
        <div className="bg-slate-800 rounded-lg border border-red-900/50 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-400 mb-2">Warnings</h3>
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
