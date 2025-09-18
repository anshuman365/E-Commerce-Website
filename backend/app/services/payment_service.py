import stripe
from flask import current_app

def init_stripe():
    """Initialize Stripe with API key"""
    stripe.api_key = current_app.config.get('STRIPE_API_KEY')

def create_stripe_payment_intent(amount, currency='usd', metadata=None):
    """Create a Stripe Payment Intent"""
    init_stripe()
    
    try:
        intent = stripe.PaymentIntent.create(
            amount=int(amount * 100),  # Convert to cents
            currency=currency,
            metadata=metadata or {},
            automatic_payment_methods={
                'enabled': True,
            },
        )
        return intent
    except stripe.error.StripeError as e:
        print(f"Stripe error: {e}")
        return None

def create_razorpay_order(amount, currency='INR', receipt=None):
    """Create a Razorpay order"""
    try:
        import razorpay
        
        client = razorpay.Client(
            auth=(
                current_app.config.get('RAZORPAY_KEY'),
                current_app.config.get('RAZORPAY_SECRET')
            )
        )
        
        order_data = {
            'amount': int(amount * 100),  # Convert to paise
            'currency': currency,
            'receipt': receipt or f"receipt_{uuid.uuid4().hex}",
            'payment_capture': 1  # Auto capture payment
        }
        
        order = client.order.create(data=order_data)
        return order
    except Exception as e:
        print(f"Razorpay error: {e}")
        return None

def verify_stripe_webhook_signature(payload, sig_header, webhook_secret):
    """Verify Stripe webhook signature"""
    init_stripe()
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
        return event
    except ValueError as e:
        # Invalid payload
        print(f"Invalid payload: {e}")
        return None
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        print(f"Invalid signature: {e}")
        return None

def process_refund(payment_intent_id, amount=None):
    """Process refund for a payment"""
    init_stripe()
    
    try:
        refund_params = {'payment_intent': payment_intent_id