from marshmallow import Schema, fields, validate, validates_schema
from ..utils.validators import validate_email, validate_password

class UserSchema(Schema):
    id = fields.Int(dump_only=True)
    email = fields.Str(required=True, validate=validate.Email())
    password = fields.Str(required=True, load_only=True, validate=validate.Length(min=8))
    full_name = fields.Str(required=True, validate=validate.Length(min=2))
    phone = fields.Str(validate=validate.Length(min=10))
    is_active = fields.Bool(dump_only=True)
    is_admin = fields.Bool(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

    @validates_schema
    def validate_email_format(self, data, **kwargs):
        if 'email' in data and not validate_email(data['email']):
            raise validate.ValidationError('Invalid email format')

class UserUpdateSchema(Schema):
    full_name = fields.Str(validate=validate.Length(min=2))
    phone = fields.Str(validate=validate.Length(min=10))

class LoginSchema(Schema):
    email = fields.Str(required=True, validate=validate.Email())
    password = fields.Str(required=True, validate=validate.Length(min=8))