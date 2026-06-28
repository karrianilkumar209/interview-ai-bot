import { ArrowRight, Clock, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AnswerBox from "../components/AnswerBox";
import ErrorDialog from "../components/ErrorDialog";
import FeedbackCard from "../components/FeedbackCard";
import LoadingSpinner from "../components/LoadingSpinner";
import ProgressBar from "../components/ProgressBar";
import QuestionCard from "../components/QuestionCard";
import SuccessDialog from "../components/SuccessDialog";
import { getApiError } from "../services/api";
import { submitAnswer } from "../services/interviewService";
import type { Evaluation, Feedback, Question } from "../types/interview";
import { loadInterview, saveSelectedReport } from "../utils/storage";

export default function InterviewScreen() {
  const navigate = useNavigate();
  const stored = useMemo(() => loadInterview(), []);
  const [question, setQuestion] = useState<Question | null>(stored?.session.current_question ?? null);
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [pendingNextQuestion, setPendingNextQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState("");
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!stored) {
      navigate("/setup");
    }
  }, [navigate, stored]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!stored || !question || answer.trim().length < 3) {
      setError("Please enter a complete answer.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const data = await submitAnswer(stored.session.interview_id, answer.trim());
      setEvaluation(data.evaluation);
      setFeedback(data.feedback);
      setAnswer("");

      if (data.completed) {
        setCompleted(true);
        saveSelectedReport(stored.session.interview_id);
        setTimeout(() => navigate("/result"), 1600);
        return;
      }

      if (data.next_question) {
        setPendingNextQuestion(data.next_question);
        setTimeout(() => {
          setQuestion(data.next_question);
          setPendingNextQuestion(null);
          setEvaluation(null);
          setFeedback(null);
          setSeconds(0);
        }, 1200);
      }
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }

  function loadNextNow() {
    if (pendingNextQuestion) {
      setQuestion(pendingNextQuestion);
      setPendingNextQuestion(null);
      setEvaluation(null);
      setFeedback(null);
      setSeconds(0);
    }
  }

  if (!stored || !question) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10">
        <ErrorDialog message="No active interview found. Please start a new interview." />
      </main>
    );
  }

  const progress = (question.position / stored.session.total_questions) * 100;
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");

  return (
    <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_420px]">
      <section className="space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-blue-600">{stored.profile.name}</p>
              <h1 className="text-2xl font-bold">{stored.profile.role} Interview</h1>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <Clock size={17} />
              {minutes}:{secs}
            </div>
          </div>
          <ProgressBar value={progress} label={`${Math.round(progress)}% complete`} />
        </div>

        <QuestionCard question={question} total={stored.session.total_questions} />

        <form className="space-y-4" onSubmit={handleSubmit}>
          <AnswerBox value={answer} onChange={setAnswer} disabled={loading || completed} />
          <ErrorDialog message={error} />
          {loading && <LoadingSpinner label="AI is evaluating your answer..." />}
          {completed && (
            <SuccessDialog
              title="Interview completed"
              message="Great work. Your result and final report are being prepared."
              actionLabel="View Result"
              onAction={() => navigate("/result")}
            />
          )}
          <div className="flex flex-wrap gap-3">
            <button disabled={loading || completed} className="focus-ring inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-soft hover:bg-blue-700 disabled:opacity-60">
              <Send size={18} />
              Submit Answer
            </button>
            {pendingNextQuestion && !completed && (
              <button
                type="button"
                onClick={loadNextNow}
                className="focus-ring inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 hover:border-blue-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
              >
                Next Question
                <ArrowRight size={18} />
              </button>
            )}
          </div>
        </form>
      </section>

      <aside className="space-y-5">
        {evaluation && feedback ? (
          <FeedbackCard evaluation={evaluation} feedback={feedback} />
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-semibold text-blue-600">Live feedback</p>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              After every answer, your communication, confidence, clarity, and professionalism scores will appear here.
            </p>
          </div>
        )}
      </aside>
    </main>
  );
}
