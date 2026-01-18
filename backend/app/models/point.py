from datetime import datetime
from .base import BaseDBModel

class Point(BaseDBModel):
    child_id: int
    amount: int
    reason: str
    source: str  # exercise, streak, goal, etc.

    class Config:
        schema_extra = {
            "example": {
                "child_id": 1,
                "amount": 10,
                "reason": "Hoàn thành bài tập Toán",
                "source": "exercise"
            }
        } 