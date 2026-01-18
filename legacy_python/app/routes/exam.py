from flask import Blueprint, render_template

exam_bp = Blueprint('exam', __name__)

@exam_bp.route('/')
def index():
    return render_template('exam/index.html')
