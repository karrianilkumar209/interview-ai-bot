import type { StoredInterview } from "../types/interview";

const KEY = "interviewpilot_current_interview";
const REPORT_KEY = "interviewpilot_selected_report";

export function saveInterview(value: StoredInterview) {
  localStorage.setItem(KEY, JSON.stringify(value));
}

export function loadInterview(): StoredInterview | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as StoredInterview;
  } catch {
    localStorage.removeItem(KEY);
    return null;
  }
}

export function clearInterview() {
  localStorage.removeItem(KEY);
}

export function clearSelectedReport() {
  localStorage.removeItem(REPORT_KEY);
}

export function saveSelectedReport(interviewId: number) {
  localStorage.setItem(REPORT_KEY, String(interviewId));
}

export function loadSelectedReport(): number | null {
  const value = Number(localStorage.getItem(REPORT_KEY));
  return Number.isFinite(value) && value > 0 ? value : null;
}
