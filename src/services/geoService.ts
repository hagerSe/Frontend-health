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
    const response = await apiClient.get(`${API_ENDPOINTS.GEO.BASE}/kebeles/${woredaId}`);
    return response.data;
  },

  /**
   * Create a new zone
   */
  async createZone(zoneData: any) {
    const response = await apiClient.post(`${API_ENDPOINTS.GEO.BASE}/zones`, zoneData);
    return response.data;
  },

  /**
   * Create a new woreda
   */
  async createWoreda(woredaData: any) {
    const response = await apiClient.post(`${API_ENDPOINTS.GEO.BASE}/woredas`, woredaData);
    return response.data;
  },

  /**
   * Create a new kebele
   */
  async createKebele(kebeleData: any) {
    const response = await apiClient.post(`${API_ENDPOINTS.GEO.BASE}/kebeles`, kebeleData);
    return response.data;
  }
};
