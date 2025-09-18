from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.user import User
from ..models.product import Product
from ..models.order import Order
from ..extensions import db
from ..utils.decorators import admin_required

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/dashboard', methods=['GET'])
@jwt_required()
@admin_required
def dashboard():
    try:
        # Get basic stats
        total_users = User.query.count()
        total_products = Product.query.count()
        total_orders = Order.query.count()
        
        # Get recent orders
        recent_orders = Order.query.order_by(Order.created_at.desc()).limit(10).all()
        
        return jsonify({
            'stats': {
                'total_users': total_users,
                'total_products': total_products,
                'total_orders': total_orders
            },
            'recent_orders': [{
                'id': order.id,
                'status': order.status.value,
                'total_amount': float(order.total_amount),
                'created_at': order.created_at.isoformat()
            } for order in recent_orders]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400