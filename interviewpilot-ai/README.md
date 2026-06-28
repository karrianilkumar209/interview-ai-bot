# InterviewPilot AI

InterviewPilot AI is an MVP multi-agent HR interview system built with React, Vite, TailwindCSS, TypeScript, Axios, React Router, FastAPI, SQLite, SQLAlchemy, Pydantic, and Google Gemini.

The app runs a realistic HR interview flow: a candidate enters their profile, agents plan the interview, ask one question at a time, evaluate each answer, provide coaching feedback, score the interview, and generate a final report.

## Agents

- Interview Planner Agent: selects difficulty, interview flow, and question count.
- Question Generator Agent: creates realistic HR questions from role, experience, and skills.
- Interview Conductor Agent: presents one question, stores answers, and advances the interview.
- Answer Evaluation Agent: uses Gemini when configured and returns detailed evaluation JSON.
- Feedback Agent: generates positive feedback, weak points, suggestions, and a better sample answer.
- Score Agent: scores communication, confidence, technical understanding, problem solving, professionalism, and overall performance.
- Report Generator Agent: creates the final report with summary, answers, evaluations, scores, strengths, weaknesses, improvement plan, and recommendation.

## Project Structure

```text
interviewpilot-ai/
  frontend/
    src/
      components/
      hooks/
      pages/
      services/
      types/
      utils/
  backend/
    api/
    agents/
    config/
    database/
    models/
    schemas/
    services/
    tests/
```

## Backend Setup

```bash
cd interviewpilot-ai
python -m venv .venv
.venv\Scripts\activate
pip install -r backend/requirements.txt
copy backend\.env.example .env
uvicorn backend.main:app --reload
```

Set `GEMINI_API_KEY` in `.env` to use Gemini. If it is empty, the backend uses a deterministic local evaluator so the MVP still works.

API docs:

```text
http://localhost:8000/docs
```

## Frontend Setup

```bash
cd interviewpilot-ai/frontend
npm install
copy .env.example .env
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

Frontend pages:

```text
/
/setup
/interview
/result
/report
```

## API

All routes are under `/api/v1`.

```text
POST /start-interview
POST /answer
GET /next-question?interview_id=1
GET /result?interview_id=1
GET /report?interview_id=1
```

## Environment Variables

Backend:

```env
ENVIRONMENT=development
DATABASE_URL=sqlite:///./interviewpilot.db
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash
CORS_ORIGINS=["http://localhost:5173","http://127.0.0.1:5173"]
```

Frontend:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

## Test

```bash
cd interviewpilot-ai
pytest backend/tests
```
