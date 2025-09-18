import { useRouter } from 'next/router'
import { useQuery } from 'react-query'
import { productService } from '@/services/products'
import Image from 'next/image'
import { useState } from 'react'
import { useCart } from '@/hooks/useCart'

export default function ProductDetail() {
  const router = useRouter()
  const { slug } = router.query
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useCart()

  const { data: product, isLoading } = useQuery(
    ['product', slug],
    () => productService.getProduct(slug),
    { enabled: !!slug }
  )

  if (isLoading) return <div>Loading...</div>
  if (!product) return <div>Product not found</div>

  const handleAddToCart = () => {
    addToCart.mutate({ productId: product.id, quantity })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Image
            src={product.images?.[0] || '/placeholder.jpg'}
            alt={product.name}
            width={500}
            height={500}
            className="w-full h-auto rounded"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-gray-600 mb-4">{product.description}</p>
          <div className="flex items-center mb-4">
            <span className="text-2xl font-bold">${product.discount_price || product.price}</span>
            {product.discount_price && (
              <span className="ml-2 text-sm text-gray-500 line-through">${product.price}</span>
            )}
          </div>
          <div className="mb-4">
            <label htmlFor="quantity" className="block mb-2">Quantity:</label>
            <input
              type="number"
              id="quantity"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="border rounded px-3 py-2 w-20"
            />
          </div>
          <button
            onClick={handleAddToCart}
            disabled={addToCart.isLoading}
            className="bg-indigo-600 text-white px-6 py-3 rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {addToCart.isLoading ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  )
}