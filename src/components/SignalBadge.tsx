interface Props {
  signal: string;
  score: number;
}

export function SignalBadge({ signal, score }: Props) {
  const colors: Record<string, string> = {
    BUY: 'bg-green-600 text-white',
    HOLD: 'bg-amber-600 text-white',
    SELL: 'bg-red-600 text-white',
    'N/A': 'bg-gray-600 text-gray-300',
  };

  const colorClass = colors[signal] || colors['N/A'];

  return (
    <div className="flex items-center gap-2">
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${colorClass}`}>
        {signal}
      </span>
      <span className="text-sm text-slate-400">{score}/100</span>
    </div>
  );
}
