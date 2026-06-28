import { useState } from "react";
import { Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ErrorDialog from "../components/ErrorDialog";
import LoadingSpinner from "../components/LoadingSpinner";
import { getApiError } from "../services/api";
import { startInterview } from "../services/interviewService";
import type { CandidateProfile, Difficulty, InterviewType } from "../types/interview";
import { clearSelectedReport, saveInterview } from "../utils/storage";

const difficulties: Difficulty[] = ["Easy", "Medium", "Hard"];
const interviewTypes: InterviewType[] = ["HR", "Behavioral", "Mixed"];

export default function InterviewSetup() {
  const navigate = useNavigate();
  const [form, setForm] = useState<CandidateProfile>({
    name: "",
    role: "Software Engineer",
    years_of_experience: 2,
    skills: ["Communication", "React", "JavaScript"],
    difficulty: "Medium",
    interview_type: "HR"
  });
  const [skillText, setSkillText] = useState("Communication, React, JavaScript");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const profile = {
      ...form,
      skills: skillText
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)
    };

    if (profile.skills.length === 0) {
      setError("Add at least one skill.");
      return;
    }

    setLoading(true);
    try {
      const session = await startInterview(profile);
      clearSelectedReport();
      saveInterview({ profile, session });
      navigate("/interview");
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
      <section>
        <p className="text-sm font-semibold uppercase text-blue-600">Interview setup</p>
        <h1 className="mt-2 text-4xl font-bold tracking-normal">Create your HR interview</h1>
        <p className="mt-4 max-w-xl text-slate-600 dark:text-slate-300">
          Add candidate details and choose the interview style. The backend agents will plan the flow and generate the first question.
        </p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <form className="space-y-5" onSubmit={onSubmit}>
          <Field label="Candidate Name">
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </Field>
          <Field label="Target Job Role">
            <input className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required />
          </Field>
          <Field label="Years of Experience">
            <input
              className="input"
              type="number"
              min="0"
              max="60"
              step="0.5"
              value={form.years_of_experience}
              onChange={(e) => setForm({ ...form, years_of_experience: Number(e.target.value) })}
              required
            />
          </Field>
          <Field label="Skills">
            <input className="input" value={skillText} onChange={(e) => setSkillText(e.target.value)} required />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Difficulty">
              <Segmented value={form.difficulty} options={difficulties} onChange={(value) => setForm({ ...form, difficulty: value as Difficulty })} />
            </Field>
            <Field label="Interview Type">
              <Segmented value={form.interview_type} options={interviewTypes} onChange={(value) => setForm({ ...form, interview_type: value as InterviewType })} />
            </Field>
          </div>
          <ErrorDialog message={error} />
          {loading && <LoadingSpinner label="Planning interview and preparing questions..." />}
          <button disabled={loading} className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-soft hover:bg-blue-700 disabled:opacity-60">
            <Play size={18} />
            Start Interview
          </button>
        </form>
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
      {children}
    </label>
  );
}

function Segmented({ value, options, onChange }: { value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <div className="grid grid-cols-3 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-950">
      {options.map((option) => (
        <button
          type="button"
          key={option}
          onClick={() => onChange(option)}
          className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
            value === option ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:text-blue-700 dark:text-slate-300"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
