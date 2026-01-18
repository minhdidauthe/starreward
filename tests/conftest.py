import pytest
import mongomock
from app import create_app
from app.models.user import User
from app.models.task import Task
from app.models.reward import Reward

@pytest.fixture
def app():
    """Tạo ứng dụng Flask với MongoDB mock cho testing"""
    app = create_app('testing')
    app.mongo_db = mongomock.MongoClient().db
    return app

@pytest.fixture
def client(app):
    """Tạo test client"""
    return app.test_client()

@pytest.fixture
def mongo(app):
    """Trả về MongoDB mock instance"""
    return app.mongo_db

@pytest.fixture
def sample_user(mongo):
    """Tạo một user mẫu"""
    user = User(
        email="test@example.com",
        password="password123",
        name="Test User"
    )
    mongo.users.insert_one(user.__dict__)
    return user

@pytest.fixture
def sample_task(mongo, sample_user):
    """Tạo một task mẫu"""
    task = Task(
        title="Test Task",
        description="Test Description",
        points=100,
        creator_id=str(sample_user._id)
    )
    mongo.tasks.insert_one(task.__dict__)
    return task

@pytest.fixture
def sample_reward(mongo, sample_user):
    """Tạo một phần thưởng mẫu"""
    reward = Reward(
        title="Test Reward",
        description="Test Description",
        points_required=100,
        quantity=10,
        creator_id=str(sample_user._id)
    )
    mongo.rewards.insert_one(reward.__dict__)
    return reward 