import { useState } from 'react'
import { useQuery } from 'react-query'
import ProductCard from '../components/Product_Card'
import { productService } from '../services/products'

export default function Products() {
  const [filters, setFilters] = useState({
    page: 1,
    per_page: 20,
    q: '',
    category: '',
    min_price: '',
    max_price: ''
  })

  const { data: products, isLoading } = useQuery(
    ['products', filters],
    () => productService.getProducts(filters),
    { keepPreviousData: true }
  )

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">All Products</h1>
      
      {/* Filters */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Search products..."
          value={filters.q}
          onChange={(e) => handleFilterChange('q', e.target.value)}
          className="border rounded px-3 py-2"
        />
        <input
          type="number"
          placeholder="Min price"
          value={filters.min_price}
          onChange={(e) => handleFilterChange('min_price', e.target.value)}
          className="border rounded px-3 py-2"
        />
        <input
          type="number"
          placeholder="Max price"
          value={filters.max_price}
          onChange={(e) => handleFilterChange('max_price', e.target.value)}
          className="border rounded px-3 py-2"
        />
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">All Categories</option>
          {/* Categories would be populated from API */}
        </select>
      </div>

      {/* Products Grid */}
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products?.items?.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          {/* Pagination */}
          {products && products.total > products.per_page && (
            <div className="mt-8 flex justify-center space-x-2">
              <button
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={filters.page === 1}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {filters.page} of {Math.ceil(products.total / products.per_page)}
              </span>
              <button
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={filters.page >= Math.ceil(products.total / products.per_page)}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}