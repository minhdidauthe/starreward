import pytest
from datetime import datetime, timedelta
from bson import ObjectId
from app.models.task import Task
from app.services.task_service import TaskService
from app.utils.exceptions import ValidationError, ResourceNotFoundError, AuthorizationError

class TestTaskModel:
    def test_task_creation(self):
        """Test tạo task mới"""
        task = Task(
            title="Test Task",
            description="Test Description",
            points=100,
            creator_id="user123"
        )
        assert task.title == "Test Task"
        assert task.description == "Test Description"
        assert task.points == 100
        assert task.creator_id == "user123"
        assert task.status == "PENDING"
        assert task.priority == "MEDIUM"
        assert isinstance(task._id, ObjectId)

    def test_task_to_dict(self):
        """Test chuyển đổi task sang dict"""
        task = Task(
            title="Test Task",
            description="Test Description",
            points=100,
            creator_id="user123"
        )
        task_dict = task.to_dict()
        assert isinstance(task_dict, dict)
        assert task_dict["title"] == "Test Task"
        assert task_dict["status"] == "PENDING"
        assert task_dict["priority"] == "MEDIUM"
        assert isinstance(task_dict["id"], str)

    def test_update_status(self):
        """Test cập nhật trạng thái task"""
        task = Task(
            title="Test Task",
            description="Test Description",
            points=100,
            creator_id="user123"
        )
        task.update_status("IN_PROGRESS")
        assert task.status == "IN_PROGRESS"

        with pytest.raises(ValueError):
            task.update_status("INVALID_STATUS")

    def test_update_priority(self):
        """Test cập nhật độ ưu tiên task"""
        task = Task(
            title="Test Task",
            description="Test Description",
            points=100,
            creator_id="user123"
        )
        task.update_priority("HIGH")
        assert task.priority == "HIGH"

        with pytest.raises(ValueError):
            task.update_priority("INVALID_PRIORITY")

class MockTaskRepository:
    def __init__(self):
        self.tasks = {}

    def create(self, task):
        self.tasks[str(task._id)] = task
        return task

    def find_by_id(self, task_id):
        return self.tasks.get(task_id)

    def update(self, task):
        if str(task._id) in self.tasks:
            self.tasks[str(task._id)] = task
            return True
        return False

    def delete(self, task_id):
        if task_id in self.tasks:
            del self.tasks[task_id]
            return True
        return False

class MockUserService:
    def __init__(self):
        self.users = {
            "user123": {"id": "user123", "points": 0},
            "user456": {"id": "user456", "points": 100}
        }

    def get_user_by_id(self, user_id):
        return self.users.get(user_id)

    def update_points(self, user_id, points):
        if user_id in self.users:
            self.users[user_id]["points"] += points
            return True
        return False

class TestTaskService:
    @pytest.fixture
    def task_service(self):
        return TaskService(MockTaskRepository(), MockUserService())

    def test_create_task(self, task_service):
        """Test tạo task mới qua service"""
        task_data = {
            "title": "Test Task",
            "description": "Test Description",
            "points": 100
        }
        task = task_service.create_task("user123", task_data)
        assert task.title == "Test Task"
        assert task.creator_id == "user123"

        # Test với creator không tồn tại
        with pytest.raises(ValidationError):
            task_service.create_task("invalid_user", task_data)

        # Test thiếu trường bắt buộc
        invalid_data = {"title": "Test Task"}
        with pytest.raises(ValidationError):
            task_service.create_task("user123", invalid_data)

    def test_update_task_status(self, task_service):
        """Test cập nhật trạng thái task và tính điểm"""
        # Tạo task mới
        task_data = {
            "title": "Test Task",
            "description": "Test Description",
            "points": 100
        }
        task = task_service.create_task("user123", task_data)
        task.assignee_id = "user456"

        # Cập nhật trạng thái thành COMPLETED
        updated_task = task_service.update_task_status(str(task._id), "user456", "COMPLETED")
        assert updated_task.status == "COMPLETED"

        # Test với user không có quyền
        with pytest.raises(AuthorizationError):
            task_service.update_task_status(str(task._id), "invalid_user", "COMPLETED")

        # Test với task không tồn tại
        with pytest.raises(ResourceNotFoundError):
            task_service.update_task_status("invalid_task_id", "user123", "COMPLETED") 