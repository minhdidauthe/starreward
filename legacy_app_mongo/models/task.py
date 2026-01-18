from datetime import datetime
from bson import ObjectId
from typing import Optional, Dict, Any, List

class Task:
    def __init__(self,
                 title: str,
                 description: str,
                 points: int,
                 creator_id: str,
                 assignee_id: Optional[str] = None,
                 status: str = "PENDING",
                 due_date: Optional[datetime] = None,
                 tags: Optional[List[str]] = None,
                 priority: str = "MEDIUM",
                 completion_criteria: Optional[Dict] = None,
                 _id: Optional[ObjectId] = None,
                 created_at: Optional[datetime] = None,
                 updated_at: Optional[datetime] = None):
        self._id = _id or ObjectId()
        self.title = title
        self.description = description
        self.points = points
        self.creator_id = creator_id
        self.assignee_id = assignee_id
        self.status = status
        self.due_date = due_date
        self.tags = tags or []
        self.priority = priority
        self.completion_criteria = completion_criteria or {}
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": str(self._id),
            "title": self.title,
            "description": self.description,
            "points": self.points,
            "creator_id": self.creator_id,
            "assignee_id": self.assignee_id,
            "status": self.status,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "tags": self.tags,
            "priority": self.priority,
            "completion_criteria": self.completion_criteria,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'Task':
        if '_id' in data:
            data['_id'] = ObjectId(data['_id']) if isinstance(data['_id'], str) else data['_id']
        if 'due_date' in data and data['due_date']:
            data['due_date'] = datetime.fromisoformat(data['due_date']) if isinstance(data['due_date'], str) else data['due_date']
        if 'created_at' in data:
            data['created_at'] = datetime.fromisoformat(data['created_at']) if isinstance(data['created_at'], str) else data['created_at']
        if 'updated_at' in data:
            data['updated_at'] = datetime.fromisoformat(data['updated_at']) if isinstance(data['updated_at'], str) else data['updated_at']
        return cls(**data)

    def update_status(self, new_status: str) -> None:
        """Cập nhật trạng thái task"""
        valid_statuses = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]
        if new_status not in valid_statuses:
            raise ValueError(f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
        self.status = new_status
        self.updated_at = datetime.utcnow()

    def assign_to(self, user_id: str) -> None:
        """Gán task cho user"""
        self.assignee_id = user_id
        self.updated_at = datetime.utcnow()

    def update_priority(self, new_priority: str) -> None:
        """Cập nhật độ ưu tiên của task"""
        valid_priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"]
        if new_priority not in valid_priorities:
            raise ValueError(f"Invalid priority. Must be one of: {', '.join(valid_priorities)}")
        self.priority = new_priority
        self.updated_at = datetime.utcnow()

    def add_tag(self, tag: str) -> None:
        """Thêm tag cho task"""
        if tag not in self.tags:
            self.tags.append(tag)
            self.updated_at = datetime.utcnow()

    def remove_tag(self, tag: str) -> None:
        """Xóa tag khỏi task"""
        if tag in self.tags:
            self.tags.remove(tag)
            self.updated_at = datetime.utcnow()

    def update_completion_criteria(self, criteria: Dict) -> None:
        """Cập nhật tiêu chí hoàn thành task"""
        self.completion_criteria.update(criteria)
        self.updated_at = datetime.utcnow() 