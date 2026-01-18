from typing import Optional, Dict, List
from datetime import datetime
from app.models.task import Task
from app.repositories.task_repository import TaskRepository
from app.services.user_service import UserService
from app.utils.exceptions import ValidationError, ResourceNotFoundError, AuthorizationError

class TaskService:
    def __init__(self, task_repository: TaskRepository, user_service: UserService):
        self.task_repository = task_repository
        self.user_service = user_service

    def create_task(self, creator_id: str, task_data: Dict) -> Task:
        """Tạo task mới"""
        # Kiểm tra creator có tồn tại
        creator = self.user_service.get_user_by_id(creator_id)
        if not creator:
            raise ValidationError("Creator not found")

        # Validate task data
        required_fields = ["title", "description", "points"]
        for field in required_fields:
            if field not in task_data:
                raise ValidationError(f"Missing required field: {field}")

        # Tạo task mới
        task = Task(
            title=task_data["title"],
            description=task_data["description"],
            points=task_data["points"],
            creator_id=creator_id,
            due_date=datetime.fromisoformat(task_data["due_date"]) if "due_date" in task_data else None,
            tags=task_data.get("tags", []),
            priority=task_data.get("priority", "MEDIUM"),
            completion_criteria=task_data.get("completion_criteria", {})
        )
        return self.task_repository.create(task)

    def get_task_by_id(self, task_id: str) -> Optional[Task]:
        """Lấy thông tin task theo ID"""
        task = self.task_repository.find_by_id(task_id)
        if not task:
            raise ResourceNotFoundError("Task not found")
        return task

    def update_task(self, task_id: str, user_id: str, task_data: Dict) -> Task:
        """Cập nhật thông tin task"""
        task = self.get_task_by_id(task_id)
        
        # Kiểm tra quyền cập nhật
        if task.creator_id != user_id and task.assignee_id != user_id:
            raise AuthorizationError("You don't have permission to update this task")

        # Cập nhật các trường được phép
        updatable_fields = ["title", "description", "points", "due_date", "tags", "priority", "completion_criteria"]
        for field in updatable_fields:
            if field in task_data:
                if field == "due_date" and task_data[field]:
                    setattr(task, field, datetime.fromisoformat(task_data[field]))
                else:
                    setattr(task, field, task_data[field])

        if not self.task_repository.update(task):
            raise ResourceNotFoundError("Task not found")
        return task

    def delete_task(self, task_id: str, user_id: str) -> bool:
        """Xóa task"""
        task = self.get_task_by_id(task_id)
        
        # Kiểm tra quyền xóa
        if task.creator_id != user_id:
            raise AuthorizationError("You don't have permission to delete this task")

        return self.task_repository.delete(task_id)

    def assign_task(self, task_id: str, assigner_id: str, assignee_id: str) -> Task:
        """Gán task cho user"""
        task = self.get_task_by_id(task_id)
        
        # Kiểm tra quyền gán task
        if task.creator_id != assigner_id:
            raise AuthorizationError("You don't have permission to assign this task")

        # Kiểm tra assignee có tồn tại
        assignee = self.user_service.get_user_by_id(assignee_id)
        if not assignee:
            raise ValidationError("Assignee not found")

        task.assign_to(assignee_id)
        if not self.task_repository.update(task):
            raise ResourceNotFoundError("Task not found")
        return task

    def update_task_status(self, task_id: str, user_id: str, new_status: str) -> Task:
        """Cập nhật trạng thái task"""
        task = self.get_task_by_id(task_id)
        
        # Kiểm tra quyền cập nhật trạng thái
        if task.creator_id != user_id and task.assignee_id != user_id:
            raise AuthorizationError("You don't have permission to update this task's status")

        task.update_status(new_status)
        if not self.task_repository.update(task):
            raise ResourceNotFoundError("Task not found")

        # Nếu task hoàn thành, cộng điểm cho assignee
        if new_status == "COMPLETED" and task.assignee_id:
            self.user_service.update_points(task.assignee_id, task.points)

        return task

    def list_tasks(self, skip: int = 0, limit: int = 20) -> List[Task]:
        """Lấy danh sách tasks"""
        return self.task_repository.list_tasks(skip, limit)

    def get_user_tasks(self, user_id: str, skip: int = 0, limit: int = 20) -> List[Task]:
        """Lấy danh sách tasks của user (bao gồm cả tạo và được gán)"""
        created_tasks = self.task_repository.find_by_creator(user_id, skip, limit)
        assigned_tasks = self.task_repository.find_by_assignee(user_id, skip, limit)
        # Kết hợp và loại bỏ trùng lặp
        all_tasks = {str(task._id): task for task in created_tasks + assigned_tasks}
        return list(all_tasks.values())

    def search_tasks(self, query: str, skip: int = 0, limit: int = 20) -> List[Task]:
        """Tìm kiếm tasks theo từ khóa"""
        return self.task_repository.search(query, skip, limit)

    def get_overdue_tasks(self, skip: int = 0, limit: int = 20) -> List[Task]:
        """Lấy danh sách tasks quá hạn"""
        return self.task_repository.find_overdue_tasks(skip, limit)

    def get_tasks_by_tag(self, tag: str, skip: int = 0, limit: int = 20) -> List[Task]:
        """Lấy danh sách tasks theo tag"""
        return self.task_repository.find_by_tag(tag, skip, limit) 