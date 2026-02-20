import apiClient from './apiClient';
import { API_ENDPOINTS } from '../constants/api';

export const adminService = {
  /**
   * Fetch all admins with optional filtering (e.g. by region/zone)
   */
  async getAdmins(params = {}) {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.BASE, { params });
    return response.data;
  },

  /**
   * Fetch a specific admin
   */
  async getAdmin(id: string | number) {
    const response = await apiClient.get(`${API_ENDPOINTS.ADMIN.BASE}/${id}`);
    return response.data;
  },

  /**
   * Create a new admin (Federal Admin only typically)
   */
  async createAdmin(adminData: any) {
    const response = await apiClient.post(API_ENDPOINTS.ADMIN.BASE, adminData);
    return response.data;
  },

  /**
   * Update admin data
   */
  async updateAdmin(id: string | number, adminData: any) {
    const response = await apiClient.put(`${API_ENDPOINTS.ADMIN.BASE}/${id}`, adminData);
    return response.data;
  },

  /**
   * Soft delete an admin
   */
  async deleteAdmin(id: string | number) {
    const response = await apiClient.delete(`${API_ENDPOINTS.ADMIN.BASE}/${id}`);
    return response.data;
  }
};
