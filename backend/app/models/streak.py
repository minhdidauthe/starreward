from datetime import date
from .base import BaseDBModel
from typing import Optional

class Streak(BaseDBModel):
    child_id: int
    current_streak: int = 0
    longest_streak: int = 0
    last_activity_date: Optional[date] = None

    class Config:
        schema_extra = {
            "example": {
                "child_id": 1,
                "current_streak": 5,
                "longest_streak": 10,
                "last_activity_date": "2024-03-20"
            }
        } 