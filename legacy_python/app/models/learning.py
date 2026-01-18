import mongoengine as db

class Subject(db.Document):
    name = db.StringField(required=True, max_length=100)
    description = db.StringField(max_length=255)
    icon = db.StringField(default='fa-book', max_length=50)

class Chapter(db.Document):
    subject = db.ReferenceField(Subject, required=True)
    title = db.StringField(required=True, max_length=150)
    order = db.IntField(default=0)

class Lesson(db.Document):
    chapter = db.ReferenceField(Chapter, required=True)
    title = db.StringField(required=True, max_length=150)
    content = db.StringField() # Markdown or HTML content
    video_url = db.StringField(max_length=255)

class Material(db.Document):
    lesson = db.ReferenceField(Lesson, required=True)
    title = db.StringField(required=True, max_length=150)
    file_path = db.StringField(required=True, max_length=255)
    file_type = db.StringField(max_length=20)

class LearningPath(db.Document):
    title = db.StringField(required=True, max_length=150)
    description = db.StringField(max_length=255)
    student = db.ReferenceField('Student') # Optional specific path for student
