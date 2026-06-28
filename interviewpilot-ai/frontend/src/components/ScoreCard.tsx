interface ScoreCardProps {
  label: string;
  score: number;
  tone?: "blue" | "green" | "amber";
}

export default function ScoreCard({ label, score, tone = "blue" }: ScoreCardProps) {
  const color = tone === "green" ? "text-emerald-600" : tone === "amber" ? "text-amber-600" : "text-blue-600";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${color}`}>{score.toFixed(1)}</p>
      <p className="text-xs text-slate-400">out of 10</p>
    </div>
  );
}
