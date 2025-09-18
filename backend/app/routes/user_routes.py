from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.user import User
from ..models.address import Address
from ..extensions import db

users_bp = Blueprint('users', __name__)

@users_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        user_id = get_jwt_identity()
        user = User.query.get_or_404(user_id)
        
        return jsonify({
            'id': user.id,
            'email': user.email,
            'full_name': user.full_name,
            'phone': user.phone
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@users_bp.route('/addresses', methods=['GET'])
@jwt_required()
def get_addresses():
    try:
        user_id = get_jwt_identity()
        addresses = Address.query.filter_by(user_id=user_id).all()
        
        return jsonify([{
            'id': addr.id,
            'label': addr.label,
            'line1': addr.line1,
            'line2': addr.line2,
            'city': addr.city,
            'state': addr.state,
            'postal_code': addr.postal_code,
            'country': addr.country,
            'is_default': addr.is_default
        } for addr in addresses]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400