from typing import Optional
from .base import BaseDBModel

class Reward(BaseDBModel):
    name: str
    description: Optional[str] = None
    point_cost: int
    stock: int = 0
    image_url: Optional[str] = None
    is_active: bool = True

    class Config:
        schema_extra = {
            "example": {
                "name": "Đồ chơi Lego",
                "description": "Bộ xếp hình Lego 1000 mảnh",
                "point_cost": 1000,
                "stock": 10,
                "image_url": "https://example.com/lego.jpg",
                "is_active": True
            }
        } 