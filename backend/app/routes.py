from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from .models import User
from . import db

main = Blueprint('main', __name__)

@main.route('/')
def home():
    return '¡Hola desde la nueva estructura Flask!'

@main.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({'message': 'Faltan datos'}), 400

    user = User.query.filter((User.username == username) | (User.email == email)).first()
    if user:
        return jsonify({'message': 'Usuario o email ya existe'}), 400

    hashed_password = generate_password_hash(password)
    new_user = User(username=username, email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'Usuario registrado exitosamente'})

@main.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Faltan datos'}), 400

    user = User.query.filter_by(username=username).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({'message': 'Credenciales inválidas'}), 401

    # ¡CORREGIDO AQUÍ!
    access_token = create_access_token(identity=str(user.id))
    return jsonify({'token': access_token, 'message': 'Login exitoso'})

# ---- Ruta protegida con JWT ----
@main.route('/dashboard', methods=['GET'])
@jwt_required()
def dashboard():
    current_user_id = get_jwt_identity()
    return jsonify({"message": f"Bienvenido al dashboard, usuario {current_user_id}"})
