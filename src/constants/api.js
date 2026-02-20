const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const API_ENDPOINTS = {
    ADMIN: {
        LOGIN: `${API_BASE_URL}/admins/login`,
        REGISTER: `${API_BASE_URL}/admins/registration`,
        LOGOUT: `${API_BASE_URL}/admins/logout`,
        REFRESH_TOKEN: `${API_BASE_URL}/admins/refresh-token`,
        BASE: `${API_BASE_URL}/admins`,
    },
    USER: {
        LOGIN: `${API_BASE_URL}/users/login`,
        REGISTER: `${API_BASE_URL}/users/registration`,
        LOGOUT: `${API_BASE_URL}/users/logout`,
        REFRESH_TOKEN: `${API_BASE_URL}/users/refresh-token`,
        BASE: `${API_BASE_URL}/users`,
    },
    GEO: {
        BASE: `${API_BASE_URL}/geo`,
        REGIONS: `${API_BASE_URL}/geo/regions`,
        ZONES: (regionId) => `${API_BASE_URL}/geo/regions/${regionId}/zones`,
        WOREDAS: (zoneId) => `${API_BASE_URL}/geo/zones/${zoneId}/woredas`,
    },
    HOSPITALS: {
        BASE: `${API_BASE_URL}/hospitals`,
    }
};

export default API_BASE_URL;
