import { useRouter } from 'next/router'
import { useQuery } from 'react-query'
import { orderService } from '@/services/orders'

export default function OrderDetail() {
  const router = useRouter()
  const { id } = router.query

  const { data: order, isLoading } = useQuery(
    ['order', id],
    () => orderService.getOrder(id),
    { enabled: !!id }
  )

  if (isLoading) return <div>Loading...</div>
  if (!order) return <div>Order not found</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Order #{order.id}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items.map(item => (
              <div key={item.id} className="flex border-b pb-4">
                <img
                  src={item.product_image || '/placeholder.jpg'}
                  alt={item.product_name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="ml-4">
                  <h3 className="font-semibold">{item.product_name}</h3>
                  <p>Quantity: {item.quantity}</p>
                  <p>Price: ${item.unit_price}</p>
                  <p>Total: ${item.total_price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="bg-gray-100 p-6 rounded">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  order.status === 'completed' => 'bg-green-100 text-green-800' :
                  order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${order.total_amount - order.shipping_amount}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>${order.shipping_amount}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total:</span>
                <span>${order.total_amount}</span>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-semibold mt-8 mb-4">Shipping Address</h2>
          <div className="bg-gray-100 p-6 rounded">
            <p>{order.shipping_address.line1}</p>
            {order.shipping_address.line2 && <p>{order.shipping_address.line2}</p>}
            <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}</p>
            <p>{order.shipping_address.country}</p>
          </div>
        </div>
      </div>
    </div>
  )
}