import { useMutation, useQueryClient } from 'react-query'
import { cartService } from '@/services/cart'

export function useCart() {
  const queryClient = useQueryClient()

  const addToCart = useMutation(
    ({ productId, quantity }) => cartService.addToCart(productId, quantity),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cart')
      }
    }
  )

  return { addToCart }
}