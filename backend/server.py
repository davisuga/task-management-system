import asyncpg
from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from pydantic import BaseModel
from typing import List, Optional
from databases import Database
from fastapi.middleware.cors import CORSMiddleware

from models import User, Task, UserCreate, UserResponse, TaskCreate, TaskResponse

app = FastAPI()

DATABASE_URL = "postgresql://user:password@db/taskmanagement"
database = Database(DATABASE_URL)

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await database.connect()


@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()


@app.post("/users", response_model=UserResponse)
async def create_user(user: UserCreate):
    query = User.__table__.insert().values(name=user.name)
    user_id = await database.execute(query)
    return {**user.dict(), "id": user_id}


@app.get("/users", response_model=List[UserResponse])
async def read_users():
    query = User.__table__.select()
    return await database.fetch_all(query)


@app.delete("/users/{user_id}")
async def delete_user(user_id: int):
    query = User.__table__.delete().where(User.id == user_id)
    try:
        await database.execute(query)
    except asyncpg.exceptions.ForeignKeyViolationError:
        raise HTTPException(status_code=400, detail="Cannot delete user with tasks")
    return {"message": "User deleted"}


@app.delete("/tasks/{task_id}")
async def delete_task(task_id: int):
    query = Task.__table__.delete().where(Task.id == task_id)
    await database.execute(query)
    return {"message": "Task deleted"}


@app.post("/tasks", response_model=TaskResponse)
async def create_task(task: TaskCreate):
    query = Task.__table__.insert().values(title=task.title)
    task_id = await database.execute(query)
    return {**task.dict(), "id": task_id}


@app.get("/tasks", response_model=List[TaskResponse])
async def read_tasks():
    query = Task.__table__.select()
    return await database.fetch_all(query)


@app.put("/tasks/{task_id}/assign/{user_id}")
async def assign_task(task_id: int, user_id: int):
    task_query = Task.__table__.select().where(Task.id == task_id)
    task = await database.fetch_one(task_query)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    user_query = User.__table__.select().where(User.id == user_id)
    user = await database.fetch_one(user_query)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    query = (
        Task.__table__.update().where(Task.id == task_id).values(assigned_to=user_id)
    )
    await database.execute(query)
    return {"message": "Task assigned"}


@app.put("/tasks/{task_id}/unassign")
async def unassign_task(task_id: int):
    task_query = Task.__table__.select().where(Task.id == task_id)
    task = await database.fetch_one(task_query)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    query = Task.__table__.update().where(Task.id == task_id).values(assigned_to=None)
    await database.execute(query)
    return {"message": "Task unassigned"}

@app.get("/tasks/{task_id}", response_model=TaskResponse)
async def read_task(task_id: int):
    query = Task.__table__.select().where(Task.id == task_id)
    task = await database.fetch_one(query)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
