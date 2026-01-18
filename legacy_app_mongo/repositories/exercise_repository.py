from typing import List, Optional
from datetime import datetime
from pymongo import MongoClient
from app.models.exercise import Exercise
from app.utils.exceptions import DatabaseError

class ExerciseRepository:
    def __init__(self, db: MongoClient):
        self.collection = db.exercises

    def create(self, exercise: Exercise) -> Exercise:
        """Tạo bài tập mới"""
        try:
            result = self.collection.insert_one(exercise.dict(by_alias=True))
            exercise._id = result.inserted_id
            return exercise
        except Exception as e:
            raise DatabaseError(f"Failed to create exercise: {str(e)}")

    def find_by_id(self, exercise_id: str) -> Optional[Exercise]:
        """Tìm bài tập theo ID"""
        try:
            doc = self.collection.find_one({"_id": exercise_id})
            return Exercise(**doc) if doc else None
        except Exception as e:
            raise DatabaseError(f"Failed to find exercise: {str(e)}")

    def find_by_child_id(self, child_id: str, date: Optional[datetime] = None) -> List[Exercise]:
        """Tìm bài tập theo ID trẻ em"""
        try:
            query = {"child_id": child_id}
            if date:
                query["created_at"] = {
                    "$gte": datetime.combine(date, datetime.min.time()),
                    "$lt": datetime.combine(date, datetime.max.time())
                }
            docs = self.collection.find(query)
            return [Exercise(**doc) for doc in docs]
        except Exception as e:
            raise DatabaseError(f"Failed to find exercises: {str(e)}")

    def mark_completed(self, exercise_id: str) -> bool:
        """Đánh dấu bài tập đã hoàn thành"""
        try:
            result = self.collection.update_one(
                {"_id": exercise_id},
                {
                    "$set": {
                        "is_completed": True,
                        "completed_at": datetime.utcnow()
                    }
                }
            )
            return result.modified_count > 0
        except Exception as e:
            raise DatabaseError(f"Failed to mark exercise as completed: {str(e)}")

    def get_completed_exercises(self, child_id: str, start_date: datetime, end_date: datetime) -> List[Exercise]:
        """Lấy danh sách bài tập đã hoàn thành trong khoảng thời gian"""
        try:
            docs = self.collection.find({
                "child_id": child_id,
                "is_completed": True,
                "completed_at": {
                    "$gte": start_date,
                    "$lt": end_date
                }
            })
            return [Exercise(**doc) for doc in docs]
        except Exception as e:
            raise DatabaseError(f"Failed to get completed exercises: {str(e)}") 