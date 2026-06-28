import { MessageCircleQuestion } from "lucide-react";
import type { Question } from "../types/interview";

interface QuestionCardProps {
  question: Question;
  total: number;
}

export default function QuestionCard({ question, total }: QuestionCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
          <MessageCircleQuestion size={18} />
          Question {question.position} of {total}
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase text-blue-700 dark:bg-blue-950 dark:text-blue-200">
          {question.category}
        </span>
      </div>
      <h1 className="text-2xl font-bold leading-9 text-slate-950 dark:text-white">{question.text}</h1>
    </div>
  );
}
