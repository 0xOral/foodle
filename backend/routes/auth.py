from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, User
from werkzeug.security import check_password_hash, generate_password_hash

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/')
def index():
    return jsonify(message="Welcome to the auth API")

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"err": "Username and password are required"}), 400

    user = User.query.filter_by(username=username).first()

    if user and check_password_hash(user.password_hash, password):
        access_token = create_access_token(identity=str(user.id))
        return jsonify({
            "access_token": access_token,
            "username": user.username,
            "id": user.id,
            "karma": user.karma,
            "enrolledCourses": [course.id for course in user.courses]
        }), 200

    else:
        return jsonify({"err": "Wrong username or password"}), 404  


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
        # After registration, generate JWT token
        access_token = create_access_token(identity=str(new_user.id))
        return jsonify(access_token=access_token, message="Account created successfully"), 201

    except Exception as e:
        db.session.rollback()  # Rollback in case of error
        return jsonify({"message": str(e)}), 500

@auth_bp.route('/api/user', methods=['GET'])
@jwt_required()  
def get_user():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    user_data = {
        "username": user.username,
        "id": user.id,
        "profilePicture": "/placeholder.svg",
        "enrolledCourses": [course.id for course in user.courses],
        "karma": user.karma
    }
    return jsonify(user_data), 200

