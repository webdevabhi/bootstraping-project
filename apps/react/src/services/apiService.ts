import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

interface GraphQLRequest {
  query: string;
  variables?: Record<string, unknown>;
}

interface ApiServiceConfig {
  baseURL: string;
  graphqlEndpoint: string;
  timeout?: number;
}

class ApiService {
  private readonly axiosInstance: AxiosInstance;
  private readonly graphqlEndpoint: string;

  constructor(config: ApiServiceConfig) {
    this.graphqlEndpoint = config.graphqlEndpoint;
    this.axiosInstance = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout ?? 30000,
    });

    // Add request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error instanceof Error ? error : new Error(error?.message || 'Request failed'))
    );

    // Add response interceptor for global error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => this.handleError(error)
    );
  }

  private handleError(error: AxiosError): Promise<never> {
    let errorMessage = 'An unexpected error occurred';

    if (error.response) {
      // Server responded with error
      const status = error.response.status;
      switch (status) {
        case 401:
          errorMessage = 'Unauthorized access';
          // Handle logout or token refresh here
          break;
        case 404:
          errorMessage = 'Resource not found';
          break;
        case 500:
          errorMessage = 'Internal server error';
          break;
        default:
          errorMessage = (error.response?.data as { message?: string })?.message ?? errorMessage;
      }
    } else if (error.request) {
      // Request made but no response received
      errorMessage = 'No response from server';
    }

    // You can implement your custom error handling here
    // For example, showing toast notifications
    console.error(errorMessage);
    return Promise.reject(new Error(errorMessage));
  }

  // Method for REST API calls
  async request<T>(config: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance(config);
    return response.data;
  }

  // Method for GraphQL queries
  async graphql<T>(request: GraphQLRequest): Promise<T> {
    const response = await this.axiosInstance.post(this.graphqlEndpoint, request);
    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }
    return response.data.data;
  }

  // Convenience methods for common HTTP methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  async post<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  async put<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }
}

// Create and export instance
export { ApiService };
export const apiService = new ApiService({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api',
  graphqlEndpoint: import.meta.env.VITE_GRAPHQL_ENDPOINT ?? 'http://localhost:3000/graphql',
});
export default apiService;