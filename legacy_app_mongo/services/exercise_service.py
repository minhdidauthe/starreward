from typing import List, Optional
from datetime import datetime, timedelta
from app.models.exercise import Exercise
from app.repositories.exercise_repository import ExerciseRepository
from app.services.ai_service import AIService
from app.services.star_service import StarService
from app.utils.exceptions import ValidationError

class ExerciseService:
    def __init__(self, exercise_repository: ExerciseRepository, ai_service: AIService, star_service: StarService):
        self.exercise_repository = exercise_repository
        self.ai_service = ai_service
        self.star_service = star_service

    def generate_daily_exercises(self, child_id: str, age: int, subject: str) -> List[Exercise]:
        """Tạo bài tập hàng ngày cho trẻ em"""
        if age < 3 or age > 12:
            raise ValidationError("Age must be between 3 and 12")
        
        exercises = []
        for _ in range(5):  # Tạo 5 bài tập mỗi ngày
            content = self.ai_service.generate_exercise(age, subject)
            exercise = Exercise(
                child_id=child_id,
                content=content,
                subject=subject,
                difficulty=self._calculate_difficulty(age),
                is_completed=False,
                created_at=datetime.utcnow()
            )
            exercises.append(self.exercise_repository.create(exercise))
        return exercises

    def get_exercises(self, child_id: str, date: Optional[datetime] = None) -> List[Exercise]:
        """Lấy bài tập của trẻ em"""
        return self.exercise_repository.find_by_child_id(child_id, date)

    def mark_exercise_completed(self, exercise_id: str) -> bool:
        """Đánh dấu bài tập đã hoàn thành và thêm sao"""
        exercise = self.exercise_repository.find_by_id(exercise_id)
        if not exercise:
            return False
            
        if self.exercise_repository.mark_completed(exercise_id):
            # Thêm sao dựa trên độ khó của bài tập
            star_amount = self._calculate_star_amount(exercise.difficulty)
            self.star_service.add_stars(
                child_id=exercise.child_id,
                amount=star_amount,
                reason=f"Hoàn thành bài tập {exercise.subject} - Độ khó: {exercise.difficulty}"
            )
            return True
        return False

    def get_completed_exercises(self, child_id: str, days: int = 7) -> List[Exercise]:
        """Lấy bài tập đã hoàn thành trong N ngày"""
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        return self.exercise_repository.get_completed_exercises(child_id, start_date, end_date)

    def get_exercise_stats(self, child_id: str, days: int = 30) -> dict:
        """Lấy thống kê bài tập"""
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        completed_exercises = self.exercise_repository.get_completed_exercises(child_id, start_date, end_date)
        
        return {
            "total_completed": len(completed_exercises),
            "completion_rate": len(completed_exercises) / (5 * days) * 100,  # 5 bài tập mỗi ngày
            "by_subject": self._group_by_subject(completed_exercises)
        }

    def _calculate_difficulty(self, age: int) -> str:
        """Tính độ khó dựa trên tuổi"""
        if age <= 5:
            return "easy"
        elif age <= 8:
            return "medium"
        else:
            return "hard"

    def _calculate_star_amount(self, difficulty: str) -> int:
        """Tính số sao dựa trên độ khó"""
        star_map = {
            "easy": 1,
            "medium": 2,
            "hard": 3
        }
        return star_map.get(difficulty, 1)

    def _group_by_subject(self, exercises: List[Exercise]) -> dict:
        """Nhóm bài tập theo môn học"""
        result = {}
        for exercise in exercises:
            if exercise.subject not in result:
                result[exercise.subject] = 0
            result[exercise.subject] += 1
        return result 