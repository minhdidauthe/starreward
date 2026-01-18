from flask import Blueprint, request, jsonify, current_app
from datetime import datetime
from app.services.stats_service import StatsService
from app.api.user import token_required

stats_bp = Blueprint('stats', __name__)

def get_stats_service():
    return StatsService(current_app.mongo_db)

@stats_bp.route('/user/<user_id>', methods=['GET'])
@token_required
def get_user_stats(current_user_id, user_id):
    """Lấy thống kê của user"""
    try:
        stats = get_stats_service().get_user_stats(user_id)
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500

@stats_bp.route('/tasks', methods=['GET'])
@token_required
def get_task_stats(current_user_id):
    """Lấy thống kê về tasks"""
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        if start_date:
            start_date = datetime.fromisoformat(start_date)
        if end_date:
            end_date = datetime.fromisoformat(end_date)

        stats = get_stats_service().get_task_stats(start_date, end_date)
        return jsonify(stats), 200
    except ValueError:
        return jsonify({"error": "Invalid date format"}), 400
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500

@stats_bp.route('/rewards', methods=['GET'])
@token_required
def get_reward_stats(current_user_id):
    """Lấy thống kê về rewards"""
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        if start_date:
            start_date = datetime.fromisoformat(start_date)
        if end_date:
            end_date = datetime.fromisoformat(end_date)

        stats = get_stats_service().get_reward_stats(start_date, end_date)
        return jsonify(stats), 200
    except ValueError:
        return jsonify({"error": "Invalid date format"}), 400
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500

@stats_bp.route('/leaderboard', methods=['GET'])
@token_required
def get_leaderboard(current_user_id):
    """Lấy bảng xếp hạng users"""
    try:
        limit = int(request.args.get('limit', 10))
        leaderboard = get_stats_service().get_leaderboard(limit)
        return jsonify(leaderboard), 200
    except ValueError:
        return jsonify({"error": "Invalid limit value"}), 400
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500

@stats_bp.route('/activity-summary', methods=['GET'])
@token_required
def get_activity_summary(current_user_id):
    """Lấy tổng hợp hoạt động"""
    try:
        days = int(request.args.get('days', 7))
        summary = get_stats_service().get_activity_summary(days)
        return jsonify(summary), 200
    except ValueError:
        return jsonify({"error": "Invalid days value"}), 400
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500 