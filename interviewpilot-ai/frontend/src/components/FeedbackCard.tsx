import { CheckCircle2, Sparkles, TriangleAlert } from "lucide-react";
import ScoreCard from "./ScoreCard";
import type { Evaluation, Feedback } from "../types/interview";

interface FeedbackCardProps {
  evaluation: Evaluation;
  feedback: Feedback;
}

export default function FeedbackCard({ evaluation, feedback }: FeedbackCardProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div>
        <p className="text-sm font-semibold text-blue-600">AI feedback</p>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{evaluation.summary}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <ScoreCard label="Communication" score={evaluation.communication} />
        <ScoreCard label="Confidence" score={evaluation.confidence} />
        <ScoreCard label="Clarity" score={evaluation.clarity} />
        <ScoreCard label="Professionalism" score={evaluation.professionalism} />
      </div>
      <List icon={<CheckCircle2 size={17} />} title="Positive" items={feedback.positive_feedback} />
      <List icon={<TriangleAlert size={17} />} title="Weak points" items={feedback.weak_points} />
      <List icon={<Sparkles size={17} />} title="Suggestions" items={feedback.suggestions} />
    </div>
  );
}

function List({ title, items, icon }: { title: string; items: string[]; icon: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
        {icon}
        {title}
      </h3>
      <ul className="space-y-2">
        {items.slice(0, 3).map((item) => (
          <li key={item} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
