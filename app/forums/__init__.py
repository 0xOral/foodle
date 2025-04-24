from flask import Blueprint

bp = Blueprint('forums', __name__)

from app.forums import routes 