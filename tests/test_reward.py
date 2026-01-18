import pytest
from datetime import datetime, timedelta
from bson import ObjectId
from app.models.reward import Reward
from app.services.reward_service import RewardService
from app.utils.exceptions import ValidationError, ResourceNotFoundError, AuthorizationError

class TestRewardModel:
    def test_reward_creation(self):
        """Test tạo phần thưởng mới"""
        reward = Reward(
            title="Test Reward",
            description="Test Description",
            points_required=100,
            quantity=10,
            creator_id="user123"
        )
        assert reward.title == "Test Reward"
        assert reward.description == "Test Description"
        assert reward.points_required == 100
        assert reward.quantity == 10
        assert reward.creator_id == "user123"
        assert reward.status == "ACTIVE"
        assert reward.type == "PHYSICAL"
        assert isinstance(reward._id, ObjectId)

    def test_reward_to_dict(self):
        """Test chuyển đổi phần thưởng sang dict"""
        reward = Reward(
            title="Test Reward",
            description="Test Description",
            points_required=100,
            quantity=10,
            creator_id="user123"
        )
        reward_dict = reward.to_dict()
        assert isinstance(reward_dict, dict)
        assert reward_dict["title"] == "Test Reward"
        assert reward_dict["status"] == "ACTIVE"
        assert reward_dict["type"] == "PHYSICAL"
        assert isinstance(reward_dict["id"], str)

    def test_update_status(self):
        """Test cập nhật trạng thái phần thưởng"""
        reward = Reward(
            title="Test Reward",
            description="Test Description",
            points_required=100,
            quantity=10,
            creator_id="user123"
        )
        reward.update_status("INACTIVE")
        assert reward.status == "INACTIVE"

        with pytest.raises(ValueError):
            reward.update_status("INVALID_STATUS")

    def test_update_quantity(self):
        """Test cập nhật số lượng phần thưởng"""
        reward = Reward(
            title="Test Reward",
            description="Test Description",
            points_required=100,
            quantity=10,
            creator_id="user123"
        )
        reward.update_quantity(5)
        assert reward.quantity == 5
        assert reward.status == "ACTIVE"

        reward.update_quantity(0)
        assert reward.quantity == 0
        assert reward.status == "SOLD_OUT"

        with pytest.raises(ValueError):
            reward.update_quantity(-1)

    def test_is_available(self):
        """Test kiểm tra phần thưởng có khả dụng"""
        reward = Reward(
            title="Test Reward",
            description="Test Description",
            points_required=100,
            quantity=10,
            creator_id="user123"
        )
        assert reward.is_available() == True

        # Test với số lượng = 0
        reward.quantity = 0
        assert reward.is_available() == False

        # Test với trạng thái không active
        reward.quantity = 10
        reward.status = "INACTIVE"
        assert reward.is_available() == False

        # Test với phần thưởng hết hạn
        reward.status = "ACTIVE"
        reward.expiry_date = datetime.utcnow() - timedelta(days=1)
        assert reward.is_available() == False

class MockRewardRepository:
    def __init__(self):
        self.rewards = {}

    def create(self, reward):
        self.rewards[str(reward._id)] = reward
        return reward

    def find_by_id(self, reward_id):
        return self.rewards.get(reward_id)

    def update(self, reward):
        if str(reward._id) in self.rewards:
            self.rewards[str(reward._id)] = reward
            return True
        return False

    def delete(self, reward_id):
        if reward_id in self.rewards:
            del self.rewards[reward_id]
            return True
        return False

class MockUserService:
    def __init__(self):
        self.users = {
            "user123": {"id": "user123", "points": 200},
            "user456": {"id": "user456", "points": 50}
        }

    def get_user_by_id(self, user_id):
        return self.users.get(user_id)

    def update_points(self, user_id, points):
        if user_id in self.users:
            self.users[user_id]["points"] += points
            return True
        return False

class TestRewardService:
    @pytest.fixture
    def reward_service(self):
        return RewardService(MockRewardRepository(), MockUserService())

    def test_create_reward(self, reward_service):
        """Test tạo phần thưởng mới qua service"""
        reward_data = {
            "title": "Test Reward",
            "description": "Test Description",
            "points_required": 100,
            "quantity": 10
        }
        reward = reward_service.create_reward("user123", reward_data)
        assert reward.title == "Test Reward"
        assert reward.creator_id == "user123"

        # Test với creator không tồn tại
        with pytest.raises(ValidationError):
            reward_service.create_reward("invalid_user", reward_data)

        # Test thiếu trường bắt buộc
        invalid_data = {"title": "Test Reward"}
        with pytest.raises(ValidationError):
            reward_service.create_reward("user123", invalid_data)

        # Test với points_required không hợp lệ
        invalid_data = {
            "title": "Test Reward",
            "description": "Test Description",
            "points_required": -100,
            "quantity": 10
        }
        with pytest.raises(ValidationError):
            reward_service.create_reward("user123", invalid_data)

    def test_redeem_reward(self, reward_service):
        """Test đổi phần thưởng"""
        # Tạo phần thưởng mới
        reward_data = {
            "title": "Test Reward",
            "description": "Test Description",
            "points_required": 100,
            "quantity": 2
        }
        reward = reward_service.create_reward("user123", reward_data)

        # Test đổi thưởng thành công
        redeemed_reward = reward_service.redeem_reward(str(reward._id), "user123")
        assert redeemed_reward.quantity == 1
        assert redeemed_reward.status == "ACTIVE"

        # Test với user không đủ điểm
        with pytest.raises(ValidationError):
            reward_service.redeem_reward(str(reward._id), "user456")

        # Test với phần thưởng hết hàng
        reward.quantity = 0
        reward_service.reward_repository.update(reward)
        with pytest.raises(ValidationError):
            reward_service.redeem_reward(str(reward._id), "user123")

        # Test với phần thưởng không tồn tại
        with pytest.raises(ResourceNotFoundError):
            reward_service.redeem_reward("invalid_reward_id", "user123") 