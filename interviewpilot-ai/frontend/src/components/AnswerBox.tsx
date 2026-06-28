interface AnswerBoxProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function AnswerBox({ value, onChange, disabled }: AnswerBoxProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">Your answer</span>
      <textarea
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="focus-ring min-h-60 w-full resize-y rounded-2xl border border-slate-200 bg-white p-5 leading-7 text-slate-900 shadow-sm disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
        placeholder="Type your answer naturally, as if you are speaking to an HR interviewer..."
      />
    </label>
  );
}
