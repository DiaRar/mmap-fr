const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

type TokenProvider = () => string | null;
type UnauthorizedHandler = () => void;

interface RequestOptions extends RequestInit {
  token?: string;
}

let authTokenProvider: TokenProvider | null = null;
let unauthorizedHandler: UnauthorizedHandler | null = null;

export function setAuthTokenProvider(provider: TokenProvider | null): void {
  authTokenProvider = provider;
}

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler;
}

export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers, ...customConfig } = options;
  const resolvedToken = token ?? authTokenProvider?.() ?? null;

  const config: RequestInit = {
    ...customConfig,
    headers: {
      'Content-Type': 'application/json',
      ...(resolvedToken ? { Authorization: `Bearer ${resolvedToken}` } : {}),
      ...headers,
    },
  };

  if (config.body instanceof FormData) {
    // Content-Type header should not be set for FormData,
    // let the browser set it with the boundary
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    const { 'Content-Type': _contentType, ...restHeaders } = config.headers as any;
    config.headers = restHeaders;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    if (response.status === 401) {
      unauthorizedHandler?.();
    }
    const errorBody = await response.json().catch(() => ({}));
    const errorMessage = errorBody.detail || response.statusText;
    throw new Error(errorMessage);
  }

  return response.json();
}
