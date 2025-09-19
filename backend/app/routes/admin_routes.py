# routes/admin_routes.py
from flask import Blueprint, render_template, request, flash, redirect, url_for, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from ..models.user import User
from ..models.product import Product
from ..models.category import Category
from ..models.order import Order
from ..models.order_item import OrderItem
from ..models.review import Review
from app import db
from ..utils.decorators import admin_required
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash
import os
from werkzeug.utils import secure_filename
from flask import current_app

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']
           
admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/')
@login_required
@admin_required
def dashboard():
    # Get statistics for the dashboard
    total_users = User.query.count()
    total_products = Product.query.count()
    total_orders = Order.query.count()
    total_revenue = db.session.query(db.func.sum(Order.total_amount)).scalar() or 0
    
    # Recent orders
    recent_orders = Order.query.order_by(Order.created_at.desc()).limit(10).all()
    
    # Sales data for the chart (last 7 days)
    sales_data = []
    for i in range(6, -1, -1):
        date = datetime.now() - timedelta(days=i)
        day_start = datetime(date.year, date.month, date.day)
        day_end = day_start + timedelta(days=1)
        
        day_sales = db.session.query(db.func.sum(Order.total_amount)).filter(
            Order.created_at >= day_start,
            Order.created_at < day_end
        ).scalar() or 0
        
        sales_data.append({
            'date': date.strftime('%Y-%m-%d'),
            'sales': float(day_sales)
        })
    
    return render_template('admin/dashboard.html', 
                         total_users=total_users,
                         total_products=total_products,
                         total_orders=total_orders,
                         total_revenue=total_revenue,
                         recent_orders=recent_orders,
                         sales_data=sales_data)

@admin_bp.route('/users')
@login_required
@admin_required
def users():
    page = request.args.get('page', 1, type=int)
    per_page = 20
    
    users = User.query.order_by(User.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
    return render_template('admin/users.html', users=users)

@admin_bp.route('/user/<int:user_id>')
@login_required
@admin_required
def user_detail(user_id):
    user = User.query.get_or_404(user_id)
    orders = Order.query.filter_by(user_id=user_id).order_by(Order.created_at.desc()).all()
    return render_template('admin/user_detail.html', user=user, orders=orders)

@admin_bp.route('/user/<int:user_id>/toggle', methods=['POST'])
@login_required
@admin_required
def toggle_user(user_id):
    user = User.query.get_or_404(user_id)
    user.is_active = not user.is_active
    db.session.commit()
    
    flash(f'User {user.username} has been {"activated" if user.is_active else "deactivated"}', 'success')
    return redirect(url_for('admin.user_detail', user_id=user_id))

@admin_bp.route('/products')
@login_required
@admin_required
def products():
    page = request.args.get('page', 1, type=int)
    per_page = 20
    
    products = Product.query.order_by(Product.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
    categories = Category.query.all()
    return render_template('admin/products.html', products=products, categories=categories)

@admin_bp.route('/product/new', methods=['GET', 'POST'])
@login_required
@admin_required
def add_product():
    categories = Category.query.all()
    if request.method == 'POST':
        name = request.form.get('name')
        description = request.form.get('description')
        price = float(request.form.get('price'))
        discount_price = float(request.form.get('discount_price')) if request.form.get('discount_price') else None
        stock = int(request.form.get('stock'))
        category_id = int(request.form.get('category_id'))
        sku = request.form.get('sku')
        is_featured = True if request.form.get('is_featured') else False

        # Generate slug
        slug = name.replace(' ', '-').lower()

        # Handle image uploads
        image_urls = []
        if 'images' in request.files:
            files = request.files.getlist('images')
            for file in files:
                if file and allowed_file(file.filename):
                    filename = secure_filename(file.filename)
                    # Create unique filename
                    unique_filename = f"{slug}_{len(image_urls)}_{filename}"
                    upload_path = os.path.join(current_app.config['UPLOAD_FOLDER'], 'products')
                    os.makedirs(upload_path, exist_ok=True)
                    file.save(os.path.join(upload_path, unique_filename))
                    image_urls.append(f"/static/uploads/products/{unique_filename}")

        product = Product(
            name=name,
            slug=slug,
            description=description,
            price=price,
            discount_price=discount_price,
            stock=stock,
            category_id=category_id,
            sku=sku,
            is_featured=is_featured,
            images=image_urls  # Store image URLs
        )
        db.session.add(product)
        db.session.commit()
        flash('Product added successfully', 'success')
        return redirect(url_for('admin.products'))
    return render_template('admin/product_form.html', categories=categories, product=None)

@admin_bp.route('/product/<int:product_id>/edit', methods=['GET', 'POST'])
@login_required
@admin_required
def edit_product(product_id):
    product = Product.query.get_or_404(product_id)
    categories = Category.query.all()
    
    if request.method == 'POST':
        product.name = request.form.get('name')
        product.description = request.form.get('description')
        product.price = float(request.form.get('price'))
        product.discount_price = float(request.form.get('discount_price')) if request.form.get('discount_price') else None
        product.stock = int(request.form.get('stock'))
        product.category_id = int(request.form.get('category_id'))
        product.sku = request.form.get('sku')
        product.is_featured = True if request.form.get('is_featured') else False
        product.is_active = True if request.form.get('is_active') else False
        
        # Handle image uploads
        if 'images' in request.files:
            files = request.files.getlist('images')
            new_images = []
            for file in files:
                if file and allowed_file(file.filename):
                    filename = secure_filename(file.filename)
                    # Create unique filename
                    unique_filename = f"{product.slug}_{len(new_images)}_{filename}"
                    upload_path = os.path.join(current_app.config['UPLOAD_FOLDER'], 'products')
                    os.makedirs(upload_path, exist_ok=True)
                    file.save(os.path.join(upload_path, unique_filename))
                    new_images.append(f"/static/uploads/products/{unique_filename}")
            
            # Combine existing images with new ones
            if product.images:
                product.images.extend(new_images)
            else:
                product.images = new_images
        
        db.session.commit()
        
        flash('Product updated successfully', 'success')
        return redirect(url_for('admin.products'))
    
    return render_template('admin/product_form.html', product=product, categories=categories)

@admin_bp.route('/product/<int:product_id>/delete', methods=['POST'])
@login_required
@admin_required
def delete_product(product_id):
    product = Product.query.get_or_404(product_id)
    
    # Check if product is in any orders
    order_items = OrderItem.query.filter_by(product_id=product_id).count()
    if order_items > 0:
        flash('Cannot delete product that has been ordered', 'danger')
        return redirect(url_for('admin.products'))
    
    db.session.delete(product)
    db.session.commit()
    
    flash('Product deleted successfully', 'success')
    return redirect(url_for('admin.products'))

@admin_bp.route('/orders')
@login_required
@admin_required
def orders():
    page = request.args.get('page', 1, type=int)
    per_page = 20
    status = request.args.get('status', 'all')
    
    query = Order.query
    
    if status != 'all':
        query = query.filter_by(status=status)
    
    orders = query.order_by(Order.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
    return render_template('admin/orders.html', orders=orders, status=status)

@admin_bp.route('/order/<int:order_id>')
@login_required
@admin_required
def order_detail(order_id):
    order = Order.query.get_or_404(order_id)
    return render_template('admin/order_detail.html', order=order)

@admin_bp.route('/order/<int:order_id>/update_status', methods=['POST'])
@login_required
@admin_required
def update_order_status(order_id):
    order = Order.query.get_or_404(order_id)
    new_status = request.form.get('status')
    
    if new_status not in ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']:
        flash('Invalid status', 'danger')
        return redirect(url_for('admin.order_detail', order_id=order_id))
    
    order.status = new_status
    db.session.commit()
    
    flash(f'Order status updated to {new_status}', 'success')
    return redirect(url_for('admin.order_detail', order_id=order_id))

@admin_bp.route('/categories')
@login_required
@admin_required
def categories():
    categories = Category.query.all()
    return render_template('admin/categories.html', categories=categories)

@admin_bp.route('/category/new', methods=['POST'])
@login_required
@admin_required
def add_category():
    name = request.form.get('name')
    description = request.form.get('description')
    slug = name.replace(' ', '-').lower()  # Generate slug automatically
    if not name:
        flash('Category name is required', 'danger')
        return redirect(url_for('admin.categories'))
    category = Category(name=name, slug=slug, description=description)
    db.session.add(category)
    db.session.commit()
    flash('Category added successfully', 'success')
    return redirect(url_for('admin.categories'))

@admin_bp.route('/category/<int:category_id>/edit', methods=['POST'])
@login_required
@admin_required
def edit_category(category_id):
    category = Category.query.get_or_404(category_id)
    
    category.name = request.form.get('name')
    category.description = request.form.get('description')
    db.session.commit()
    
    flash('Category updated successfully', 'success')
    return redirect(url_for('admin.categories'))

@admin_bp.route('/category/<int:category_id>/delete', methods=['POST'])
@login_required
@admin_required
def delete_category(category_id):
    category = Category.query.get_or_404(category_id)
    
    # Check if category has products
    if category.products.count() > 0:
        flash('Cannot delete category that has products', 'danger')
        return redirect(url_for('admin.categories'))
    
    db.session.delete(category)
    db.session.commit()
    
    flash('Category deleted successfully', 'success')
    return redirect(url_for('admin.categories'))

@admin_bp.route('/reviews')
@login_required
@admin_required
def reviews():
    page = request.args.get('page', 1, type=int)
    per_page = 20
    
    reviews = Review.query.order_by(Review.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
    return render_template('admin/reviews.html', reviews=reviews)

@admin_bp.route('/review/<int:review_id>/toggle', methods=['POST'])
@login_required
@admin_required
def toggle_review(review_id):
    review = Review.query.get_or_404(review_id)
    review.is_approved = not review.is_approved
    db.session.commit()
    
    flash(f'Review has been {"approved" if review.is_approved else "unapproved"}', 'success')
    return redirect(url_for('admin.reviews'))

@admin_bp.route('/review/<int:review_id>/delete', methods=['POST'])
@login_required
@admin_required
def delete_review(review_id):
    review = Review.query.get_or_404(review_id)
    db.session.delete(review)
    db.session.commit()
    
    flash('Review deleted successfully', 'success')
    return redirect(url_for('admin.reviews'))

@admin_bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated and current_user.is_admin:
        return redirect(url_for('admin.dashboard'))
    
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        user = User.query.filter_by(email=email).first()
        
        if user and user.check_password(password) and user.is_admin:
            login_user(user)
            return redirect(url_for('admin.dashboard'))
        else:
            flash('Invalid credentials or not an admin', 'danger')
    
    return render_template('admin/login.html')

@admin_bp.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        full_name = request.form.get('full_name')
        
        if User.query.filter_by(email=email).first():
            flash('Email already exists', 'danger')
            return redirect(url_for('admin.register'))
        
        user = User(
            email=email,
            full_name=full_name,
            is_admin=True
        )
        user.set_password(password)  # Use the set_password method
        
        db.session.add(user)
        db.session.commit()
        
        flash('Registration successful. Please login.', 'success')
        return redirect(url_for('admin.login'))
    
    return render_template('admin/register.html')

@admin_bp.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('admin.login'))