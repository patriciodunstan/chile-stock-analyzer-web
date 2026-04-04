/**
 * API Type Definitions
 * All TypeScript interfaces matching the backend stock analysis API responses
 */

export interface CompanyInfo {
  ticker: string;
  name: string;
  sector: string;
  eeff_currency: "CLP" | "USD";
  yahoo_ticker: string;
  shares_outstanding: number;
}

export interface CompaniesResponse {
  companies: CompanyInfo[];
  total: number;
}

export interface MetricsData {
  pe_ratio: number | null;
  pb_ratio: number | null;
  ps_ratio: number | null;
  ev_ebitda: number | null;
  ev_ebit: number | null;
  roe: number | null;
  roa: number | null;
  roic: number | null;
  net_margin: number | null;
  ebitda_margin: number | null;
  gross_margin: number | null;
  debt_to_equity: number | null;
  debt_to_ebitda: number | null;
  interest_coverage: number | null;
  current_ratio: number | null;
  dividend_yield: number | null;
  payout_ratio: number | null;
  revenue_cagr: number | null;
}

export interface ScoringData {
  score: number;
  signal: "BUY" | "HOLD" | "SELL" | "N/A";
  components: Record<string, number>;
  reasons: string[];
}

export interface DCFData {
  intrinsic_value: number;
  margin_of_safety: number;
  assumptions: Record<string, number>;
}

export interface AnalysisResult {
  ticker: string;
  period: string;
  market_price: number | null;
  metrics: MetricsData;
  scoring: ScoringData;
  dcf: DCFData;
  warnings: string[];
  analyzed_at: string;
}

export interface RankedCompany {
  rank: number;
  ticker: string;
  name: string;
  sector: string;
  signal: string;
  score: number;
  market_price: number | null;
  intrinsic_value: number | null;
  margin_of_safety: number | null;
  pe_ratio: number | null;
  ev_ebitda: number | null;
  roe: number | null;
  debt_to_equity: number | null;
}

export interface BatchSummary {
  total_companies: number;
  analyzed: number;
  buy_count: number;
  hold_count: number;
  sell_count: number;
}

export interface BatchAnalysisResponse {
  ranking: RankedCompany[];
  summary: BatchSummary;
  errors: Record<string, string>;
  analyzed_at: string;
}
