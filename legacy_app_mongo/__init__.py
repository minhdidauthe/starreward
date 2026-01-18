from flask import Flask
from flask_cors import CORS
from pymongo import MongoClient
from app.api.user import user_bp
from app.api.task import task_bp
from app.api.reward import reward_bp
from app.api.stats import stats_bp
from app.config import config

def create_app(config_name='default'):
    """Khởi tạo ứng dụng Flask"""
    app = Flask(__name__)
    
    # Load config
    app.config.from_object(config[config_name])
    
    # Cấu hình CORS
    CORS(app, resources={r"/api/*": {"origins": app.config['CORS_ORIGINS']}})
    
    # Khởi tạo MongoDB
    client = MongoClient(app.config['MONGO_URI'])
    app.mongo_db = client.get_default_database()
    
    # Đăng ký blueprints
    app.register_blueprint(user_bp, url_prefix='/api/users')
    app.register_blueprint(task_bp, url_prefix='/api/tasks')
    app.register_blueprint(reward_bp, url_prefix='/api/rewards')
    app.register_blueprint(stats_bp, url_prefix='/api/stats')
    
    # Xử lý lỗi
    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Not found'}, 404

    @app.errorhandler(500)
    def internal_error(error):
        return {'error': 'Internal server error'}, 500

    @app.route('/health')
    def health_check():
        """Kiểm tra trạng thái hoạt động của ứng dụng"""
        return {
            'status': 'healthy',
            'mongo': 'connected' if app.mongo_db else 'disconnected'
        }
    
    return app 