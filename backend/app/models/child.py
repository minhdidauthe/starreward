from typing import Optional
from .base import BaseDBModel

class Child(BaseDBModel):
    user_id: int
    name: str
    age: int
    gender: Optional[str] = None

    class Config:
        schema_extra = {
            "example": {
                "user_id": 1,
                "name": "Alice",
                "age": 8,
                "gender": "female"
            }
        } 