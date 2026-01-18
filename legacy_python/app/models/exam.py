import mongoengine as db
from datetime import datetime

class Exam(db.Document):
    title = db.StringField(required=True, max_length=150)
    description = db.StringField(max_length=255)
    duration_minutes = db.IntField(default=45)
    subject = db.ReferenceField('Subject') 

class Question(db.Document):
    exam = db.ReferenceField(Exam, required=True)
    content = db.StringField(required=True)
    question_type = db.StringField(default='multiple_choice', max_length=20)
    points = db.FloatField(default=1.0)
    
    # Store options as a list of strings
    options = db.ListField(db.StringField()) 
    correct_answer = db.StringField(max_length=255)

class ExamSchedule(db.Document):
    exam = db.ReferenceField(Exam, required=True)
    student = db.ReferenceField('Student', required=True)
    start_time = db.DateTimeField(required=True)
    end_time = db.DateTimeField()
    is_completed = db.BooleanField(default=False)
    score = db.FloatField()
    
class ExamResult(db.Document):
    schedule = db.ReferenceField(ExamSchedule, required=True)
    answers = db.DictField() # Store answers as a dictionary
    evaluated_at = db.DateTimeField(default=datetime.utcnow)
