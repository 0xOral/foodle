from flask import Blueprint, request, render_template, redirect, url_for, flash, jsonify
from flask_login import login_user, logout_user, current_user, login_required
from models import db, User, Course, Post, Comment
from werkzeug.security import generate_password_hash, check_password_hash

auth_bp = Blueprint('auth', __name__) 

@auth_bp.route('/')
def index():
    if current_user.is_authenticated:
        posts = Post.query.order_by(Post.timestamp.desc()).all()
        return render_template('index.html', posts=posts)
    return redirect(url_for('routes.login'))

@auth_bp.route('/login', methods=['POST'])
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


@auth_bp.route('/logout', methods=['GET'])
@login_required
def logout():
    logout_user()  # Log out the user
    return jsonify({"message": "Logged out successfully"}), 200  # Return JSON response


@auth_bp.route('/register', methods=['POST'])
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