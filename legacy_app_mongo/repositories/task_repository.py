from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from app.models.task import Task
from pymongo.collection import Collection
from pymongo.database import Database

class TaskRepository:
    def __init__(self, db: Database):
        self.collection: Collection = db.tasks
        self._ensure_indexes()

    def _ensure_indexes(self) -> None:
        """Tạo các indexes cần thiết cho collection"""
        self.collection.create_index("creator_id")
        self.collection.create_index("assignee_id")
        self.collection.create_index("status")
        self.collection.create_index("due_date")
        self.collection.create_index("priority")
        self.collection.create_index([("title", "text"), ("description", "text")])

    def create(self, task: Task) -> Task:
        """Tạo task mới"""
        result = self.collection.insert_one(task.__dict__)
        task._id = result.inserted_id
        return task

    def find_by_id(self, task_id: str) -> Optional[Task]:
        """Tìm task theo ID"""
        data = self.collection.find_one({"_id": ObjectId(task_id)})
        return Task.from_dict(data) if data else None

    def update(self, task: Task) -> bool:
        """Cập nhật thông tin task"""
        result = self.collection.update_one(
            {"_id": task._id},
            {"$set": task.__dict__}
        )
        return result.modified_count > 0

    def delete(self, task_id: str) -> bool:
        """Xóa task"""
        result = self.collection.delete_one({"_id": ObjectId(task_id)})
        return result.deleted_count > 0

    def list_tasks(self, skip: int = 0, limit: int = 20) -> List[Task]:
        """Lấy danh sách tasks với phân trang"""
        tasks_data = self.collection.find().skip(skip).limit(limit)
        return [Task.from_dict(data) for data in tasks_data]

    def find_by_creator(self, creator_id: str, skip: int = 0, limit: int = 20) -> List[Task]:
        """Tìm tasks theo người tạo"""
        tasks_data = self.collection.find({"creator_id": creator_id}).skip(skip).limit(limit)
        return [Task.from_dict(data) for data in tasks_data]

    def find_by_assignee(self, assignee_id: str, skip: int = 0, limit: int = 20) -> List[Task]:
        """Tìm tasks theo người được gán"""
        tasks_data = self.collection.find({"assignee_id": assignee_id}).skip(skip).limit(limit)
        return [Task.from_dict(data) for data in tasks_data]

    def find_by_status(self, status: str, skip: int = 0, limit: int = 20) -> List[Task]:
        """Tìm tasks theo trạng thái"""
        tasks_data = self.collection.find({"status": status}).skip(skip).limit(limit)
        return [Task.from_dict(data) for data in tasks_data]

    def find_by_priority(self, priority: str, skip: int = 0, limit: int = 20) -> List[Task]:
        """Tìm tasks theo độ ưu tiên"""
        tasks_data = self.collection.find({"priority": priority}).skip(skip).limit(limit)
        return [Task.from_dict(data) for data in tasks_data]

    def search(self, query: str, skip: int = 0, limit: int = 20) -> List[Task]:
        """Tìm kiếm tasks theo từ khóa"""
        tasks_data = self.collection.find(
            {"$text": {"$search": query}}
        ).skip(skip).limit(limit)
        return [Task.from_dict(data) for data in tasks_data]

    def find_overdue_tasks(self, skip: int = 0, limit: int = 20) -> List[Task]:
        """Tìm các tasks đã quá hạn"""
        tasks_data = self.collection.find({
            "due_date": {"$lt": datetime.utcnow()},
            "status": {"$nin": ["COMPLETED", "CANCELLED"]}
        }).skip(skip).limit(limit)
        return [Task.from_dict(data) for data in tasks_data]

    def find_by_tag(self, tag: str, skip: int = 0, limit: int = 20) -> List[Task]:
        """Tìm tasks theo tag"""
        tasks_data = self.collection.find(
            {"tags": tag}
        ).skip(skip).limit(limit)
        return [Task.from_dict(data) for data in tasks_data] 