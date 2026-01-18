from datetime import datetime
from bson import ObjectId
from typing import Optional, Dict, Any, List

class Reward:
    def __init__(self,
                 title: str,
                 description: str,
                 points_required: int,
                 quantity: int,
                 creator_id: str,
                 type: str = "PHYSICAL",  # PHYSICAL, DIGITAL, EXPERIENCE
                 status: str = "ACTIVE",  # ACTIVE, INACTIVE, SOLD_OUT
                 expiry_date: Optional[datetime] = None,
                 tags: Optional[List[str]] = None,
                 redemption_instructions: Optional[str] = None,
                 image_url: Optional[str] = None,
                 _id: Optional[ObjectId] = None,
                 created_at: Optional[datetime] = None,
                 updated_at: Optional[datetime] = None):
        self._id = _id or ObjectId()
        self.title = title
        self.description = description
        self.points_required = points_required
        self.quantity = quantity
        self.creator_id = creator_id
        self.type = type
        self.status = status
        self.expiry_date = expiry_date
        self.tags = tags or []
        self.redemption_instructions = redemption_instructions
        self.image_url = image_url
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": str(self._id),
            "title": self.title,
            "description": self.description,
            "points_required": self.points_required,
            "quantity": self.quantity,
            "creator_id": self.creator_id,
            "type": self.type,
            "status": self.status,
            "expiry_date": self.expiry_date.isoformat() if self.expiry_date else None,
            "tags": self.tags,
            "redemption_instructions": self.redemption_instructions,
            "image_url": self.image_url,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Reward':
        if '_id' in data:
            data['_id'] = ObjectId(data['_id']) if isinstance(data['_id'], str) else data['_id']
        if 'expiry_date' in data and data['expiry_date']:
            data['expiry_date'] = datetime.fromisoformat(data['expiry_date']) if isinstance(data['expiry_date'], str) else data['expiry_date']
        if 'created_at' in data:
            data['created_at'] = datetime.fromisoformat(data['created_at']) if isinstance(data['created_at'], str) else data['created_at']
        if 'updated_at' in data:
            data['updated_at'] = datetime.fromisoformat(data['updated_at']) if isinstance(data['updated_at'], str) else data['updated_at']
        return cls(**data)

    def update_status(self, new_status: str) -> None:
        """Cập nhật trạng thái phần thưởng"""
        valid_statuses = ["ACTIVE", "INACTIVE", "SOLD_OUT"]
        if new_status not in valid_statuses:
            raise ValueError(f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
        self.status = new_status
        self.updated_at = datetime.utcnow()

    def update_quantity(self, quantity: int) -> None:
        """Cập nhật số lượng phần thưởng"""
        if quantity < 0:
            raise ValueError("Quantity cannot be negative")
        self.quantity = quantity
        if self.quantity == 0:
            self.status = "SOLD_OUT"
        self.updated_at = datetime.utcnow()

    def decrease_quantity(self) -> None:
        """Giảm số lượng phần thưởng khi được đổi"""
        if self.quantity <= 0:
            raise ValueError("No rewards left")
        self.quantity -= 1
        if self.quantity == 0:
            self.status = "SOLD_OUT"
        self.updated_at = datetime.utcnow()

    def add_tag(self, tag: str) -> None:
        """Thêm tag cho phần thưởng"""
        if tag not in self.tags:
            self.tags.append(tag)
            self.updated_at = datetime.utcnow()

    def remove_tag(self, tag: str) -> None:
        """Xóa tag khỏi phần thưởng"""
        if tag in self.tags:
            self.tags.remove(tag)
            self.updated_at = datetime.utcnow()

    def is_available(self) -> bool:
        """Kiểm tra phần thưởng có còn khả dụng"""
        if self.status != "ACTIVE":
            return False
        if self.quantity <= 0:
            return False
        if self.expiry_date and datetime.utcnow() > self.expiry_date:
            return False
        return True 