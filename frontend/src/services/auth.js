import api from './api';

export const authService = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  register: (userData) => 
    api.post('/auth/register', userData),
  
  logout: () => 
    api.post('/auth/logout'),
  
  requestPasswordReset: (email) => 
    api.post('/auth/password-reset/request', { email }),
  
  confirmPasswordReset: (token, newPassword) => 
    api.post('/auth/password-reset/confirm', { token, newPassword }),
};