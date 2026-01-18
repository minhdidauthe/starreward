from mongoengine import connect
from flask import Flask
from app.config import Config

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    connect(**app.config['MONGODB_SETTINGS'])

    # Import routes/blueprints
    from app.routes import main_bp
    from app.routes.learning import learning_bp
    from app.routes.exam import exam_bp
    
    app.register_blueprint(main_bp)
    app.register_blueprint(learning_bp, url_prefix='/learning')
    app.register_blueprint(exam_bp, url_prefix='/exam')

    # Database seed logic (executed on startup)
    with app.app_context():
        from app.utils.seed import init_default_tasks
        try:
            init_default_tasks()
        except Exception as e:
            print(f"Error seeding database: {e}")

    return app
