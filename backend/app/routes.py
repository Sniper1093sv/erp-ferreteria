from flask import Blueprint, request, jsonify, send_file
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from . import db
from .models import User, Seller, Client, Product, Order, OrderDetail
import pandas as pd
import io
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

main = Blueprint('main', __name__)

# ======= RUTA DE PRUEBA =======
@main.route('/')
def home():
    return '¡Hola desde la nueva estructura Flask!'

# ======= USUARIOS =======
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

    access_token = create_access_token(identity=str(user.id))
    return jsonify({'token': access_token, 'message': 'Login exitoso'})

# ======= DASHBOARD PROTEGIDO =======
@main.route('/dashboard', methods=['GET'])
@jwt_required()
def dashboard():
    current_user_id = get_jwt_identity()
    return jsonify({"message": f"Bienvenido al dashboard, usuario {current_user_id}"})


# ======= VENDEDORES =======
@main.route('/sellers', methods=['POST'])
@jwt_required()
def create_seller():
    data = request.get_json()
    name = data.get('name')
    zone = data.get('zone')
    phone = data.get('phone')
    email = data.get('email')

    if not name or not zone or not email:
        return jsonify({'message': 'Faltan datos obligatorios'}), 400

    if Seller.query.filter_by(email=email).first():
        return jsonify({'message': 'Ya existe un vendedor con ese email'}), 400

    seller = Seller(name=name, zone=zone, phone=phone, email=email)
    db.session.add(seller)
    db.session.commit()

    return jsonify({'message': 'Vendedor creado correctamente'})

@main.route('/sellers', methods=['GET'])
@jwt_required()
def list_sellers():
    sellers = Seller.query.all()
    sellers_data = [
        {
            'id': s.id,
            'name': s.name,
            'zone': s.zone,
            'phone': s.phone,
            'email': s.email
        } for s in sellers
    ]
    return jsonify(sellers_data)

@main.route('/sellers/<int:seller_id>', methods=['PUT'])
@jwt_required()
def update_seller(seller_id):
    seller = Seller.query.get_or_404(seller_id)
    data = request.get_json()
    seller.name = data.get('name', seller.name)
    seller.zone = data.get('zone', seller.zone)
    seller.phone = data.get('phone', seller.phone)
    seller.email = data.get('email', seller.email)
    db.session.commit()
    return jsonify({'message': 'Vendedor actualizado correctamente'})

@main.route('/sellers/<int:seller_id>', methods=['DELETE'])
@jwt_required()
def delete_seller(seller_id):
    seller = Seller.query.get_or_404(seller_id)
    db.session.delete(seller)
    db.session.commit()
    return jsonify({'message': 'Vendedor eliminado correctamente'})


# ======= CLIENTES =======
@main.route('/clients', methods=['POST'])
@jwt_required()
def create_client():
    data = request.get_json()
    name = data.get('name')
    phone = data.get('phone')
    email = data.get('email')
    address = data.get('address')

    if not name or not email:
        return jsonify({'message': 'Faltan datos obligatorios'}), 400

    if Client.query.filter_by(email=email).first():
        return jsonify({'message': 'Ya existe un cliente con ese email'}), 400

    client = Client(name=name, phone=phone, email=email, address=address)
    db.session.add(client)
    db.session.commit()

    return jsonify({'message': 'Cliente creado correctamente'})

@main.route('/clients', methods=['GET'])
@jwt_required()
def list_clients():
    clients = Client.query.all()
    clients_data = [
        {
            'id': c.id,
            'name': c.name,
            'phone': c.phone,
            'email': c.email,
            'address': c.address
        } for c in clients
    ]
    return jsonify(clients_data)

@main.route('/clients/<int:client_id>', methods=['PUT'])
@jwt_required()
def update_client(client_id):
    client = Client.query.get_or_404(client_id)
    data = request.get_json()
    client.name = data.get('name', client.name)
    client.phone = data.get('phone', client.phone)
    client.email = data.get('email', client.email)
    client.address = data.get('address', client.address)
    db.session.commit()
    return jsonify({'message': 'Cliente actualizado correctamente'})

@main.route('/clients/<int:client_id>', methods=['DELETE'])
@jwt_required()
def delete_client(client_id):
    client = Client.query.get_or_404(client_id)
    db.session.delete(client)
    db.session.commit()
    return jsonify({'message': 'Cliente eliminado correctamente'})


# ======= PRODUCTOS =======
@main.route('/products', methods=['POST'])
@jwt_required()
def create_product():
    data = request.get_json()
    name = data.get('name')
    description = data.get('description')
    price = data.get('price')
    stock = data.get('stock')
    category = data.get('category')

    if not name or price is None or stock is None:
        return jsonify({'message': 'Faltan datos obligatorios'}), 400

    product = Product(
        name=name,
        description=description,
        price=price,
        stock=stock,
        category=category
    )
    db.session.add(product)
    db.session.commit()

    return jsonify({'message': 'Producto creado correctamente'})

@main.route('/products', methods=['GET'])
@jwt_required()
def list_products():
    products = Product.query.all()
    products_data = [
        {
            'id': p.id,
            'name': p.name,
            'description': p.description,
            'price': p.price,
            'stock': p.stock,
            'category': p.category
        } for p in products
    ]
    return jsonify(products_data)

@main.route('/products/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    product = Product.query.get_or_404(product_id)
    data = request.get_json()
    product.name = data.get('name', product.name)
    product.description = data.get('description', product.description)
    product.price = data.get('price', product.price)
    product.stock = data.get('stock', product.stock)
    product.category = data.get('category', product.category)
    db.session.commit()
    return jsonify({'message': 'Producto actualizado correctamente'})

@main.route('/products/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    product = Product.query.get_or_404(product_id)
    db.session.delete(product)
    db.session.commit()
    return jsonify({'message': 'Producto eliminado correctamente'})


# ======= ÓRDENES =======
@main.route('/orders', methods=['POST'])
@jwt_required()
def create_order():
    data = request.get_json()
    client_id = data.get('client_id')
    seller_id = data.get('seller_id')
    date = data.get('date')
    total = data.get('total')

    if not client_id or not seller_id or not date or total is None:
        return jsonify({'message': 'Faltan datos obligatorios'}), 400

    order = Order(client_id=client_id, seller_id=seller_id, date=date, total=total)
    db.session.add(order)
    db.session.commit()

    return jsonify({'message': 'Orden creada correctamente'})

@main.route('/orders', methods=['GET'])
@jwt_required()
def list_orders():
    orders = Order.query.all()
    orders_data = [
        {
            'id': o.id,
            'client_id': o.client_id,
            'seller_id': o.seller_id,
            'date': o.date,
            'total': o.total
        } for o in orders
    ]
    return jsonify(orders_data)

@main.route('/orders/<int:order_id>', methods=['PUT'])
@jwt_required()
def update_order(order_id):
    order = Order.query.get_or_404(order_id)
    data = request.get_json()
    order.client_id = data.get('client_id', order.client_id)
    order.seller_id = data.get('seller_id', order.seller_id)
    order.date = data.get('date', order.date)
    order.total = data.get('total', order.total)
    db.session.commit()
    return jsonify({'message': 'Orden actualizada correctamente'})

@main.route('/orders/<int:order_id>', methods=['DELETE'])
@jwt_required()
def delete_order(order_id):
    order = Order.query.get_or_404(order_id)
    db.session.delete(order)
    db.session.commit()
    return jsonify({'message': 'Orden eliminada correctamente'})


# ======= DETALLES DE ORDEN =======
@main.route('/orders/<int:order_id>/add_product', methods=['POST'])
@jwt_required()
def add_product_to_order(order_id):
    data = request.get_json()
    product_id = data.get('product_id')
    quantity = data.get('quantity')
    unit_price = data.get('unit_price')

    if not product_id or quantity is None or unit_price is None:
        return jsonify({'message': 'Faltan datos obligatorios'}), 400

    detail = OrderDetail(order_id=order_id, product_id=product_id, quantity=quantity, unit_price=unit_price)
    db.session.add(detail)
    db.session.commit()

    return jsonify({'message': 'Producto agregado a la orden correctamente'})

@main.route('/orders/<int:order_id>/details', methods=['GET'])
@jwt_required()
def list_order_details(order_id):
    details = OrderDetail.query.filter_by(order_id=order_id).all()
    details_data = [
        {
            'id': d.id,
            'order_id': d.order_id,
            'product_id': d.product_id,
            'quantity': d.quantity,
            'unit_price': d.unit_price
        } for d in details
    ]
    return jsonify(details_data)


# ======= ESTADÍSTICAS =======
@main.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    total_orders = Order.query.count()
    total_sales = db.session.query(db.func.sum(Order.total)).scalar() or 0
    total_products = Product.query.count()
    total_clients = Client.query.count()
    total_sellers = Seller.query.count()

    return jsonify({
        'total_orders': total_orders,
        'total_sales': total_sales,
        'total_products': total_products,
        'total_clients': total_clients,
        'total_sellers': total_sellers
    })


# ======= EXPORTACIÓN DE ÓRDENES A EXCEL =======
@main.route('/export/orders', methods=['GET'])
@jwt_required()
def export_orders():
    orders = Order.query.all()
    orders_data = [{
        'id': o.id,
        'client_id': o.client_id,
        'seller_id': o.seller_id,
        'date': o.date,
        'total': o.total
    } for o in orders]

    df = pd.DataFrame(orders_data)

    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Órdenes')

    output.seek(0)

    return send_file(
        output,
        as_attachment=True,
        download_name='ordenes.xlsx',
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )

@main.route('/export/clients/pdf', methods=['GET'])
@jwt_required()
def export_clients_pdf():
    clients = Client.query.all()

    # Crear PDF en memoria
    output = io.BytesIO()
    c = canvas.Canvas(output, pagesize=letter)
    width, height = letter

    # Título
    c.setFont("Helvetica-Bold", 16)
    c.drawString(40, height - 40, "Listado de Clientes")

    # Encabezados de columnas
    c.setFont("Helvetica-Bold", 12)
    y = height - 80
    c.drawString(40, y, "ID")
    c.drawString(80, y, "Nombre")
    c.drawString(250, y, "Email")
    c.drawString(400, y, "Teléfono")
    c.drawString(500, y, "Dirección")

    # Datos de los clientes
    c.setFont("Helvetica", 10)
    y -= 20
    for client in clients:
        if y < 40:
            c.showPage()
            y = height - 40
        c.drawString(40, y, str(client.id))
        c.drawString(80, y, client.name)
        c.drawString(250, y, client.email)
        c.drawString(400, y, client.phone if client.phone else "")
        c.drawString(500, y, client.address if client.address else "")
        y -= 15

    c.save()
    output.seek(0)

    return send_file(
        output,
        as_attachment=True,
        download_name='clientes.pdf',
        mimetype='application/pdf'
    )

@main.route('/export/products/pdf', methods=['GET'])
@jwt_required()
def export_products_pdf():
    products = Product.query.all()

    output = io.BytesIO()
    c = canvas.Canvas(output, pagesize=letter)
    width, height = letter

    c.setFont("Helvetica-Bold", 16)
    c.drawString(40, height - 40, "Listado de Productos")

    c.setFont("Helvetica-Bold", 12)
    y = height - 80
    c.drawString(40, y, "ID")
    c.drawString(80, y, "Nombre")
    c.drawString(250, y, "Descripción")
    c.drawString(400, y, "Precio")
    c.drawString(480, y, "Stock")
    c.drawString(540, y, "Categoría")

    c.setFont("Helvetica", 10)
    y -= 20
    for p in products:
        if y < 40:
            c.showPage()
            y = height - 40
        c.drawString(40, y, str(p.id))
        c.drawString(80, y, p.name)
        c.drawString(250, y, p.description if p.description else "")
        c.drawString(400, y, str(p.price))
        c.drawString(480, y, str(p.stock))
        c.drawString(540, y, p.category if p.category else "")
        y -= 15

    c.save()
    output.seek(0)

    return send_file(
        output,
        as_attachment=True,
        download_name='productos.pdf',
        mimetype='application/pdf'
    )

@main.route('/export/sellers/pdf', methods=['GET'])
@jwt_required()
def export_sellers_pdf():
    sellers = Seller.query.all()

    output = io.BytesIO()
    c = canvas.Canvas(output, pagesize=letter)
    width, height = letter

    c.setFont("Helvetica-Bold", 16)
    c.drawString(40, height - 40, "Listado de Vendedores")

    c.setFont("Helvetica-Bold", 12)
    y = height - 80
    c.drawString(40, y, "ID")
    c.drawString(80, y, "Nombre")
    c.drawString(250, y, "Zona")
    c.drawString(350, y, "Email")
    c.drawString(500, y, "Teléfono")

    c.setFont("Helvetica", 10)
    y -= 20
    for s in sellers:
        if y < 40:
            c.showPage()
            y = height - 40
        c.drawString(40, y, str(s.id))
        c.drawString(80, y, s.name)
        c.drawString(250, y, s.zone)
        c.drawString(350, y, s.email)
        c.drawString(500, y, s.phone if s.phone else "")
        y -= 15

    c.save()
    output.seek(0)

    return send_file(
        output,
        as_attachment=True,
        download_name='vendedores.pdf',
        mimetype='application/pdf'
    )

@main.route('/export/orders/pdf', methods=['GET'])
@jwt_required()
def export_orders_pdf():
    orders = Order.query.all()

    output = io.BytesIO()
    c = canvas.Canvas(output, pagesize=letter)
    width, height = letter

    c.setFont("Helvetica-Bold", 16)
    c.drawString(40, height - 40, "Listado de Órdenes")

    c.setFont("Helvetica-Bold", 12)
    y = height - 80
    c.drawString(40, y, "ID")
    c.drawString(80, y, "Cliente")
    c.drawString(250, y, "Vendedor")
    c.drawString(400, y, "Fecha")
    c.drawString(480, y, "Total")

    c.setFont("Helvetica", 10)
    y -= 20
    for o in orders:
        if y < 40:
            c.showPage()
            y = height - 40
        c.drawString(40, y, str(o.id))
        c.drawString(80, y, str(o.client_id))
        c.drawString(250, y, str(o.seller_id))
        c.drawString(400, y, o.date)
        c.drawString(480, y, str(o.total))
        y -= 15

    c.save()
    output.seek(0)

    return send_file(
        output,
        as_attachment=True,
        download_name='ordenes.pdf',
        mimetype='application/pdf'
    )
