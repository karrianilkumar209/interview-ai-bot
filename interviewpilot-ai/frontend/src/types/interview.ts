export type Difficulty = "Easy" | "Medium" | "Hard";
export type InterviewType = "HR" | "Behavioral" | "Mixed";

export interface CandidateProfile {
  name: string;
  role: string;
  years_of_experience: number;
  skills: string[];
  difficulty: Difficulty;
  interview_type: InterviewType;
}

export interface Question {
  id: number;
  position: number;
  category: string;
  text: string;
}

export interface StartInterviewResponse {
  interview_id: number;
  candidate_id: number;
  difficulty: string;
  interview_type: string;
  flow: string[];
  total_questions: number;
  current_question: Question;
}

export interface Evaluation {
  communication: number;
  grammar: number;
  confidence: number;
  clarity: number;
  structure: number;
  professionalism: number;
  completeness: number;
  relevance: number;
  depth: number;
  technical_understanding: number;
  problem_solving: number;
  leadership: number;
  summary: string;
  positive_feedback: string[];
  weak_points: string[];
  suggestions: string[];
  better_sample_answer: string;
}

export interface Feedback {
  positive_feedback: string[];
  weak_points: string[];
  suggestions: string[];
  better_sample_answer: string;
}

export interface AnswerResponse {
  interview_id: number;
  question_id: number;
  completed: boolean;
  evaluation: Evaluation;
  feedback: Feedback;
  next_question: Question | null;
}

export interface Scores {
  communication: number;
  confidence: number;
  technical_understanding: number;
  problem_solving: number;
  professionalism: number;
  leadership: number;
  overall: number;
  details: Record<string, unknown>;
}

export interface AnswerResult {
  question_id: number;
  question: string;
  answer: string;
  evaluation: Evaluation;
  feedback: Feedback;
  created_at: string;
}

export interface ResultResponse {
  interview_id: number;
  status: string;
  scores: Scores | null;
  answers: AnswerResult[];
}

export interface ReportContent {
  candidate_details?: {
    name: string;
    role: string;
    years_of_experience: number;
    skills: string[];
    difficulty: string;
    interview_type: string;
    interview_date: string;
    interview_duration_seconds: number;
  };
  interview_summary: string;
  questions_and_answers: Array<{
    question: string;
    answer: string;
    evaluation: Evaluation;
    feedback: Feedback;
  }>;
  evaluation: Evaluation[];
  scores: Scores;
  strengths: string[];
  weaknesses: string[];
  improvement_plan: string[];
  improvement_roadmap?: {
    seven_day: RoadmapItem[];
    thirty_day: RoadmapItem[];
  };
  smart_recommendations?: string[];
  overall_recommendation: string;
}

export interface ReportResponse {
  interview_id: number;
  status: string;
  report: ReportContent | null;
}

export interface StoredInterview {
  profile: CandidateProfile;
  session: StartInterviewResponse;
}

export interface RoadmapItem {
  day: string;
  task: string;
}

export interface HistoryItem {
  interview_id: number;
  interview_date: string;
  candidate_name: string;
  role: string;
  difficulty: string;
  overall_score: number | null;
  interview_duration_seconds: number;
  status: string;
}

export interface AnalyticsResponse {
  average_score: number;
  best_category: string | null;
  weakest_category: string | null;
  number_of_interviews: number;
  average_interview_duration_seconds: number;
}

export interface TrendPoint {
  interview_id: number;
  date: string;
  overall: number;
  communication: number;
  confidence: number;
  professionalism: number;
  leadership: number;
  problem_solving: number;
}

export interface DashboardResponse {
  analytics: AnalyticsResponse;
  history: HistoryItem[];
  trends: TrendPoint[];
}
