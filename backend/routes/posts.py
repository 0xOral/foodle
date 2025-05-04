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
        courseId = data.get('courseId')
        content = data.get('content')
        image = data.get('image')  # Optional field

        if not courseId or not content:
            return jsonify({"message": "Course ID and post content are required"}), 400

        # Find the course
        course = Course.query.get(courseId)
        if not course:
            return jsonify({"message": "Course not found"}), 404

        # Check if user is enrolled in the course
        if course not in user.courses:
            return jsonify({"message": "You must be enrolled in the course to post"}), 403

        # Create new post
        post = Post(
            content=content,
            user_id=user.id,
            courseId=courseId,    
            image=image  # Will be None if not provided
        )

        try:
            db.session.add(post)
            db.session.commit()
            post_data = {
                "id": str(post.id),
                "content": post.content,
                "createdAt": post.timestamp.isoformat(),
                "userId": str(post.user_id),
                "courseId": str(post.courseId),
                "likes": 0,
                "comments": []
            }
            
            # Only add image field if it exists
            if post.image:
                post_data["image"] = post.image

            return jsonify({
                "message": "Post created successfully",
                "post": post_data
            }), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": str(e)}), 500

    elif request.method == 'DELETE':
        data = request.get_json()

        # Validate input data
        postId = data.get('postId')

        if not postId:
            return jsonify({"message": "Post ID is required"}), 400

        # Find the post
        post = Post.query.get(postId)
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
            .filter(Post.courseId.in_([c.id for c in user.courses]))\
            .order_by(Post.timestamp.desc())\
            .all()

        posts_data = [{
            "id": str(post.id),
            "content": post.content,
            "createdAt": post.timestamp.isoformat(),
            "userId": str(post.user_id),
            "courseId": str(post.courseId),
            "username": post.user.username,
            "likes": post.likes or 0,
            "isLiked": user in post.liked_by,  # Check if current user liked the post
            "comments": [{
                "id": str(comment.id),
                "content": comment.content,
                "createdAt": comment.timestamp.isoformat(),
                "userId": str(comment.user_id),
                "postId": str(post.id),
                "username": comment.user.username
            } for comment in post.comments]
        } for post in posts]

        # Add image field only if it exists
        for i, post in enumerate(posts):
            if post.image:
                posts_data[i]["image"] = post.image

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
            "content": post.content,
            "timestamp": post.timestamp,
            "user_id": post.user_id,
            "courseId": post.courseId,
            "username": post.user.username,
            "comments": [{
                "id": comment.id,
                "content": comment.content,
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
            .filter(Post.courseId.in_([c.id for c in user_courses]))\
            .order_by(Post.timestamp.desc())\
            .all()

        # Format posts for response
        posts_data = [{
            "id": post.id,
            "content": post.content,
            "timestamp": post.timestamp,
            "user_id": post.user_id,
            "courseId": post.courseId,
            "username": post.user.username,
            "comments": [{
                "id": comment.id,
                "content": comment.content,
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

@posts_bp.route('/api/comment', methods=['POST'])
@jwt_required() 
def create_comment():
    user_id = get_jwt_identity() 
    user = User.query.get(user_id)

    data = request.get_json()

    # Validate input data
    post_id = data.get('postId')  # Changed from post_id to postId to match frontend
    content = data.get('content')

    if not post_id or not content:
        return jsonify({"message": "Post ID and comment content are required"}), 400

    # Find the post
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"message": "Post not found"}), 404

    # Create new comment
    comment = Comment(
        content=content,
        user_id=user.id,
        post_id=post_id
    )

    try:
        db.session.add(comment)
        db.session.commit()
        return jsonify({
            "message": "Comment created successfully",
            "comment": {
                "id": str(comment.id),
                "content": comment.content,
                "createdAt": comment.timestamp.isoformat(),
                "userId": str(comment.user_id),
                "postId": str(comment.post_id),
                "username": user.username,  # Include username for display
                "likes": 0
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500

@posts_bp.route('/api/comment', methods=['DELETE'])
@jwt_required()
def delete_comment():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    data = request.get_json()
    comment_id = data.get('commentId')
    if not comment_id:
        return jsonify({"message": "Comment ID is required"}), 400
    comment = Comment.query.get(comment_id)
    if not comment:
        return jsonify({"message": "Comment not found"}), 404
    if comment.user_id != user.id:
        return jsonify({"message": "Unauthorized to delete this comment"}), 403
    try:
        db.session.delete(comment)
        db.session.commit()
        return jsonify({"message": "Comment deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500

@posts_bp.route('/api/courses/<courseId>/posts', methods=['GET'])
@jwt_required()
def get_course_posts(courseId):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    # Verify course exists
    course = Course.query.get(courseId)
    if not course:
        return jsonify({"message": "Course not found"}), 404

    # Get all posts for the course
    posts = Post.query.filter_by(courseId=courseId).order_by(Post.timestamp.desc()).all()

    posts_list = [{
        "id": str(post.id),
        "userId": str(post.user_id),
        "courseId": str(post.courseId),
        "content": post.content,
        "likes": post.likes or 0,
        "isLiked": user in post.liked_by,  # Check if current user liked the post
        "createdAt": post.timestamp.isoformat(),
        "comments": [{
            "id": str(comment.id),
            "userId": str(comment.user_id),
            "postId": str(post.id),
            "content": comment.content,
            "createdAt": comment.timestamp.isoformat()
        } for comment in post.comments]
    } for post in posts]

    # Add image field only if it exists
    for i, post in enumerate(posts):
        if post.image:
            posts_list[i]["image"] = post.image

    return jsonify({"posts": posts_list}), 200

@posts_bp.route('/api/post/<int:post_id>/like', methods=['POST'])
@jwt_required()
def like_post(post_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    # Find the post
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"message": "Post not found"}), 404

    try:
        # Check if user already liked the post
        if post.is_liked_by(user):
            # Unlike the post
            post.liked_by.remove(user)
            post.likes = post.likes - 1
            post.user.karma = post.user.karma - 1
            action = "unliked"
        else:
            # Like the post
            post.liked_by.append(user)
            post.likes = post.likes + 1
            post.user.karma = post.user.karma + 1
            action = "liked"

        db.session.commit()
        return jsonify({
            "message": f"Post {action} successfully",
            "post": {
                "id": str(post.id),
                "likes": post.likes,
                "isLiked": post.is_liked_by(user)
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        print(f"Error in like_post: {str(e)}")
        return jsonify({"message": str(e)}), 500

# Add this new endpoint to check if a user has liked posts
@posts_bp.route('/api/posts/liked', methods=['GET'])
@jwt_required()
def get_liked_posts():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    try:
        liked_post_ids = [str(post.id) for post in user.liked_posts]
        return jsonify({
            "liked_posts": liked_post_ids
        }), 200
    except Exception as e:
        print(f"Error in get_liked_posts: {str(e)}")
        return jsonify({"message": str(e)}), 500
