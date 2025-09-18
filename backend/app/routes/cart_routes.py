from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.cart import Cart
from ..models.cart_item import CartItem
from ..models.product import Product
from ..extensions import db

cart_bp = Blueprint('cart', __name__)

def get_or_create_cart(user_id):
    cart = Cart.query.filter_by(user_id=user_id).first()
    if not cart:
        cart = Cart(user_id=user_id)
        db.session.add(cart)
        db.session.commit()
    return cart

@cart_bp.route('/', methods=['GET'])
@jwt_required()
def get_cart():
    try:
        user_id = get_jwt_identity()
        cart = get_or_create_cart(user_id)
        
        return jsonify({
            'id': cart.id,
            'items': [{
                'id': item.id,
                'product_id': item.product_id,
                'name': item.product.name,
                'quantity': item.quantity,
                'unit_price': float(item.unit_price),
                'subtotal': float(item.get_subtotal()),
                'image': item.product.images[0] if item.product.images else None
            } for item in cart.items],
            'total': float(cart.get_total())
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@cart_bp.route('/items', methods=['POST'])
@jwt_required()
def add_to_cart():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        product = Product.query.get_or_404(data['product_id'])
        cart = get_or_create_cart(user_id)
        
        # Check if item already in cart
        existing_item = next((item for item in cart.items if item.product_id == product.id), None)
        
        if existing_item:
            existing_item.quantity += data.get('quantity', 1)
        else:
            cart_item = CartItem(
                cart_id=cart.id,
                product_id=product.id,
                quantity=data.get('quantity', 1),
                unit_price=product.discount_price or product.price
            )
            db.session.add(cart_item)
        
        db.session.commit()
        
        return jsonify({'message': 'Item added to cart'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400