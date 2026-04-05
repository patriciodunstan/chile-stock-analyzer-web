/**
 * API Client Layer
 * Axios client with TanStack Query hooks for stock analysis API
 */

import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import type {
  CompaniesResponse,
  BatchAnalysisResponse,
  AnalysisResult,
} from "../types/api";

/**
 * Axios instance configured for API calls
 * Base URL is configurable via VITE_API_URL environment variable
 * Defaults to /api/v1 for development
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  timeout: 30000,
});

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
