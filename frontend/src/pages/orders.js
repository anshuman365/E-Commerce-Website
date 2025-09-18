import { useQuery } from 'react-query'
import Link from 'next/link'
import { orderService } from '@/services/orders'

export default function Orders() {
  const { data: orders, isLoading } = useQuery('orders', orderService.getOrders)

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Orders</h1>
      {orders?.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">No orders yet</h2>
          <Link href="/products" className="text-indigo-600 hover:text-indigo-500">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders?.map(order => (
            <div key={order.id} className="border rounded p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">Order #{order.id}</h3>
                  <p className="text-gray-600">Date: {new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <p className="font-semibold">Total: ${order.total_amount}</p>
                <Link href={`/orders/${order.id}`} className="text-indigo-600 hover:text-indigo-500">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}