from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from bson import ObjectId

class Exercise(BaseModel):
    _id: Optional[ObjectId] = Field(default_factory=ObjectId, alias="_id")
    child_id: str
    content: str
    subject: str
    difficulty: str
    is_completed: bool = False
    completed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {
            ObjectId: str,
            datetime: lambda dt: dt.isoformat()
        } 