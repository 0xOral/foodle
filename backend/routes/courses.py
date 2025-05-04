from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Course, Post

courses_bp = Blueprint('courses', __name__)

@courses_bp.route('/api/courses', methods=['POST'])
def create_course():
    data = request.get_json()

    # Validate required fields
    if not all(key in data for key in ['title', 'description', 'code']):
        return jsonify({"message": "Title, code, and description are required"}), 400

    try:
        # Create new course
        new_course = Course(
            name=data['title'],
            code=data['code'],
            description=data['description'],
            instructor="Prof. Anderson"  # Hardcoded for now
        )

        db.session.add(new_course)
        db.session.commit()

        return jsonify({
            "message": "Course created successfully",
            "course": {
                "id": new_course.id,
                "userId": new_course.userId,
                "code": new_course.code,
                "name": new_course.name,
                "description": new_course.description,
                "instructor": new_course.instructor
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500

@courses_bp.route('/api/courses/<courseId>', methods=['DELETE'])
def delete_course(courseId):
    course = Course.query.get(courseId)
    if not course:
        return jsonify({"message": "Course not found"}), 404
    
    try:
        db.session.delete(course)
        db.session.commit()
        return jsonify({"message": "Course deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": str(e)}), 500


@courses_bp.route('/api/courses/all', methods=['GET'])
@jwt_required()  # Protect route with JWT
def get_courses():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    courses = Course.query.all()

    courses_list = [{
        "id": course.id,
        "code": "CS101", # TODO: change to course.code
        "name": course.name, # TODO: change to course.name
        "description": "Fundamental concepts of computer science and programming", # TODO: change to course.description
        "instructor": "Prof. Anderson", # TODO: change to course.instructor
        "enrolledStudents": [] # TODO: change to course.enrolledStudents
    } for course in courses]

    return jsonify({"courses": courses_list}), 200

@courses_bp.route('/api/courses/my', methods=['GET'])
@jwt_required()
def get_my_courses():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    courses = user.courses

    courses_list = [{
        "id": course.id,
        "code": "CS101", # TODO: change to course.code
        "name": course.name, # TODO: change to course.name
        "description": "Fundamental concepts of computer science and programming", # TODO: change to course.description
        "instructor": "Prof. Anderson", # TODO: change to course.instructor
        "enrolledStudents": [] # TODO: change to course.enrolledStudents
    } for course in courses]

    return jsonify({"courses": courses_list}), 200

@courses_bp.route('/api/courses/<courseId>/posts', methods=['GET'])
@jwt_required()
def get_course_posts(courseId):
    # Verify course exists
    course = Course.query.get(courseId)
    if not course:
        return jsonify({"message": "Course not found"}), 404

    # Get all posts for the course
    posts = Post.query.filter_by(courseId=courseId).order_by(Post.timestamp.desc()).all()

    posts_list = [{
        "id": post.id,
        "userId": post.user_id,
        "courseId": post.courseId,
        "content": post.content,
        "image": "/placeholder.svg", # TODO: change to post.image_url
        "karma": post.upvotes - post.downvotes, # TODO: change to post.likes
        "createdAt": post.timestamp, # TODO: change to post.created_at
        "comments": [{
            "id": comment.id,
            "userId": comment.user_id,
            "postId": comment.courseId,
            "content": comment.content,
            "createdAt": "2024-01-01" # TODO: change to comment.created_at  
        } for comment in post.comments]
    } for post in posts]

    return jsonify({"posts": posts_list}), 200

@courses_bp.route('/api/courses/<courseId>/info', methods=['GET'])
@jwt_required()
def get_course_info(courseId):
    course = Course.query.get(courseId)
    if not course:
        return jsonify({"message": "Course not found"}), 404
    
    course_data = {
        "id": course.id,
        "code": course.code,
        "name": course.name,
        "description": course.description,
        "instructor": course.instructor,
        "enrolledStudents": [student.id for student in course.enrolledStudents]
    }

    return jsonify({"course": course_data}), 200

@courses_bp.route('/api/enroll', methods=['POST'])
@jwt_required()  # Protect route with JWT
def enroll():
    data = request.get_json()  # Get JSON data from the request

    courseId = data.get('courseId')

    if not courseId:
        return jsonify({"message": "Course ID is required"}), 400

    course = Course.query.get(courseId)

    if not course:
        return jsonify({"message": "Course not found"}), 404

    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    if course in user.courses:
        return jsonify({"message": "Already enrolled in this course"}), 400

    user.courses.append(course)

    try:
        db.session.commit()
        return jsonify({"message": f"Successfully enrolled in {course.name}"}), 200
    except Exception as e:
        db.session.rollback()  # Rollback in case of error
        return jsonify({"message": str(e)}), 500


@courses_bp.route('/api/unenroll', methods=['POST'])
@jwt_required()  # Protect route with JWT
def unenroll():
    data = request.get_json()  # Get JSON data from the request

    courseId = data.get('courseId')

    if not courseId:
        return jsonify({"message": "Course ID is required"}), 400

    course = Course.query.get(courseId)

    if not course:
        return jsonify({"message": "Course not found"}), 404

    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"message": "User not found"}), 404

    if course not in user.courses:
        return jsonify({"message": "Not enrolled in this course"}), 400

    user.courses.remove(course)

    try:
        db.session.commit()
        return jsonify({
            "message": f"Successfully unenrolled from {course.name}",
            "course": {
                "id": course.id,
                "code": course.code,
                "name": course.name,
                "description": course.description,
                "instructor": course.instructor,
                "enrolledStudents": [student.id for student in course.enrolledStudents]
            }
        }), 200
    except Exception as e:
        db.session.rollback()  # Rollback in case of error
        return jsonify({"message": str(e)}), 500
