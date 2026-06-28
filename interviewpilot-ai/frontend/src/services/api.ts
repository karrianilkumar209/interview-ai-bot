import axios from "axios";

function normalizeApiBaseUrl(url: string): string {
  const cleaned = url.trim().replace(/\/+$/, "");
  if (cleaned.endsWith("/api/v1")) return cleaned;
  return `${cleaned}/api/v1`;
}

const RAW_API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: normalizeApiBaseUrl(RAW_API_URL),
  timeout: 30000,
});

export function getApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;

    if (Array.isArray(detail)) {
      return detail.map((item) => item.msg || "Invalid input").join(", ");
    }

    if (typeof detail === "string") {
      return detail;
    }

    if (error.code === "ECONNABORTED") {
      return "The AI evaluation took too long. Please try again.";
    }

    if (!error.response) {
      return "Could not reach the backend. Please try again.";
    }
  }

  return "Something went wrong. Please try again.";
}

export default api;