from flask import render_template, flash, redirect, url_for, request
from flask_login import current_user, login_required
from app import db
from app.forums import bp
from app.forums.forms import PostForm
from app.models import Post

@bp.route('/create', methods=['GET', 'POST'])
@login_required
def create_post():
    form = PostForm()
    if form.validate_on_submit():
        post = Post(title=form.title.data, body=form.body.data,
                   category=form.category.data, tags=form.tags.data,
                   author=current_user)
        db.session.add(post)
        db.session.commit()
        flash('Your post is now live!')
        return redirect(url_for('forums.view_post', post_id=post.id))
    return render_template('forums/create_post.html', title='Create Post', form=form)

@bp.route('/post/<int:post_id>')
def view_post(post_id):
    post = Post.query.get_or_404(post_id)
    return render_template('forums/post.html', post=post)

@bp.route('/category/<category>')
def category(category):
    page = request.args.get('page', 1, type=int)
    posts = Post.query.filter_by(category=category).order_by(
        Post.timestamp.desc()).paginate(
        page=page, per_page=10, error_out=False)
    return render_template('forums/category.html', title=category, posts=posts) 