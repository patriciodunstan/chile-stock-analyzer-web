interface Props {
  sectors: string[];
  activeSector: string | null;
  onSectorChange: (sector: string | null) => void;
}

export function SectorFilter({ sectors, activeSector, onSectorChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSectorChange(null)}
        className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${
          activeSector === null
            ? 'bg-blue-600 text-white'
            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
        }`}
      >
        All Sectors
      </button>
      {sectors.map((sector) => (
        <button
          key={sector}
          onClick={() => onSectorChange(activeSector === sector ? null : sector)}
          className={`px-4 py-2 rounded-full font-medium text-sm transition-colors whitespace-nowrap ${
            activeSector === sector
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          {sector}
        </button>
      ))}
    </div>
  );
}
