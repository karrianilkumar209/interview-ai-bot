from __future__ import annotations

from dataclasses import dataclass
from statistics import mean


@dataclass(frozen=True)
class CandidateProfile:
    name: str
    role: str
    years_of_experience: float
    skills: list[str]
    difficulty: str | None = None
    interview_type: str = "HR"


class InterviewPlannerAgent:
    def plan(self, profile: CandidateProfile) -> dict:
        difficulty = self._normalize_difficulty(profile)
        question_count = self._question_count(profile.years_of_experience, difficulty)
        flow = self._flow(profile)
        return {
            "difficulty": difficulty,
            "interview_type": profile.interview_type,
            "question_count": question_count,
            "flow": flow,
            "strategy": {
                "role": profile.role,
                "experience": profile.years_of_experience,
                "skills_to_probe": profile.skills,
                "interview_type": profile.interview_type,
                "questioning_style": self._questioning_style(difficulty),
                "topic_order": flow,
            },
        }

    def first_question(self, profile: CandidateProfile, plan: dict) -> dict[str, str | int]:
        role = profile.role
        if plan["interview_type"].lower() == "behavioral":
            text = f"Tell me about yourself through one professional experience that shows why you are ready for this {role} role."
        else:
            text = f"Tell me about yourself and what makes you a strong fit for this {role} role."
        return {"position": 1, "category": "Introduction", "text": text}

    def _normalize_difficulty(self, profile: CandidateProfile) -> str:
        if profile.difficulty:
            value = profile.difficulty.lower()
            if value in {"easy", "medium", "hard"}:
                return value
        if profile.years_of_experience < 2:
            return "easy"
        if profile.years_of_experience < 6:
            return "medium"
        return "hard"

    def _question_count(self, years: float, difficulty: str) -> int:
        if difficulty == "easy":
            return 5
        if difficulty == "hard" or years >= 6:
            return 7
        return 6

    def _flow(self, profile: CandidateProfile) -> list[str]:
        base = ["Introduction", "Communication", "Problem Solving", "Teamwork", "Conflict Handling"]
        if profile.years_of_experience >= 2:
            base.append("Leadership")
        if profile.interview_type.lower() == "mixed":
            base.insert(3, "Role and Skill Fit")
        return [*base, "Career Goals", "Closing"]

    def _questioning_style(self, difficulty: str) -> str:
        if difficulty == "easy":
            return "Supportive HR interviewer. Ask clear, confidence-building questions with simple follow-ups."
        if difficulty == "hard":
            return "Senior HR interviewer. Probe decisions, tradeoffs, ownership, ambiguity, and measurable impact."
        return "Professional HR interviewer. Balance behavioral depth with practical role fit."


class InterviewAgent:
    def generate_first_question(self, profile: CandidateProfile, plan: dict) -> dict[str, str | int]:
        return InterviewPlannerAgent().first_question(profile, plan)

    def generate_next_question(self, decision: dict, position: int) -> dict[str, str | int]:
        return {
            "position": position,
            "category": decision.get("next_topic", "Follow-up"),
            "text": decision["question"],
        }


class InterviewConductorAgent:
    def current_question(self, questions: list, current_index: int):
        if current_index >= len(questions):
            return None
        return questions[current_index]

    def advance(self, current_index: int) -> int:
        return current_index + 1

    def is_complete(self, current_index: int, total_questions: int) -> bool:
        return current_index >= total_questions


class DecisionAgent:
    def local_decision(self, interview, question, answer_text: str, evaluation: dict, answered_count: int) -> dict:
        answer_lower = answer_text.lower()
        avg_score = self._average_score(evaluation)
        remaining_slots = interview.total_questions - answered_count
        used_topics = {item.category.lower() for item in interview.questions}
        flow_topics = [topic for topic in interview.flow if topic.lower() not in used_topics]

        if remaining_slots <= 1:
            topic = "Closing"
            question_text = f"Why should we hire you for this {interview.role} role, and what final message would you like us to remember?"
            action = "move_to_next_topic"
        elif any(token in answer_lower for token in ["led", "lead", "managed", "owned", "college project"]):
            topic = "Leadership"
            question_text = "What challenges did you face while leading that team, and how did you handle them?"
            action = "ask_follow_up"
        elif any(token in answer_lower for token in ["conflict", "disagreement", "stakeholder", "teammate"]):
            topic = "Conflict Handling"
            question_text = "How did you keep the relationship professional while resolving that conflict?"
            action = "explore_strong_topic" if avg_score >= 7 else "ask_easier_question"
        elif avg_score < 5:
            topic = question.category
            question_text = "Could you share a simpler, specific example with the situation, your action, and the result?"
            action = "ask_easier_question"
        elif avg_score >= 8:
            topic = "Problem Solving"
            question_text = "That sounds strong. What was the hardest tradeoff you made, and what did you learn from the result?"
            action = "ask_harder_question"
        else:
            topic = flow_topics[0] if flow_topics else "Career Goals"
            question_text = self._topic_question(interview.role, topic)
            action = "move_to_next_topic"

        return {
            "decision": action,
            "next_topic": topic,
            "question": question_text,
            "reason": "Generated from previous answer content, score pattern, and remaining interview strategy.",
        }

    def _average_score(self, evaluation: dict) -> float:
        keys = ["communication", "confidence", "clarity", "professionalism", "completeness", "depth", "relevance"]
        values = [float(evaluation.get(key, 0)) for key in keys]
        return mean(values) if values else 0

    def _topic_question(self, role: str, topic: str) -> str:
        questions = {
            "Communication": "Describe a time you had to explain something important clearly to another person or team.",
            "Problem Solving": "Tell me about a difficult problem you solved. What options did you consider?",
            "Teamwork": "Tell me about a time you worked with a team to complete an important goal.",
            "Conflict Handling": "Describe a disagreement at work or in a project. How did you resolve it?",
            "Leadership": "Tell me about a time you showed leadership or ownership without being directly asked.",
            "Role and Skill Fit": f"Which skill will help you contribute fastest in this {role} role, and why?",
            "Career Goals": f"Where do you want your career to go, and how does this {role} role fit that plan?",
        }
        return questions.get(topic, f"What is one professional example that shows your fit for this {role} role?")


class FeedbackAgent:
    def generate(self, evaluation: dict) -> dict:
        return {
            "positive_feedback": evaluation.get("positive_feedback", evaluation.get("strengths", [])),
            "weak_points": evaluation.get("weak_points", evaluation.get("weaknesses", [])),
            "suggestions": evaluation.get("suggestions", evaluation.get("improvement_tips", [])),
            "better_sample_answer": evaluation.get("better_sample_answer", evaluation.get("ideal_answer", "")),
        }


class ScoreAgent:
    def generate(self, evaluations: list[dict]) -> dict:
        if not evaluations:
            return self._blank_scores()

        scores = {
            "communication": self._average(evaluations, "communication"),
            "confidence": self._average(evaluations, "confidence"),
            "problem_solving": self._average(evaluations, "problem_solving"),
            "leadership": self._average(evaluations, "leadership"),
            "professionalism": self._average(evaluations, "professionalism"),
        }
        scores["technical_understanding"] = round((scores["problem_solving"] + self._average(evaluations, "relevance")) / 2, 1)
        scores["overall"] = round(
            mean(
                [
                    scores["communication"],
                    scores["confidence"],
                    scores["problem_solving"],
                    scores["leadership"],
                    scores["professionalism"],
                ]
            ),
            1,
        )
        scores["details"] = {
            "basis": "Cumulative average updated from every answer evaluation.",
            "leadership": scores["leadership"],
        }
        return scores

    def _average(self, evaluations: list[dict], key: str) -> float:
        return round(mean(float(item.get(key, 0)) for item in evaluations), 1)

    def _blank_scores(self) -> dict:
        return {
            "communication": 0,
            "confidence": 0,
            "technical_understanding": 0,
            "problem_solving": 0,
            "leadership": 0,
            "professionalism": 0,
            "overall": 0,
            "details": {"basis": "No answers submitted.", "leadership": 0},
        }


class ReportGeneratorAgent:
    def generate(self, interview, answers: list, score_data: dict) -> dict:
        strengths = self._unique_items([item.evaluation.get("positive_feedback", []) for item in answers])
        weaknesses = self._unique_items([item.evaluation.get("weak_points", []) for item in answers])
        improvements = self._unique_items([item.feedback.get("suggestions", []) for item in answers])
        recommendation = self._recommendation(score_data["overall"])
        category_scores = self._category_scores(score_data)
        duration_seconds = max(0, int((interview.updated_at - interview.created_at).total_seconds()))
        return {
            "candidate_details": {
                "name": interview.candidate.name,
                "role": interview.role,
                "years_of_experience": interview.years_of_experience,
                "skills": interview.skills,
                "difficulty": interview.difficulty,
                "interview_type": interview.interview_type,
                "interview_date": interview.created_at.isoformat(),
                "interview_duration_seconds": duration_seconds,
            },
            "interview_summary": (
                f"{interview.candidate.name} completed a {interview.difficulty} {interview.interview_type} "
                f"interview for {interview.role}. The interview adapted each question based on prior answers."
            ),
            "questions_and_answers": [
                {
                    "question": answer.question.text,
                    "answer": answer.text,
                    "evaluation": answer.evaluation,
                    "feedback": answer.feedback,
                }
                for answer in answers
            ],
            "evaluation": [answer.evaluation for answer in answers],
            "scores": score_data,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "improvement_plan": improvements
            or [
                "Prepare concise STAR stories for common HR themes.",
                "Add measurable results and role-specific impact to each answer.",
            ],
            "improvement_roadmap": {
                "seven_day": self._roadmap(weaknesses, 7),
                "thirty_day": self._roadmap(weaknesses, 30),
            },
            "smart_recommendations": self._recommendations(weaknesses, category_scores),
            "overall_recommendation": recommendation,
        }

    def _unique_items(self, groups: list[list[str]]) -> list[str]:
        items: list[str] = []
        for group in groups:
            for item in group:
                if item and item not in items:
                    items.append(item)
        return items[:6]

    def _recommendation(self, overall: float) -> str:
        if overall >= 8:
            return "Strong hiring signal. Recommend moving the candidate to the next round."
        if overall >= 6:
            return "Moderate hiring signal. Recommend another round after targeted preparation."
        return "Needs more preparation before advancing."

    def _category_scores(self, score_data: dict) -> dict[str, float]:
        return {
            "communication": float(score_data.get("communication", 0)),
            "confidence": float(score_data.get("confidence", 0)),
            "professionalism": float(score_data.get("professionalism", 0)),
            "leadership": float(score_data.get("details", {}).get("leadership", 0)),
            "problem_solving": float(score_data.get("problem_solving", 0)),
        }

    def _roadmap(self, weaknesses: list[str], days: int) -> list[dict[str, str]]:
        core = [
            "Practice a concise self introduction with role-specific positioning.",
            "Write two STAR stories with situation, task, action, and result.",
            "Record one answer and improve clarity, pace, and filler words.",
            "Run a mock interview and ask for feedback on confidence.",
            "Prepare behavioral answers for conflict, ownership, and teamwork.",
            "Add measurable outcomes to every major project story.",
            "Review HR questions and rehearse a strong closing answer.",
        ]
        weakness_text = " ".join(weaknesses).lower()
        if "lead" in weakness_text or "ownership" in weakness_text:
            core[4] = "Prepare leadership stories that show ownership, mentoring, and decisions."
        if "communication" in weakness_text or "clarity" in weakness_text:
            core[2] = "Practice communication drills: slow pace, clear structure, and direct conclusions."
        if "example" in weakness_text or "measurable" in weakness_text:
            core[5] = "Rewrite answers with metrics, business impact, and lessons learned."
        return [{"day": f"Day {day}", "task": core[(day - 1) % len(core)]} for day in range(1, days + 1)]

    def _recommendations(self, weaknesses: list[str], category_scores: dict[str, float]) -> list[str]:
        recommendations: list[str] = []
        weakness_text = " ".join(weaknesses).lower()
        if category_scores.get("communication", 0) < 7 or "communication" in weakness_text or "clarity" in weakness_text:
            recommendations.append("Communication practice: rehearse short, structured answers with clear conclusions.")
        if category_scores.get("leadership", 0) < 7 or "lead" in weakness_text or "ownership" in weakness_text:
            recommendations.append("Leadership practice: prepare examples about ownership, mentoring, conflict, and decisions.")
        if category_scores.get("confidence", 0) < 7 or "confidence" in weakness_text:
            recommendations.append("Confidence improvement: record mock answers and replace hesitant language with direct statements.")
        if "behavioral" in weakness_text or "star" in weakness_text or "example" in weakness_text:
            recommendations.append("Behavioral interview preparation: build STAR stories for teamwork, failure, conflict, and achievement.")
        recommendations.append("HR interview tips: connect every answer to the target role, impact, and learning.")
        return self._unique_items([recommendations])
