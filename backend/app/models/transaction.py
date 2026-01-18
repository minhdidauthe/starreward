from .base import BaseDBModel

class Transaction(BaseDBModel):
    child_id: int
    reward_id: int
    points_spent: int
    status: str  # pending, completed, cancelled

    class Config:
        schema_extra = {
            "example": {
                "child_id": 1,
                "reward_id": 1,
                "points_spent": 1000,
                "status": "pending"
            }
        } 