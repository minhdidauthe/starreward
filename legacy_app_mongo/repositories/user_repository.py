from typing import Optional, List
from bson import ObjectId
from app.models.user import User
from pymongo.collection import Collection
from pymongo.database import Database

class UserRepository:
    def __init__(self, db: Database):
        self.collection: Collection = db.users
        self._ensure_indexes()

    def _ensure_indexes(self) -> None:
        """Tạo các indexes cần thiết cho collection"""
        self.collection.create_index("email", unique=True)
        self.collection.create_index("total_points")
        self.collection.create_index("tier")

    def create(self, user: User) -> User:
        """Tạo user mới"""
        result = self.collection.insert_one(user.__dict__)
        user._id = result.inserted_id
        return user

    def find_by_id(self, user_id: str) -> Optional[User]:
        """Tìm user theo ID"""
        data = self.collection.find_one({"_id": ObjectId(user_id)})
        return User.from_dict(data) if data else None

    def find_by_email(self, email: str) -> Optional[User]:
        """Tìm user theo email"""
        data = self.collection.find_one({"email": email})
        return User.from_dict(data) if data else None

    def update(self, user: User) -> bool:
        """Cập nhật thông tin user"""
        result = self.collection.update_one(
            {"_id": user._id},
            {"$set": user.__dict__}
        )
        return result.modified_count > 0

    def delete(self, user_id: str) -> bool:
        """Xóa user"""
        result = self.collection.delete_one({"_id": ObjectId(user_id)})
        return result.deleted_count > 0

    def list_users(self, skip: int = 0, limit: int = 20) -> List[User]:
        """Lấy danh sách users với phân trang"""
        users_data = self.collection.find().skip(skip).limit(limit)
        return [User.from_dict(data) for data in users_data]

    def find_by_tier(self, tier: str, skip: int = 0, limit: int = 20) -> List[User]:
        """Tìm users theo tier"""
        users_data = self.collection.find({"tier": tier}).skip(skip).limit(limit)
        return [User.from_dict(data) for data in users_data]

    def update_points(self, user_id: str, points: int) -> bool:
        """Cập nhật điểm cho user"""
        user = self.find_by_id(user_id)
        if not user:
            return False
        
        user.update_points(points)
        return self.update(user)

    def update_profile(self, user_id: str, profile_data: dict) -> bool:
        """Cập nhật profile cho user"""
        user = self.find_by_id(user_id)
        if not user:
            return False
        
        user.update_profile(profile_data)
        return self.update(user)

    def update_preferences(self, user_id: str, preferences_data: dict) -> bool:
        """Cập nhật preferences cho user"""
        user = self.find_by_id(user_id)
        if not user:
            return False
        
        user.update_preferences(preferences_data)
        return self.update(user) 