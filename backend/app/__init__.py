from flask import Flask
from flask_cors import CORS
from .config import Config
from .extensions import db, jwt, mail, migrate

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)
    migrate.init_app(app, db)
    CORS(app)
    
    # Import models after db initialization to avoid circular imports
    from .models import User, Product, Category, Address, Cart, CartItem, Coupon, Order, OrderItem, Review
    
    # Register blueprints
    from .routes.auth_routes import auth_bp
    from .routes.product_routes import products_bp
    from .routes.category_routes import categories_bp
    from .routes.cart_routes import cart_bp
    from .routes.order_routes import orders_bp
    from .routes.user_routes import users_bp
    from .routes.admin_routes import admin_bp
    from .routes.webhook_routes import webhook_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/v1/auth')
    app.register_blueprint(products_bp, url_prefix='/api/v1/products')
    app.register_blueprint(categories_bp, url_prefix='/api/v1/categories')
    app.register_blueprint(cart_bp, url_prefix='/api/v1/cart')
    app.register_blueprint(orders_bp, url_prefix='/api/v1/orders')
    app.register_blueprint(users_bp, url_prefix='/api/v1/users')
    app.register_blueprint(admin_bp, url_prefix='/api/v1/admin')
    app.register_blueprint(webhook_bp, url_prefix='/webhooks')
    
    # Add health check endpoint
    @app.route('/health')
    def health():
        return {'status': 'healthy', 'database': 'connected'}
    
    return app