from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import relationship

from database.session import Base


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(160), nullable=False)
    role = Column(String(160), nullable=False)
    years_of_experience = Column(Float, nullable=False)
    skills = Column(JSON, nullable=False, default=list)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    interviews = relationship("Interview", back_populates="candidate", cascade="all, delete-orphan")


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id"), nullable=False, index=True)
    role = Column(String(160), nullable=False)
    years_of_experience = Column(Float, nullable=False)
    skills = Column(JSON, nullable=False, default=list)
    difficulty = Column(String(40), nullable=False)
    interview_type = Column(String(40), default="HR", nullable=False)
    flow = Column(JSON, nullable=False)
    total_questions = Column(Integer, nullable=False)
    current_question_index = Column(Integer, default=0, nullable=False)
    status = Column(String(40), default="in_progress", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    candidate = relationship("Candidate", back_populates="interviews")
    questions = relationship(
        "Question",
        back_populates="interview",
        cascade="all, delete-orphan",
        order_by="Question.position",
    )
    answers = relationship(
        "Answer",
        back_populates="interview",
        cascade="all, delete-orphan",
        order_by="Answer.question_id",
    )
    scores = relationship("Score", back_populates="interview", cascade="all, delete-orphan", uselist=False)
    report = relationship("Report", back_populates="interview", cascade="all, delete-orphan", uselist=False)
    logs = relationship("InterviewLog", back_populates="interview", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id"), nullable=False, index=True)
    position = Column(Integer, nullable=False)
    text = Column(Text, nullable=False)
    category = Column(String(80), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    interview = relationship("Interview", back_populates="questions")
    answer = relationship("Answer", back_populates="question", cascade="all, delete-orphan", uselist=False)


class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id"), nullable=False, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False, unique=True, index=True)
    text = Column(Text, nullable=False)
    evaluation = Column(JSON, nullable=False)
    feedback = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    interview = relationship("Interview", back_populates="answers")
    question = relationship("Question", back_populates="answer")


class Score(Base):
    __tablename__ = "scores"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id"), nullable=False, unique=True, index=True)
    communication = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False)
    technical_understanding = Column(Float, nullable=False)
    problem_solving = Column(Float, nullable=False)
    professionalism = Column(Float, nullable=False)
    overall = Column(Float, nullable=False)
    details = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    interview = relationship("Interview", back_populates="scores")


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id"), nullable=False, unique=True, index=True)
    content = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    interview = relationship("Interview", back_populates="report")


class InterviewLog(Base):
    __tablename__ = "interview_logs"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id"), nullable=False, index=True)
    event = Column(String(80), nullable=False)
    message = Column(Text, nullable=False)
    log_metadata = Column("metadata", JSON, nullable=False, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    interview = relationship("Interview", back_populates="logs")
