const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface RequestOptions extends RequestInit {
  token?: string;
}

export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers, ...customConfig } = options;

  const config: RequestInit = {
    ...customConfig,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  };

  if (config.body instanceof FormData) {
     // Content-Type header should not be set for FormData, 
     // let the browser set it with the boundary
     const { 'Content-Type': contentType, ...restHeaders } = config.headers as any;
     config.headers = restHeaders;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    if (response.status === 401) {
      // Handle unauthorized (e.g., redirect to login or clear token)
      // We'll handle this in the store or a higher level, but throwing here is correct.
    }
    const errorBody = await response.json().catch(() => ({}));
    const errorMessage = errorBody.detail || response.statusText;
    throw new Error(errorMessage);
  }

  return response.json();
}

