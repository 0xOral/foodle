from .auth import auth_bp
from .posts import posts_bp
from .courses import courses_bp

def register_blueprints(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(posts_bp)
    app.register_blueprint(courses_bp)