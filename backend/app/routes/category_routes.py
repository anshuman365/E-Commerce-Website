from flask import Blueprint, jsonify
from ..models.category import Category

categories_bp = Blueprint('categories', __name__)

@categories_bp.route('/', methods=['GET'])
def get_categories():
    try:
        categories = Category.query.filter(Category.parent_id == None).all()
        
        def build_category_tree(category):
            return {
                'id': category.id,
                'name': category.name,
                'slug': category.slug,
                'children': [build_category_tree(child) for child in category.children]
            }
        
        return jsonify([build_category_tree(cat) for cat in categories]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400