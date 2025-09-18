import { useQuery, useMutation, useQueryClient } from 'react-query'
import Link from 'next/link'
import { cartService } from '../services/cart'

export default function Cart() {
  const queryClient = useQueryClient()
  const { data: cart, isLoading } = useQuery('cart', cartService.getCart)

  const updateQuantity = useMutation(
    ({ itemId, quantity }) => cartService.updateItem(itemId, quantity),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cart')
      }
    }
  )

  const removeItem = useMutation(
    (itemId) => cartService.removeItem(itemId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cart')
      }
    }
  )

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      {!cart || cart.items.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
          <Link href="/products" className="text-indigo-600 hover:text-indigo-500">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {cart.items.map(item => (
              <div key={item.id} className="flex items-center border-b py-4">
                <img
                  src={item.image || '/placeholder.jpg'}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="ml-4 flex-grow">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-gray-600">${item.unit_price}</p>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={() => updateQuantity.mutate({
                      itemId: item.id,
                      quantity: item.quantity - 1
                    })}
                    disabled={item.quantity <= 1}
                    className="px-3 py-1 bg-gray-200 rounded-l"
                  >
                    -
                  </button>
                  <span className="px-4">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity.mutate({
                      itemId: item.id,
                      quantity: item.quantity + 1
                    })}
                    className="px-3 py-1 bg-gray-200 rounded-r"
                  >
                    +
                  </button>
                </div>
                <div className="ml-4">
                  <p className="font-bold">${item.subtotal}</p>
                </div>
                <button
                  onClick={() => removeItem.mutate(item.id)}
                  className="ml-4 text-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          
          <div>
            <div className="bg-gray-100 p-6 rounded">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${cart.total}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>${cart.total}</span>
                </div>
              </div>
              <Link
                href="/checkout"
                className="mt-6 block w-full bg-indigo-600 text-white py-3 rounded text-center font-semibold"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}