from flask import Flask
from flask_migrate import Migrate
from flask_login import LoginManager
from config import Config
from models import db, User

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate = Migrate(app, db)

    login = LoginManager(app)
    login.login_view = 'login'

    @login.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    # Blueprints or routes go here
    from routes import bp as routes_bp
    app.register_blueprint(routes_bp)

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
