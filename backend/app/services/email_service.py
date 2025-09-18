from flask_mail import Message
from ..extensions import mail
from threading import Thread

def send_async_email(app, msg):
    """Send email asynchronously"""
    with app.app_context():
        mail.send(msg)

def send_email(subject, recipients, body, html=None):
    """Send email with optional HTML content"""
    from flask import current_app
    
    msg = Message(
        subject=subject,
        recipients=recipients,
        body=body,
        html=html
    )
    
    # Send email asynchronously
    Thread(target=send_async_email, args=(current_app._get_current_object(), msg)).start()

def send_welcome_email(user):
    """Send welcome email to new user"""
    subject = "Welcome to Our E-Commerce Store"
    body = f"Hi {user.full_name},\n\nWelcome to our store! Thank you for registering."
    html = f"""
    <h1>Welcome to Our Store!</h1>
    <p>Hi {user.full_name},</p>
    <p>Thank you for registering with our e-commerce store.</p>
    <p>Start shopping now and enjoy our products!</p>
    """
    
    send_email(subject, [user.email], body, html)

def send_order_confirmation(order, user):
    """Send order confirmation email"""
    subject = f"Order Confirmation - #{order.id}"
    body = f"Hi {user.full_name},\n\nYour order #{order.id} has been confirmed."
    html = f"""
    <h1>Order Confirmation</h1>
    <p>Hi {user.full_name},</p>
    <p>Your order <strong>#{order.id}</strong> has been confirmed.</p>
    <p>Total amount: ${order.total_amount}</p>
    <p>Thank you for your purchase!</p>
    """
    
    send_email(subject, [user.email], body, html)

def send_password_reset_email(user, reset_token):
    """Send password reset email"""
    from flask import url_for, current_app
    
    reset_url = f"{current_app.config['FRONTEND_URL']}/reset-password?token={reset_token}"
    subject = "Password Reset Request"
    body = f"Hi {user.full_name},\n\nPlease use this link to reset your password: {reset_url}"
    html = f"""
    <h1>Password Reset</h1>
    <p>Hi {user.full_name},</p>
    <p>Please click the link below to reset your password:</p>
    <p><a href="{reset_url}">Reset Password</a></p>
    <p>This link will expire in 1 hour.</p>
    """
    
    send_email(subject, [user.email], body, html)