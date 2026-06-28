import { BarChart3, CalendarDays, Clock, FileText, Plus, RefreshCw, TrendingUp } from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import ErrorDialog from "../components/ErrorDialog";
import LoadingSpinner from "../components/LoadingSpinner";
import { fetchDashboard } from "../services/interviewService";
import type { DashboardResponse, HistoryItem, Scores } from "../types/interview";
import { saveSelectedReport } from "../utils/storage";

export default function Home() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchDashboard()
      .then((data) => {
        if (active) setDashboard(data);
      })
      .catch(() => {
        if (active) setError("Could not load dashboard data. Check that the backend is running.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const latest = dashboard?.history[0];
  const latestScores = useMemo(() => {
    const point = dashboard?.trends[dashboard.trends.length - 1];
    if (!point) return [];
    return [
      { label: "Communication", score: point.communication },
      { label: "Confidence", score: point.confidence },
      { label: "Professionalism", score: point.professionalism },
      { label: "Leadership", score: point.leadership },
      { label: "Problem Solving", score: point.problem_solving },
      { label: "Overall", score: point.overall }
    ];
  }, [dashboard]);

  function openReport(interviewId: number) {
    saveSelectedReport(interviewId);
    navigate("/report");
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase text-blue-600">Performance dashboard</p>
          <h1 className="mt-2 text-3xl font-bold tracking-normal">InterviewPilot AI</h1>
        </div>
        <Link to="/setup" className="focus-ring inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-soft hover:bg-blue-700">
          <Plus size={18} />
          New Interview
        </Link>
      </div>

      {loading && <LoadingSpinner label="Loading dashboard..." />}
      <ErrorDialog message={error} />

      {dashboard && (
        <div className="space-y-6">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <Metric icon={<BarChart3 size={20} />} label="Average Score" value={scoreLabel(dashboard.analytics.average_score)} />
            <Metric icon={<TrendingUp size={20} />} label="Best Category" value={dashboard.analytics.best_category || "No data"} />
            <Metric icon={<RefreshCw size={20} />} label="Weakest Category" value={dashboard.analytics.weakest_category || "No data"} />
            <Metric icon={<CalendarDays size={20} />} label="Interviews" value={String(dashboard.analytics.number_of_interviews)} />
            <Metric icon={<Clock size={20} />} label="Avg Duration" value={formatDuration(dashboard.analytics.average_interview_duration_seconds)} />
          </section>

          {dashboard.history.length === 0 ? (
            <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <h2 className="text-xl font-bold">No interviews yet</h2>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                Start an interview to generate history, charts, analytics, recommendations, and a downloadable report.
              </p>
              <Link to="/setup" className="focus-ring mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white">
                <Plus size={18} />
                Start First Interview
              </Link>
            </section>
          ) : (
            <>
              <section className="grid gap-5 lg:grid-cols-[1fr_420px]">
                <ChartPanel title="Score Trends">
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={dashboard.trends.map((point, index) => ({ ...point, label: `#${index + 1}` }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="label" stroke="#64748b" />
                      <YAxis domain={[0, 10]} stroke="#64748b" />
                      <Tooltip formatter={(value) => Number(value).toFixed(1)} />
                      <Line type="monotone" dataKey="overall" name="Overall" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="communication" name="Communication" stroke="#10b981" strokeWidth={2} />
                      <Line type="monotone" dataKey="confidence" name="Confidence" stroke="#f59e0b" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartPanel>

                <ChartPanel title="Latest Score Summary">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={latestScores}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="label" hide />
                      <YAxis domain={[0, 10]} stroke="#64748b" />
                      <Tooltip formatter={(value) => Number(value).toFixed(1)} />
                      <Bar dataKey="score" fill="#2563eb" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartPanel>
              </section>

              {latest && <LatestInterview item={latest} onOpen={openReport} />}

              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="border-b border-slate-200 p-5 dark:border-slate-800">
                  <h2 className="text-xl font-bold">Interview History</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[860px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                      <tr>
                        <th className="px-5 py-3">Interview Date</th>
                        <th className="px-5 py-3">Candidate Name</th>
                        <th className="px-5 py-3">Role</th>
                        <th className="px-5 py-3">Difficulty</th>
                        <th className="px-5 py-3">Overall Score</th>
                        <th className="px-5 py-3">Duration</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3">Report</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.history.map((item) => (
                        <HistoryRow key={item.interview_id} item={item} onOpen={openReport} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </div>
      )}
    </main>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200">{icon}</div>
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </article>
  );
}

function ChartPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-4 text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}

function LatestInterview({ item, onOpen }: { item: HistoryItem; onOpen: (id: number) => void }) {
  const canOpen = item.status === "completed";
  return (
    <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-900 dark:bg-blue-950/40">
      <div>
        <p className="text-sm font-semibold text-blue-700 dark:text-blue-200">Latest interview</p>
        <h2 className="mt-1 text-xl font-bold">{item.candidate_name} - {item.role}</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          {formatDate(item.interview_date)} - {item.difficulty} - {formatDuration(item.interview_duration_seconds)}
        </p>
      </div>
      <button
        disabled={!canOpen}
        onClick={() => onOpen(item.interview_id)}
        className="focus-ring inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        <FileText size={17} />
        {canOpen ? "Reopen Report" : "Report Pending"}
      </button>
    </section>
  );
}

function HistoryRow({ item, onOpen }: { item: HistoryItem; onOpen: (id: number) => void }) {
  const canOpen = item.status === "completed";
  return (
    <tr className="border-t border-slate-100 dark:border-slate-800">
      <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{formatDate(item.interview_date)}</td>
      <td className="px-5 py-4 font-semibold">{item.candidate_name}</td>
      <td className="px-5 py-4">{item.role}</td>
      <td className="px-5 py-4 capitalize">{item.difficulty}</td>
      <td className="px-5 py-4">{item.overall_score == null ? "Pending" : scoreLabel(item.overall_score)}</td>
      <td className="px-5 py-4">{formatDuration(item.interview_duration_seconds)}</td>
      <td className="px-5 py-4">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${canOpen ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200" : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200"}`}>
          {item.status.replace("_", " ")}
        </span>
      </td>
      <td className="px-5 py-4">
        <button
          disabled={!canOpen}
          onClick={() => onOpen(item.interview_id)}
          className="focus-ring inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
        >
          <FileText size={16} />
          Open
        </button>
      </td>
    </tr>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  if (minutes === 0) return `${remainder}s`;
  return `${minutes}m ${remainder.toString().padStart(2, "0")}s`;
}

function scoreLabel(score: Scores["overall"] | number) {
  return `${Number(score).toFixed(1)}/10`;
}
