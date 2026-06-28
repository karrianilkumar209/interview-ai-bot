from datetime import datetime
from statistics import mean

from sqlalchemy.orm import Session, joinedload

from agents.hr_interviewer import (
    CandidateProfile,
    DecisionAgent,
    FeedbackAgent,
    InterviewAgent,
    InterviewConductorAgent,
    InterviewPlannerAgent,
    ReportGeneratorAgent,
    ScoreAgent,
)
from models.interview import Answer, Candidate, Interview, InterviewLog, Question, Report, Score
from services.gemini_service import GeminiEvaluationService


class InterviewService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.planner = InterviewPlannerAgent()
        self.interview_agent = InterviewAgent()
        self.conductor = InterviewConductorAgent()
        self.decision_agent = DecisionAgent()
        self.feedback_agent = FeedbackAgent()
        self.score_agent = ScoreAgent()
        self.report_generator = ReportGeneratorAgent()
        self.evaluator = GeminiEvaluationService()

    def start_interview(
        self,
        name: str,
        role: str,
        years_of_experience: float,
        skills: list[str],
        difficulty: str | None = None,
        interview_type: str = "HR",
    ) -> Interview:
        clean_skills = [skill.strip() for skill in skills if skill.strip()]
        profile = CandidateProfile(
            name=name.strip(),
            role=role.strip(),
            years_of_experience=years_of_experience,
            skills=clean_skills,
            difficulty=difficulty,
            interview_type=interview_type,
        )
        plan = self.planner.plan(profile)
        first_question = self.interview_agent.generate_first_question(profile, plan)

        candidate = Candidate(
            name=profile.name,
            role=profile.role,
            years_of_experience=profile.years_of_experience,
            skills=profile.skills,
        )
        interview = Interview(
            candidate=candidate,
            role=profile.role,
            years_of_experience=profile.years_of_experience,
            skills=profile.skills,
            difficulty=plan["difficulty"],
            interview_type=plan["interview_type"],
            flow=plan["flow"],
            total_questions=plan["question_count"],
        )
        interview.questions = [
            Question(
                position=first_question["position"],
                category=first_question["category"],
                text=first_question["text"],
            )
        ]
        self.db.add(interview)
        self.db.flush()
        self._log(interview.id, "interview_started", "Interview created and first question generated.")
        self.db.commit()
        return self.get_interview(interview.id)

    def get_interview(self, interview_id: int) -> Interview | None:
        return (
            self.db.query(Interview)
            .options(
                joinedload(Interview.candidate),
                joinedload(Interview.questions),
                joinedload(Interview.answers).joinedload(Answer.question),
                joinedload(Interview.scores),
                joinedload(Interview.report),
            )
            .filter(Interview.id == interview_id)
            .first()
        )

    def get_next_question(self, interview: Interview) -> Question | None:
        if interview.status == "completed":
            return None
        return self.conductor.current_question(interview.questions, interview.current_question_index)

    async def submit_answer(self, interview: Interview, answer_text: str) -> tuple[Answer, Question | None]:
        if interview.status == "completed":
            self._log(interview.id, "answer_rejected", "Attempted to answer a completed interview.")
            self.db.commit()
            raise ValueError("Interview already completed")

        question = self.get_next_question(interview)
        if question is None:
            interview.status = "completed"
            self._log(interview.id, "answer_rejected", "No remaining questions were available.")
            self.db.commit()
            raise ValueError("No remaining questions")

        evaluation = await self.evaluator.evaluate_answer(
            role=interview.role,
            years_of_experience=interview.years_of_experience,
            skills=interview.skills,
            question=question.text,
            answer=answer_text,
            difficulty=interview.difficulty,
            interview_type=interview.interview_type,
        )
        feedback = self.feedback_agent.generate(evaluation)
        answer = Answer(
            interview_id=interview.id,
            question_id=question.id,
            text=answer_text,
            evaluation=evaluation,
            feedback=feedback,
        )
        self.db.add(answer)
        self.db.flush()
        self._log(interview.id, "answer_submitted", f"Answer stored for question {question.position}.")
        interview.current_question_index = self.conductor.advance(interview.current_question_index)
        self.db.flush()
        score_data = self._update_cumulative_scores(interview.id)

        if self.conductor.is_complete(interview.current_question_index, interview.total_questions):
            interview.status = "completed"
            interview.updated_at = datetime.utcnow()
            self.db.flush()
            self._finalize_interview(interview.id, score_data)
        else:
            next_question = await self._create_next_question(interview.id, question, answer_text, evaluation)
            self.db.add(next_question)
            self.db.flush()
            self._log(interview.id, "question_generated", f"Generated question {next_question.position}.")

        self.db.commit()
        refreshed = self.get_interview(interview.id)
        saved_answer = next(item for item in refreshed.answers if item.question_id == question.id)
        return saved_answer, self.get_next_question(refreshed)

    async def _create_next_question(
        self,
        interview_id: int,
        current_question: Question,
        answer_text: str,
        evaluation: dict,
    ) -> Question:
        interview = self.get_interview(interview_id)
        answered_count = len(interview.answers)
        fallback = self.decision_agent.local_decision(
            interview=interview,
            question=current_question,
            answer_text=answer_text,
            evaluation=evaluation,
            answered_count=answered_count,
        )
        decision = await self.evaluator.decide_next_question(
            interview=interview,
            answered_count=answered_count,
            current_question=current_question.text,
            answer=answer_text,
            evaluation=evaluation,
            fallback=fallback,
        )
        asked_questions = {item.text.strip().lower() for item in interview.questions}
        if decision["question"].strip().lower() in asked_questions:
            decision = fallback
        generated = self.interview_agent.generate_next_question(decision, position=len(interview.questions) + 1)
        return Question(
            interview_id=interview.id,
            position=generated["position"],
            category=generated["category"],
            text=generated["text"],
        )

    def _update_cumulative_scores(self, interview_id: int) -> dict:
        answers = self.db.query(Answer).filter(Answer.interview_id == interview_id).all()
        evaluations = [answer.evaluation for answer in answers]
        score_data = self.score_agent.generate(evaluations)
        score = self.db.query(Score).filter(Score.interview_id == interview_id).first()
        if not score:
            score = Score(interview_id=interview_id)
            self.db.add(score)

        score.communication = score_data["communication"]
        score.confidence = score_data["confidence"]
        score.technical_understanding = score_data["technical_understanding"]
        score.problem_solving = score_data["problem_solving"]
        score.professionalism = score_data["professionalism"]
        score.overall = score_data["overall"]
        score.details = score_data["details"]
        self.db.flush()
        return score_data

    def _finalize_interview(self, interview_id: int, score_data: dict) -> None:
        interview = self.get_interview(interview_id)
        answers = list(interview.answers)
        report_content = self.report_generator.generate(interview, answers, score_data)
        self.db.add(Report(interview_id=interview.id, content=report_content))
        self._log(interview.id, "interview_completed", "Final scores and report generated.")

    def result_payload(self, interview: Interview) -> dict:
        scores = None
        if interview.scores:
            scores = {
                "communication": interview.scores.communication,
                "confidence": interview.scores.confidence,
                "technical_understanding": interview.scores.technical_understanding,
                "problem_solving": interview.scores.problem_solving,
                "professionalism": interview.scores.professionalism,
                "leadership": interview.scores.details.get("leadership", 0) if interview.scores.details else 0,
                "overall": interview.scores.overall,
                "details": interview.scores.details,
            }
        return {
            "interview_id": interview.id,
            "status": interview.status,
            "scores": scores,
            "answers": [
                {
                    "question_id": answer.question_id,
                    "question": answer.question.text,
                    "answer": answer.text,
                    "evaluation": answer.evaluation,
                    "feedback": answer.feedback,
                    "created_at": answer.created_at,
                }
                for answer in interview.answers
            ],
        }

    def history_payload(self) -> list[dict]:
        interviews = (
            self.db.query(Interview)
            .options(joinedload(Interview.candidate), joinedload(Interview.scores))
            .order_by(Interview.created_at.desc())
            .all()
        )
        return [self._history_item(interview) for interview in interviews]

    def analytics_payload(self) -> dict:
        completed = (
            self.db.query(Interview)
            .options(joinedload(Interview.scores))
            .filter(Interview.status == "completed")
            .all()
        )
        scored = [interview for interview in completed if interview.scores]
        categories = {
            "Communication": [item.scores.communication for item in scored],
            "Confidence": [item.scores.confidence for item in scored],
            "Professionalism": [item.scores.professionalism for item in scored],
            "Leadership": [item.scores.details.get("leadership", 0) for item in scored if item.scores.details],
            "Problem Solving": [item.scores.problem_solving for item in scored],
        }
        category_averages = {
            category: round(mean(values), 1)
            for category, values in categories.items()
            if values
        }
        durations = [self._duration_seconds(interview) for interview in completed]
        return {
            "average_score": round(mean([item.scores.overall for item in scored]), 1) if scored else 0,
            "best_category": max(category_averages, key=category_averages.get) if category_averages else None,
            "weakest_category": min(category_averages, key=category_averages.get) if category_averages else None,
            "number_of_interviews": len(completed),
            "average_interview_duration_seconds": int(mean(durations)) if durations else 0,
        }

    def dashboard_payload(self) -> dict:
        history = self.history_payload()
        trend_interviews = (
            self.db.query(Interview)
            .options(joinedload(Interview.scores))
            .filter(Interview.status == "completed")
            .order_by(Interview.created_at.asc())
            .all()
        )
        trends = [
            {
                "interview_id": interview.id,
                "date": interview.created_at,
                "overall": interview.scores.overall,
                "communication": interview.scores.communication,
                "confidence": interview.scores.confidence,
                "professionalism": interview.scores.professionalism,
                "leadership": interview.scores.details.get("leadership", 0) if interview.scores.details else 0,
                "problem_solving": interview.scores.problem_solving,
            }
            for interview in trend_interviews
            if interview.scores
        ]
        return {
            "analytics": self.analytics_payload(),
            "history": history,
            "trends": trends,
        }

    def _history_item(self, interview: Interview) -> dict:
        return {
            "interview_id": interview.id,
            "interview_date": interview.created_at,
            "candidate_name": interview.candidate.name,
            "role": interview.role,
            "difficulty": interview.difficulty,
            "overall_score": interview.scores.overall if interview.scores else None,
            "interview_duration_seconds": self._duration_seconds(interview),
            "status": interview.status,
        }

    def _duration_seconds(self, interview: Interview) -> int:
        end_time = interview.updated_at or datetime.utcnow()
        return max(0, int((end_time - interview.created_at).total_seconds()))

    def _log(self, interview_id: int, event: str, message: str, metadata: dict | None = None) -> None:
        self.db.add(
            InterviewLog(
                interview_id=interview_id,
                event=event,
                message=message,
                log_metadata=metadata or {},
            )
        )
