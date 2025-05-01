from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Course, Post, Comment

posts_bp = Blueprint('posts', __name__)

@posts_bp.route('/api/post', methods=['POST', 'DELETE'])
@jwt_required() 
def post():
    user_id = get_jwt_identity()
    user = User.query.get(user_id) 
    if request.method == 'POST':
        data = request.get_json()

        # Validate input data
        course_id = data.get('course_id')
        title = data.get('title')
        body = data.get('body')

        if not course_id or not body or not title:
            return jsonify({"message": "Course ID, title, and post body are required"}), 400

        # Find the course
        course = Course.query.get(course_id)
        if not course:
            return jsonify({"message": "Course not found"}), 404

        # Check if user is enrolled in the course
        if course not in user.courses:
            return jsonify({"message": "You must be enrolled in the course to post"}), 403

        # Create new post
        post = Post(
            body=body,
            title=title,
            user_id=user.id,
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
        if post.user_id != user.id:
            return jsonify({"message": "Unauthorized to delete this post"}), 403

        try:
            db.session.delete(post)
            db.session.commit()
            return jsonify({"message": "Post deleted successfully"}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": str(e)}), 500

@posts_bp.route('/api/post/home', methods=['GET'])
@jwt_required() 
def home_posts():
    user_id = get_jwt_identity()
    user = User.query.get(user_id) 
    try:
        # Get all posts from courses the user is enrolled in
        posts = Post.query\
            .filter(Post.course_id.in_([c.id for c in user.courses]))\
            .order_by(Post.timestamp.desc())\
            .all()

        posts_data = [{
            "id": post.id,
            "title": post.title,
            "content": post.body,
            "timestamp": post.timestamp,
            "userId": post.user_id,
            "courseId": post.course_id, 
            "image": "/placeholder.svg",  # Only if you have an image field
            "username": post.user.username,
            "likes": 69,  # Assuming you have a likes relationship
            "comments": [{
                "id": comment.id,
                "content": comment.body,
                "timestamp": comment.timestamp,
                "userId": comment.user_id,
                "postId": post.id,
                "username": comment.user.username,
                "createdAt": comment.timestamp.isoformat()
            } for comment in post.comments]
        } for post in posts]

        return jsonify({
            "message": "Posts retrieved successfully",
            "posts": posts_data
        }), 200

    except Exception as e:
        print(f"Error in home_posts: {str(e)}")  # Add logging for debugging
        return jsonify({"message": "Internal server error"}), 500

@posts_bp.route('/api/post/my', methods=['GET'])
@jwt_required() 
def my_posts():
    print("my posts")
    user_id = get_jwt_identity()
    user = User.query.get(user_id) 
    try:
        # Get all posts where user is the author
        posts = Post.query\
            .filter(Post.user_id == user_id)\
            .order_by(Post.timestamp.desc())\
            .all()

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

@posts_bp.route('/api/post/all', methods=['GET'])
@jwt_required() 
def all_posts():
    print("all posts")
    user_id = get_jwt_identity()
    user = User.query.get(user_id) 
    try:
        # Get all courses for current user
        user_courses = user.courses

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
@jwt_required() 
def create_comment():
    user_id = get_jwt_identity() 
    user = User.query.get(user_id)

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
            user_id=user.id,
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
        if comment.user_id != user.id:
            return jsonify({"message": "You can only delete your own comments"}), 403

        try:
            db.session.delete(comment)
            db.session.commit()
            return jsonify({"message": "Comment deleted successfully"}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": str(e)}), 500
