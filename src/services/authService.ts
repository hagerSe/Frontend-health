import apiClient from './apiClient';
import { API_ENDPOINTS } from '../constants/api';

export const authService = {
  async adminLogin(credentials: any) {
    const response = await apiClient.post(API_ENDPOINTS.ADMIN.LOGIN, credentials);
    if (response.data.accessToken) {
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('admin', JSON.stringify(response.data.admin));
      localStorage.setItem('user_role', response.data.admin.role);
    }
    return response.data;
  },

  async userLogin(credentials: any) {
    const response = await apiClient.post(API_ENDPOINTS.USER.LOGIN, credentials);
    if (response.data.accessToken) {
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('user_role', response.data.user.role);
    }
    return response.data;
  },

  async adminRegister(userData: any) {
    const response = await apiClient.post(API_ENDPOINTS.ADMIN.REGISTER, userData);
    return response.data;
  },

  async userRegister(userData: any) {
    const response = await apiClient.post(API_ENDPOINTS.USER.REGISTER, userData);
    return response.data;
  },

  async logout() {
    const role = localStorage.getItem('user_role');
    const endpoint = role?.includes('Admin') ? API_ENDPOINTS.ADMIN.LOGOUT : API_ENDPOINTS.USER.LOGOUT;
    
    try {
      await apiClient.post(endpoint);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
      localStorage.removeItem('user');
      localStorage.removeItem('user_role');
    }
  },

  getCurrentUser() {
    const admin = localStorage.getItem('admin');
    const user = localStorage.getItem('user');
    return admin ? JSON.parse(admin) : (user ? JSON.parse(user) : null);
  },

  getUserRole() {
    return localStorage.getItem('user_role');
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
};
