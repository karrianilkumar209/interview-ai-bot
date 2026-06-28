import { TriangleAlert } from "lucide-react";

interface ErrorDialogProps {
  message: string;
}

export default function ErrorDialog({ message }: ErrorDialogProps) {
  if (!message) return null;

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-100">
      <div className="flex gap-2">
        <TriangleAlert size={18} className="mt-0.5 shrink-0" />
        <span>{message}</span>
      </div>
    </div>
  );
}
