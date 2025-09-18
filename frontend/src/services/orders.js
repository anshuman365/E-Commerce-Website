import api from './api'

export const orderService = {
  getOrders: (params = {}) => 
    api.get('/orders', { params }),
  
  getOrder: (id) => 
    api.get(`/orders/${id}`),
  
  checkout: (data) => 
    api.post('/orders/checkout', data),
  
  cancelOrder: (id) => 
    api.post(`/orders/${id}/cancel`),
  
  createPaymentIntent: () => 
    api.post('/orders/create-payment-intent'),
}