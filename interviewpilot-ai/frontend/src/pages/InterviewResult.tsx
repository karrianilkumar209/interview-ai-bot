import { FileText, RefreshCw } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import CircularScore from "../components/CircularScore";
import ErrorDialog from "../components/ErrorDialog";
import LoadingSpinner from "../components/LoadingSpinner";
import ScoreCard from "../components/ScoreCard";
import { useInterviewData } from "../hooks/useInterviewData";
import { clearInterview, loadInterview, saveSelectedReport } from "../utils/storage";

export default function InterviewResult() {
  const navigate = useNavigate();
  const stored = loadInterview();
  const { result, report, loading, error } = useInterviewData(stored?.session.interview_id);
  const content = report?.report;
  const scores = result?.scores || content?.scores;

  function restart() {
    clearInterview();
    navigate("/setup");
  }

  function openReport() {
    if (stored) saveSelectedReport(stored.session.interview_id);
  }

  const chartData = scores
    ? [
        { label: "Communication", score: scores.communication },
        { label: "Confidence", score: scores.confidence },
        { label: "Professionalism", score: scores.professionalism },
        { label: "Leadership", score: scores.leadership ?? Number(scores.details?.leadership ?? 0) },
        { label: "Problem Solving", score: scores.problem_solving },
        { label: "Overall", score: scores.overall }
      ]
    : [];

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      {loading && <LoadingSpinner label="Loading final result..." />}
      <ErrorDialog message={error || (!stored ? "No completed interview found." : "")} />

      {scores && content && (
        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-soft dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-semibold uppercase text-blue-600">Congratulations</p>
            <h1 className="mt-2 text-3xl font-bold">Interview Complete</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              You completed the interview and received a full AI evaluation.
            </p>
            <div className="mt-6 flex justify-center">
              <CircularScore score={scores.overall} label="Overall Score" />
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <Link onClick={openReport} to="/report" className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white">
                <FileText size={18} />
                Open Report
              </Link>
              <button onClick={restart} className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                <RefreshCw size={18} />
                New Interview
              </button>
            </div>
          </section>

          <section className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <ScoreCard label="Communication" score={scores.communication} />
              <ScoreCard label="Confidence" score={scores.confidence} />
              <ScoreCard label="Professionalism" score={scores.professionalism} />
              <ScoreCard label="Leadership" score={scores.leadership ?? Number(scores.details?.leadership ?? 0)} />
              <ScoreCard label="Problem Solving" score={scores.problem_solving} />
              <ScoreCard label="Overall" score={scores.overall} tone="green" />
            </div>
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg font-bold">Performance Breakdown</h2>
              <div className="mt-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="label" hide />
                    <YAxis domain={[0, 10]} stroke="#64748b" />
                    <Tooltip formatter={(value) => Number(value).toFixed(1)} />
                    <Bar dataKey="score" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
            <Panel title="Recommendation" items={[content.overall_recommendation]} />
            <Panel title="Strengths" items={content.strengths} />
            <Panel title="Weaknesses" items={content.weaknesses} />
            <Panel title="Improvement Suggestions" items={content.improvement_plan} />
            <Panel title="Smart Recommendations" items={content.smart_recommendations ?? []} />
            <RoadmapPanel title="7-Day Roadmap" items={content.improvement_roadmap?.seven_day ?? []} />
          </section>
        </div>
      )}
    </main>
  );
}

function RoadmapPanel({ title, items }: { title: string; items: Array<{ day: string; task: string }> }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-bold">{title}</h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.day} className="rounded-xl bg-slate-50 px-4 py-3 text-sm leading-6 dark:bg-slate-800">
            <p className="font-bold text-blue-600">{item.day}</p>
            <p className="text-slate-600 dark:text-slate-300">{item.task}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Panel({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-bold">{title}</h2>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item} className="rounded-xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
