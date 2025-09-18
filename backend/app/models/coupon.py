from ..extensions import db
from datetime import datetime

class Coupon(db.Model):
    __tablename__ = 'coupons'
    
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(20), unique=True, nullable=False)
    discount_type = db.Column(db.String(10), nullable=False)  # 'percent' or 'fixed'
    value = db.Column(db.Numeric(10, 2), nullable=False)
    max_uses = db.Column(db.Integer, nullable=True)
    uses_count = db.Column(db.Integer, default=0)
    valid_from = db.Column(db.DateTime, nullable=False)
    valid_to = db.Column(db.DateTime, nullable=False)
    active = db.Column(db.Boolean, default=True)
    
    # Relationships
    orders = db.relationship('Order', backref='coupon', lazy=True)
    
    def is_valid(self):
        now = datetime.now()
        return (self.active and 
                self.valid_from <= now <= self.valid_to and
                (self.max_uses is None or self.uses_count < self.max_uses))