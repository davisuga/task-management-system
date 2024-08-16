from typing import Optional

from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, ForeignKey, MetaData
from sqlalchemy.ext.declarative import declarative_base

metadata = MetaData()

Base = declarative_base(metadata=metadata)


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)


class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)


class UserCreate(BaseModel):
    name: str


class UserResponse(BaseModel):
    id: int
    name: str


class TaskCreate(BaseModel):
    title: str


class TaskResponse(BaseModel):
    id: int
    title: str
    assigned_to: Optional[int] = None
