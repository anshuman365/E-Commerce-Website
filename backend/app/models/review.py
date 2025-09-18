from ..extensions import db

class Review(db.Model):
    __tablename__ = 'reviews'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)  # 1-5
    comment = db.Column(db.Text)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    
    # Ensure a user can only review a product once
    __table_args__ = (
        db.UniqueConstraint('user_id', 'product_id', name='unique_user_product_review'),
    )