from flask import Blueprint, render_template

learning_bp = Blueprint('learning', __name__)

@learning_bp.route('/')
def index():
    return render_template('learning/index.html')
