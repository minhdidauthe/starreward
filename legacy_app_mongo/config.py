import os

class Config:
    """Cấu hình cơ bản"""
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/star_reward_app')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-secret-key')
    JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', 3600))  # 1 giờ
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*').split(',')

class DevelopmentConfig(Config):
    """Cấu hình môi trường development"""
    DEBUG = True
    TESTING = False

class TestingConfig(Config):
    """Cấu hình môi trường testing"""
    DEBUG = True
    TESTING = True
    MONGO_URI = 'mongodb://localhost:27017/star_reward_app_test'

class ProductionConfig(Config):
    """Cấu hình môi trường production"""
    DEBUG = False
    TESTING = False

config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
} 