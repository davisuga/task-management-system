import pytest
import requests


def test_create_and_assign_task():
    # Create a user
    user_response = requests.post(
        "http://localhost:8000/users", json={"name": "Test User"}
    )
    assert user_response.status_code == 200
    user_id = user_response.json()["id"]

    # Create a task
    task_response = requests.post(
        "http://localhost:8000/tasks", json={"title": "Test Task"}
    )
    assert task_response.status_code == 200
    task_id = task_response.json()["id"]

    # Assign the task to the user
    assign_response = requests.put(f"http://localhost:8000/tasks/{task_id}/assign/{user_id}")
    assert assign_response.status_code == 200

    # Verify the task is assigned
    task_response = requests.get(f"http://localhost:8000/tasks/{task_id}")
    assert task_response.status_code == 200
    assert task_response.json()["assigned_to"] == user_id

    # Unassign the task
    unassign_response = requests.put(f"http://localhost:8000/tasks/{task_id}/unassign")
    assert unassign_response.status_code == 200

    # Verify the task is unassigned
    task_response = requests.get(f"http://localhost:8000/tasks/{task_id}")
    assert task_response.status_code == 200
    assert task_response.json()["assigned_to"] is None

    # Delete the user
    delete_response = requests.delete(f"http://localhost:8000/users/{user_id}")
    assert delete_response.status_code == 200

    # Verify the user is deleted
    users_response = requests.get("http://localhost:8000/users")
    assert users_response.status_code == 200
    assert user_id not in [user["id"] for user in users_response.json()]
