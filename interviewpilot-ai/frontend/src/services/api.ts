import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
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