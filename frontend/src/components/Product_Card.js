import Link from 'next/link'
import Image from 'next/image'

export default function ProductCard({ product }) {
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <Link href={`/products/${product.slug || product.id}`}>
        <div className="aspect-w-1 aspect-h-1">
          <Image
            src={product.images?.[0] || '/placeholder.jpg'}
            alt={product.name}
            width={300}
            height={300}
            className="object-cover w-full h-48"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">
              ${product.discount_price || product.price}
            </span>
            {product.discount_price && (
              <span className="text-sm text-gray-500 line-through">
                ${product.price}
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}