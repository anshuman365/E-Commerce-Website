import { useQuery, useMutation, useQueryClient } from 'react-query'
import Link from 'next/link'
import Image from 'next/image'
import { cartService } from '../services/cart'
import { useAuth } from '../hooks/useAuth'
import { toast } from 'react-toastify'

export default function Cart() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { data: cart, isLoading, error } = useQuery('cart', cartService.getCart)

  const updateQuantity = useMutation(
    ({ itemId, quantity }) => cartService.updateItem(itemId, quantity),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cart')
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to update quantity')
      }
    }
  )

  const removeItem = useMutation(
    (itemId) => cartService.removeItem(itemId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cart')
        toast.info('Item removed from cart')
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to remove item')
      }
    }
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
          Failed to load cart. Please try again later.
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      
      {!cart || cart.items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Looks like you haven't added any items to your cart yet.</p>
          <Link href="/products" className="btn-primary inline-block">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Cart Items ({cart.items.length})</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {cart.items.map(item => (
                  <div key={item.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center">
                    <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
                      <Image
                        src={item.image || '/placeholder.jpg'}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                      <p className="text-gray-600 mb-2">${item.unit_price}</p>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 mr-4">Quantity:</span>
                        <div className="flex items-center border rounded-md">
                          <button
                            onClick={() => updateQuantity.mutate({
                              itemId: item.id,
                              quantity: Math.max(1, item.quantity - 1)
                            })}
                            disabled={item.quantity <= 1 || updateQuantity.isLoading}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                          >
                            -
                          </button>
                          <span className="px-4 py-1">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity.mutate({
                              itemId: item.id,
                              quantity: item.quantity + 1
                            })}
                            disabled={updateQuantity.isLoading}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 sm:mt-0 sm:ml-6 flex flex-col items-end">
                      <p className="font-bold text-lg">${item.subtotal}</p>
                      <button
                        onClick={() => removeItem.mutate(item.id)}
                        className="mt-2 text-red-600 hover:text-red-800 text-sm flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${cart.subtotal || cart.total}</span>
                </div>
                {cart.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-${cart.discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{cart.shipping_cost > 0 ? `$${cart.shipping_cost}` : 'Free'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${cart.tax || '0.00'}</span>
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${cart.total}</span>
                  </div>
                </div>
              </div>

              {user ? (
                <Link
                  href="/checkout"
                  className="block w-full bg-indigo-600 text-white py-3 rounded text-center font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Proceed to Checkout
                </Link>
              ) : (
                <div className="space-y-3">
                  <Link
                    href="/login?redirect=/checkout"
                    className="block w-full bg-indigo-600 text-white py-3 rounded text-center font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    Login to Checkout
                  </Link>
                  <Link
                    href="/register?redirect=/checkout"
                    className="block w-full text-indigo-600 py-3 rounded text-center font-semibold border border-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    Create Account
                  </Link>
                </div>
              )}

              <Link
                href="/products"
                className="block w-full text-center mt-4 text-indigo-600 hover:text-indigo-800"
              >
                Continue Shopping
              </Link>
            </div>

            {cart.coupon_code && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
                <p className="text-green-800">
                  Coupon <strong>{cart.coupon_code}</strong> applied. You saved ${cart.discount}.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}