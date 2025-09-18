import { useQuery } from 'react-query'
import ProductCard from '../components/Product_Card'
import { productService } from '../services/products'

export default function Home() {
  const { data: products, isLoading, error } = useQuery(
    'featured-products',
    () => productService.getProducts({ per_page: 8, featured: true }),
    { staleTime: 5 * 60 * 1000 }
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
          Failed to load products. Please try again later.
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="mb-16 bg-indigo-700 text-white rounded-xl p-8 md:p-12">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to Our Store</h1>
          <p className="text-xl mb-6">Discover amazing products at great prices. Shop now and enjoy fast delivery!</p>
          <a href="/products" className="btn-primary bg-white text-indigo-700 hover:bg-gray-100 inline-block">
            Shop Now
          </a>
        </div>
      </section>

      {/* Featured Products */}
      <section className="mb-16">
        <h2 className="section-title">Featured Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products?.items?.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        {(!products || products.items.length === 0) && (
          <div className="text-center py-12 text-gray-500">
            No featured products available at the moment.
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Quality Products</h3>
          <p className="text-gray-600">We offer only the highest quality products from trusted suppliers.</p>
        </div>
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Fast Shipping</h3>
          <p className="text-gray-600">Get your orders delivered quickly with our efficient shipping partners.</p>
        </div>
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Secure Payment</h3>
          <p className="text-gray-600">Your payments are secure with our encrypted payment processing system.</p>
        </div>
      </section>
    </div>
  )
}