from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import json
import random

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
import os
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'database/stars.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class DailyTask(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    default_stars = db.Column(db.Integer, nullable=False)
    description = db.Column(db.String(200))

class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    total_stars = db.Column(db.Integer, default=0)
    rewards = db.relationship('Reward', backref='student', lazy=True)

class Reward(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    stars = db.Column(db.Integer, nullable=False)
    reason = db.Column(db.String(200), nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    is_penalty = db.Column(db.Boolean, default=False)
    task_id = db.Column(db.Integer, db.ForeignKey('daily_task.id'), nullable=True)
    task = db.relationship('DailyTask')

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(200))
    due_date = db.Column(db.DateTime, nullable=False)
    is_completed = db.Column(db.Boolean, default=False)

def init_default_tasks():
    # Chỉ thêm các task mặc định nếu bảng trống
    if DailyTask.query.count() == 0:
        default_tasks = [
            {'name': 'Rửa bát', 'stars': 2, 'description': 'Rửa bát sau bữa ăn'},
            {'name': 'Học bài', 'stars': 3, 'description': 'Hoàn thành bài tập về nhà'},
            {'name': 'Ngủ đúng giờ', 'stars': 2, 'description': 'Đi ngủ trước 10 giờ tối'},
            {'name': 'Ăn đúng giờ', 'stars': 2, 'description': 'Ăn đúng bữa, đúng giờ'},
            {'name': 'Dọn phòng', 'stars': 2, 'description': 'Dọn dẹp phòng ngủ gọn gàng'},
            {'name': 'Đánh răng', 'stars': 1, 'description': 'Đánh răng sáng và tối'},
            {'name': 'Tập thể dục', 'stars': 2, 'description': 'Tập thể dục buổi sáng'},
        ]
        for task in default_tasks:
            db.session.add(DailyTask(
                name=task['name'],
                default_stars=task['stars'],
                description=task['description']
            ))
        db.session.commit()

with app.app_context():
    db.create_all()
    init_default_tasks()

@app.route('/')
def index():
    students = Student.query.all()
    return render_template('index.html', students=students)

@app.route('/add_student', methods=['POST'])
def add_student():
    name = request.form.get('name')
    if name:
        student = Student(name=name)
        db.session.add(student)
        db.session.commit()
        flash(f'Đã thêm học sinh {name}!', 'success')
    return redirect(url_for('index'))

@app.route('/student/<int:student_id>')
def student(student_id):
    student = Student.query.get_or_404(student_id)
    daily_tasks = DailyTask.query.all()
    today = datetime.now().date()
    # Lấy danh sách các task đã hoàn thành trong ngày
    completed_tasks = {r.task_id for r in Reward.query.filter(
        Reward.student_id == student_id,
        db.func.date(Reward.date) == today,
        Reward.task_id.isnot(None)
    ).all()}
    return render_template('student.html', student=student, daily_tasks=daily_tasks, completed_tasks=completed_tasks)

@app.route('/add_stars/<int:student_id>', methods=['POST'])
def add_stars(student_id):
    student = Student.query.get_or_404(student_id)
    stars = int(request.form.get('stars', 0))
    reason = request.form.get('reason', '')
    is_penalty = request.form.get('is_penalty') == 'true'
    task_id = request.form.get('task_id')
    
    if task_id:
        task = DailyTask.query.get(task_id)
        if task:
            stars = task.default_stars
            reason = task.name
    
    if stars > 0 and reason:
        if is_penalty:
            stars = -stars
            message = f'Đã trừ {abs(stars)} sao vì {reason}!'
        else:
            message = f'Đã thêm {stars} sao cho {reason}!'
            
        reward = Reward(
            stars=stars, 
            reason=reason, 
            student_id=student_id, 
            is_penalty=is_penalty,
            task_id=task_id if task_id else None
        )
        student.total_stars += stars
        db.session.add(reward)
        db.session.commit()
        flash(message, 'success' if not is_penalty else 'warning')
    
    return redirect(url_for('student', student_id=student_id))

@app.route('/edit_reward/<int:reward_id>', methods=['POST'])
def edit_reward(reward_id):
    reward = Reward.query.get_or_404(reward_id)
    student = reward.student
    
    # Lưu lại số sao cũ để tính toán
    old_stars = reward.stars
    
    # Cập nhật thông tin mới
    new_stars = int(request.form.get('stars', 0))
    new_reason = request.form.get('reason', '')
    new_is_penalty = request.form.get('is_penalty') == 'true'
    
    if new_is_penalty:
        new_stars = -new_stars
    
    # Cập nhật tổng số sao của học sinh
    student.total_stars = student.total_stars - old_stars + new_stars
    
    # Cập nhật thông tin phần thưởng
    reward.stars = new_stars
    reward.reason = new_reason
    reward.is_penalty = new_is_penalty
    
    db.session.commit()
    flash('Đã cập nhật phần thưởng thành công!', 'success')
    return redirect(url_for('student', student_id=student.id))

@app.route('/delete_reward/<int:reward_id>', methods=['POST'])
def delete_reward(reward_id):
    reward = Reward.query.get_or_404(reward_id)
    student = reward.student
    
    # Cập nhật tổng số sao của học sinh
    student.total_stars -= reward.stars
    
    # Xóa phần thưởng
    db.session.delete(reward)
    db.session.commit()
    
    flash('Đã xóa phần thưởng thành công!', 'success')
    return redirect(url_for('student', student_id=student.id))

@app.route('/get_star_history/<int:student_id>')
def get_star_history(student_id):
    days = request.args.get('days', default=30, type=int)
    page = request.args.get('page', default=1, type=int)
    per_page = 10
    is_chart = request.args.get('is_chart', default='false') == 'true'
    
    # Lấy ngày bắt đầu (days ngày trước)
    start_date = datetime.now() - timedelta(days=days)
    
    # Lấy tất cả phần thưởng trong khoảng thời gian
    rewards = Reward.query.filter(
        Reward.student_id == student_id,
        Reward.date >= start_date
    ).order_by(Reward.date.asc()).all()  # Sắp xếp tăng dần theo ngày
    
    # Tính tổng số sao theo ngày
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
    
    # Chuyển dictionary thành list và sắp xếp theo ngày tăng dần
    daily_summary_list = [
        {
            'date': date,
            'stars': data['stars'],
            'reasons': data['reasons']
        }
        for date, data in daily_summary.items()
    ]
    daily_summary_list.sort(key=lambda x: datetime.strptime(x['date'], '%d/%m/%Y'))
    
    # Nếu là yêu cầu cho biểu đồ, trả về tất cả dữ liệu
    if is_chart:
        return jsonify({
            'daily_summary': daily_summary_list,
            'pagination': {
                'current_page': 1,
                'total_pages': 1,
                'total_items': len(daily_summary_list)
            }
        })
    
    # Phân trang cho bảng
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

app.jinja_env.globals.update(get_reward_level=get_reward_level)

@app.route('/add_test_data/<int:student_id>')
def add_test_data(student_id):
    student = Student.query.get_or_404(student_id)
    today = datetime.now().date()
    
    # Tạo dữ liệu test cho 30 ngày trước
    for i in range(30):
        date = today - timedelta(days=i)
        # Tạo số sao ngẫu nhiên từ 0-5
        stars = random.randint(0, 5)
        if stars > 0:
            reward = Reward(
                stars=stars,
                reason=f"Test data for {date.strftime('%d/%m/%Y')}",
                date=datetime.combine(date, datetime.min.time()),
                student_id=student_id
            )
            student.total_stars += stars
            db.session.add(reward)
    
    db.session.commit()
    flash('Đã thêm dữ liệu test thành công!', 'success')
    return redirect(url_for('student', student_id=student_id))

@app.route('/clear_test_data/<int:student_id>')
def clear_test_data(student_id):
    student = Student.query.get_or_404(student_id)
    # Xóa tất cả phần thưởng có chứa "Test data" trong lý do
    test_rewards = Reward.query.filter(
        Reward.student_id == student_id,
        Reward.reason.like('Test data%')
    ).all()
    
    for reward in test_rewards:
        student.total_stars -= reward.stars
        db.session.delete(reward)
    
    db.session.commit()
    flash('Đã xóa dữ liệu test thành công!', 'success')
    return redirect(url_for('student', student_id=student_id))

@app.route('/get_reward_history/<int:student_id>')
def get_reward_history(student_id):
    # Lấy số trang và số mục trên mỗi trang
    page = request.args.get('page', default=1, type=int)
    per_page = request.args.get('per_page', default=10, type=int)
    
    # Truy vấn lịch sử nhận sao có phân trang
    rewards = Reward.query.filter(
        Reward.student_id == student_id
    ).order_by(
        Reward.date.desc()
    ).paginate(
        page=page,
        per_page=per_page,
        error_out=False
    )
    
    # Chuyển đổi dữ liệu thành định dạng JSON
    reward_list = []
    for reward in rewards.items:
        reward_list.append({
            'id': reward.id,
            'stars': reward.stars,
            'reason': reward.reason,
            'date': reward.date.strftime('%d/%m/%Y %H:%M'),
            'is_penalty': reward.is_penalty
        })
    
    return jsonify({
        'rewards': reward_list,
        'pagination': {
            'current_page': rewards.page,
            'total_pages': rewards.pages,
            'total_items': rewards.total,
            'per_page': rewards.per_page
        }
    })

@app.route('/add_task/<int:student_id>', methods=['GET', 'POST'])
def add_task(student_id):
    student = Student.query.get_or_404(student_id)
    if request.method == 'POST':
        title = request.form.get('title')
        description = request.form.get('description')
        due_date = datetime.strptime(request.form.get('due_date'), '%Y-%m-%dT%H:%M')
        
        task = Task(
            student_id=student_id,
            title=title,
            description=description,
            due_date=due_date,
            is_completed=False
        )
        
        db.session.add(task)
        db.session.commit()
        flash('Đã thêm công việc mới!', 'success')
        return redirect(url_for('student', student_id=student_id))
    
    return render_template('add_task.html', student=student)

@app.route('/get_tasks/<int:student_id>')
def get_tasks(student_id):
    tasks = Task.query.filter_by(student_id=student_id).order_by(Task.due_date.asc()).all()
    return jsonify([{
        'id': task.id,
        'title': task.title,
        'description': task.description,
        'due_date': task.due_date.strftime('%Y-%m-%dT%H:%M'),
        'is_completed': task.is_completed
    } for task in tasks])

@app.route('/complete_task/<int:task_id>', methods=['POST'])
def complete_task(task_id):
    task = Task.query.get_or_404(task_id)
    task.is_completed = True
    db.session.commit()
    flash('Đã đánh dấu công việc hoàn thành!', 'success')
    return redirect(url_for('student', student_id=task.student_id))

@app.route('/delete_task/<int:task_id>', methods=['POST'])
def delete_task(task_id):
    task = Task.query.get_or_404(task_id)
    student_id = task.student_id
    db.session.delete(task)
    db.session.commit()
    flash('Đã xóa công việc!', 'success')
    return redirect(url_for('student', student_id=student_id))

if __name__ == '__main__':
    # Chạy server với host 0.0.0.0 và cổng 8080
    app.run(debug=True, host='0.0.0.0', port=8080) 