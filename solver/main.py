from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

app = FastAPI(title="Motion Scheduler Solver", version="1.0.0")

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Task(BaseModel):
    id: str
    title: str
    duration: int  # minutes
    priority: int
    deadline: Optional[str] = None


class ScheduleRequest(BaseModel):
    tasks: List[Task]
    available_slots: List[dict]  # time slots available for scheduling


class ScheduleResponse(BaseModel):
    scheduled_tasks: List[dict]
    message: str


@app.get("/")
async def root():
    return {"message": "Motion Scheduler Solver API"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/optimize", response_model=ScheduleResponse)
async def optimize_schedule(request: ScheduleRequest):
    """
    Optimize task scheduling using OR-Tools
    TODO: Implement OR-Tools optimization logic
    """
    # Placeholder response
    return ScheduleResponse(
        scheduled_tasks=[],
        message="Optimization service ready - OR-Tools integration pending"
    )


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)