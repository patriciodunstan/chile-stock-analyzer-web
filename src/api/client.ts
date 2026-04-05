/**
 * API Client Layer
 * Axios client with TanStack Query hooks for stock analysis API
 */

import axios from "axios";

import { useQuery } from "@tanstack/react-query";

declare module "axios" {
  interface InternalAxiosRequestConfig {
    metadata?: { startTime: number };
  }
}
import type {
  CompaniesResponse,
  BatchAnalysisResponse,
  AnalysisResult,
  PriceHistoryResponse,
  FinancialMetricsResponse,
  FinancialStatementsResponse,
} from "../types/api";

const resolveApiBaseUrl = (): string => {
  const raw = import.meta.env.VITE_API_URL?.trim();

  if (!raw) {
    return "/api/v1";
  }

  const base = raw.replace(/\/+$/, "");

  if (base.endsWith("/api/v1")) {
    return base;
  }

  if (base.endsWith("/api")) {
    return `${base}/v1`;
  }

  if (base.startsWith("http://") || base.startsWith("https://")) {
    return `${base}/api/v1`;
  }

  return `${base}/api/v1`;
};

/**
 * Axios instance configured for API calls
 * Base URL is configurable via VITE_API_URL environment variable
 * Defaults to /api/v1 for development
 */
const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  config.metadata = { startTime: Date.now() };
  console.info(`[API] → ${config.method?.toUpperCase()} ${config.url}`, config.params ?? '');
  return config;
});

api.interceptors.response.use(
  (response) => {
    const duration = Date.now() - (response.config.metadata?.startTime ?? Date.now());
    console.info(
      `[API] ✓ ${response.config.method?.toUpperCase()} ${response.config.url} — ${response.status} (${duration}ms)`
    );
    return response;
  },
  (error: import('axios').AxiosError) => {
    const duration = Date.now() - (error.config?.metadata?.startTime ?? Date.now());
    const status = error.response?.status ?? 'network error';
    const url = error.config?.url ?? 'unknown';
    const method = error.config?.method?.toUpperCase() ?? 'UNKNOWN';
    console.error(
      `[API] ✗ ${method} ${url} — ${status} (${duration}ms)`,
      error.response?.data ?? error.message
    );
    return Promise.reject(error);
  }
);

/**
 * API Functions
 */

/**
 * Fetch all companies available for analysis
 */
export const fetchCompanies = async (): Promise<CompaniesResponse> => {
  const { data } = await api.get<CompaniesResponse>("/analysis/companies");
  return data;
};

/**
 * Fetch batch analysis with optional sector filter
 * Returns ranked companies with summary statistics
 */
export const fetchBatchAnalysis = async (
  sector?: string
): Promise<BatchAnalysisResponse> => {
  const params = sector ? { sector } : {};
  const { data } = await api.get<BatchAnalysisResponse>("/analysis/batch", {
    params,
  });
  return data;
};

/**
 * Fetch detailed analysis for a specific company
 */
export const fetchAnalysis = async (ticker: string): Promise<AnalysisResult> => {
  const { data } = await api.get<AnalysisResult>(`/analysis/${ticker}`);
  return data;
};

/**
 * TanStack Query Hooks
 * These hooks provide caching, auto-refetch, and loading states
 */

/**
 * Hook to fetch companies list
 * Stale time: 5 minutes
 */
export const useCompanies = () =>
  useQuery({
    queryKey: ["companies"],
    queryFn: fetchCompanies,
    staleTime: 5 * 60 * 1000,
  });

/**
 * Hook to fetch batch analysis with optional sector filter
 * Stale time: 2 minutes
 */
export const useBatchAnalysis = (sector?: string) =>
  useQuery({
    queryKey: ["batch-analysis", sector],
    queryFn: () => fetchBatchAnalysis(sector),
    staleTime: 2 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });

/**
 * Hook to fetch detailed analysis for a company
 * Only enabled when ticker is provided
 * Stale time: 2 minutes
 */
export const useAnalysis = (ticker: string) =>
  useQuery({
    queryKey: ["analysis", ticker],
    queryFn: () => fetchAnalysis(ticker),
    enabled: !!ticker,
    staleTime: 2 * 60 * 1000,
  });

/**
 * Fetch price history for a ticker
 */
export const fetchPriceHistory = async (
  ticker: string,
  limit = 90
): Promise<PriceHistoryResponse> => {
  const { data } = await api.get<PriceHistoryResponse>(
    `/stocks/${ticker}/history`,
    { params: { limit } }
  );
  return data;
};

/**
 * Hook to fetch price history — enabled only when ticker is provided
 * Stale time: 5 minutes
 */
export const usePriceHistory = (ticker: string, limit = 90) =>
  useQuery({
    queryKey: ["price-history", ticker, limit],
    queryFn: () => fetchPriceHistory(ticker, limit),
    enabled: !!ticker,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

/**
 * Fetch financial metrics for a ticker
 */
export const fetchFinancialMetrics = async (
  ticker: string
): Promise<FinancialMetricsResponse> => {
  const { data } = await api.get<FinancialMetricsResponse>(
    `/financials/${ticker}/metrics`
  );
  return data;
};

/**
 * Hook to fetch financial metrics — enabled only when ticker is provided
 * Stale time: 10 minutes (metrics don't change often)
 */
export const useFinancialMetrics = (ticker: string) =>
  useQuery({
    queryKey: ["financial-metrics", ticker],
    queryFn: () => fetchFinancialMetrics(ticker),
    enabled: !!ticker,
    staleTime: 10 * 60 * 1000,
    retry: false,
  });

/**
 * Fetch financial statements history for a ticker
 */
export const fetchFinancialStatements = async (
  ticker: string,
  limit = 8
): Promise<FinancialStatementsResponse> => {
  const { data } = await api.get<FinancialStatementsResponse>(
    `/financials/${ticker}/statements`,
    { params: { limit } }
  );
  return data;
};

/**
 * Hook to fetch financial statements — enabled only when ticker is provided
 * Stale time: 10 minutes
 */
export const useFinancialStatements = (ticker: string, limit = 8) =>
  useQuery({
    queryKey: ["financial-statements", ticker, limit],
    queryFn: () => fetchFinancialStatements(ticker, limit),
    enabled: !!ticker,
    staleTime: 10 * 60 * 1000,
    retry: false,
  });
