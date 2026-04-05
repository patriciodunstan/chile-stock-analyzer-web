import { useState, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBatchAnalysis, useAnalysis } from './api/client';
import {
  RankingTable,
  CompanyDetail,
  SectorFilter,
  ComparisonView,
  RadarChart,
  MetricsHistory,
} from './components';
import { RefreshCw } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      retryDelay: 5000,
    },
  },
});

function Dashboard() {
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [activeSector, setActiveSector] = useState<string | null>(null);
  const [comparisonTickers, setComparisonTickers] = useState<string[]>([]);

  const { data: batchData, isLoading: batchLoading, error: batchError, refetch, isFetching } =
    useBatchAnalysis(activeSector ?? undefined);

  const { data: detailData, isLoading: detailLoading } = useAnalysis(selectedTicker ?? '');

  const safeSummary = useMemo(() => {
    if (!batchData) {
      return {
        total_companies: 0,
        analyzed: 0,
        buy_count: 0,
        hold_count: 0,
        sell_count: 0,
      };
    }

    const rankingLength = Array.isArray(batchData.ranking) ? batchData.ranking.length : 0;
    const summary = batchData.summary;

    return {
      total_companies: summary?.total_companies ?? rankingLength,
      analyzed: summary?.analyzed ?? rankingLength,
      buy_count: summary?.buy_count ?? 0,
      hold_count: summary?.hold_count ?? 0,
      sell_count: summary?.sell_count ?? 0,
    };
  }, [batchData]);

  const sectors = useMemo(() => {
    if (!batchData?.ranking) return [];
    const sectorSet = new Set(batchData.ranking.map((c) => c.sector));
    return Array.from(sectorSet).sort();
  }, [batchData]);

  const handleSelectCompany = (ticker: string) => {
    setSelectedTicker(ticker);
    setComparisonTickers((prev) => {
      if (prev.includes(ticker)) return prev.filter((t) => t !== ticker);
      if (prev.length >= 3) return [prev[1], prev[2], ticker];
      return [...prev, ticker];
    });
  };

  const comparisonCompanies = useMemo(() => {
    if (!batchData?.ranking) return [];
    return batchData.ranking.filter((c) => comparisonTickers.includes(c.ticker));
  }, [batchData, comparisonTickers]);

  const radarCompanies = useMemo(() => {
    if (!batchData?.ranking) return [];
    return batchData.ranking
      .filter((c) => comparisonTickers.includes(c.ticker))
      .map((c) => ({
        ticker: c.ticker,
        metrics: {
          pe_ratio: c.pe_ratio,
          roe: c.roe,
          ebitda_margin: null,
          current_ratio: null,
          debt_to_equity: c.debt_to_equity,
          score: c.score,
        },
      }));
  }, [batchData?.ranking, comparisonTickers]);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-950 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
                Chile Stock Analyzer
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                IPSA Top 10 — Fundamental Analysis Dashboard
              </p>
            </div>
            <div className="flex items-center gap-4">
              {batchData && (
                <div className="hidden md:flex gap-3 text-sm">
                  <span className="px-2.5 py-1 bg-green-900/50 text-green-400 rounded font-semibold">
                    BUY {safeSummary.buy_count}
                  </span>
                  <span className="px-2.5 py-1 bg-amber-900/50 text-amber-400 rounded font-semibold">
                    HOLD {safeSummary.hold_count}
                  </span>
                  <span className="px-2.5 py-1 bg-red-900/50 text-red-400 rounded font-semibold">
                    SELL {safeSummary.sell_count}
                  </span>
                </div>
              )}
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Error */}
        {batchError && (
          <div className="bg-red-900/20 border border-red-900 rounded-lg p-4 mb-6 text-red-300">
            Error loading analysis data. Verify backend is running on port 8000.
            <button onClick={() => refetch()} className="ml-2 underline hover:text-red-200">
              Retry
            </button>
          </div>
        )}

        {/* Loading */}
        {batchLoading && (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-slate-400">Analyzing IPSA companies...</p>
            </div>
          </div>
        )}

        {batchData && (
          <>
            {/* Sector Filter */}
            {sectors.length > 0 && (
              <div className="mb-6">
                <SectorFilter
                  sectors={sectors}
                  activeSector={activeSector}
                  onSectorChange={setActiveSector}
                />
              </div>
            )}

            {/* Main Layout: Ranking + Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RankingTable
                  ranking={batchData.ranking}
                  onSelectCompany={handleSelectCompany}
                  selectedTicker={selectedTicker}
                />
              </div>
              <div className="space-y-4">
                {/* Summary cards */}
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                  <p className="text-xs text-slate-400 mb-1">Analyzed</p>
                  <p className="text-2xl font-bold text-slate-100">
                    {safeSummary.analyzed}/{safeSummary.total_companies}
                  </p>
                </div>
                <div className="bg-slate-800 rounded-lg border border-green-900/50 p-4">
                  <p className="text-xs text-slate-400 mb-1">BUY Signals</p>
                  <p className="text-2xl font-bold text-green-400">{safeSummary.buy_count}</p>
                </div>
                <div className="bg-slate-800 rounded-lg border border-amber-900/50 p-4">
                  <p className="text-xs text-slate-400 mb-1">HOLD Signals</p>
                  <p className="text-2xl font-bold text-amber-400">{safeSummary.hold_count}</p>
                </div>
                <div className="bg-slate-800 rounded-lg border border-red-900/50 p-4">
                  <p className="text-xs text-slate-400 mb-1">SELL Signals</p>
                  <p className="text-2xl font-bold text-red-400">{safeSummary.sell_count}</p>
                </div>
              </div>
            </div>

            {/* Company Detail */}
            {selectedTicker && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-slate-100 mb-4">
                  Company Analysis — {selectedTicker}
                </h2>
                <CompanyDetail analysis={detailData ?? null} isLoading={detailLoading} />
              </div>
            )}

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              {radarCompanies.length > 0 && <RadarChart companies={radarCompanies} />}
              <MetricsHistory ranking={batchData.ranking} />
            </div>

            {/* Comparison */}
            {comparisonCompanies.length >= 2 && (
              <div className="mt-8">
                <h2 className="text-lg font-semibold text-slate-100 mb-4">
                  Side-by-Side ({comparisonCompanies.length}/3)
                </h2>
                <ComparisonView companies={comparisonCompanies} />
              </div>
            )}

            {/* Errors */}
            {Object.keys(batchData.errors || {}).length > 0 && (
              <div className="mt-6 p-4 bg-amber-900/20 border border-amber-800 rounded-lg">
                <h4 className="text-sm font-semibold text-amber-400 mb-2">Analysis Errors:</h4>
                {Object.entries(batchData.errors).map(([ticker, error]) => (
                  <p key={ticker} className="text-sm text-slate-300">
                    <span className="font-medium text-amber-300">{ticker}:</span> {error}
                  </p>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 text-center text-xs text-slate-500">
              Last analyzed:{' '}
              {batchData.analyzed_at
                ? new Date(batchData.analyzed_at).toLocaleString('es-CL')
                : 'N/A'}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
}
