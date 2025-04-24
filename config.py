import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'change-me')
    SQLALCHEMY_DATABASE_URI = (
        f"mysql://anas:palestine@192.168.1.7:3306/foodle"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False