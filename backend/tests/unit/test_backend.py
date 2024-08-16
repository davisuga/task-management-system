import pytest
from fastapi.testclient import TestClient
from server import app

client = TestClient(app)


def test_create_user():
    response = client.post("/users", json={"name": "Test User"})
    assert response.status_code == 200
    assert response.json()["name"] == "Test User"


def test_create_task():
    response = client.post("/tasks", json={"title": "Test Task"})
    assert response.status_code == 200
    assert response.json()["title"] == "Test Task"


def test_assign_task():
    user_response = client.post("/users", json={"name": "Test User"})
    user_id = user_response.json()["id"]
    task_response = client.post("/tasks", json={"title": "Test Task"})
    task_id = task_response.json()["id"]

    response = client.put(f"/tasks/{task_id}/assign/{user_id}")
    assert response.status_code == 200

    task_response = client.get(f"/tasks/{task_id}")
    assert task_response.json()["assigned_to"] == user_id


def test_unassign_task():
    task_response = client.post("/tasks", json={"title": "Test Task"})
    task_id = task_response.json()["id"]

    response = client.put(f"/tasks/{task_id}/unassign")
    assert response.status_code == 200

    task_response = client.get(f"/tasks/{task_id}")
    assert task_response.json()["assigned_to"] is None
