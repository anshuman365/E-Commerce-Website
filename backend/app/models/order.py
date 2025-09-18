from ..extensions import db
import enum

class OrderStatus(enum.Enum):
    PENDING = 'pending'
    PAID = 'paid'
    SHIPPED = 'shipped'
    COMPLETED = 'completed'
    CANCELLED = 'cancelled'
    REFUNDED = 'refunded'

class Order(db.Model):
    __tablename__ = 'orders'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)  # Nullable for guest orders
    status = db.Column(db.Enum(OrderStatus), default=OrderStatus.PENDING)
    total_amount = db.Column(db.Numeric(10, 2), nullable=False)
    shipping_amount = db.Column(db.Numeric(10, 2), default=0)
    coupon_id = db.Column(db.Integer, db.ForeignKey('coupons.id'), nullable=True)
    payment_method = db.Column(db.String(20))  # stripe, razorpay, cod
    shipping_address_id = db.Column(db.Integer, db.ForeignKey('addresses.id'), nullable=False)
    stripe_payment_id = db.Column(db.String(100))
    razorpay_order_id = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, server_default=db.func.now(), onupdate=db.func.now())
    
    # Relationships
    items = db.relationship('OrderItem', backref='order', lazy=True, cascade='all, delete-orphan')