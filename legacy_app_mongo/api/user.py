from flask import Blueprint, request, jsonify, current_app
from app.services.user_service import UserService
from app.repositories.user_repository import UserRepository
from app.utils.exceptions import ValidationError, AuthenticationError
from functools import wraps

user_bp = Blueprint('user', __name__)

def get_user_service():
    return UserService(
        UserRepository(current_app.mongo_db),
        current_app.config
    )

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({"error": "Token is missing"}), 401

        token = token.split(" ")[1] if len(token.split(" ")) > 1 else token
        user_service = get_user_service()
        payload = user_service.verify_token(token)
        
        if not payload:
            return jsonify({"error": "Invalid token"}), 401

        return f(*args, user_id=payload['user_id'], **kwargs)
    return decorated

@user_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    try:
        user = get_user_service().register(
            email=data['email'],
            password=data['password'],
            name=data['name']
        )
        return jsonify(user.to_dict()), 201
    except ValidationError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500

@user_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    try:
        user, token = get_user_service().login(
            email=data['email'],
            password=data['password']
        )
        return jsonify({
            "user": user.to_dict(),
            "token": token
        }), 200
    except AuthenticationError as e:
        return jsonify({"error": str(e)}), 401
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500

@user_bp.route('/profile', methods=['GET'])
@token_required
def get_profile(user_id):
    try:
        user = get_user_service().get_user_by_id(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        return jsonify(user.to_dict()), 200
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500

@user_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile(user_id):
    data = request.get_json()
    try:
        success = get_user_service().update_profile(user_id, data)
        if not success:
            return jsonify({"error": "User not found"}), 404
        return jsonify({"message": "Profile updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500

@user_bp.route('/preferences', methods=['PUT'])
@token_required
def update_preferences(user_id):
    data = request.get_json()
    try:
        success = get_user_service().update_preferences(user_id, data)
        if not success:
            return jsonify({"error": "User not found"}), 404
        return jsonify({"message": "Preferences updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500

@user_bp.route('/list', methods=['GET'])
@token_required
def list_users(user_id):
    try:
        skip = int(request.args.get('skip', 0))
        limit = int(request.args.get('limit', 20))
        users = get_user_service().list_users(skip, limit)
        return jsonify([user.to_dict() for user in users]), 200
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500

@user_bp.route('/tier/<tier>', methods=['GET'])
@token_required
def get_users_by_tier(user_id, tier):
    try:
        skip = int(request.args.get('skip', 0))
        limit = int(request.args.get('limit', 20))
        users = get_user_service().find_by_tier(tier, skip, limit)
        return jsonify([user.to_dict() for user in users]), 200
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500 