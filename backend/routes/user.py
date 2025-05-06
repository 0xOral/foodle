from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Post, Course, user_courses
from datetime import datetime

user_bp = Blueprint('user', __name__)

@user_bp.route('/api/users/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    return jsonify({
        'id': str(user.id),
        'username': user.username,
        'profilePicture': "placeholder.svg",
        'karma': user.karma
    }), 200

@user_bp.route('/api/users/<user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    return jsonify({
        'id': str(user.id),
        'username': user.username,
        'profilePicture': "placeholder.svg",
        'karma': user.karma
    }), 200

@user_bp.route('/api/users/<user_id>/posts', methods=['GET'])
@jwt_required()
def get_user_posts(user_id):
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    posts = Post.query.filter_by(user_id=user_id).order_by(Post.timestamp.desc()).all()
    
    posts_data = [{
        'id': str(post.id),
        'content': post.content,
        'timestamp': post.timestamp.isoformat(),
        'userId': str(post.user_id),
        'courseId': str(post.courseId) if post.courseId else None,
        'image': post.image,
        'likes': post.likes,
        'comments': [{
            'id': str(comment.id),
            'content': comment.content,
            'timestamp': comment.timestamp.isoformat(),
            'userId': str(comment.user_id),
            'likes': comment.likes
        } for comment in post.comments]
    } for post in posts]
    
    return jsonify({'posts': posts_data}), 200

@user_bp.route('/api/users/<user_id>/courses', methods=['GET'])
@jwt_required()
def get_user_courses(user_id):
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    courses = Course.query.join(user_courses).filter(user_courses.c.user_id == user_id).all()
    
    courses_data = [{
        'id': str(course.id),
        'name': course.name,
        'code': course.code,
        'description': course.description,
        'instructor': course.instructor
    } for course in courses]
    
    return jsonify({'courses': courses_data}), 200

@user_bp.route('/api/users/<user_id>/karma', methods=['GET'])
@jwt_required()
def get_user_karma(user_id):
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    return jsonify({'karma': user.karma}), 200

@user_bp.route('/api/users/<user_id>/profile', methods=['PUT'])
@jwt_required()
def update_user_profile(user_id):
    current_user_id = get_jwt_identity()
    
    if str(current_user_id) != user_id:
        return jsonify({'message': 'Unauthorized'}), 403
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    data = request.get_json()
    
    if 'username' in data:
        # Check if username is already taken
        existing_user = User.query.filter_by(username=data['username']).first()
        if existing_user and existing_user.id != user_id:
            return jsonify({'message': 'Username already taken'}), 400
        user.username = data['username']
    
    if 'profilePicture' in data:
        user.profilePicture = data['profilePicture']
    
    try:
        db.session.commit()
        return jsonify({
            'message': 'Profile updated successfully',
            'user': {
                'id': str(user.id),
                'username': user.username,
                'profilePicture': "placeholder.svg",
                'karma': user.karma
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500 