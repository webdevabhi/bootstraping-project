import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import axios from 'axios';
import { ApiService } from './apiService';

type MockAxiosInstance = ReturnType<typeof vi.fn> & {
  interceptors: {
    request: { use: ReturnType<typeof vi.fn> };
    response: { use: ReturnType<typeof vi.fn> };
  };
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

// Create a more detailed mock for axios
vi.mock('axios', () => {
  const mockInterceptors = {
    request: {
      use: vi.fn((fn) => fn),
    },
    response: {
      use: vi.fn((successFn, errorFn) => ({
        successFn,
        errorFn
      })),
    }
  };

  const mockAxiosInstance = vi.fn().mockImplementation((config) => {
    return Promise.resolve({ data: {} });
  }) as unknown as ReturnType<typeof vi.fn> & { 
    interceptors: typeof mockInterceptors;
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  // Ensure all methods are properly mocked
  mockAxiosInstance.interceptors = mockInterceptors;
  mockAxiosInstance.get = vi.fn().mockImplementation(() => Promise.resolve({ data: {} }));
  mockAxiosInstance.post = vi.fn().mockImplementation(() => Promise.resolve({ data: {} }));
  mockAxiosInstance.put = vi.fn().mockImplementation(() => Promise.resolve({ data: {} }));
  mockAxiosInstance.delete = vi.fn().mockImplementation(() => Promise.resolve({ data: {} }));

  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
      interceptors: mockInterceptors,
    },
  };
});

// Add localStorage mock before describe block
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('ApiService', () => {
  let apiService: ApiService;
  const mockConfig = {
    baseURL: 'http://test-api.com',
    graphqlEndpoint: '/graphql',
    timeout: 5000,
  };

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    apiService = new ApiService(mockConfig);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize correctly', () => {
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: mockConfig.baseURL,
      timeout: mockConfig.timeout,
    });
  });

  it('should handle GET requests', async () => {
    const mockResponse = { data: { test: 'data' } };
    const mockAxiosInstance = (axios.create as unknown as () => MockAxiosInstance)();
    
    // Mock the direct function call
    mockAxiosInstance.mockResolvedValueOnce(mockResponse);

    const result = await apiService.get('/test');
    
    // Verify the instance was called with the correct config
    expect(mockAxiosInstance).toHaveBeenCalledWith({
      method: 'GET',
      url: '/test'
    });
    expect(result).toEqual(mockResponse.data);
  });

  it('should handle POST requests', async () => {
    const mockResponse = { data: { test: 'data' } };
    const mockAxiosInstance = (axios.create as unknown as () => MockAxiosInstance)();
    const postData = { name: 'test' };
    
    // Mock the direct function call
    mockAxiosInstance.mockResolvedValueOnce(mockResponse);

    const result = await apiService.post('/test', postData);
    
    // Verify the instance was called with the correct config
    expect(mockAxiosInstance).toHaveBeenCalledWith({
      method: 'POST',
      url: '/test',
      data: postData
    });
    expect(result).toEqual(mockResponse.data);
  });

  it('should handle GraphQL queries', async () => {
    const mockResponse = { 
      data: { 
        data: { user: { id: 1 } },
      } 
    };
    const mockAxiosInstance = (axios.create as unknown as () => MockAxiosInstance)();
    
    // Properly mock the post method
    mockAxiosInstance.post.mockResolvedValueOnce(mockResponse);

    const query = 'query { user { id } }';
    const result = await apiService.graphql({ query });
    
    // Verify the post call
    expect(mockAxiosInstance.post).toHaveBeenCalledWith(
      mockConfig.graphqlEndpoint,
      { query }
    );
    expect(result).toEqual(mockResponse.data.data);
  });

  it('should add auth token to headers when available', () => {
    const token = 'test-token';
    localStorageMock.setItem('token', token);
    
    const mockAxiosInstance = (axios.create as unknown as () => MockAxiosInstance)();
    const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];
    
    // Create a config object that matches the AxiosRequestConfig structure
    const config = { 
      headers: {} 
    };
    
    // Call the actual interceptor function that was registered
    const modifiedConfig = requestInterceptor(config);
    
    expect(modifiedConfig.headers.Authorization).toBe(`Bearer ${token}`);
  });

  it('should handle error responses', async () => {
    const mockAxiosInstance = (axios.create as unknown as () => MockAxiosInstance)();
    // Get the error handler that was registered
    const errorHandler = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];

    const error = {
      response: {
        status: 401,
        data: { message: 'Unauthorized' }
      }
    };

    await expect(errorHandler(error)).rejects.toThrow('Unauthorized access');
  });

  it('should handle network errors', async () => {
    const mockAxiosInstance = (axios.create as unknown as () => MockAxiosInstance)();
    // Get the error handler that was registered
    const errorHandler = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];

    const error = {
      request: {},
    };

    await expect(errorHandler(error)).rejects.toThrow('No response from server');
  });

  // Add a test for GraphQL error handling
  it('should handle GraphQL errors', async () => {
    const mockErrorResponse = { 
      data: { 
        errors: [{ message: 'GraphQL Error' }]
      } 
    };
    const mockAxiosInstance = (axios.create as unknown as () => MockAxiosInstance)();
    mockAxiosInstance.post.mockResolvedValueOnce(mockErrorResponse);

    const query = 'query { user { id } }';
    
    await expect(apiService.graphql({ query }))
      .rejects
      .toThrow('GraphQL Error');
  });
}); 