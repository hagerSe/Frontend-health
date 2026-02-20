import apiClient from './apiClient';
import { API_ENDPOINTS } from '../constants/api';

export const hospitalService = {
  /**
   * Fetch all hospitals with optional filtering
   */
  async getHospitals(params = {}) {
    const response = await apiClient.get(API_ENDPOINTS.HOSPITALS.BASE, { params });
    return response.data;
  },

  /**
   * Fetch a single hospital by ID
   */
  async getHospitalById(id: string | number) {
    const response = await apiClient.get(`${API_ENDPOINTS.HOSPITALS.BASE}/${id}`);
    return response.data;
  },

  /**
   * Create a new hospital
   */
  async createHospital(hospitalData: any) {
    const response = await apiClient.post(API_ENDPOINTS.HOSPITALS.BASE, hospitalData);
    return response.data;
  },

  /**
   * Update an existing hospital
   */
  async updateHospital(id: string | number, hospitalData: any) {
    const response = await apiClient.put(`${API_ENDPOINTS.HOSPITALS.BASE}/${id}`, hospitalData);
    return response.data;
  },

  /**
   * Delete a hospital (soft delete usually)
   */
  async deleteHospital(id: string | number) {
    const response = await apiClient.delete(`${API_ENDPOINTS.HOSPITALS.BASE}/${id}`);
    return response.data;
  }
};
