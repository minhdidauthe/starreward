from flask import Blueprint, request, jsonify, current_app
from app.services.reward_service import RewardService
from app.services.user_service import UserService
from app.repositories.reward_repository import RewardRepository
from app.repositories.user_repository import UserRepository
from app.utils.exceptions import ValidationError, ResourceNotFoundError, AuthorizationError
from app.api.user import token_required

reward_bp = Blueprint('reward', __name__)

def get_reward_service():
    return RewardService(
        RewardRepository(current_app.mongo_db),
        UserService(UserRepository(current_app.mongo_db), current_app.config)
    )

@reward_bp.route('', methods=['POST'])
@token_required
def create_reward(user_id):
    try:
        reward = get_reward_service().create_reward(user_id, request.get_json())
        return jsonify(reward.to_dict()), 201
    except ValidationError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500

@reward_bp.route('/<reward_id>', methods=['GET'])
@token_required
def get_reward(user_id, reward_id):
    try:
        reward = get_reward_service().get_reward_by_id(reward_id)
        return jsonify(reward.to_dict()), 200
    except ResourceNotFoundError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500

@reward_bp.route('/<reward_id>', methods=['PUT'])
@token_required
def update_reward(user_id, reward_id):
    try:
        reward = get_reward_service().update_reward(reward_id, user_id, request.get_json())
        return jsonify(reward.to_dict()), 200
    except (ResourceNotFoundError, ValidationError) as e:
        return jsonify({"error": str(e)}), 404 if isinstance(e, ResourceNotFoundError) else 400
    except AuthorizationError as e:
        return jsonify({"error": str(e)}), 403
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500

@reward_bp.route('/<reward_id>', methods=['DELETE'])
@token_required
def delete_reward(user_id, reward_id):
    try:
        if get_reward_service().delete_reward(reward_id, user_id):
            return jsonify({"message": "Reward deleted successfully"}), 200
        return jsonify({"error": "Reward not found"}), 404
    except AuthorizationError as e:
        return jsonify({"error": str(e)}), 403
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500

@reward_bp.route('/<reward_id>/status', methods=['PUT'])
@token_required
def update_reward_status(user_id, reward_id):
    try:
        data = request.get_json()
        if 'status' not in data:
            return jsonify({"error": "Status is required"}), 400
            
        reward = get_reward_service().update_reward_status(reward_id, user_id, data['status'])
        return jsonify(reward.to_dict()), 200
    except (ResourceNotFoundError, ValidationError) as e:
        return jsonify({"error": str(e)}), 404 if isinstance(e, ResourceNotFoundError) else 400
    except AuthorizationError as e:
        return jsonify({"error": str(e)}), 403
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500

@reward_bp.route('/<reward_id>/redeem', methods=['POST'])
@token_required
def redeem_reward(user_id, reward_id):
    try:
        reward = get_reward_service().redeem_reward(reward_id, user_id)
        return jsonify(reward.to_dict()), 200
    except (ResourceNotFoundError, ValidationError) as e:
        return jsonify({"error": str(e)}), 404 if isinstance(e, ResourceNotFoundError) else 400
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500

@reward_bp.route('', methods=['GET'])
@token_required
def list_rewards(user_id):
    try:
        skip = int(request.args.get('skip', 0))
        limit = int(request.args.get('limit', 20))
        rewards = get_reward_service().list_rewards(skip, limit)
        return jsonify([reward.to_dict() for reward in rewards]), 200
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500

@reward_bp.route('/available', methods=['GET'])
@token_required
def get_available_rewards(user_id):
    try:
        skip = int(request.args.get('skip', 0))
        limit = int(request.args.get('limit', 20))
        rewards = get_reward_service().get_available_rewards(skip, limit)
        return jsonify([reward.to_dict() for reward in rewards]), 200
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500

@reward_bp.route('/search', methods=['GET'])
@token_required
def search_rewards(user_id):
    try:
        query = request.args.get('q', '')
        skip = int(request.args.get('skip', 0))
        limit = int(request.args.get('limit', 20))
        rewards = get_reward_service().search_rewards(query, skip, limit)
        return jsonify([reward.to_dict() for reward in rewards]), 200
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500

@reward_bp.route('/points-range', methods=['GET'])
@token_required
def get_rewards_by_points_range(user_id):
    try:
        min_points = int(request.args.get('min', 0))
        max_points = int(request.args.get('max', float('inf')))
        skip = int(request.args.get('skip', 0))
        limit = int(request.args.get('limit', 20))
        rewards = get_reward_service().get_rewards_by_points_range(min_points, max_points, skip, limit)
        return jsonify([reward.to_dict() for reward in rewards]), 200
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500

@reward_bp.route('/type/<type>', methods=['GET'])
@token_required
def get_rewards_by_type(user_id, type):
    try:
        skip = int(request.args.get('skip', 0))
        limit = int(request.args.get('limit', 20))
        rewards = get_reward_service().get_rewards_by_type(type, skip, limit)
        return jsonify([reward.to_dict() for reward in rewards]), 200
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500

@reward_bp.route('/tag/<tag>', methods=['GET'])
@token_required
def get_rewards_by_tag(user_id, tag):
    try:
        skip = int(request.args.get('skip', 0))
        limit = int(request.args.get('limit', 20))
        rewards = get_reward_service().get_rewards_by_tag(tag, skip, limit)
        return jsonify([reward.to_dict() for reward in rewards]), 200
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500 