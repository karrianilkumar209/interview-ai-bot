from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field, field_validator


class StartInterviewRequest(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    role: str = Field(min_length=2, max_length=160)
    years_of_experience: float = Field(ge=0, le=60)
    skills: list[str] = Field(min_length=1, max_length=20)
    difficulty: str | None = Field(default=None, max_length=40)
    interview_type: str = Field(default="HR", max_length=40)

    @field_validator("name", "role", "interview_type")
    @classmethod
    def strip_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Field cannot be empty")
        return value

    @field_validator("difficulty")
    @classmethod
    def validate_difficulty(cls, value: str | None) -> str | None:
        if value is None:
            return value
        clean = value.strip()
        if clean.lower() not in {"easy", "medium", "hard"}:
            raise ValueError("Difficulty must be Easy, Medium, or Hard")
        return clean

    @field_validator("interview_type")
    @classmethod
    def validate_interview_type(cls, value: str) -> str:
        clean = value.strip()
        if clean.lower() not in {"hr", "behavioral", "mixed"}:
            raise ValueError("Interview type must be HR, Behavioral, or Mixed")
        return clean

    @field_validator("skills")
    @classmethod
    def validate_skills(cls, value: list[str]) -> list[str]:
        clean = [skill.strip() for skill in value if skill.strip()]
        if not clean:
            raise ValueError("Add at least one skill")
        return clean[:20]


class QuestionRead(BaseModel):
    id: int
    position: int
    category: str
    text: str

    model_config = {"from_attributes": True}


class StartInterviewResponse(BaseModel):
    interview_id: int
    candidate_id: int
    difficulty: str
    interview_type: str
    flow: list[str]
    total_questions: int
    current_question: QuestionRead


class AnswerRequest(BaseModel):
    interview_id: int
    answer: str = Field(min_length=3, max_length=6000)

    @field_validator("answer")
    @classmethod
    def strip_answer(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 3:
            raise ValueError("Answer must contain at least 3 characters")
        return value


class EvaluationRead(BaseModel):
    communication: float
    grammar: float
    confidence: float
    clarity: float
    structure: float
    professionalism: float
    completeness: float
    relevance: float
    depth: float
    technical_understanding: float
    problem_solving: float
    leadership: float
    summary: str
    positive_feedback: list[str]
    weak_points: list[str]
    suggestions: list[str]
    better_sample_answer: str


class FeedbackRead(BaseModel):
    positive_feedback: list[str]
    weak_points: list[str]
    suggestions: list[str]
    better_sample_answer: str


class AnswerResponse(BaseModel):
    interview_id: int
    question_id: int
    completed: bool
    evaluation: EvaluationRead
    feedback: FeedbackRead
    next_question: QuestionRead | None = None


class NextQuestionResponse(BaseModel):
    interview_id: int
    completed: bool
    question: QuestionRead | None = None


class ScoreRead(BaseModel):
    communication: float
    confidence: float
    technical_understanding: float
    problem_solving: float
    professionalism: float
    leadership: float = 0
    overall: float
    details: dict[str, Any] = Field(default_factory=dict)


class AnswerRead(BaseModel):
    question_id: int
    question: str
    answer: str
    evaluation: dict[str, Any]
    feedback: dict[str, Any]
    created_at: datetime


class ResultResponse(BaseModel):
    interview_id: int
    status: str
    scores: ScoreRead | None = None
    answers: list[AnswerRead]


class ReportResponse(BaseModel):
    interview_id: int
    status: str
    report: dict[str, Any] | None = None


class HistoryItem(BaseModel):
    interview_id: int
    interview_date: datetime
    candidate_name: str
    role: str
    difficulty: str
    overall_score: float | None = None
    interview_duration_seconds: int
    status: str


class AnalyticsResponse(BaseModel):
    average_score: float
    best_category: str | None
    weakest_category: str | None
    number_of_interviews: int
    average_interview_duration_seconds: int


class TrendPoint(BaseModel):
    interview_id: int
    date: datetime
    overall: float
    communication: float
    confidence: float
    professionalism: float
    leadership: float
    problem_solving: float


class DashboardResponse(BaseModel):
    analytics: AnalyticsResponse
    history: list[HistoryItem]
    trends: list[TrendPoint]
