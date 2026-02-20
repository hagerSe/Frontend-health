import apiClient from './apiClient';
import { API_ENDPOINTS } from '../constants/api';

export const geoService = {
  /**
   * Fetch all regions
   */
  async getRegions() {
    const response = await apiClient.get(API_ENDPOINTS.GEO.REGIONS);
    return response.data;
  },

  /**
   * Fetch zones for a specific region
   */
  async getZones(regionId: string | number) {
    const response = await apiClient.get(API_ENDPOINTS.GEO.ZONES(regionId));
    return response.data;
  },

  /**
   * Fetch woredas for a specific zone
   */
  async getWoredas(zoneId: string | number) {
    const response = await apiClient.get(API_ENDPOINTS.GEO.WOREDAS(zoneId));
    return response.data;
  },

  /**
   * Fetch kebeles for a specific woreda (if endpoint exists)
   * Adding this as a placeholder based on typical hierarchy
   */
  async getKebeles(woredaId: string | number) {
    const response = await apiClient.get(`${API_ENDPOINTS.GEO.BASE}/woredas/${woredaId}/kebeles`);
    return response.data;
  }
};
