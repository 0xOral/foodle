from flask import Blueprint, request, render_template, redirect, url_for, flash, jsonify
from flask_login import login_user, logout_user, current_user, login_required
from models import db, User, Course, Post, Comment
from werkzeug.security import generate_password_hash, check_password_hash

bp = Blueprint('routes', __name__)

@bp.route('/')
def index():
    if current_user.is_authenticated:
        posts = Post.query.order_by(Post.timestamp.desc()).all()
        return render_template('index.html', posts=posts)
    return redirect(url_for('routes.login'))

@bp.route('/login', methods=['POST'])
def login():
    # Get the JSON data from the request
    data = request.get_json()

    # Debug: Print the received data
    print(f"Received data: {data}")

    # Extract username and password from the JSON payload
    username = data.get('username')
    password = data.get('password')

    # Ensure both username and password are provided
    if not username or not password:
        return jsonify({"err": "Username and password are required"}), 400

    # Find user by username
    user = User.query.filter_by(username=username).first()

    # Check if user exists and if password matches
    if user and check_password_hash(user.password_hash, password):
        login_user(user)
        return jsonify({"message": "Login successful"}), 200  # Successful login response
    else:
        return jsonify({"err": "Wrong username or password"}), 404  # Invalid credentials error


@bp.route('/logout', methods=['GET'])
@login_required
def logout():
    logout_user()  # Log out the user
    return jsonify({"message": "Logged out successfully"}), 200  # Return JSON response


@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()  # Get JSON data from the request

    # Validate input data
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"message": "Username and password are required"}), 400

    # Check if user already exists
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({"message": "User already exists"}), 400

    # Hash the password and create a new user
    hashed_password = generate_password_hash(password)
    new_user = User(username=username, password_hash=hashed_password)

    try:
        # Add new user to the database and commit
        db.session.add(new_user)
        db.session.commit()
        login_user(new_user)
        return jsonify({"message": "Account created successfully"}), 201

    except Exception as e:
        db.session.rollback()  # Rollback in case of error
        return jsonify({"message": str(e)}), 500

@bp.route('/api/courses', methods=['GET'])
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


@bp.route('/api/enroll', methods=['POST'])
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
    

@bp.route('/api/unenroll', methods=['POST'])
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


@bp.route('/api/post', methods=['POST', 'DELETE', 'GET'])
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

@bp.route('/api/comment', methods=['POST', 'DELETE'])
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
        print("Deleting comment")
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

