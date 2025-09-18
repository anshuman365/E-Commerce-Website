import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '../hooks/useCart'
import { toast } from 'react-toastify'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart.mutate({ productId: product.id, quantity: 1 })
  }

  const discountPercentage = product.discount_price 
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0

  return (
    <div className="card product-card h-full flex flex-col">
      <Link href={`/products/${product.slug || product.id}`}>
        <div className="relative">
          <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden">
            <Image
              src={product.images?.[0] || '/placeholder.jpg'}
              alt={product.name}
              width={300}
              height={300}
              className="object-cover w-full h-48"
            />
          </div>
          {discountPercentage > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{discountPercentage}%
            </span>
          )}
          <button 
            onClick={handleAddToCart}
            className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-indigo-50 transition-colors"
            aria-label="Add to cart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
        <div className="p-4 flex-grow flex flex-col">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">{product.description}</p>
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center">
              <span className="text-xl font-bold text-indigo-600">
                ${product.discount_price || product.price}
              </span>
              {product.discount_price && (
                <span className="ml-2 text-sm text-gray-500 line-through">
                  ${product.price}
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500">
              {product.stock > 0 ? `In stock (${product.stock})` : 'Out of stock'}
            </span>
          </div>
        </div>
      </Link>
    </div>
  )
}