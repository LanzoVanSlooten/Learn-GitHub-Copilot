import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)


def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert "Chess Club" in data
    assert "Programming Class" in data


def test_signup_for_activity():
    email = "testuser@mergington.edu"
    activity = "Chess Club"
    # First signup should succeed
    response = client.post(f"/activities/{activity}/signup?email={email}")
    assert response.status_code == 200
    assert email in client.get("/activities").json()[activity]["participants"]
    # Second signup should fail (already signed up)
    response = client.post(f"/activities/{activity}/signup?email={email}")
    assert response.status_code == 400


def test_unregister_participant():
    email = "testuser@mergington.edu"
    activity = "Chess Club"
    # Unregister should succeed
    response = client.post(f"/activities/{activity}/unregister?email={email}")
    assert response.status_code == 200
    assert email not in client.get("/activities").json()[activity]["participants"]
    # Unregister again should fail
    response = client.post(f"/activities/{activity}/unregister?email={email}")
    assert response.status_code == 404
