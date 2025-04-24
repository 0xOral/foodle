from flask import Blueprint, request, render_template, redirect, url_for, flash, jsonify
from flask_login import login_user, logout_user, current_user, login_required
from models import db, User, Course, Post, Comment
from werkzeug.security import generate_password_hash, check_password_hash

posts_bp = Blueprint('posts', __name__)

@posts_bp.route('/api/post', methods=['POST', 'DELETE', 'GET'])
@login_required
def post():
    if request.method == 'POST':
        data = request.get_json()

        # Validate input data
        course_id = data.get('course_id')
        title = data.get('title')
        body = data.get('body')

        if not course_id or not body or not title:
            return jsonify({"message": "Course ID, title and post body are required"}), 400

        # Find the course
        course = Course.query.get(course_id)
        if not course:
            return jsonify({"message": "Course not found"}), 404

        # Check if user is enrolled in the course
        if course not in current_user.courses:
            return jsonify({"message": "You must be enrolled in the course to post"}), 403

        # Create new post
        post = Post(
            body=body,
            title=title,
            user_id=current_user.id,
            course_id=course_id
        )

        try:
            db.session.add(post)
            db.session.commit()
            return jsonify({
                "message": "Post created successfully",
                "post": {
                    "id": post.id,
                    "body": post.body,
                    "timestamp": post.timestamp,
                    "user_id": post.user_id,
                    "course_id": post.course_id
                }
            }), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": str(e)}), 500

    elif request.method == 'DELETE':
        data = request.get_json()
        
        # Validate input data
        post_id = data.get('post_id')
        
        if not post_id:
            return jsonify({"message": "Post ID is required"}), 400

        # Find the post
        post = Post.query.get(post_id)
        if not post:
            return jsonify({"message": "Post not found"}), 404

        # Check if user owns the post
        if post.user_id != current_user.id:
            return jsonify({"message": "Unauthorized to delete this post"}), 403

        try:
            db.session.delete(post)
            db.session.commit()
            return jsonify({"message": "Post deleted successfully"}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": str(e)}), 500

    elif request.method == 'GET':
        try:
            # Get all courses for current user
            user_courses = current_user.courses
            
            # Query posts for all user's courses
            posts = Post.query\
                .filter(Post.course_id.in_([c.id for c in user_courses]))\
                .order_by(Post.timestamp.desc())\
                .all()
            
            # Format posts for response
            posts_data = [{
                "id": post.id,
                "title": post.title,
                "body": post.body,
                "timestamp": post.timestamp,
                "user_id": post.user_id,
                "course_id": post.course_id,
                "username": post.user.username,
                "comments": [{
                    "id": comment.id,
                    "body": comment.body,
                    "timestamp": comment.timestamp,
                    "user_id": comment.user_id,
                    "username": comment.user.username
                } for comment in post.comments]
            } for post in posts]

            return jsonify({
                "message": "Posts retrieved successfully", 
                "posts": posts_data
            }), 200
            
        except Exception as e:
            return jsonify({"message": str(e)}), 500

@posts_bp.route('/api/comment', methods=['POST', 'DELETE'])
@login_required
def create_comment():
    if request.method == 'POST':
        data = request.get_json()

        # Validate input data
        post_id = data.get('post_id')
        body = data.get('body')

        if not post_id or not body:
            return jsonify({"message": "Post ID and comment body are required"}), 400

        # Find the post
        post = Post.query.get(post_id)
        if not post:
            return jsonify({"message": "Post not found"}), 404

        # Create new comment
        comment = Comment(
            body=body,
            user_id=current_user.id,
            post_id=post_id
        )

        try:
            db.session.add(comment)
            db.session.commit()
            return jsonify({
                "message": "Comment created successfully",
                "comment": {
                    "id": comment.id,
                    "body": comment.body,
                    "timestamp": comment.timestamp,
                    "user_id": comment.user_id
                }
            }), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": str(e)}), 500

    elif request.method == 'DELETE':
        data = request.get_json()
        comment_id = data.get('comment_id')

        if not comment_id:
            return jsonify({"message": "Comment ID is required"}), 400

        comment = Comment.query.get(comment_id)
        if not comment:
            return jsonify({"message": "Comment not found"}), 404

        # Check if the user is the author of the comment
        if comment.user_id != current_user.id:
            return jsonify({"message": "You can only delete your own comments"}), 403

        try:
            db.session.delete(comment)
            db.session.commit()
            return jsonify({"message": "Comment deleted successfully"}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": str(e)}), 500

