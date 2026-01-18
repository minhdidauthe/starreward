import mongoengine as db
from datetime import datetime

class DailyTask(db.Document):
    name = db.StringField(required=True, max_length=100)
    default_stars = db.IntField(required=True)
    description = db.StringField(max_length=200)

class Student(db.Document):
    name = db.StringField(required=True, max_length=100)
    total_stars = db.IntField(default=0)
    # Rewards are referenced back or embedded? 
    # For now, stick to Referenced to maintain structure similar to SQL
    
    meta = {'strict': False}

class Reward(db.Document):
    stars = db.IntField(required=True)
    reason = db.StringField(required=True, max_length=200)
    date = db.DateTimeField(default=datetime.utcnow)
    student = db.ReferenceField(Student, required=True)
    is_penalty = db.BooleanField(default=False)
    task = db.ReferenceField(DailyTask)

class Task(db.Document):
    student = db.ReferenceField(Student, required=True)
    title = db.StringField(required=True, max_length=100)
    description = db.StringField(max_length=200)
    due_date = db.DateTimeField(required=True)
    is_completed = db.BooleanField(default=False)
