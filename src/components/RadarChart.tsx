import {
  Radar,
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface CompanyMetrics {
  ticker: string;
  metrics: {
    pe_ratio: number | null;
    roe: number | null;
    ebitda_margin: number | null;
    current_ratio: number | null;
    debt_to_equity: number | null;
    score: number;
  };
}

interface Props {
  companies: CompanyMetrics[];
}

export function RadarChart({ companies }: Props) {
  if (companies.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 bg-slate-800 rounded-lg border border-slate-700">
        <p className="text-slate-400">Select companies to compare</p>
      </div>
    );
  }

  // Normalize metrics to 0-100 scale
  const normalizeValue = (value: number | null, type: string, invert: boolean = false): number => {
    if (value === null) return 0;

    let normalized = 0;
    switch (type) {
      case 'pe': // P/E ratio - lower is better, cap at 30
        normalized = Math.max(0, Math.min(100, ((30 - Math.min(value, 30)) / 30) * 100));
        break;
      case 'roe': // ROE as percentage - higher is better, cap at 30%
        normalized = Math.max(0, Math.min(100, (Math.min(value, 30) / 30) * 100));
        break;
      case 'margin': // EBITDA margin - higher is better, cap at 40%
        normalized = Math.max(0, Math.min(100, (Math.min(value, 40) / 40) * 100));
        break;
      case 'liquidity': // Current ratio - higher is better, cap at 3
        normalized = Math.max(0, Math.min(100, (Math.min(value, 3) / 3) * 100));
        break;
      case 'leverage': // D/E - lower is better, cap at 2
        normalized = Math.max(0, Math.min(100, ((2 - Math.min(value, 2)) / 2) * 100));
        break;
      case 'score': // Score is already 0-100
        normalized = value;
        break;
    }

    return invert ? 100 - normalized : normalized;
  };

  // Prepare data for radar chart
  const data: Array<Record<string, number | string>> = [
    { metric: 'Valuation', fullMark: 100 },
    { metric: 'Profitability', fullMark: 100 },
    { metric: 'Margin', fullMark: 100 },
    { metric: 'Liquidity', fullMark: 100 },
    { metric: 'Leverage', fullMark: 100 },
    { metric: 'Score', fullMark: 100 },
  ];

  // Add company data to each metric
  companies.slice(0, 3).forEach((company) => {
    const valuation = normalizeValue(company.metrics.pe_ratio, 'pe');
    const profitability = normalizeValue(company.metrics.roe, 'roe');
    const margin = normalizeValue(company.metrics.ebitda_margin, 'margin');
    const liquidity = normalizeValue(company.metrics.current_ratio, 'liquidity');
    const leverage = normalizeValue(company.metrics.debt_to_equity, 'leverage');
    const score = company.metrics.score;

    const key = company.ticker;
    data[0][key] = valuation;
    data[1][key] = profitability;
    data[2][key] = margin;
    data[3][key] = liquidity;
    data[4][key] = leverage;
    data[5][key] = score;
  });

  const colors = ['#10b981', '#3b82f6', '#f59e0b'];

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
      <h3 className="text-lg font-semibold text-slate-200 mb-4">Metrics Comparison</h3>
      <ResponsiveContainer width="100%" height={400}>
        <RechartsRadar data={data}>
          <PolarGrid stroke="#475569" />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          {companies.slice(0, 3).map((company, idx) => (
            <Radar
              key={company.ticker}
              name={company.ticker}
              dataKey={company.ticker}
              stroke={colors[idx]}
              fill={colors[idx]}
              fillOpacity={0.25}
            />
          ))}
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
          />
        </RechartsRadar>
      </ResponsiveContainer>
    </div>
  );
}
