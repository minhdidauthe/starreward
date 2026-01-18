from typing import Optional, Dict, List, Tuple
import jwt
from datetime import datetime, timedelta
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.utils.exceptions import AuthenticationError, ValidationError

class UserService:
    def __init__(self, user_repository: UserRepository, config: Dict):
        self.user_repository = user_repository
        self.config = config

    def register(self, email: str, password: str, name: str) -> User:
        """Đăng ký user mới"""
        # Kiểm tra email đã tồn tại
        if self.user_repository.find_by_email(email):
            raise ValidationError("Email already exists")

        # Tạo user mới
        user = User(email=email, password=password, name=name)
        return self.user_repository.create(user)

    def login(self, email: str, password: str) -> Tuple[User, str]:
        """Đăng nhập và trả về user cùng access token"""
        user = self.user_repository.find_by_email(email)
        if not user or not user.verify_password(password):
            raise AuthenticationError("Invalid email or password")

        # Tạo access token
        token = self._create_access_token(user)
        return user, token

    def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Lấy thông tin user theo ID"""
        return self.user_repository.find_by_id(user_id)

    def update_profile(self, user_id: str, profile_data: Dict) -> bool:
        """Cập nhật profile cho user"""
        return self.user_repository.update_profile(user_id, profile_data)

    def update_preferences(self, user_id: str, preferences_data: Dict) -> bool:
        """Cập nhật preferences cho user"""
        return self.user_repository.update_preferences(user_id, preferences_data)

    def list_users(self, skip: int = 0, limit: int = 20) -> List[User]:
        """Lấy danh sách users"""
        return self.user_repository.list_users(skip, limit)

    def find_by_tier(self, tier: str, skip: int = 0, limit: int = 20) -> List[User]:
        """Tìm users theo tier"""
        return self.user_repository.find_by_tier(tier, skip, limit)

    def update_points(self, user_id: str, points: int) -> bool:
        """Cập nhật điểm cho user"""
        return self.user_repository.update_points(user_id, points)

    def _create_access_token(self, user: User) -> str:
        """Tạo JWT access token"""
        payload = {
            'user_id': str(user._id),
            'email': user.email,
            'exp': datetime.utcnow() + timedelta(seconds=self.config['JWT_ACCESS_TOKEN_EXPIRES'])
        }
        return jwt.encode(payload, self.config['JWT_SECRET_KEY'], algorithm='HS256')

    def verify_token(self, token: str) -> Optional[Dict]:
        """Xác thực và decode JWT token"""
        try:
            return jwt.decode(token, self.config['JWT_SECRET_KEY'], algorithms=['HS256'])
        except jwt.InvalidTokenError:
            return None 