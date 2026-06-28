import api from "./api";
import type {
  AnswerResponse,
  CandidateProfile,
  DashboardResponse,
  HistoryItem,
  ReportResponse,
  ResultResponse,
  StartInterviewResponse
} from "../types/interview";

export async function startInterview(profile: CandidateProfile): Promise<StartInterviewResponse> {
  const { data } = await api.post<StartInterviewResponse>("/start-interview", profile);
  return data;
}

export async function submitAnswer(interviewId: number, answer: string): Promise<AnswerResponse> {
  const { data } = await api.post<AnswerResponse>("/answer", {
    interview_id: interviewId,
    answer
  });
  return data;
}

export async function fetchResult(interviewId: number): Promise<ResultResponse> {
  const { data } = await api.get<ResultResponse>("/result", {
    params: { interview_id: interviewId }
  });
  return data;
}

export async function fetchReport(interviewId: number): Promise<ReportResponse> {
  const { data } = await api.get<ReportResponse>("/report", {
    params: { interview_id: interviewId }
  });
  return data;
}

export async function fetchHistory(): Promise<HistoryItem[]> {
  const { data } = await api.get<HistoryItem[]>("/history");
  return data;
}

export async function fetchDashboard(): Promise<DashboardResponse> {
  const { data } = await api.get<DashboardResponse>("/dashboard");
  return data;
}
