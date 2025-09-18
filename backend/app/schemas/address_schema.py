from marshmallow import Schema, fields, validate

class AddressSchema(Schema):
    id = fields.Int(dump_only=True)
    user_id = fields.Int(dump_only=True)
    label = fields.Str(validate=validate.Length(max=50))
    line1 = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    line2 = fields.Str(validate=validate.Length(max=100))
    city = fields.Str(required=True, validate=validate.Length(min=1, max=50))
    state = fields.Str(required=True, validate=validate.Length(min=1, max=50))
    postal_code = fields.Str(required=True, validate=validate.Length(min=1, max=20))
    country = fields.Str(required=True, validate=validate.Length(min=1, max=50))
    is_default = fields.Bool()