import { CheckCircle2 } from "lucide-react";

interface SuccessDialogProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function SuccessDialog({ title, message, actionLabel, onAction }: SuccessDialogProps) {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100">
      <div className="flex gap-3">
        <CheckCircle2 className="mt-0.5 shrink-0" size={22} />
        <div>
          <h3 className="font-bold">{title}</h3>
          <p className="mt-1 text-sm leading-6">{message}</p>
          {actionLabel && onAction && (
            <button onClick={onAction} className="focus-ring mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
