import { useQuery } from 'react-query'
import ProductCard from '../components/ProductCard'
import { productService } from '../services/products'

export default function Home() {
  const { data: products, isLoading } = useQuery(
    'products',
    () => productService.getProducts({ per_page: 12 }),
    { staleTime: 5 * 60 * 1000 } // 5 minutes
  )

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold my-8">Featured Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products?.items?.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}