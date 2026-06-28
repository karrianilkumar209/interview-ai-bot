from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database.session import get_db
from models.interview import Interview, Question
from schemas.interview import (
    AnswerRequest,
    AnswerResponse,
    AnalyticsResponse,
    DashboardResponse,
    FeedbackRead,
    HistoryItem,
    NextQuestionResponse,
    ReportResponse,
    ResultResponse,
    StartInterviewRequest,
    StartInterviewResponse,
)
from services.interview_service import InterviewService

router = APIRouter(tags=["interview"])


@router.post("/start-interview", response_model=StartInterviewResponse)
def start_interview(payload: StartInterviewRequest, db: Session = Depends(get_db)) -> StartInterviewResponse:
    interview = InterviewService(db).start_interview(
        name=payload.name,
        role=payload.role,
        years_of_experience=payload.years_of_experience,
        skills=payload.skills,
        difficulty=payload.difficulty,
        interview_type=payload.interview_type,
    )
    question = _current_question_or_404(interview)
    return StartInterviewResponse(
        interview_id=interview.id,
        candidate_id=interview.candidate_id,
        difficulty=interview.difficulty,
        interview_type=interview.interview_type,
        flow=interview.flow,
        total_questions=interview.total_questions,
        current_question=question,
    )


@router.post("/answer", response_model=AnswerResponse)
async def answer(payload: AnswerRequest, db: Session = Depends(get_db)) -> AnswerResponse:
    service = InterviewService(db)
    interview = _interview_or_404(service, payload.interview_id)
    try:
        saved_answer, next_question = await service.submit_answer(interview, payload.answer)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    refreshed = service.get_interview(payload.interview_id)
    return AnswerResponse(
        interview_id=payload.interview_id,
        question_id=saved_answer.question_id,
        completed=refreshed.status == "completed",
        evaluation=saved_answer.evaluation,
        feedback=FeedbackRead(**saved_answer.feedback),
        next_question=next_question,
    )


@router.get("/next-question", response_model=NextQuestionResponse)
def next_question(interview_id: int = Query(...), db: Session = Depends(get_db)) -> NextQuestionResponse:
    service = InterviewService(db)
    interview = _interview_or_404(service, interview_id)
    question = service.get_next_question(interview)
    return NextQuestionResponse(
        interview_id=interview.id,
        completed=question is None,
        question=question,
    )


@router.get("/result", response_model=ResultResponse)
def result(interview_id: int = Query(...), db: Session = Depends(get_db)) -> dict:
    service = InterviewService(db)
    interview = _interview_or_404(service, interview_id)
    return service.result_payload(interview)


@router.get("/report", response_model=ReportResponse)
def report(interview_id: int = Query(...), db: Session = Depends(get_db)) -> ReportResponse:
    service = InterviewService(db)
    interview = _interview_or_404(service, interview_id)
    return ReportResponse(
        interview_id=interview.id,
        status=interview.status,
        report=interview.report.content if interview.report else None,
    )


@router.get("/history", response_model=list[HistoryItem])
def history(db: Session = Depends(get_db)) -> list[dict]:
    return InterviewService(db).history_payload()


@router.get("/analytics", response_model=AnalyticsResponse)
def analytics(db: Session = Depends(get_db)) -> dict:
    return InterviewService(db).analytics_payload()


@router.get("/dashboard", response_model=DashboardResponse)
def dashboard(db: Session = Depends(get_db)) -> dict:
    return InterviewService(db).dashboard_payload()


def _interview_or_404(service: InterviewService, interview_id: int) -> Interview:
    interview = service.get_interview(interview_id)
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    return interview


def _current_question_or_404(interview: Interview) -> Question:
    if not interview.questions:
        raise HTTPException(status_code=500, detail="Interview has no questions")
    return interview.questions[interview.current_question_index]
