from marshmallow import Schema, fields, validate

class CategorySchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True, validate=validate.Length(min=1, max=50))
    slug = fields.Str(dump_only=True)
    parent_id = fields.Int()

class CategoryTreeSchema(Schema):
    id = fields.Int()
    name = fields.Str()
    slug = fields.Str()
    children = fields.List(fields.Nested(lambda: CategoryTreeSchema()))