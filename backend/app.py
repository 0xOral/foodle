from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from models import db, User
from routes import register_blueprints
import os

# Config class
class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'change-me')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-jwt-secret')  # Add the JWT secret key
    SQLALCHEMY_DATABASE_URI = "mysql://anas:palestine@192.168.1.7:3306/foodle"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

app = Flask(__name__)
app.config.from_object(Config)

# Initialize CORS
CORS(app, origins="http://localhost:8080", supports_credentials=True)

# Initialize DB
db.init_app(app)

# Initialize JWT
jwt = JWTManager(app)

# Register Blueprints
register_blueprints(app)