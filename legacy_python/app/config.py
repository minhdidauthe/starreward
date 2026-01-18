import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-secret-key-dev'
    MONGODB_SETTINGS = {
        'db': 'star_reward_app',
        'host': 'mongodb://localhost:27017/star_reward_app'
    }
