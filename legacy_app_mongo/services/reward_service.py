from typing import Optional, Dict, List
from datetime import datetime
from app.models.reward import Reward
from app.repositories.reward_repository import RewardRepository
from app.services.user_service import UserService
from app.utils.exceptions import ValidationError, ResourceNotFoundError, AuthorizationError

class RewardService:
    def __init__(self, reward_repository: RewardRepository, user_service: UserService):
        self.reward_repository = reward_repository
        self.user_service = user_service

    def create_reward(self, creator_id: str, reward_data: Dict) -> Reward:
        """Tạo phần thưởng mới"""
        # Kiểm tra creator có tồn tại
        creator = self.user_service.get_user_by_id(creator_id)
        if not creator:
            raise ValidationError("Creator not found")

        # Validate reward data
        required_fields = ["title", "description", "points_required", "quantity"]
        for field in required_fields:
            if field not in reward_data:
                raise ValidationError(f"Missing required field: {field}")

        # Validate points_required và quantity
        if reward_data["points_required"] <= 0:
            raise ValidationError("Points required must be positive")
        if reward_data["quantity"] < 0:
            raise ValidationError("Quantity cannot be negative")

        # Tạo phần thưởng mới
        reward = Reward(
            title=reward_data["title"],
            description=reward_data["description"],
            points_required=reward_data["points_required"],
            quantity=reward_data["quantity"],
            creator_id=creator_id,
            type=reward_data.get("type", "PHYSICAL"),
            expiry_date=datetime.fromisoformat(reward_data["expiry_date"]) if "expiry_date" in reward_data else None,
            tags=reward_data.get("tags", []),
            redemption_instructions=reward_data.get("redemption_instructions"),
            image_url=reward_data.get("image_url")
        )
        return self.reward_repository.create(reward)

    def get_reward_by_id(self, reward_id: str) -> Optional[Reward]:
        """Lấy thông tin phần thưởng theo ID"""
        reward = self.reward_repository.find_by_id(reward_id)
        if not reward:
            raise ResourceNotFoundError("Reward not found")
        return reward

    def update_reward(self, reward_id: str, user_id: str, reward_data: Dict) -> Reward:
        """Cập nhật thông tin phần thưởng"""
        reward = self.get_reward_by_id(reward_id)
        
        # Kiểm tra quyền cập nhật
        if reward.creator_id != user_id:
            raise AuthorizationError("You don't have permission to update this reward")

        # Cập nhật các trường được phép
        updatable_fields = ["title", "description", "points_required", "quantity", "type", 
                          "expiry_date", "tags", "redemption_instructions", "image_url"]
        for field in updatable_fields:
            if field in reward_data:
                if field == "expiry_date" and reward_data[field]:
                    setattr(reward, field, datetime.fromisoformat(reward_data[field]))
                else:
                    setattr(reward, field, reward_data[field])

        if not self.reward_repository.update(reward):
            raise ResourceNotFoundError("Reward not found")
        return reward

    def delete_reward(self, reward_id: str, user_id: str) -> bool:
        """Xóa phần thưởng"""
        reward = self.get_reward_by_id(reward_id)
        
        # Kiểm tra quyền xóa
        if reward.creator_id != user_id:
            raise AuthorizationError("You don't have permission to delete this reward")

        return self.reward_repository.delete(reward_id)

    def update_reward_status(self, reward_id: str, user_id: str, new_status: str) -> Reward:
        """Cập nhật trạng thái phần thưởng"""
        reward = self.get_reward_by_id(reward_id)
        
        # Kiểm tra quyền cập nhật trạng thái
        if reward.creator_id != user_id:
            raise AuthorizationError("You don't have permission to update this reward's status")

        reward.update_status(new_status)
        if not self.reward_repository.update(reward):
            raise ResourceNotFoundError("Reward not found")
        return reward

    def redeem_reward(self, reward_id: str, user_id: str) -> Reward:
        """Đổi phần thưởng"""
        reward = self.get_reward_by_id(reward_id)
        user = self.user_service.get_user_by_id(user_id)

        # Kiểm tra phần thưởng có khả dụng
        if not reward.is_available():
            raise ValidationError("Reward is not available")

        # Kiểm tra user có đủ điểm
        if user.points < reward.points_required:
            raise ValidationError("Insufficient points")

        # Thực hiện đổi thưởng
        reward.decrease_quantity()
        if not self.reward_repository.update(reward):
            raise ResourceNotFoundError("Reward not found")

        # Trừ điểm của user
        self.user_service.update_points(user_id, -reward.points_required)

        return reward

    def list_rewards(self, skip: int = 0, limit: int = 20) -> List[Reward]:
        """Lấy danh sách phần thưởng"""
        return self.reward_repository.list_rewards(skip, limit)

    def get_available_rewards(self, skip: int = 0, limit: int = 20) -> List[Reward]:
        """Lấy danh sách phần thưởng còn khả dụng"""
        return self.reward_repository.find_available_rewards(skip, limit)

    def search_rewards(self, query: str, skip: int = 0, limit: int = 20) -> List[Reward]:
        """Tìm kiếm phần thưởng theo từ khóa"""
        return self.reward_repository.search(query, skip, limit)

    def get_rewards_by_points_range(self, min_points: int, max_points: int, skip: int = 0, limit: int = 20) -> List[Reward]:
        """Lấy danh sách phần thưởng theo khoảng điểm"""
        return self.reward_repository.find_by_points_range(min_points, max_points, skip, limit)

    def get_rewards_by_type(self, type: str, skip: int = 0, limit: int = 20) -> List[Reward]:
        """Lấy danh sách phần thưởng theo loại"""
        return self.reward_repository.find_by_type(type, skip, limit)

    def get_rewards_by_tag(self, tag: str, skip: int = 0, limit: int = 20) -> List[Reward]:
        """Lấy danh sách phần thưởng theo tag"""
        return self.reward_repository.find_by_tag(tag, skip, limit) 