import api from './api'

export const authService = {
  login: (credentials) => 
    api.post('/auth/login', credentials),
  
  register: (userData) => 
    api.post('/auth/register', userData),
  
  logout: () => 
    api.post('/auth/logout'),
  
  getProfile: () => 
    api.get('/users/profile'),
  
  updateProfile: (userData) => 
    api.put('/users/profile', userData),
  
  requestPasswordReset: (email) => 
    api.post('/auth/password-reset/request', { email }),
  
  confirmPasswordReset: (token, newPassword) => 
    api.post('/auth/password-reset/confirm', { token, newPassword }),
}