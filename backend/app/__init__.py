from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager      # Importa JWTManager
from .config import Config

db = SQLAlchemy()
jwt = JWTManager()     # Crea la instancia JWTManager

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    jwt.init_app(app)  # ¡ESTA LÍNEA ES CRUCIAL!

    from .routes import main
    app.register_blueprint(main)

    return app
