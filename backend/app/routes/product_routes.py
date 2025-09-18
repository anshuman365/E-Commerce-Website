from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import or_
from ..models.product import Product
from ..models.category import Category
from ..extensions import db

products_bp = Blueprint('products', __name__)

@products_bp.route('/', methods=['GET'])
def get_products():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('q', '')
        category_id = request.args.get('category', type=int)
        min_price = request.args.get('min_price', type=float)
        max_price = request.args.get('max_price', type=float)
        
        query = Product.query.filter(Product.is_active == True)
        
        if search:
            query = query.filter(
                or_(
                    Product.name.ilike(f'%{search}%'),
                    Product.description.ilike(f'%{search}%')
                )
            )
        
        if category_id:
            query = query.filter(Product.category_id == category_id)
        
        if min_price is not None:
            query = query.filter(Product.price >= min_price)
        
        if max_price is not None:
            query = query.filter(Product.price <= max_price)
        
        products = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'items': [{
                'id': p.id,
                'name': p.name,
                'slug': p.slug,
                'price': float(p.price),
                'discount_price': float(p.discount_price) if p.discount_price else None,
                'images': p.images,
                'stock': p.stock
            } for p in products.items],
            'page': products.page,
            'per_page': products.per_page,
            'total': products.total
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@products_bp.route('/<id_or_slug>', methods=['GET'])
def get_product(id_or_slug):
    try:
        if id_or_slug.isdigit():
            product = Product.query.get_or_404(int(id_or_slug))
        else:
            product = Product.query.filter_by(slug=id_or_slug).first_or_404()
        
        return jsonify({
            'id': product.id,
            'name': product.name,
            'slug': product.slug,
            'description': product.description,
            'price': float(product.price),
            'discount_price': float(product.discount_price) if product.discount_price else None,
            'sku': product.sku,
            'stock': product.stock,
            'images': product.images,
            'category_id': product.category_id,
            'reviews': [{
                'rating': r.rating,
                'comment': r.comment,
                'user_name': r.user.full_name,
                'created_at': r.created_at.isoformat()
            } for r in product.reviews]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 404