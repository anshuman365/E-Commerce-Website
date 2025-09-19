from flask import Flask, render_template
from flask_cors import CORS
from .config import Config
from .extensions import db, jwt, mail, migrate, login_manager

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)
    migrate.init_app(app, db)
    CORS(app)

    # Initialize login manager
    login_manager.init_app(app)
    login_manager.login_view = 'admin.login'
    
    # Import models after db initialization to avoid circular imports
    from .models import User, Product, Category, Address, Cart, CartItem, Coupon, Order, OrderItem, Review
    
    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))
    
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
    
    @app.route('/')
    def home():
        # Fetch featured products
        featured_products = Product.query.filter_by(is_featured=True, is_active=True).limit(8).all()
    
        # Fetch categories
        categories = Category.query.limit(8).all()
    
        # Fetch recent products
        recent_products = Product.query.filter_by(is_active=True).order_by(Product.created_at.desc()).limit(4).all()
    
        return render_template("index.html", 
                             featured_products=featured_products,
                             categories=categories,
                             recent_products=recent_products)
    
    return app