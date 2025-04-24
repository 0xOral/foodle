from flask import render_template, flash, redirect, url_for, request
from flask_login import current_user, login_required
from app import db
from app.main import bp
from app.models import Post

@bp.route('/')
@bp.route('/index')
def index():
    page = request.args.get('page', 1, type=int)
    posts = Post.query.order_by(Post.timestamp.desc()).paginate(
        page=page, per_page=10, error_out=False)
    return render_template('index.html', title='Home', posts=posts)

@bp.route('/about')
def about():
    return render_template('about.html', title='About') 