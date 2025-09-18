from ..extensions import db
from ..models.product import Product
from ..models.order import Order, OrderItem
from sqlalchemy import func

def get_frequently_bought_together(product_id, limit=4):
    """Get products frequently bought together with the given product"""
    # Find orders that contain the target product
    subquery = db.session.query(OrderItem.order_id).filter(
        OrderItem.product_id == product_id
    ).subquery()
    
    # Find other products in those orders
    recommendations = db.session.query(
        OrderItem.product_id,
        func.count(OrderItem.product_id).label('frequency')
    ).filter(
        OrderItem.order_id.in_(subquery),
        OrderItem.product_id != product_id
    ).group_by(
        OrderItem.product_id
    ).order_by(
        func.count(OrderItem.product_id).desc()
    ).limit(limit).all()
    
    # Get product details
    product_ids = [rec.product_id for rec in recommendations]
    products = Product.query.filter(Product.id.in_(product_ids)).all()
    
    return products

def get_similar_products(product, limit=4):
    """Get products from the same category or with similar attributes"""
    similar_products = Product.query.filter(
        Product.category_id == product.category_id,
        Product.id != product.id,
        Product.is_active == True
    ).order_by(
        func.random()  # Random order for variety
    ).limit(limit).all()
    
    return similar_products

def get_personalized_recommendations(user_id, limit=4):
    """Get personalized recommendations based on user's order history"""
    if not user_id:
        return get_popular_products(limit)
    
    # Get user's most ordered category
    user_category = db.session.query(
        Product.category_id,
        func.count(Product.category_id).label('count')
    ).join(OrderItem, OrderItem.product_id == Product.id
    ).join(Order, Order.id == OrderItem.order_id
    ).filter(
        Order.user_id == user_id
    ).group_by(
        Product.category_id
    ).order_by(
        func.count(Product.category_id).desc()
    ).first()
    
    if user_category:
        # Recommend products from user's favorite category
        recommendations = Product.query.filter(
            Product.category_id == user_category.category_id,
            Product.is_active == True
        ).order_by(
            func.random()
        ).limit(limit).all()
    else:
        # Fallback to popular products
        recommendations = get_popular_products(limit)
    
    return recommendations

def get_popular_products(limit=4):
    """Get most popular products based on sales"""
    popular_products = db.session.query(
        Product,
        func.count(OrderItem.id).label('sales_count')
    ).join(OrderItem, OrderItem.product_id == Product.id
    ).filter(
        Product.is_active == True 
    ).group_by(
        Product.id
    ).order_by(
        func.count(OrderItem.id).desc()
    ).limit(limit).all()
    
    return [product for product, count in popular_products]