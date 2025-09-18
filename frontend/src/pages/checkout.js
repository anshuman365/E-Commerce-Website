import { useState } from 'react'
import { useRouter } from 'next/router'
import { useQuery, useMutation } from 'react-query'
import { useAuth } from '../hooks/useAuth'
import { cartService } from '../services/cart'
import { orderService } from '../services/orders'
import { toast } from 'react-toastify'

export default function Checkout() {
  const { user } = useAuth()
  const router = useRouter()
  const [selectedAddress, setSelectedAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [couponCode, setCouponCode] = useState('')
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [newAddress, setNewAddress] = useState({
    label: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    is_default: false
  })

  const { data: cart } = useQuery('cart', cartService.getCart)
  const { data: addresses, refetch: refetchAddresses } = useQuery(
    'addresses',
    () => cartService.getAddresses(),
    { enabled: !!user }
  )

  const applyCoupon = useMutation(
    (code) => cartService.applyCoupon(code),
    {
      onSuccess: () => {
        toast.success('Coupon applied successfully!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Invalid coupon code')
      }
    }
  )

  const addAddress = useMutation(
    (data) => cartService.addAddress(data),
    {
      onSuccess: () => {
        toast.success('Address added successfully!')
        refetchAddresses()
        setShowAddressForm(false)
        setNewAddress({
          label: '',
          line1: '',
          line2: '',
          city: '',
          state: '',
          postal_code: '',
          country: '',
          is_default: false
        })
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to add address')
      }
    }
  )

  const checkoutMutation = useMutation(
    (data) => orderService.checkout(data),
    {
      onSuccess: (data) => {
        if (data.data.payment_url) {
          window.location.href = data.data.payment_url
        } else {
          toast.success('Order placed successfully!')
          router.push(`/orders/${data.data.order_id}`)
        }
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Checkout failed')
      }
    }
  )

  const handleCouponApply = (e) => {
    e.preventDefault()
    if (couponCode.trim()) {
      applyCoupon.mutate(couponCode.trim())
    }
  }

  const handleAddressSubmit = (e) => {
    e.preventDefault()
    addAddress.mutate(newAddress)
  }

  const handleCheckout = (e) => {
    e.preventDefault()
    if (!selectedAddress) {
      toast.error('Please select a shipping address')
      return
    }

    checkoutMutation.mutate({
      payment_method: paymentMethod,
      shipping_address_id: selectedAddress
    })
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold mb-4">Authentication Required</h2>
          <p className="mb-6">Please log in or create an account to proceed with checkout.</p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/login?redirect=/checkout')}
              className="w-full btn-primary"
            >
              Login
            </button>
            <button
              onClick={() => router.push('/register?redirect=/checkout')}
              className="w-full btn-secondary"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
          <button
            onClick={() => router.push('/products')}
            className="btn-primary"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
          
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="mb-4">
              <label className="form-label">Select Address:</label>
              {addresses && addresses.length > 0 ? (
                <>
                  <select
                    value={selectedAddress}
                    onChange={(e) => setSelectedAddress(e.target.value)}
                    className="form-input"
                    required
                  >
                    <option value="">Select an address</option>
                    {addresses.map(address => (
                      <option key={address.id} value={address.id}>
                        {address.label}: {address.line1}, {address.city}, {address.state} {address.postal_code}
                        {address.is_default && ' (Default)'}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(true)}
                    className="text-indigo-600 hover:text-indigo-500 text-sm mt-2"
                  >
                    + Add new address
                  </button>
                </>
              ) : (
                <p className="text-gray-600 mb-4">No addresses found. Please add a shipping address.</p>
              )}
            </div>

            {showAddressForm && (
              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold mb-3">Add New Address</h3>
                <form onSubmit={handleAddressSubmit}>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="form-label">Label (Home, Work, etc.)</label>
                      <input
                        type="text"
                        value={newAddress.label}
                        onChange={(e) => setNewAddress({...newAddress, label: e.target.value})}
                        className="form-input"
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Address Line 1</label>
                      <input
                        type="text"
                        value={newAddress.line1}
                        onChange={(e) => setNewAddress({...newAddress, line1: e.target.value})}
                        className="form-input"
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Address Line 2 (Optional)</label>
                      <input
                        type="text"
                        value={newAddress.line2}
                        onChange={(e) => setNewAddress({...newAddress, line2: e.target.value})}
                        className="form-input"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="form-label">City</label>
                        <input
                          type="text"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                          className="form-input"
                          required
                        />
                      </div>
                      <div>
                        <label className="form-label">State</label>
                        <input
                          type="text"
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                          className="form-input"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="form-label">Postal Code</label>
                        <input
                          type="text"
                          value={newAddress.postal_code}
                          onChange={(e) => setNewAddress({...newAddress, postal_code: e.target.value})}
                          className="form-input"
                          required
                        />
                      </div>
                      <div>
                        <label className="form-label">Country</label>
                        <input
                          type="text"
                          value={newAddress.country}
                          onChange={(e) => setNewAddress({...newAddress, country: e.target.value})}
                          className="form-input"
                          required
                        />
                      </div>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_default"
                        checked={newAddress.is_default}
                        onChange={(e) => setNewAddress({...newAddress, is_default: e.target.checked})}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="is_default" className="ml-2 block text-sm text-gray-900">
                        Set as default address
                      </label>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <button
                      type="submit"
                      className="btn-primary"
                    >
                      Save Address
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="space-y-3">
              <label className="flex items-center p-3 border rounded-md hover:border-indigo-500 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="ml-3">
                  <span className="block text-sm font-medium">Cash on Delivery</span>
                  <span className="block text-xs text-gray-500">Pay when you receive your order</span>
                </div>
              </label>
              <label className="flex items-center p-3 border rounded-md hover:border-indigo-500 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="stripe"
                  checked={paymentMethod === 'stripe'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="ml-3">
                  <span className="block text-sm font-medium">Credit/Debit Card</span>
                  <span className="block text-xs text-gray-500">Pay securely with Stripe</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
            <div className="mb-4">
              {cart.items.map(item => (
                <div key={item.id} className="flex justify-between py-2 border-b">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-600"> x {item.quantity}</span>
                  </div>
                  <span>${item.subtotal}</span>
                </div>
              ))}
            </div>
            
            <div className="mb-4">
              <form onSubmit={handleCouponApply} className="flex">
                <input
                  type="text"
                  placeholder="Coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-grow form-input rounded-r-none"
                />
                <button
                  type="submit"
                  className="btn-secondary rounded-l-none"
                  disabled={applyCoupon.isLoading}
                >
                  {applyCoupon.isLoading ? 'Applying...' : 'Apply'}
                </button>
              </form>
            </div>
            
            <div className="space-y-2 mb-4">
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
              <div className="border-t pt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${cart.total}</span>
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={checkoutMutation.isLoading || !selectedAddress}
              className="w-full btn-primary py-3 text-lg"
            >
              {checkoutMutation.isLoading ? 'Processing...' : 'Place Order'}
            </button>
            
            <p className="text-xs text-gray-500 mt-4">
              By completing your purchase you agree to our Terms of Service.
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}