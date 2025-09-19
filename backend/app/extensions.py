from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_migrate import Migrate
from flask_login import LoginManager

db = SQLAlchemy()
jwt = JWTManager()
mail = Mail()
migrate = Migrate()
login_manager = LoginManager()