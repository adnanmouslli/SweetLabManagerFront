import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";
import Cookies from "js-cookie";

interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  accessTokenKey?: string;
  refreshTokenKey?: string;
  authRedirectPath?: string;
  onTokenRefresh?: () => Promise<void>;
}

const createApiClient = ({
  baseURL,
  timeout = 10000,
  accessTokenKey = "access_token",
  refreshTokenKey = "refresh_token",
  authRedirectPath = "/auth",
  onTokenRefresh,
}: ApiClientConfig): AxiosInstance => {
  const api = axios.create({
    baseURL,
    timeout,
    headers: { "Content-Type": "application/json" },
    // withCredentials: true,
  });

  const handleAuthError = async (error: AxiosError) => {
    const accessToken = Cookies.get(accessTokenKey);

    if (!accessToken) {
      console.warn("Access token is missing. Redirecting to login.");
      window.location.href = authRedirectPath;
      return Promise.reject(error);
    }

    if (onTokenRefresh) {
      try {
        console.info("Attempting token refresh...");
        await onTokenRefresh();
        return api.request(error.config!);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        Cookies.remove(refreshTokenKey);
        Cookies.remove(accessTokenKey);
        window.location.href = authRedirectPath;
        return Promise.reject(error);
      }
    } else {
      console.warn("onTokenRefresh is not provided. Redirecting to login.");
      window.location.href = authRedirectPath;
    }

    return Promise.reject(error);
  };

  api.interceptors.request.use((config) => {
    const token = Cookies.get(accessTokenKey);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (response: AxiosResponse) => response.data,
    async (error: AxiosError) => {
      if (error.response?.status === 401) {
        return handleAuthError(error);
      }
      return Promise.reject(error);
    }
  );

  return api;
};

const api = createApiClient({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || "",
  authRedirectPath: "/login",
});

export const apiClient = {
  get: <T>(url: string, params?: any): Promise<T> => api.get(url, params),
  post: <T>(url: string, data?: unknown): Promise<T> => api.post(url, data),
  put: <T>(url: string, data?: unknown): Promise<T> => api.put(url, data),
  patch: <T>(url: string, data?: unknown): Promise<T> => api.patch(url, data),
  delete: <T>(url: string): Promise<T> => api.delete(url),
};
