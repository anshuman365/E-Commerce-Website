from marshmallow import Schema, fields, validate

class OrderItemSchema(Schema):
    id = fields.Int(dump_only=True)
    product_id = fields.Int(required=True)
    product_name = fields.Str(dump_only=True)
    quantity = fields.Int(required=True, validate=validate.Range(min=1))
    unit_price = fields.Decimal(required=True, places=2)
    total_price = fields.Decimal(dump_only=True, places=2)

class OrderSchema(Schema):
    id = fields.Int(dump_only=True)
    user_id = fields.Int(dump_only=True)
    status = fields.Str(dump_only=True)
    total_amount = fields.Decimal(required=True, places=2)
    shipping_amount = fields.Decimal(required=True, places=2)
    payment_method = fields.Str(required=True, validate=validate.OneOf(['stripe', 'razorpay', 'cod']))
    shipping_address = fields.Nested('AddressSchema', dump_only=True)
    items = fields.List(fields.Nested(OrderItemSchema))
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

class CheckoutSchema(Schema):
    payment_method = fields.Str(required=True, validate=validate.OneOf(['stripe', 'razorpay', 'cod']))
    shipping_address_id = fields.Int(required=True)
    coupon_code = fields.Str()