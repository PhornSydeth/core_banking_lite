import axios from "axios";

export const ApiClient=axios.create({
     baseURL:import.meta.env.VITE_BACKEND_URL,
     withCredentials:true
})

ApiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response && (error.response.status === 401 || error.response.status === 403) && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/refresh`, {}, { withCredentials: true });
                return ApiClient(originalRequest);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);
