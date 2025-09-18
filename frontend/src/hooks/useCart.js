import { useMutation, useQuery, useQueryClient } from 'react-query'
import { cartService } from '../services/cart'
import { toast } from 'react-toastify'

export function useCart() {
  const queryClient = useQueryClient()

  const { data: cart, isLoading, error } = useQuery(
    'cart',
    cartService.getCart,
    {
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to load cart')
      }
    }
  )

  const addToCart = useMutation(
    ({ productId, quantity }) => cartService.addToCart(productId, quantity),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cart')
        toast.success('Product added to cart!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to add to cart')
      }
    }
  )

  const updateItem = useMutation(
    ({ itemId, quantity }) => cartService.updateItem(itemId, quantity),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cart')
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to update cart')
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

  const applyCoupon = useMutation(
    (code) => cartService.applyCoupon(code),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cart')
        toast.success('Coupon applied successfully!')
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Invalid coupon code')
      }
    }
  )

  return { 
    cart, 
    isLoading, 
    error, 
    addToCart, 
    updateItem, 
    removeItem, 
    applyCoupon 
  }
}