import { useState } from 'react';
import { SignalBadge } from './SignalBadge';
import { ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import type { RankedCompany } from '../types/api';

interface Props {
  ranking: RankedCompany[];
  onSelectCompany: (ticker: string) => void;
  selectedTicker: string | null;
}

type SortColumn = 'score' | 'pe_ratio' | 'ev_ebitda' | 'roe' | 'margin_of_safety' | 'debt_to_equity';
type SortDirection = 'asc' | 'desc';

export function RankingTable({ ranking, onSelectCompany, selectedTicker }: Props) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const sortedRanking = [...ranking].sort((a, b) => {
    const aVal = a[sortColumn] as number | null;
    const bVal = b[sortColumn] as number | null;

    // Handle null values
    if (aVal === null && bVal === null) return 0;
    if (aVal === null) return 1;
    if (bVal === null) return -1;

    const comparison = aVal - bVal;
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const formatNumber = (value: number | null, type: 'decimal' | 'percentage'): string => {
    if (value === null) return 'N/A';
    if (type === 'percentage') return `${value.toFixed(1)}%`;
    return value.toFixed(1);
  };

  const getMoSColor = (mos: number | null): string => {
    if (mos === null) return 'text-gray-400';
    if (mos > 30) return 'text-green-400';
    if (mos > 10) return 'text-amber-400';
    return 'text-red-400';
  };

  const SortHeader = ({ column, label }: { column: SortColumn; label: string }) => (
    <button
      onClick={() => handleSort(column)}
      className="flex items-center gap-1 font-semibold text-slate-300 hover:text-slate-200 transition-colors"
    >
      {label}
      {sortColumn === column ? (
        sortDirection === 'asc' ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )
      ) : (
        <ArrowUpDown className="w-4 h-4 opacity-50" />
      )}
    </button>
  );

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-900 border-b border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">#</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300">Company</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-slate-300">Signal</th>
              <th className="px-4 py-3 text-right">
                <SortHeader column="score" label="Score" />
              </th>
              <th className="px-4 py-3 text-right">
                <SortHeader column="pe_ratio" label="P/E" />
              </th>
              <th className="px-4 py-3 text-right">
                <SortHeader column="ev_ebitda" label="EV/EBITDA" />
              </th>
              <th className="px-4 py-3 text-right">
                <SortHeader column="roe" label="ROE" />
              </th>
              <th className="px-4 py-3 text-right">
                <SortHeader column="margin_of_safety" label="MoS" />
              </th>
              <th className="px-4 py-3 text-right">
                <SortHeader column="debt_to_equity" label="D/E" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {sortedRanking.map((company) => (
              <tr
                key={company.ticker}
                onClick={() => onSelectCompany(company.ticker)}
                className={`cursor-pointer transition-colors ${
                  selectedTicker === company.ticker
                    ? 'bg-slate-700 hover:bg-slate-650'
                    : 'bg-slate-800 hover:bg-slate-750'
                }`}
              >
                <td className="px-4 py-3 text-sm text-slate-400 font-medium">{company.rank}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-slate-200">{company.ticker}</span>
                    <span className="text-xs text-slate-500">{company.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <SignalBadge signal={company.signal} score={company.score} />
                </td>
                <td className="px-4 py-3 text-right text-sm text-slate-300 font-medium">
                  {company.score}
                </td>
                <td className="px-4 py-3 text-right text-sm text-slate-300">
                  {formatNumber(company.pe_ratio, 'decimal')}
                </td>
                <td className="px-4 py-3 text-right text-sm text-slate-300">
                  {formatNumber(company.ev_ebitda, 'decimal')}
                </td>
                <td className="px-4 py-3 text-right text-sm text-slate-300">
                  {formatNumber(company.roe, 'percentage')}
                </td>
                <td className={`px-4 py-3 text-right text-sm font-semibold ${getMoSColor(company.margin_of_safety)}`}>
                  {formatNumber(company.margin_of_safety, 'percentage')}
                </td>
                <td className="px-4 py-3 text-right text-sm text-slate-300">
                  {formatNumber(company.debt_to_equity, 'decimal')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
