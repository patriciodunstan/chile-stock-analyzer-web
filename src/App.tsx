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
  FinancialsPanel,
} from './components';
import { RefreshCw, BarChart2 } from 'lucide-react';

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
  const [showFinancials, setShowFinancials] = useState(false);

  const {
    data: batchData,
    isLoading: batchLoading,
    error: batchError,
    refetch,
    isFetching,
  } = useBatchAnalysis(activeSector ?? undefined);

  const { data: detailData, isLoading: detailLoading } = useAnalysis(
    selectedTicker ?? ''
  );

  const safeSummary = useMemo(() => {
    if (!batchData) {
      return { total_companies: 0, analyzed: 0, buy_count: 0, hold_count: 0, sell_count: 0 };
    }
    const rankingLength = Array.isArray(batchData.ranking) ? batchData.ranking.length : 0;
    const s = batchData.summary;
    return {
      total_companies: s?.total_companies ?? rankingLength,
      analyzed: s?.analyzed ?? rankingLength,
      buy_count: s?.buy_count ?? 0,
      hold_count: s?.hold_count ?? 0,
      sell_count: s?.sell_count ?? 0,
    };
  }, [batchData]);

  const sectors = useMemo(() => {
    if (!batchData?.ranking) return [];
    return Array.from(new Set(batchData.ranking.map((c) => c.sector))).sort();
  }, [batchData]);

  const handleSelectCompany = (ticker: string) => {
    setSelectedTicker(ticker);
    setShowFinancials(false);
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
      {/* ── Header ── */}
      <header className="bg-slate-950 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8 xl:px-12 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl 2xl:text-3xl font-bold text-slate-100 truncate">
                Chile Stock Analyzer
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5 hidden sm:block">
                IPSA Top 10 — Análisis Fundamental
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              {/* Signal summary — hidden on mobile */}
              {batchData && (
                <div className="hidden lg:flex gap-2 text-xs sm:text-sm">
                  <span className="px-2 py-1 bg-green-900/50 text-green-400 rounded font-semibold">
                    BUY {safeSummary.buy_count}
                  </span>
                  <span className="px-2 py-1 bg-amber-900/50 text-amber-400 rounded font-semibold">
                    HOLD {safeSummary.hold_count}
                  </span>
                  <span className="px-2 py-1 bg-red-900/50 text-red-400 rounded font-semibold">
                    SELL {safeSummary.sell_count}
                  </span>
                </div>
              )}
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFetching ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8 xl:px-12 py-4 sm:py-6 lg:py-8">
        {/* Error */}
        {batchError && (
          <div className="bg-red-900/20 border border-red-900 rounded-lg p-4 mb-6 text-red-300 text-sm">
            Error al cargar datos. Verifica que el backend esté activo.
            <button onClick={() => refetch()} className="ml-2 underline hover:text-red-200">
              Reintentar
            </button>
          </div>
        )}

        {/* Loading */}
        {batchLoading && (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-slate-400 text-sm">Analizando empresas IPSA...</p>
            </div>
          </div>
        )}

        {batchData && (
          <>
            {/* Mobile signal summary */}
            <div className="flex gap-2 mb-4 lg:hidden">
              <span className="px-2.5 py-1 bg-green-900/50 text-green-400 rounded text-xs font-semibold">
                BUY {safeSummary.buy_count}
              </span>
              <span className="px-2.5 py-1 bg-amber-900/50 text-amber-400 rounded text-xs font-semibold">
                HOLD {safeSummary.hold_count}
              </span>
              <span className="px-2.5 py-1 bg-red-900/50 text-red-400 rounded text-xs font-semibold">
                SELL {safeSummary.sell_count}
              </span>
            </div>

            {/* Sector Filter */}
            {sectors.length > 0 && (
              <div className="mb-4 sm:mb-6">
                <SectorFilter
                  sectors={sectors}
                  activeSector={activeSector}
                  onSectorChange={setActiveSector}
                />
              </div>
            )}

            {/* ── Main layout: ranking + summary cards ── */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6">
              {/* Ranking table — full width on mobile/laptop, 3/4 on XL+ */}
              <div className="xl:col-span-3">
                <RankingTable
                  ranking={batchData.ranking}
                  onSelectCompany={handleSelectCompany}
                  selectedTicker={selectedTicker}
                />
              </div>

              {/* Summary cards — horizontal on mobile, vertical on XL+ */}
              <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-1 gap-3 xl:gap-4">
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-3 sm:p-4">
                  <p className="text-xs text-slate-400 mb-1">Analizadas</p>
                  <p className="text-xl sm:text-2xl font-bold text-slate-100">
                    {safeSummary.analyzed}/{safeSummary.total_companies}
                  </p>
                </div>
                <div className="bg-slate-800 rounded-lg border border-green-900/50 p-3 sm:p-4">
                  <p className="text-xs text-slate-400 mb-1">BUY</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-400">
                    {safeSummary.buy_count}
                  </p>
                </div>
                <div className="bg-slate-800 rounded-lg border border-amber-900/50 p-3 sm:p-4">
                  <p className="text-xs text-slate-400 mb-1">HOLD</p>
                  <p className="text-xl sm:text-2xl font-bold text-amber-400">
                    {safeSummary.hold_count}
                  </p>
                </div>
                <div className="bg-slate-800 rounded-lg border border-red-900/50 p-3 sm:p-4">
                  <p className="text-xs text-slate-400 mb-1">SELL</p>
                  <p className="text-xl sm:text-2xl font-bold text-red-400">
                    {safeSummary.sell_count}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Company Detail + Financials ── */}
            {selectedTicker && (
              <div className="mt-6 sm:mt-8">
                <div className="flex items-center justify-between mb-4 gap-3">
                  <h2 className="text-base sm:text-lg font-semibold text-slate-100">
                    Análisis — {selectedTicker}
                  </h2>
                  <button
                    onClick={() => setShowFinancials((v) => !v)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                      showFinancials
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    <BarChart2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Estados Financieros
                  </button>
                </div>

                {/* 2-column on large screens when financials are open */}
                <div className={`grid gap-4 sm:gap-6 ${showFinancials ? 'grid-cols-1 2xl:grid-cols-2' : 'grid-cols-1'}`}>
                  <CompanyDetail analysis={detailData ?? null} isLoading={detailLoading} />
                  {showFinancials && (
                    <div>
                      <FinancialsPanel ticker={selectedTicker} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Charts (radar + metrics history) ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8">
              {radarCompanies.length > 0 && <RadarChart companies={radarCompanies} />}
              <MetricsHistory ranking={batchData.ranking} />
            </div>

            {/* ── Side-by-side comparison ── */}
            {comparisonCompanies.length >= 2 && (
              <div className="mt-6 sm:mt-8">
                <h2 className="text-base sm:text-lg font-semibold text-slate-100 mb-4">
                  Comparativa ({comparisonCompanies.length}/3)
                </h2>
                <ComparisonView companies={comparisonCompanies} />
              </div>
            )}

            {/* ── API Errors ── */}
            {Object.keys(batchData.errors || {}).length > 0 && (
              <div className="mt-6 p-4 bg-amber-900/20 border border-amber-800 rounded-lg">
                <h4 className="text-sm font-semibold text-amber-400 mb-2">Errores de análisis:</h4>
                {Object.entries(batchData.errors).map(([ticker, error]) => (
                  <p key={ticker} className="text-sm text-slate-300">
                    <span className="font-medium text-amber-300">{ticker}:</span> {error}
                  </p>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 text-center text-xs text-slate-500">
              Último análisis:{' '}
              {batchData.analyzed_at
                ? new Date(batchData.analyzed_at).toLocaleString('es-CL')
                : '—'}
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
