import { useRouter } from 'next/router'
import { useQuery } from 'react-query'
import { orderService } from '../../services/orders'
import Link from 'next/link'

export default function OrderDetail() {
  const router = useRouter()
  const { id } = router.query

  const { data: order, isLoading, error } = useQuery(
    ['order', id],
    () => orderService.getOrder(id),
    { enabled: !!id }
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
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Order not found</h2>
          <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link href="/orders" className="btn-primary">
            Back to Orders
          </Link>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Order not found</h2>
          <Link href="/orders" className="btn-primary">
            Back to Orders
          </Link>
        </div>
      </div>
    )
  }

  const statusSteps = [
    { key: 'pending', label: 'Order Placed' },
    { key: 'processing', label: 'Processing' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' }
  ]

  const currentStatusIndex = statusSteps.findIndex(step => step.key === order.status)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/orders" className="text-indigo-600 hover:text-indigo-500 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Orders
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Order #{order.id}</h1>
          <p className="text-gray-600 mt-1">
            Placed on {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            order.status === 'completed' ? 'bg-green-100 text-green-800' :
            order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
            order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Order Progress */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Order Status</h2>
        <div className="relative">
          <div className="absolute left-0 top-1/2 h-0.5 w-full bg-gray-200"></div>
          <div className="relative flex justify-between">
            {statusSteps.map((step, index) => (
              <div key={step.key} className="relative z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index <= currentStatusIndex 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {index < currentStatusIndex ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 text-xs font-medium text-gray-600 whitespace-nowrap">
                  {step.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Items */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Order Items</h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="divide-y divide-gray-200">
              {order.items.map(item => (
                <div key={item.id} className="p-6 flex items-center">
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-md overflow-hidden">
                    <img
                      src={item.product_image || '/placeholder.jpg'}
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="ml-4 flex-grow">
                    <h3 className="font-semibold">{item.product_name}</h3>
                    <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                    <p className="text-gray-600 text-sm">Price: ${item.unit_price}</p>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="font-bold">${item.total_price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${order.total_amount - order.shipping_amount}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>${order.shipping_amount}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-${order.discount_amount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${order.tax_amount || '0.00'}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${order.total_amount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="font-medium">{order.shipping_address?.recipient_name || order.shipping_address?.label}</p>
            <p>{order.shipping_address?.line1}</p>
            {order.shipping_address?.line2 && <p>{order.shipping_address.line2}</p>}
            <p>{order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.postal_code}</p>
            <p>{order.shipping_address?.country}</p>
          </div>

          {/* Payment Information */}
          <h2 className="text-xl font-semibold mt-6 mb-4">Payment Information</h2>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center">
              <span>Payment Method:</span>
              <span className="font-medium">
                {order.payment_method === 'cod' ? 'Cash on Delivery' : 
                 order.payment_method === 'stripe' ? 'Credit Card' : 
                 order.payment_method}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span>Payment Status:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                order.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {order.payment_status?.charAt(0).toUpperCase() + order.payment_status?.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}