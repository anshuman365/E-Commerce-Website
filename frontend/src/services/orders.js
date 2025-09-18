import api from './api'

export const orderService = {
  getOrders: () => api.get('/orders'),
  getOrder: (id) => api.get(`/orders/${id}`),
  checkout: (data) => api.post('/orders/checkout', data),
  cancelOrder: (id) => api.post(`/orders/${id}/cancel`)
}