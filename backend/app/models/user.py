from typing import Optional
from pydantic import EmailStr
from .base import BaseDBModel

class User(BaseDBModel):
    email: EmailStr
    password_hash: str
    name: str
    role: str = "user"

    class Config:
        schema_extra = {
            "example": {
                "email": "user@example.com",
                "name": "John Doe",
                "role": "user"
            }
        } 