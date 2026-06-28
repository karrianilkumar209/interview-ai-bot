interface ProgressBarProps {
  value: number;
  label?: string;
}

export default function ProgressBar({ value, label }: ProgressBarProps) {
  const width = Math.max(0, Math.min(100, value));

  return (
    <div>
      {label && <div className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">{label}</div>}
      <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div className="h-full rounded-full bg-blue-600 transition-all duration-500" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}
