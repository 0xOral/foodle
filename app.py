import os
from flask import Flask
from flask_login import LoginManager
from models import db, User
from routes import register_blueprints

# Config class inside app.py
class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'change-me')
    SQLALCHEMY_DATABASE_URI = "mysql://anas:palestine@192.168.1.7:3306/foodle"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

app = Flask(__name__)
app.config.from_object(Config)

# Init DB
db.init_app(app)

# Init Login Manager
login_manager = LoginManager()
login_manager.login_view = 'auth.login'
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Register Blueprints
register_blueprints(app)

if __name__ == '__main__':
    app.run(debug=True)
