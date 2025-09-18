from marshmallow import Schema, fields, validate

class CartItemSchema(Schema):
    id = fields.Int(dump_only=True)
    product_id = fields.Int(required=True)
    quantity = fields.Int(required=True, validate=validate.Range(min=1))
    unit_price = fields.Decimal(dump_only=True, places=2)
    subtotal = fields.Decimal(dump_only=True, places=2)
    product_name = fields.Str(dump_only=True)
    product_image = fields.Str(dump_only=True)

class CartSchema(Schema):
    id = fields.Int(dump_only=True)
    user_id = fields.Int(dump_only=True)
    items = fields.List(fields.Nested(CartItemSchema))
    total = fields.Decimal(dump_only=True, places=2)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)