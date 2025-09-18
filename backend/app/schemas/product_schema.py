from marshmallow import Schema, fields, validate

class ProductSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    slug = fields.Str(dump_only=True)
    description = fields.Str(required=True)
    price = fields.Decimal(required=True, places=2, validate=validate.Range(min=0))
    discount_price = fields.Decimal(places=2, validate=validate.Range(min=0))
    sku = fields.Str(validate=validate.Length(max=50))
    stock = fields.Int(required=True, validate=validate.Range(min=0))
    is_active = fields.Bool()
    is_featured = fields.Bool()
    category_id = fields.Int(required=True)
    images = fields.List(fields.Str())
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

class ProductUpdateSchema(Schema):
    name = fields.Str(validate=validate.Length(min=1, max=100))
    description = fields.Str()
    price = fields.Decimal(places=2, validate=validate.Range(min=0))
    discount_price = fields.Decimal(places=2, validate=validate.Range(min=0))
    sku = fields.Str(validate=validate.Length(max=50))
    stock = fields.Int(validate=validate.Range(min=0))
    is_active = fields.Bool()
    is_featured = fields.Bool()
    category_id = fields.Int()
    images = fields.List(fields.Str())