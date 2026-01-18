from flask import Blueprint, request, jsonify, current_app
from app.services.task_service import TaskService
from app.services.user_service import UserService
from app.repositories.task_repository import TaskRepository
from app.repositories.user_repository import UserRepository
from app.utils.exceptions import ValidationError, ResourceNotFoundError, AuthorizationError
from app.api.user import token_required

task_bp = Blueprint('task', __name__)

def get_task_service():
    return TaskService(
        TaskRepository(current_app.mongo_db),
        UserService(UserRepository(current_app.mongo_db), current_app.config)
    )

@task_bp.route('', methods=['POST'])
@token_required
def create_task(user_id):
    try:
        task = get_task_service().create_task(user_id, request.get_json())
        return jsonify(task.to_dict()), 201
    except ValidationError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500

@task_bp.route('/<task_id>', methods=['GET'])
@token_required
def get_task(user_id, task_id):
    try:
        task = get_task_service().get_task_by_id(task_id)
        return jsonify(task.to_dict()), 200
    except ResourceNotFoundError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500

@task_bp.route('/<task_id>', methods=['PUT'])
@token_required
def update_task(user_id, task_id):
    try:
        task = get_task_service().update_task(task_id, user_id, request.get_json())
        return jsonify(task.to_dict()), 200
    except (ResourceNotFoundError, ValidationError) as e:
        return jsonify({"error": str(e)}), 404 if isinstance(e, ResourceNotFoundError) else 400
    except AuthorizationError as e:
        return jsonify({"error": str(e)}), 403
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500

@task_bp.route('/<task_id>', methods=['DELETE'])
@token_required
def delete_task(user_id, task_id):
    try:
        if get_task_service().delete_task(task_id, user_id):
            return jsonify({"message": "Task deleted successfully"}), 200
        return jsonify({"error": "Task not found"}), 404
    except AuthorizationError as e:
        return jsonify({"error": str(e)}), 403
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500

@task_bp.route('/<task_id>/assign/<assignee_id>', methods=['POST'])
@token_required
def assign_task(user_id, task_id, assignee_id):
    try:
        task = get_task_service().assign_task(task_id, user_id, assignee_id)
        return jsonify(task.to_dict()), 200
    except (ResourceNotFoundError, ValidationError) as e:
        return jsonify({"error": str(e)}), 404 if isinstance(e, ResourceNotFoundError) else 400
    except AuthorizationError as e:
        return jsonify({"error": str(e)}), 403
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500

@task_bp.route('/<task_id>/status', methods=['PUT'])
@token_required
def update_task_status(user_id, task_id):
    try:
        data = request.get_json()
        if 'status' not in data:
            return jsonify({"error": "Status is required"}), 400
            
        task = get_task_service().update_task_status(task_id, user_id, data['status'])
        return jsonify(task.to_dict()), 200
    except (ResourceNotFoundError, ValidationError) as e:
        return jsonify({"error": str(e)}), 404 if isinstance(e, ResourceNotFoundError) else 400
    except AuthorizationError as e:
        return jsonify({"error": str(e)}), 403
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500

@task_bp.route('', methods=['GET'])
@token_required
def list_tasks(user_id):
    try:
        skip = int(request.args.get('skip', 0))
        limit = int(request.args.get('limit', 20))
        tasks = get_task_service().list_tasks(skip, limit)
        return jsonify([task.to_dict() for task in tasks]), 200
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500

@task_bp.route('/my', methods=['GET'])
@token_required
def get_my_tasks(user_id):
    try:
        skip = int(request.args.get('skip', 0))
        limit = int(request.args.get('limit', 20))
        tasks = get_task_service().get_user_tasks(user_id, skip, limit)
        return jsonify([task.to_dict() for task in tasks]), 200
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500

@task_bp.route('/search', methods=['GET'])
@token_required
def search_tasks(user_id):
    try:
        query = request.args.get('q', '')
        skip = int(request.args.get('skip', 0))
        limit = int(request.args.get('limit', 20))
        tasks = get_task_service().search_tasks(query, skip, limit)
        return jsonify([task.to_dict() for task in tasks]), 200
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500

@task_bp.route('/overdue', methods=['GET'])
@token_required
def get_overdue_tasks(user_id):
    try:
        skip = int(request.args.get('skip', 0))
        limit = int(request.args.get('limit', 20))
        tasks = get_task_service().get_overdue_tasks(skip, limit)
        return jsonify([task.to_dict() for task in tasks]), 200
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500

@task_bp.route('/tag/<tag>', methods=['GET'])
@token_required
def get_tasks_by_tag(user_id, tag):
    try:
        skip = int(request.args.get('skip', 0))
        limit = int(request.args.get('limit', 20))
        tasks = get_task_service().get_tasks_by_tag(tag, skip, limit)
        return jsonify([task.to_dict() for task in tasks]), 200
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500 