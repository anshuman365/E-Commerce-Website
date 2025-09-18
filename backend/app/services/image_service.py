import os
import uuid
from flask import current_app
from werkzeug.utils import secure_filename
from PIL import Image
import boto3
from botocore.exceptions import ClientError

def allowed_file(filename):
    """Check if file extension is allowed"""
    allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions

def resize_image(image_path, sizes):
    """Resize image to multiple sizes"""
    results = {}
    original_image = Image.open(image_path)
    
    for size_name, dimensions in sizes.items():
        resized_image = original_image.copy()
        resized_image.thumbnail(dimensions)
        
        # Save resized image
        filename, ext = os.path.splitext(image_path)
        resized_path = f"{filename}_{size_name}{ext}"
        resized_image.save(resized_path)
        results[size_name] = resized_path
    
    return results

def upload_to_s3(file_path, bucket_name, object_name=None):
    """Upload a file to S3 bucket"""
    if object_name is None:
        object_name = os.path.basename(file_path)
    
    s3_client = boto3.client(
        's3',
        aws_access_key_id=current_app.config.get('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=current_app.config.get('AWS_SECRET_ACCESS_KEY')
    )
    
    try:
        s3_client.upload_file(file_path, bucket_name, object_name)
        return f"https://{bucket_name}.s3.amazonaws.com/{object_name}"
    except ClientError as e:
        print(f"Error uploading to S3: {e}")
        return None

def save_product_image(file):
    """Save product image and return URLs for different sizes"""
    if not file or not allowed_file(file.filename):
        return None
    
    # Generate unique filename
    filename = secure_filename(file.filename)
    unique_filename = f"{uuid.uuid4().hex}_{filename}"
    
    # Create upload directory if it doesn't exist
    upload_dir = os.path.join(current_app.root_path, 'uploads')
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)
    
    # Save original file
    file_path = os.path.join(upload_dir, unique_filename)
    file.save(file_path)
    
    # Define sizes for resizing
    sizes = {
        'original': (1200, 1200),
        'large': (800, 800),
        'medium': (400, 400),
        'thumbnail': (150, 150)
    }
    
    # Resize images
    resized_paths = resize_image(file_path, sizes)
    
    # Upload to S3 if configured
    image_urls = {}
    bucket_name = current_app.config.get('S3_BUCKET')
    
    if bucket_name:
        for size_name, path in resized_paths.items():
            s3_url = upload_to_s3(path, bucket_name)
            if s3_url:
                image_urls[size_name] = s3_url
            # Clean up local file
            os.remove(path)
    else:
        # Return local paths for development
        base_url = current_app.config.get('BASE_URL', 'http://localhost:5000')
        for size_name, path in resized_paths.items():
            image_urls[size_name] = f"{base_url}/uploads/{os.path.basename(path)}"
    
    # Clean up original file
    os.remove(file_path)
    
    return image_urls