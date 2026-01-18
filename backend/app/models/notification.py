from .base import BaseDBModel

class Notification(BaseDBModel):
    user_id: int
    title: str
    message: str
    type: str  # points, reward, goal, etc.
    is_read: bool = False

    class Config:
        schema_extra = {
            "example": {
                "user_id": 1,
                "title": "Chúc mừng!",
                "message": "Bạn đã nhận được 10 sao",
                "type": "points",
                "is_read": False
            }
        } 