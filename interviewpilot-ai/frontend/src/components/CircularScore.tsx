interface CircularScoreProps {
  score: number;
  label: string;
}

export default function CircularScore({ score, label }: CircularScoreProps) {
  const pct = Math.max(0, Math.min(100, score * 10));

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="grid h-44 w-44 place-items-center rounded-full"
        style={{ background: `conic-gradient(#2563eb ${pct}%, #dbeafe ${pct}% 100%)` }}
      >
        <div className="grid h-32 w-32 place-items-center rounded-full bg-white text-center dark:bg-slate-950">
          <div>
            <p className="text-4xl font-bold text-blue-600">{score.toFixed(1)}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">out of 10</p>
          </div>
        </div>
      </div>
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</p>
    </div>
  );
}
