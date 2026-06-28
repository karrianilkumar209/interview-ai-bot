from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import interviews
from config.settings import get_settings
from database.base import Base
from database.session import engine

settings = get_settings()

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://interview-ai-bot-liart.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(interviews.router, prefix=settings.api_prefix)


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": settings.app_name,
    }