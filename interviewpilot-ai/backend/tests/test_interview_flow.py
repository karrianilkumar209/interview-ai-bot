from fastapi.testclient import TestClient

from main import app


def test_complete_interview_flow():
    client = TestClient(app)

    start_response = client.post(
        "/api/v1/start-interview",
        json={
            "name": "Asha Kumar",
            "role": "Frontend Engineer",
            "years_of_experience": 1.5,
            "skills": ["React", "JavaScript", "Communication"],
        },
    )

    assert start_response.status_code == 200
    start_data = start_response.json()
    assert start_data["difficulty"] == "easy"
    assert start_data["total_questions"] == 5

    interview_id = start_data["interview_id"]
    for index in range(start_data["total_questions"]):
        answer_response = client.post(
            "/api/v1/answer",
            json={
                "interview_id": interview_id,
                "answer": (
                    "In a recent project, I worked with my team to solve a delivery challenge. "
                    "First, I clarified the priority, then I owned the React implementation, "
                    "communicated progress, and delivered a result that improved the user flow."
                ),
            },
        )
        assert answer_response.status_code == 200
        answer_data = answer_response.json()
        assert answer_data["evaluation"]["communication"] > 0
        assert answer_data["evaluation"]["grammar"] > 0
        assert answer_data["evaluation"]["leadership"] > 0
        assert answer_data["feedback"]["better_sample_answer"]
        assert answer_data["completed"] is (index == start_data["total_questions"] - 1)
        if not answer_data["completed"]:
            assert answer_data["next_question"]["position"] == index + 2
            assert "leading" in answer_data["next_question"]["text"].lower() or answer_data["next_question"]["text"]

    result_response = client.get("/api/v1/result", params={"interview_id": interview_id})
    assert result_response.status_code == 200
    result_data = result_response.json()
    assert result_data["status"] == "completed"
    assert result_data["scores"]["overall"] > 0
    assert len(result_data["answers"]) == start_data["total_questions"]

    report_response = client.get("/api/v1/report", params={"interview_id": interview_id})
    assert report_response.status_code == 200
    report_data = report_response.json()
    assert report_data["report"]["overall_recommendation"]
    assert report_data["report"]["candidate_details"]["name"] == "Asha Kumar"
    assert len(report_data["report"]["improvement_roadmap"]["seven_day"]) == 7
    assert len(report_data["report"]["improvement_roadmap"]["thirty_day"]) == 30
    assert report_data["report"]["smart_recommendations"]
    assert len(report_data["report"]["questions_and_answers"]) == start_data["total_questions"]

    history_response = client.get("/api/v1/history")
    assert history_response.status_code == 200
    history_data = history_response.json()
    assert any(item["interview_id"] == interview_id for item in history_data)

    analytics_response = client.get("/api/v1/analytics")
    assert analytics_response.status_code == 200
    analytics_data = analytics_response.json()
    assert analytics_data["number_of_interviews"] >= 1
    assert analytics_data["average_score"] > 0

    dashboard_response = client.get("/api/v1/dashboard")
    assert dashboard_response.status_code == 200
    dashboard_data = dashboard_response.json()
    assert dashboard_data["history"]
    assert dashboard_data["trends"]
