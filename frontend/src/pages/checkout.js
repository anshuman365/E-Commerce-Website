import { useState } from 'react'
import { useRouter } from 'next/router'
import { useQuery, useMutation } from 'react-query'
import { cartService } from '@/services/cart'
import { orderService } from '@/services/orders'
import { useAuth } from '@/hooks/useAuth'

export default function Checkout() {
  const { user } = useAuth()
  const router = useRouter()
  const [selectedAddress, setSelectedAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cod')

  const { data: cart } = useQuery('cart', cartService.getCart)
  const { data: addresses } = useQuery('addresses', () => 
    fetch('/api/v1/users/addresses', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    }).then(res => res.json())
  )

  const checkoutMutation = useMutation(orderService.checkout, {
    onSuccess: (data) => {
      if (data.data.payment_url) {
        window.location.href = data.data.payment_url
      } else {
        router.push(`/orders/${data.data.order_id}`)
      }
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    checkoutMutation.mutate({
      payment_method: paymentMethod,
      shipping_address_id: selectedAddress
    })
  }

  if (!cart || cart.items.length === 0) {
    return <div>Your cart is empty</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
          <div className="mb-4">
            <label className="block mb-2">Select Address:</label>
            <select
              value={selectedAddress}
              onChange={(e) => setSelectedAddress(e.target.value)}
              className="border rounded px-3 py-2 w-full"
              required
            >
              <option value="">Select an address</option>
              {addresses?.map(address => (
                <option key={address.id} value={address.id}>
                  {address.line1}, {address.city}, {address.state} {address.postal_code}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => router.push('/profile?tab=addresses')}
            className="text-indigo-600 hover:text-indigo-500"
          >
            Manage addresses
          </button>

          <h2 className="text-xl font-semibold mt-8 mb-4">Payment Method</h2>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-2"
              />
              Cash on Delivery
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="stripe"
                checked={paymentMethod === 'stripe'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-2"
              />
              Credit Card (Stripe)
            </label>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="bg-gray-100 p-6 rounded">
            {cart.items.map(item => (
              <div key={item.id} className="flex justify-between mb-2">
                <span>{item.name} x {item.quantity}</span>
                <span>${item.subtotal}</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-4">
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>${cart.total}</span>
              </div>
            </div>
            <button
              type="submit"
              disabled={checkoutMutation.isLoading || !selectedAddress}
              className="mt-6 w-full bg-indigo-600 text-white py-3 rounded disabled:opacity-50"
            >
              {checkoutMutation.isLoading ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}