from flask import Blueprint, request, render_template, redirect, url_for, flash, jsonify
from flask_login import login_user, logout_user, current_user, login_required
from models import db, User, Course, Post, Comment
from werkzeug.security import generate_password_hash, check_password_hash

courses_bp = Blueprint('courses', __name__)

@courses_bp.route('/api/courses', methods=['GET'])
@login_required
def get_courses():
    # Get the current user from Flask-Login
    user = current_user

    # Retrieve all courses the user is enrolled in
    courses = user.courses

    # Convert the courses to a list of dictionaries to return in the response
    courses_list = [{"id": course.id, "name": course.name} for course in courses]

    # Return the list of courses as a JSON response
    return jsonify({"courses": courses_list}), 200


@courses_bp.route('/api/enroll', methods=['POST'])
@login_required
def enroll():
    data = request.get_json()  # Get JSON data from the request

    # Validate input data
    course_id = data.get('course_id')

    if not course_id:
        return jsonify({"message": "Course ID is required"}), 400

    # Find the course by its ID
    course = Course.query.get(course_id)

    if not course:
        return jsonify({"message": "Course not found"}), 404

    # Check if the user is already enrolled in this course
    if course in current_user.courses:
        return jsonify({"message": "Already enrolled in this course"}), 400

    # Add the course to the user's enrolled courses
    current_user.courses.append(course)

    try:
        # Commit the change to the database
        db.session.commit()
        return jsonify({"message": f"Successfully enrolled in {course.name}"}), 200
    except Exception as e:
        db.session.rollback()  # Rollback in case of error
        return jsonify({"message": str(e)}), 500
    

@courses_bp.route('/api/unenroll', methods=['POST'])
@login_required
def unenroll():
    data = request.get_json()  # Get JSON data from the request

    # Validate input data
    course_id = data.get('course_id')

    if not course_id:
        return jsonify({"message": "Course ID is required"}), 400

    # Find the course by its ID
    course = Course.query.get(course_id)

    if not course:
        return jsonify({"message": "Course not found"}), 404

    # Check if the user is enrolled in this course
    if course not in current_user.courses:
        return jsonify({"message": "Not enrolled in this course"}), 400

    # Remove the course from the user's enrolled courses
    current_user.courses.remove(course)

    try:
        # Commit the change to the database
        db.session.commit()
        return jsonify({"message": f"Successfully unenrolled from {course.name}"}), 200
    except Exception as e:
        db.session.rollback()  # Rollback in case of error
        return jsonify({"message": str(e)}), 500

