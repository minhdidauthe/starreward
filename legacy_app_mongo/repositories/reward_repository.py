from typing import Optional, List
from datetime import datetime
from bson import ObjectId
from app.models.reward import Reward
from pymongo.collection import Collection
from pymongo.database import Database

class RewardRepository:
    def __init__(self, db: Database):
        self.collection: Collection = db.rewards
        self._ensure_indexes()

    def _ensure_indexes(self) -> None:
        """Tạo các indexes cần thiết cho collection"""
        self.collection.create_index("creator_id")
        self.collection.create_index("status")
        self.collection.create_index("type")
        self.collection.create_index("points_required")
        self.collection.create_index("expiry_date")
        self.collection.create_index([("title", "text"), ("description", "text")])

    def create(self, reward: Reward) -> Reward:
        """Tạo phần thưởng mới"""
        result = self.collection.insert_one(reward.__dict__)
        reward._id = result.inserted_id
        return reward

    def find_by_id(self, reward_id: str) -> Optional[Reward]:
        """Tìm phần thưởng theo ID"""
        data = self.collection.find_one({"_id": ObjectId(reward_id)})
        return Reward.from_dict(data) if data else None

    def update(self, reward: Reward) -> bool:
        """Cập nhật thông tin phần thưởng"""
        result = self.collection.update_one(
            {"_id": reward._id},
            {"$set": reward.__dict__}
        )
        return result.modified_count > 0

    def delete(self, reward_id: str) -> bool:
        """Xóa phần thưởng"""
        result = self.collection.delete_one({"_id": ObjectId(reward_id)})
        return result.deleted_count > 0

    def list_rewards(self, skip: int = 0, limit: int = 20) -> List[Reward]:
        """Lấy danh sách phần thưởng với phân trang"""
        rewards_data = self.collection.find().skip(skip).limit(limit)
        return [Reward.from_dict(data) for data in rewards_data]

    def find_by_creator(self, creator_id: str, skip: int = 0, limit: int = 20) -> List[Reward]:
        """Tìm phần thưởng theo người tạo"""
        rewards_data = self.collection.find({"creator_id": creator_id}).skip(skip).limit(limit)
        return [Reward.from_dict(data) for data in rewards_data]

    def find_by_status(self, status: str, skip: int = 0, limit: int = 20) -> List[Reward]:
        """Tìm phần thưởng theo trạng thái"""
        rewards_data = self.collection.find({"status": status}).skip(skip).limit(limit)
        return [Reward.from_dict(data) for data in rewards_data]

    def find_by_type(self, type: str, skip: int = 0, limit: int = 20) -> List[Reward]:
        """Tìm phần thưởng theo loại"""
        rewards_data = self.collection.find({"type": type}).skip(skip).limit(limit)
        return [Reward.from_dict(data) for data in rewards_data]

    def find_by_points_range(self, min_points: int, max_points: int, skip: int = 0, limit: int = 20) -> List[Reward]:
        """Tìm phần thưởng theo khoảng điểm"""
        rewards_data = self.collection.find({
            "points_required": {
                "$gte": min_points,
                "$lte": max_points
            }
        }).skip(skip).limit(limit)
        return [Reward.from_dict(data) for data in rewards_data]

    def search(self, query: str, skip: int = 0, limit: int = 20) -> List[Reward]:
        """Tìm kiếm phần thưởng theo từ khóa"""
        rewards_data = self.collection.find(
            {"$text": {"$search": query}}
        ).skip(skip).limit(limit)
        return [Reward.from_dict(data) for data in rewards_data]

    def find_available_rewards(self, skip: int = 0, limit: int = 20) -> List[Reward]:
        """Tìm các phần thưởng còn khả dụng"""
        rewards_data = self.collection.find({
            "status": "ACTIVE",
            "quantity": {"$gt": 0},
            "$or": [
                {"expiry_date": None},
                {"expiry_date": {"$gt": datetime.utcnow()}}
            ]
        }).skip(skip).limit(limit)
        return [Reward.from_dict(data) for data in rewards_data]

    def find_by_tag(self, tag: str, skip: int = 0, limit: int = 20) -> List[Reward]:
        """Tìm phần thưởng theo tag"""
        rewards_data = self.collection.find(
            {"tags": tag}
        ).skip(skip).limit(limit)
        return [Reward.from_dict(data) for data in rewards_data] 