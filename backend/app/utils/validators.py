import re
from flask import jsonify
from werkzeug.security import check_password_hash

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Validate password strength"""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    
    if not re.search(r'[0-9]', password):
        return False, "Password must contain at least one number"
    
    return True, "Password is valid"

def validate_phone(phone):
    """Validate phone number format"""
    pattern = r'^\+?[1-9]\d{1,14}$'  # E.164 format
    return re.match(pattern, phone) is not None

def validate_price(price):
    """Validate price is positive"""
    try:
        price = float(price)
        return price >= 0
    except (ValueError, TypeError):
        return False

def validate_quantity(quantity):
    """Validate quantity is positive integer"""
    try:
        quantity = int(quantity)
        return quantity > 0
    except (ValueError, TypeError):
        return False

def validate_request_json(required_fields):
    """Decorator to validate request JSON has required fields"""
    def decorator(f):
        from functools import wraps
        
        @wraps(f)
        def decorated_function(*args, **kwargs):
            data = request.get_json()
            if not data:
                return jsonify({'error': 'Request must be JSON'}), 400
                
            missing_fields = [field for field in required_fields if field not in data]
            if missing_fields:
                return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
                
            return f(*args, **kwargs)
        return decorated_function
    return decorator