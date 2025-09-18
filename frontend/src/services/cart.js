import api from './api'

export const cartService = {
  getCart: () => api.get('/cart'),
  
  addToCart: (productId, quantity) => 
    api.post('/cart/items', { product_id: productId, quantity }),
  
  updateItem: (itemId, quantity) => 
    api.put(`/cart/items/${itemId}`, { quantity }),
  
  removeItem: (itemId) => 
    api.delete(`/cart/items/${itemId}`),
  
  applyCoupon: (code) => 
    api.post('/cart/apply-coupon', { code }),
  
  getAddresses: () => 
    api.get('/users/addresses'),
  
  addAddress: (data) => 
    api.post('/users/addresses', data),
  
  updateAddress: (id, data) => 
    api.put(`/users/addresses/${id}`, data),
  
  deleteAddress: (id) => 
    api.delete(`/users/addresses/${id}`),
}