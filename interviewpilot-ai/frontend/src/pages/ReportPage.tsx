import { Download, Printer } from "lucide-react";
import { jsPDF } from "jspdf";
import ErrorDialog from "../components/ErrorDialog";
import LoadingSpinner from "../components/LoadingSpinner";
import ScoreCard from "../components/ScoreCard";
import { useInterviewData } from "../hooks/useInterviewData";
import type { ReportContent, RoadmapItem } from "../types/interview";
import { loadInterview, loadSelectedReport } from "../utils/storage";
import { formatDuration } from "./Home";

export default function ReportPage() {
  const stored = loadInterview();
  const selectedReportId = loadSelectedReport();
  const interviewId = selectedReportId ?? stored?.session.interview_id;
  const { result, report, loading, error } = useInterviewData(interviewId);
  const content = report?.report;
  const candidate = content?.candidate_details;

  function printReport() {
    window.print();
  }

  function downloadPdf() {
    if (!content) return;
    exportReportPdf(content);
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      {loading && <LoadingSpinner label="Loading report..." />}
      <ErrorDialog message={error || (!interviewId ? "No interview report found." : "")} />

      {content && (
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900 print:border-0 print:shadow-none">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6 dark:border-slate-800">
            <div>
              <p className="text-sm font-semibold uppercase text-blue-600">Detailed report</p>
              <h1 className="mt-2 text-3xl font-bold">InterviewPilot AI Report</h1>
              <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">{content.interview_summary}</p>
            </div>
            <div className="flex gap-2 print:hidden">
              <button onClick={printReport} className="focus-ring inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                <Printer size={17} />
                Print
              </button>
              <button onClick={downloadPdf} className="focus-ring inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
                <Download size={17} />
                Download PDF
              </button>
            </div>
          </div>

          <section className="grid gap-4 rounded-2xl bg-slate-50 p-5 dark:bg-slate-950 sm:grid-cols-2 lg:grid-cols-4">
            <Info label="Candidate" value={candidate?.name ?? stored?.profile.name ?? "Candidate"} />
            <Info label="Role" value={candidate?.role ?? stored?.profile.role ?? "Role"} />
            <Info label="Difficulty" value={candidate?.difficulty ?? stored?.profile.difficulty ?? "Medium"} />
            <Info label="Duration" value={formatDuration(candidate?.interview_duration_seconds ?? 0)} />
          </section>

          <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <ScoreCard label="Communication" score={content.scores.communication} />
            <ScoreCard label="Confidence" score={content.scores.confidence} />
            <ScoreCard label="Professionalism" score={content.scores.professionalism} />
            <ScoreCard label="Leadership" score={content.scores.leadership ?? Number(content.scores.details?.leadership ?? 0)} />
            <ScoreCard label="Problem Solving" score={content.scores.problem_solving} />
            <ScoreCard label="Overall" score={content.scores.overall} tone="green" />
          </section>

          <section className="mt-6 rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
            <h2 className="text-xl font-bold">Final Recommendation</h2>
            <p className="mt-2 leading-7 text-slate-600 dark:text-slate-300">{content.overall_recommendation}</p>
          </section>

          <section className="mt-6 grid gap-5 lg:grid-cols-2">
            <ListPanel title="Strengths" items={content.strengths} />
            <ListPanel title="Weaknesses" items={content.weaknesses} />
            <ListPanel title="Improvement Suggestions" items={content.improvement_plan} />
            <ListPanel title="Smart Recommendations" items={content.smart_recommendations ?? []} />
          </section>

          <section className="mt-6 grid gap-5 lg:grid-cols-2">
            <Roadmap title="7-Day Improvement Plan" items={content.improvement_roadmap?.seven_day ?? []} />
            <Roadmap title="30-Day Improvement Plan" items={content.improvement_roadmap?.thirty_day ?? []} compact />
          </section>

          <section className="mt-6">
            <h2 className="text-xl font-bold">Questions, Answers, Evaluation, and Feedback</h2>
            <div className="mt-4 space-y-4">
              {content.questions_and_answers.map((item, index) => (
                <article key={`${item.question}-${index}`} className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
                  <p className="text-sm font-semibold text-blue-600">Question {index + 1}</p>
                  <h3 className="mt-1 font-bold leading-7">{item.question}</h3>
                  <p className="mt-3 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700 dark:bg-slate-950 dark:text-slate-300">{item.answer}</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-5">
                    <MiniScore label="Communication" value={item.evaluation.communication} />
                    <MiniScore label="Confidence" value={item.evaluation.confidence} />
                    <MiniScore label="Professionalism" value={item.evaluation.professionalism} />
                    <MiniScore label="Leadership" value={item.evaluation.leadership} />
                    <MiniScore label="Problem Solving" value={item.evaluation.problem_solving} />
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.evaluation.summary}</p>
                </article>
              ))}
            </div>
          </section>

          {result?.answers.length === 0 && (
            <p className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">No answers were found for this report.</p>
          )}
        </article>
      )}
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 font-bold capitalize">{value}</p>
    </div>
  );
}

function ListPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
      <h2 className="text-lg font-bold">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">No items available yet.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li key={item} className="rounded-xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
              {item}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Roadmap({ title, items, compact = false }: { title: string; items: RoadmapItem[]; compact?: boolean }) {
  return (
    <section className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
      <h2 className="text-lg font-bold">{title}</h2>
      <div className={`mt-3 grid gap-2 ${compact ? "max-h-96 overflow-auto pr-1" : ""}`}>
        {items.map((item) => (
          <div key={`${title}-${item.day}`} className="grid grid-cols-[72px_1fr] gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm dark:bg-slate-950">
            <p className="font-bold text-blue-600">{item.day}</p>
            <p className="leading-6 text-slate-600 dark:text-slate-300">{item.task}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function MiniScore({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-blue-50 p-3 dark:bg-blue-950/40">
      <p className="text-xs text-blue-700 dark:text-blue-200">{label}</p>
      <p className="text-lg font-bold text-blue-700 dark:text-blue-100">{Number(value || 0).toFixed(1)}/10</p>
    </div>
  );
}

function exportReportPdf(content: ReportContent) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  const width = doc.internal.pageSize.getWidth() - margin * 2;
  let y = margin;

  function addPageIfNeeded(height = 36) {
    if (y + height > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
  }

  function text(value: string, size = 10, bold = false, gap = 16) {
    addPageIfNeeded(gap + 8);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(value, width);
    doc.text(lines, margin, y);
    y += lines.length * (size + 4) + gap;
  }

  function section(title: string) {
    addPageIfNeeded(32);
    doc.setFillColor(37, 99, 235);
    doc.rect(margin, y, 4, 18, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(title, margin + 12, y + 14);
    y += 34;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("InterviewPilot AI Report", margin, y);
  y += 30;
  text(content.interview_summary, 10, false, 10);

  const candidate = content.candidate_details;
  section("Candidate Details");
  text(`Name: ${candidate?.name ?? "Candidate"}`);
  text(`Role: ${candidate?.role ?? "Role"} | Difficulty: ${candidate?.difficulty ?? "Medium"} | Duration: ${formatDuration(candidate?.interview_duration_seconds ?? 0)}`);

  section("Score Summary");
  text(
    `Overall: ${content.scores.overall.toFixed(1)}/10 | Communication: ${content.scores.communication.toFixed(1)} | Confidence: ${content.scores.confidence.toFixed(1)} | Professionalism: ${content.scores.professionalism.toFixed(1)} | Leadership: ${Number(content.scores.leadership ?? content.scores.details?.leadership ?? 0).toFixed(1)} | Problem Solving: ${content.scores.problem_solving.toFixed(1)}`
  );

  section("Final Recommendation");
  text(content.overall_recommendation);

  section("Strengths");
  content.strengths.forEach((item) => text(`- ${item}`, 10, false, 4));

  section("Weaknesses");
  content.weaknesses.forEach((item) => text(`- ${item}`, 10, false, 4));

  section("Improvement Suggestions");
  content.improvement_plan.forEach((item) => text(`- ${item}`, 10, false, 4));

  section("7-Day Improvement Plan");
  content.improvement_roadmap?.seven_day.forEach((item) => text(`${item.day}: ${item.task}`, 10, false, 4));

  section("Questions and Answers");
  content.questions_and_answers.forEach((item, index) => {
    text(`Question ${index + 1}: ${item.question}`, 11, true, 8);
    text(`Answer: ${item.answer}`, 10, false, 8);
    text(`Evaluation: ${item.evaluation.summary}`, 10, false, 10);
  });

  doc.save(`InterviewPilot-Report-${candidate?.name ?? "candidate"}.pdf`);
}
