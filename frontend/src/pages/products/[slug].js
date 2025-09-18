import { useRouter } from 'next/router'
import { useQuery } from 'react-query'
import Image from 'next/image'
import { useState } from 'react'
import { useCart } from '../../hooks/useCart'
import { productService } from '../../services/products'
import { toast } from 'react-toastify'

export default function ProductDetail() {
  const router = useRouter()
  const { slug } = router.query
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const { addToCart } = useCart()

  const { data: product, isLoading, error } = useQuery(
    ['product', slug],
    () => productService.getProduct(slug),
    { enabled: !!slug }
  )

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="spinner"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          Failed to load product. Please try again later.
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <button onClick={() => router.back()} className="btn-primary">
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const handleAddToCart = () => {
    addToCart.mutate({ productId: product.id, quantity })
    toast.success('Product added to cart!')
  }

  const discountPercentage = product.discount_price 
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2 text-sm text-gray-500">
          <li>
            <a href="/" className="hover:text-indigo-600">Home</a>
          </li>
          <li className="flex items-center">
            <span className="mx-2">/</span>
            <a href="/products" className="hover:text-indigo-600">Products</a>
          </li>
          <li className="flex items-center">
            <span className="mx-2">/</span>
            <span className="text-gray-800">{product.name}</span>
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Product Images */}
        <div>
          <div className="mb-4 bg-white rounded-lg overflow-hidden">
            <Image
              src={product.images?.[selectedImage] || '/placeholder.jpg'}
              alt={product.name}
              width={600}
              height={600}
              className="w-full h-96 object-contain"
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`bg-white p-1 rounded border ${selectedImage === index ? 'border-indigo-600' : 'border-gray-200'}`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    width={100}
                    height={100}
                    className="w-full h-20 object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <div className="flex items-center mb-4">
            <div className="flex items-center mr-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-5 h-5 ${star <= (product.rating || 4) ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="ml-1 text-gray-600">({product.review_count || 12})</span>
            </div>
            <span className={`text-sm font-medium px-2 py-1 rounded ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {product.stock > 0 ? `In stock (${product.stock})` : 'Out of stock'}
            </span>
          </div>

          <p className="text-gray-700 mb-6">{product.description}</p>

          <div className="mb-6">
            <div className="flex items-center">
              <span className="text-3xl font-bold text-indigo-600">
                ${product.discount_price || product.price}
              </span>
              {product.discount_price && (
                <>
                  <span className="ml-3 text-xl text-gray-500 line-through">
                    ${product.price}
                  </span>
                  <span className="ml-3 bg-red-100 text-red-800 text-sm font-bold px-2 py-1 rounded">
                    Save {discountPercentage}%
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="quantity" className="form-label">Quantity:</label>
            <div className="flex items-center">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="bg-gray-200 text-gray-700 px-3 py-2 rounded-l-md hover:bg-gray-300"
              >
                -
              </button>
              <input
                type="number"
                id="quantity"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="border-t border-b border-gray-300 text-center w-16 py-2"
              />
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="bg-gray-200 text-gray-700 px-3 py-2 rounded-r-md hover:bg-gray-300"
              >
                +
              </button>
              <span className="ml-3 text-sm text-gray-500">Max: {product.stock}</span>
            </div>
          </div>

          <div className="flex space-x-4 mb-6">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || addToCart.isLoading}
              className="btn-primary flex-1 flex items-center justify-center"
            >
              {addToCart.isLoading ? (
                <>
                  <div className="spinner-small mr-2"></div>
                  Adding...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Add to Cart
                </>
              )}
            </button>
            <button className="btn-secondary flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Wishlist
            </button>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Free shipping on orders over $50
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              30-day money-back guarantee
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button className="py-4 px-6 text-sm font-medium border-b-2 border-indigo-500 text-indigo-600">
              Description
            </button>
            <button className="py-4 px-6 text-sm font-medium text-gray-500 hover:text-gray-700">
              Specifications
            </button>
            <button className="py-4 px-6 text-sm font-medium text-gray-500 hover:text-gray-700">
              Reviews ({product.review_count || 12})
            </button>
          </nav>
        </div>
        <div className="p-6">
          <p className="text-gray-700">{product.long_description || product.description}</p>
        </div>
      </div>
    </div>
  )
}