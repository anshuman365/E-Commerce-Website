from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.order import Order, OrderStatus
from ..models.order_item import OrderItem
from ..models.cart import Cart
from ..models.address import Address
from ..extensions import db

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('/checkout', methods=['POST'])
@jwt_required()
def checkout():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        # Get user's cart
        cart = Cart.query.filter_by(user_id=user_id).first_or_404()
        
        if not cart.items:
            return jsonify({'error': 'Cart is empty'}), 400
        
        # Create order
        order = Order(
            user_id=user_id,
            shipping_address_id=data['shipping_address_id'],
            total_amount=cart.get_total(),
            payment_method=data['payment_method']
        )
        
        db.session.add(order)
        
        # Add order items
        for cart_item in cart.items:
            order_item = OrderItem(
                order_id=order.id,
                product_id=cart_item.product_id,
                quantity=cart_item.quantity,
                unit_price=cart_item.unit_price,
                total_price=cart_item.get_subtotal()
            )
            db.session.add(order_item)
        
        # Clear cart
        db.session.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
        
        db.session.commit()
        
        return jsonify({
            'order_id': order.id,
            'status': order.status.value,
            'total_amount': float(order.total_amount)
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400