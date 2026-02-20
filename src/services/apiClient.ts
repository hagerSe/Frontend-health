import axios from 'axios';
import API_BASE_URL from '../constants/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const role = localStorage.getItem('user_role');
                const isAdmin = role?.includes('Admin');
                const refreshEndpoint = isAdmin 
                    ? '/admins/refresh-token' 
                    : '/users/refresh-token';

                // Attempt to refresh the token
                // Note: withCredentials: true ensures the refresh cookie is sent
                const response = await axios.post(
                    `${API_BASE_URL}${refreshEndpoint}`,
                    {},
                    { withCredentials: true }
                );

                if (response.data.accessToken) {
                    const newToken = response.data.accessToken;
                    localStorage.setItem('token', newToken);
                    
                    // Update the authorization header for the original request
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    
                    // Retry the original request with the new token
                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                // If refresh fails, clear storage and redirect (optional: let authService handle it)
                localStorage.removeItem('token');
                localStorage.removeItem('admin');
                localStorage.removeItem('user');
                localStorage.removeItem('user_role');
                
                // You might want to trigger a redirect to login here
                // window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
