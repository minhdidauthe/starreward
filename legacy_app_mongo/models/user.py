from datetime import datetime
from bson import ObjectId
import bcrypt
from typing import Optional, Dict, Any

class User:
    def __init__(self, 
                 email: str,
                 password: str,
                 name: str,
                 total_points: int = 0,
                 tier: str = "BRONZE",
                 profile: Optional[Dict] = None,
                 preferences: Optional[Dict] = None,
                 _id: Optional[ObjectId] = None,
                 created_at: Optional[datetime] = None,
                 updated_at: Optional[datetime] = None):
        self._id = _id or ObjectId()
        self.email = email
        self.password_hash = self._hash_password(password)
        self.name = name
        self.total_points = total_points
        self.tier = tier
        self.profile = profile or {}
        self.preferences = preferences or {"notification_enabled": True, "language": "vi"}
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()

    @staticmethod
    def _hash_password(password: str) -> str:
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    def verify_password(self, password: str) -> bool:
        return bcrypt.checkpw(
            password.encode('utf-8'),
            self.password_hash.encode('utf-8')
        )

    def update_points(self, points: int) -> None:
        self.total_points += points
        self.updated_at = datetime.utcnow()
        self._update_tier()

    def _update_tier(self) -> None:
        if self.total_points >= 10000:
            self.tier = "PLATINUM"
        elif self.total_points >= 5000:
            self.tier = "GOLD"
        elif self.total_points >= 1000:
            self.tier = "SILVER"
        else:
            self.tier = "BRONZE"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": str(self._id),
            "email": self.email,
            "name": self.name,
            "total_points": self.total_points,
            "tier": self.tier,
            "profile": self.profile,
            "preferences": self.preferences,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'User':
        if '_id' in data:
            data['_id'] = ObjectId(data['_id']) if isinstance(data['_id'], str) else data['_id']
        return cls(**data)

    def update_profile(self, profile_data: Dict[str, Any]) -> None:
        self.profile.update(profile_data)
        self.updated_at = datetime.utcnow()

    def update_preferences(self, preferences_data: Dict[str, Any]) -> None:
        self.preferences.update(preferences_data)
        self.updated_at = datetime.utcnow() 