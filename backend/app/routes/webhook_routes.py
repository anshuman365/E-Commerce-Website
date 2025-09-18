from flask import Blueprint, request, jsonify
from ..models.order import Order, OrderStatus
from ..extensions import db

webhook_bp = Blueprint('webhook', __name__)

@webhook_bp.route('/payment/stripe', methods=['POST'])
def stripe_webhook():
    try:
        payload = request.get_json()
        event_type = payload['type']
        
        if event_type == 'payment_intent.succeeded':
            payment_intent = payload['data']['object']
            order_id = payment_intent['metadata'].get('order_id')
            
            if order_id:
                order = Order.query.get(order_id)
                if order:
                    order.status = OrderStatus.PAID
                    db.session.commit()
        
        return jsonify({'success': True}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400