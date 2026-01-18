from datetime import datetime
from typing import Optional
from .base import BaseDBModel

class Goal(BaseDBModel):
    child_id: int
    target_points: int
    deadline: Optional[datetime] = None
    status: str  # active, completed, failed
    reward_points: int = 0

    class Config:
        schema_extra = {
            "example": {
                "child_id": 1,
                "target_points": 1000,
                "deadline": "2024-12-31T23:59:59",
                "status": "active",
                "reward_points": 100
            }
        } 