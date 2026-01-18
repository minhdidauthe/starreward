from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify
# from app import db # Removed as we use mongoengine directly
from app.models.basic import Student, DailyTask, Reward, Task
from datetime import datetime, timedelta
import random

main_bp = Blueprint('main', __name__)

# Removed setup_db and init_default_tasks - moving to app factory

def get_reward_level(stars):
    if stars >= 50:
        return "🏆 Xuất sắc!"
    elif stars >= 30:
        return "🥇 Giỏi!"
    elif stars >= 20:
        return "🥈 Khá!"
    elif stars >= 10:
        return "🥉 Cố gắng!"
    else:
        return "💪 Hãy cố gắng hơn nhé!"

@main_bp.context_processor
def utility_processor():
    return dict(get_reward_level=get_reward_level)

@main_bp.route('/')
def index():
    students = Student.objects()
    return render_template('index.html', students=students)

@main_bp.route('/add_student', methods=['POST'])
def add_student():
    name = request.form.get('name')
    if name:
        student = Student(name=name)
        student.save()
        flash(f'Đã thêm học sinh {name}!', 'success')
    return redirect(url_for('main.index'))

@main_bp.route('/student/<string:student_id>')
def student(student_id):
    student = Student.objects.get_or_404(id=student_id)
    daily_tasks = DailyTask.objects()
    today = datetime.now().date()
    # Lấy danh sách các task đã hoàn thành trong ngày
    # MongoDB query: lọc theo ngày (cần xử lý vì date là DateTimeField)
    start_of_day = datetime.combine(today, datetime.min.time())
    end_of_day = datetime.combine(today, datetime.max.time())
    
    rewards = Reward.objects(
        student=student,
        date__gte=start_of_day,
        date__lte=end_of_day,
        task__ne=None
    )
    completed_tasks = {str(r.task.id) for r in rewards}
    return render_template('student.html', student=student, daily_tasks=daily_tasks, completed_tasks=completed_tasks)

@main_bp.route('/add_stars/<string:student_id>', methods=['POST'])
def add_stars(student_id):
    student = Student.objects.get_or_404(id=student_id)
    stars = int(request.form.get('stars', 0))
    reason = request.form.get('reason', '')
    is_penalty = request.form.get('is_penalty') == 'true'
    task_id = request.form.get('task_id')
    
    task_obj = None
    if task_id:
        task_obj = DailyTask.objects.get(id=task_id)
        if task_obj:
            stars = task_obj.default_stars
            reason = task_obj.name
    
    if stars > 0 and reason:
        if is_penalty:
            stars = -stars
            message = f'Đã trừ {abs(stars)} sao vì {reason}!'
        else:
            message = f'Đã thêm {stars} sao cho {reason}!'
            
        reward = Reward(
            stars=stars, 
            reason=reason, 
            student=student, 
            is_penalty=is_penalty,
            task=task_obj
        )
        reward.save()
        
        # Update total stars atomicity? 
        # For simplicity, just update and save. MongoEngine doesn't have F() expressions exactly like Django but update() works
        student.update(inc__total_stars=stars)
        
        flash(message, 'success' if not is_penalty else 'warning')
    
    return redirect(url_for('main.student', student_id=student_id))

@main_bp.route('/edit_reward/<string:reward_id>', methods=['POST'])
def edit_reward(reward_id):
    reward = Reward.objects.get_or_404(id=reward_id)
    student = reward.student
    
    old_stars = reward.stars
    
    new_stars = int(request.form.get('stars', 0))
    new_reason = request.form.get('reason', '')
    new_is_penalty = request.form.get('is_penalty') == 'true'
    
    if new_is_penalty:
        new_stars = -new_stars
    
    diff = new_stars - old_stars
    student.update(inc__total_stars=diff)
    
    reward.stars = new_stars
    reward.reason = new_reason
    reward.is_penalty = new_is_penalty
    reward.save()
    
    flash('Đã cập nhật phần thưởng thành công!', 'success')
    return redirect(url_for('main.student', student_id=student.id))

@main_bp.route('/delete_reward/<string:reward_id>', methods=['POST'])
def delete_reward(reward_id):
    reward = Reward.objects.get_or_404(id=reward_id)
    student = reward.student
    
    student.update(dec__total_stars=reward.stars)
    reward.delete()
    
    flash('Đã xóa phần thưởng thành công!', 'success')
    return redirect(url_for('main.student', student_id=student.id))

@main_bp.route('/get_star_history/<string:student_id>')
def get_star_history(student_id):
    student = Student.objects.get_or_404(id=student_id)
    days = request.args.get('days', default=30, type=int)
    page = request.args.get('page', default=1, type=int)
    per_page = 10
    is_chart = request.args.get('is_chart', default='false') == 'true'
    
    start_date = datetime.now() - timedelta(days=days)
    
    rewards = Reward.objects(student=student, date__gte=start_date).order_by('date')
    
    # ... (logic transformation to dict remains same, just object access)
    daily_summary = {}
    for reward in rewards:
        date_str = reward.date.strftime('%d/%m/%Y')
        if date_str not in daily_summary:
            daily_summary[date_str] = {
                'stars': 0,
                'reasons': []
            }
        daily_summary[date_str]['stars'] += reward.stars
        daily_summary[date_str]['reasons'].append(reward.reason)
    
    daily_summary_list = [
        {
            'date': date,
            'stars': data['stars'],
            'reasons': data['reasons']
        }
        for date, data in daily_summary.items()
    ]
    daily_summary_list.sort(key=lambda x: datetime.strptime(x['date'], '%d/%m/%Y'))
    
    if is_chart:
        return jsonify({
            'daily_summary': daily_summary_list,
            'pagination': {
                'current_page': 1,
                'total_pages': 1,
                'total_items': len(daily_summary_list)
            }
        })
    
    start_idx = (page - 1) * per_page
    end_idx = start_idx + per_page
    paginated_summary = daily_summary_list[start_idx:end_idx]
    
    return jsonify({
        'daily_summary': paginated_summary,
        'pagination': {
            'current_page': page,
            'total_pages': (len(daily_summary_list) + per_page - 1) // per_page,
            'total_items': len(daily_summary_list)
        }
    })

@main_bp.route('/add_test_data/<string:student_id>')
def add_test_data(student_id):
    student = Student.objects.get_or_404(id=student_id)
    today = datetime.now().date()
    
    for i in range(30):
        date = today - timedelta(days=i)
        stars = random.randint(0, 5)
        if stars > 0:
            reward = Reward(
                stars=stars,
                reason=f"Test data for {date.strftime('%d/%m/%Y')}",
                date=datetime.combine(date, datetime.min.time()),
                student=student
            )
            reward.save()
            student.update(inc__total_stars=stars)
    
    flash('Đã thêm dữ liệu test thành công!', 'success')
    return redirect(url_for('main.student', student_id=student.id))

@main_bp.route('/clear_test_data/<string:student_id>')
def clear_test_data(student_id):
    student = Student.objects.get_or_404(id=student_id)
    # Regex query for 'like'
    test_rewards = Reward.objects(student=student, reason__startswith='Test data')
    
    total_removed = sum(r.stars for r in test_rewards)
    student.update(dec__total_stars=total_removed)
    test_rewards.delete()
    
    flash('Đã xóa dữ liệu test thành công!', 'success')
    return redirect(url_for('main.student', student_id=student.id))

@main_bp.route('/get_reward_history/<string:student_id>')
def get_reward_history(student_id):
    student = Student.objects.get_or_404(id=student_id)
    page = request.args.get('page', default=1, type=int)
    per_page = request.args.get('per_page', default=10, type=int)
    
    offset = (page - 1) * per_page
    total_items = Reward.objects(student=student).count()
    rewards = Reward.objects(student=student).order_by('-date').skip(offset).limit(per_page)
    
    reward_list = []
    for reward in rewards:
        reward_list.append({
            'id': str(reward.id),
            'stars': reward.stars,
            'reason': reward.reason,
            'date': reward.date.strftime('%d/%m/%Y %H:%M'),
            'is_penalty': reward.is_penalty
        })
    
    total_pages = (total_items + per_page - 1) // per_page
    
    return jsonify({
        'rewards': reward_list,
        'pagination': {
            'current_page': page,
            'total_pages': total_pages,
            'total_items': total_items,
            'per_page': per_page
        }
    })

@main_bp.route('/add_task/<string:student_id>', methods=['GET', 'POST'])
def add_task(student_id):
    student = Student.objects.get_or_404(id=student_id)
    if request.method == 'POST':
        title = request.form.get('title')
        description = request.form.get('description')
        due_date_str = request.form.get('due_date')
        if not due_date_str:
             due_date = datetime.now()
        else:
             due_date = datetime.strptime(due_date_str, '%Y-%m-%dT%H:%M')
        
        task = Task(
            student=student,
            title=title,
            description=description,
            due_date=due_date,
            is_completed=False
        )
        task.save()
        
        flash('Đã thêm công việc mới!', 'success')
        return redirect(url_for('main.student', student_id=student.id))
    
    return render_template('add_task.html', student=student)

@main_bp.route('/get_tasks/<string:student_id>')
def get_tasks(student_id):
    student = Student.objects.get_or_404(id=student_id)
    tasks = Task.objects(student=student).order_by('due_date')
    return jsonify([{
        'id': str(task.id),
        'title': task.title,
        'description': task.description,
        'due_date': task.due_date.strftime('%Y-%m-%dT%H:%M'),
        'is_completed': task.is_completed
    } for task in tasks])

@main_bp.route('/complete_task/<string:task_id>', methods=['POST'])
def complete_task(task_id):
    task = Task.objects.get_or_404(id=task_id)
    task.is_completed = True
    task.save()
    flash('Đã đánh dấu công việc hoàn thành!', 'success')
    return redirect(url_for('main.student', student_id=task.student.id))

@main_bp.route('/delete_task/<string:task_id>', methods=['POST'])
def delete_task(task_id):
    task = Task.objects.get_or_404(id=task_id)
    student_id = task.student.id
    task.delete()
    flash('Đã xóa công việc!', 'success')
    return redirect(url_for('main.student', student_id=student_id))
