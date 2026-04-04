import type { RankedCompany } from '../types/api';

interface Props {
  companies: RankedCompany[];
}

export function ComparisonView({ companies }: Props) {
  if (companies.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 text-center">
        <p className="text-slate-400">Select 2-3 companies to compare</p>
      </div>
    );
  }

  const formatNumber = (value: number | null, type: 'decimal' | 'percentage'): string => {
    if (value === null) return 'N/A';
    if (type === 'percentage') return `${value.toFixed(1)}%`;
    return value.toFixed(1);
  };

  const findBestValue = (
    values: (number | null)[],
    type: 'higher' | 'lower'
  ): number | null => {
    const validValues = values.filter((v) => v !== null) as number[];
    if (validValues.length === 0) return null;
    return type === 'higher' ? Math.max(...validValues) : Math.min(...validValues);
  };

  const isBestValue = (value: number | null, bestValue: number | null, type: 'higher' | 'lower'): boolean => {
    if (value === null || bestValue === null) return false;
    if (type === 'higher') return Math.abs(value - bestValue) < 0.01;
    return Math.abs(value - bestValue) < 0.01;
  };

  const metrics = [
    { label: 'Score', key: 'score', type: 'higher', format: 'decimal' as const },
    { label: 'P/E Ratio', key: 'pe_ratio', type: 'lower', format: 'decimal' as const },
    { label: 'EV/EBITDA', key: 'ev_ebitda', type: 'lower', format: 'decimal' as const },
    { label: 'ROE', key: 'roe', type: 'higher', format: 'percentage' as const },
    { label: 'Margin of Safety', key: 'margin_of_safety', type: 'higher', format: 'percentage' as const },
    { label: 'D/E Ratio', key: 'debt_to_equity', type: 'lower', format: 'decimal' as const },
  ];

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-900 border-b border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-300 w-32">Metric</th>
              {companies.map((company) => (
                <th
                  key={company.ticker}
                  className="px-4 py-3 text-right text-sm font-semibold text-slate-300 min-w-40"
                >
                  <div className="text-slate-100">{company.ticker}</div>
                  <div className="text-xs text-slate-500 font-normal">{company.name}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {metrics.map((metric) => {
              const values = companies.map(
                (c) => c[metric.key as keyof RankedCompany] as number | null
              );
              const bestValue = findBestValue(values, metric.type as 'higher' | 'lower');

              return (
                <tr key={metric.key} className="bg-slate-800 hover:bg-slate-750 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-slate-300">
                    {metric.label}
                  </td>
                  {companies.map((company) => {
                    const value = company[metric.key as keyof RankedCompany] as number | null;
                    const isBest = isBestValue(value, bestValue, metric.type as 'higher' | 'lower');

                    return (
                      <td
                        key={`${company.ticker}-${metric.key}`}
                        className={`px-4 py-3 text-sm text-right font-medium ${
                          isBest
                            ? 'bg-green-900/30 text-green-300'
                            : 'text-slate-200'
                        }`}
                      >
                        {formatNumber(value, metric.format)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
