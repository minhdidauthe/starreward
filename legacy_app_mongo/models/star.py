from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from bson import ObjectId

class Star(BaseModel):
    _id: Optional[ObjectId] = Field(default_factory=ObjectId, alias="_id")
    child_id: str
    amount: int
    reason: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {
            ObjectId: str,
            datetime: lambda dt: dt.isoformat()
        } 