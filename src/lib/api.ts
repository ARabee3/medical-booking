import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT access token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 and refresh token
let isRefreshing = false;
let refreshSubscribers: {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}[] = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb.resolve(token));
  refreshSubscribers = [];
}

function onRefreshFailed(error: unknown) {
  refreshSubscribers.forEach((cb) => cb.reject(error));
  refreshSubscribers = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (!isRefreshing) {
        isRefreshing = true;
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem('refresh');
          if (!refreshToken) throw new Error('No refresh token');

          // In mock phase, this simulates a refresh. In Django phase, this calls /api/token/refresh/
          const { data } = await axios.post(`${API_BASE_URL}/token/refresh/`, {
            refresh: refreshToken,
          });

          localStorage.setItem('access', data.access);
          onRefreshed(data.access);
          isRefreshing = false;

          return api(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;
          onRefreshFailed(refreshError);
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      // Wait for refresh to complete
      return new Promise((resolve, reject) => {
        refreshSubscribers.push({
          resolve: (token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(api(originalRequest));
          },
          reject: (err: unknown) => {
            reject(err);
          },
        });
      });
    }

    return Promise.reject(error);
  }
);
