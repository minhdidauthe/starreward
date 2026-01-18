from typing import Dict, List
import requests
from datetime import datetime, timedelta
from pymongo.database import Database
from app.utils.exceptions import AIError

class AIService:
    def __init__(self, db: Database, config: Dict):
        self.db = db
        self.config = config
        self.ai_api_key = config.get('AI_API_KEY')
        self.ai_base_url = config.get('AI_BASE_URL')

    def generate_daily_exercises(self, child_age: int, subjects: List[str]) -> Dict:
        """Tạo bài tập hàng ngày dựa trên độ tuổi và môn học"""
        try:
            # Gọi API của AI Agent để tạo bài tập
            response = requests.post(
                f"{self.ai_base_url}/generate-exercises",
                headers={"Authorization": f"Bearer {self.ai_api_key}"},
                json={
                    "child_age": child_age,
                    "subjects": subjects,
                    "difficulty_level": "age_appropriate"
                }
            )
            
            if response.status_code != 200:
                raise AIError("Failed to generate exercises")
            
            exercises = response.json()
            
            # Lưu bài tập vào database
            exercise_doc = {
                "created_at": datetime.utcnow(),
                "exercises": exercises,
                "child_age": child_age,
                "subjects": subjects
            }
            self.db.exercises.insert_one(exercise_doc)
            
            return exercises
            
        except Exception as e:
            raise AIError(f"Error generating exercises: {str(e)}")

    def get_parenting_advice(self, topic: str) -> Dict:
        """Lấy lời khuyên về nuôi dạy con từ AI"""
        try:
            response = requests.post(
                f"{self.ai_base_url}/parenting-advice",
                headers={"Authorization": f"Bearer {self.ai_api_key}"},
                json={"topic": topic}
            )
            
            if response.status_code != 200:
                raise AIError("Failed to get parenting advice")
            
            return response.json()
            
        except Exception as e:
            raise AIError(f"Error getting parenting advice: {str(e)}")

    def search_events(self, city: str, event_type: str) -> List[Dict]:
        """Tìm kiếm sự kiện (khóa học, cuộc thi) theo thành phố"""
        try:
            # Gọi API tìm kiếm sự kiện
            response = requests.get(
                f"{self.ai_base_url}/search-events",
                headers={"Authorization": f"Bearer {self.ai_api_key}"},
                params={
                    "city": city,
                    "type": event_type,
                    "start_date": datetime.utcnow().isoformat(),
                    "end_date": (datetime.utcnow() + timedelta(days=30)).isoformat()
                }
            )
            
            if response.status_code != 200:
                raise AIError("Failed to search events")
            
            events = response.json()
            
            # Lưu kết quả tìm kiếm vào database
            search_doc = {
                "searched_at": datetime.utcnow(),
                "city": city,
                "event_type": event_type,
                "events": events
            }
            self.db.event_searches.insert_one(search_doc)
            
            return events
            
        except Exception as e:
            raise AIError(f"Error searching events: {str(e)}")

    def schedule_daily_tasks(self):
        """Lên lịch các tác vụ hàng ngày"""
        try:
            # Tạo bài tập cho tất cả trẻ em đã đăng ký
            children = self.db.children.find({})
            for child in children:
                self.generate_daily_exercises(
                    child_age=child['age'],
                    subjects=child['subjects']
                )
            
            # Tìm kiếm sự kiện cho Hà Nội và Hồ Chí Minh
            for city in ['Hanoi', 'Ho Chi Minh']:
                for event_type in ['course', 'competition']:
                    self.search_events(city, event_type)
                    
        except Exception as e:
            raise AIError(f"Error scheduling daily tasks: {str(e)}") 