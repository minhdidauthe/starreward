from datetime import datetime, timedelta
from typing import Dict, List
from bson import ObjectId
from pymongo.collection import Collection
from pymongo.database import Database

class StatsService:
    def __init__(self, db: Database):
        self.db = db

    def get_user_stats(self, user_id: str) -> Dict:
        """Lấy thống kê của user"""
        # Tìm user
        user = self.db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            return {}

        # Thống kê tasks
        tasks_created = self.db.tasks.count_documents({"creator_id": user_id})
        tasks_assigned = self.db.tasks.count_documents({"assignee_id": user_id})
        tasks_completed = self.db.tasks.count_documents({
            "assignee_id": user_id,
            "status": "COMPLETED"
        })

        # Thống kê rewards
        rewards_created = self.db.rewards.count_documents({"creator_id": user_id})
        rewards_redeemed = self.db.rewards.count_documents({
            "redeemed_by": user_id
        })

        # Tính tỷ lệ hoàn thành
        completion_rate = (tasks_completed / tasks_assigned * 100) if tasks_assigned > 0 else 0

        return {
            "tasks_stats": {
                "created": tasks_created,
                "assigned": tasks_assigned,
                "completed": tasks_completed,
                "completion_rate": round(completion_rate, 2)
            },
            "rewards_stats": {
                "created": rewards_created,
                "redeemed": rewards_redeemed
            },
            "points": user.get("points", 0),
            "tier": user.get("tier", "BRONZE")
        }

    def get_task_stats(self, start_date: datetime = None, end_date: datetime = None) -> Dict:
        """Lấy thống kê về tasks"""
        query = {}
        if start_date and end_date:
            query["created_at"] = {
                "$gte": start_date,
                "$lte": end_date
            }

        # Tổng số tasks
        total_tasks = self.db.tasks.count_documents(query)

        # Thống kê theo trạng thái
        status_stats = {}
        statuses = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]
        for status in statuses:
            status_query = {**query, "status": status}
            count = self.db.tasks.count_documents(status_query)
            status_stats[status.lower()] = count

        # Thống kê theo độ ưu tiên
        priority_stats = {}
        priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"]
        for priority in priorities:
            priority_query = {**query, "priority": priority}
            count = self.db.tasks.count_documents(priority_query)
            priority_stats[priority.lower()] = count

        # Tasks quá hạn
        overdue_query = {
            **query,
            "due_date": {"$lt": datetime.utcnow()},
            "status": {"$nin": ["COMPLETED", "CANCELLED"]}
        }
        overdue_tasks = self.db.tasks.count_documents(overdue_query)

        return {
            "total": total_tasks,
            "status_stats": status_stats,
            "priority_stats": priority_stats,
            "overdue": overdue_tasks
        }

    def get_reward_stats(self, start_date: datetime = None, end_date: datetime = None) -> Dict:
        """Lấy thống kê về rewards"""
        query = {}
        if start_date and end_date:
            query["created_at"] = {
                "$gte": start_date,
                "$lte": end_date
            }

        # Tổng số rewards
        total_rewards = self.db.rewards.count_documents(query)

        # Thống kê theo trạng thái
        status_stats = {}
        statuses = ["ACTIVE", "INACTIVE", "SOLD_OUT"]
        for status in statuses:
            status_query = {**query, "status": status}
            count = self.db.rewards.count_documents(status_query)
            status_stats[status.lower()] = count

        # Thống kê theo loại
        type_stats = {}
        types = ["PHYSICAL", "DIGITAL", "EXPERIENCE"]
        for type_ in types:
            type_query = {**query, "type": type_}
            count = self.db.rewards.count_documents(type_query)
            type_stats[type_.lower()] = count

        # Rewards hết hạn
        expired_query = {
            **query,
            "expiry_date": {"$lt": datetime.utcnow()},
            "status": "ACTIVE"
        }
        expired_rewards = self.db.rewards.count_documents(expired_query)

        return {
            "total": total_rewards,
            "status_stats": status_stats,
            "type_stats": type_stats,
            "expired": expired_rewards
        }

    def get_leaderboard(self, limit: int = 10) -> List[Dict]:
        """Lấy bảng xếp hạng users theo điểm"""
        users = list(self.db.users.find(
            {},
            {"email": 1, "name": 1, "points": 1, "tier": 1}
        ).sort("points", -1).limit(limit))

        return [{
            "id": str(user["_id"]),
            "email": user["email"],
            "name": user["name"],
            "points": user.get("points", 0),
            "tier": user.get("tier", "BRONZE")
        } for user in users]

    def get_activity_summary(self, days: int = 7) -> Dict:
        """Lấy tổng hợp hoạt động trong khoảng thời gian"""
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Thống kê tasks
        task_stats = self.get_task_stats(start_date, datetime.utcnow())
        
        # Thống kê rewards
        reward_stats = self.get_reward_stats(start_date, datetime.utcnow())
        
        # Thống kê points
        points_pipeline = [
            {
                "$match": {
                    "created_at": {"$gte": start_date}
                }
            },
            {
                "$group": {
                    "_id": None,
                    "total_points_earned": {"$sum": "$points"},
                    "total_points_spent": {"$sum": "$points_required"}
                }
            }
        ]
        points_stats = list(self.db.tasks.aggregate(points_pipeline))
        points_earned = points_stats[0]["total_points_earned"] if points_stats else 0
        
        points_stats = list(self.db.rewards.aggregate(points_pipeline))
        points_spent = points_stats[0]["total_points_spent"] if points_stats else 0

        return {
            "period": {
                "start_date": start_date.isoformat(),
                "end_date": datetime.utcnow().isoformat()
            },
            "tasks": task_stats,
            "rewards": reward_stats,
            "points": {
                "earned": points_earned,
                "spent": points_spent,
                "net": points_earned - points_spent
            }
        } 