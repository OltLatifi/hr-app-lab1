import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

interface ErrorResponse {
    message: string;
}

const apiClient = axios.create({
    baseURL: 'http://localhost:8000',
    withCredentials: true,
});

// ---- Response Interceptor for Token Refresh ----
let isRefreshing = false;
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: any) => void }[] = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ErrorResponse>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Check if it's a 401 error, not a retry, and not the refresh endpoint itself
        if (error.response?.status === 401 && 
            originalRequest.url !== '/auth/refresh' && 
            !originalRequest._retry) {
            
            if (isRefreshing) {
                // If already refreshing, queue the request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => {
                    // Retry the original request once refreshing is done
                    return apiClient(originalRequest);
                }).catch(err => {
                    // Propagate the error if queue processing failed
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await apiClient.post('/auth/refresh');
                
                processQueue(null);

                return apiClient(originalRequest);
            } catch (refreshError) {
                const typedRefreshError = refreshError as AxiosError<ErrorResponse>;
                console.error('Unable to refresh token:', typedRefreshError.response?.data?.message || typedRefreshError.message);
                
                processQueue(typedRefreshError);

                return Promise.reject(typedRefreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient; 