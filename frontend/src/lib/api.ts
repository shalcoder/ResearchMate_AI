/**
 * ResearchMate AI - Unified Frontend API Client
 * Interfaces with FastAPI Backend Endpoints
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: string;
  department?: string;
  institution?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    department?: string;
    institution?: string;
    is_active: boolean;
    created_at: string;
  };
}

class ApiError extends Error {
  response?: {
    status: number;
    data: any;
  };
  constructor(message: string, status?: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    if (status !== undefined) {
      this.response = { status, data };
    }
  }
}

function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('researchmate_token');
  }
  return null;
}

async function request(method: string, endpoint: string, data?: any, options: { headers?: Record<string, string>; params?: Record<string, any> } = {}) {
  let url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  if (options.params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(options.params)) {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    }
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const headers: Record<string, string> = { ...options.headers };
  const token = getAuthToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let body: any = undefined;
  if (data !== undefined) {
    if (typeof FormData !== 'undefined' && data instanceof FormData) {
      body = data;
      // Let browser / fetch set multipart boundary
      delete headers['Content-Type'];
    } else {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
      body = JSON.stringify(data);
    }
  }

  const response = await fetch(url, {
    method,
    headers,
    body,
  });

  let responseData: any = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    responseData = await response.json().catch(() => null);
  } else {
    responseData = await response.text().catch(() => '');
  }

  if (!response.ok) {
    const msg = (responseData && responseData.detail) || `Request failed with status ${response.status}`;
    throw new ApiError(msg, response.status, responseData);
  }

  return {
    data: responseData,
    status: response.status,
    headers: response.headers,
  };
}

export const api = {
  get: (url: string, options?: { headers?: Record<string, string>; params?: Record<string, any> }) =>
    request('GET', url, undefined, options),
  post: (url: string, data?: any, options?: { headers?: Record<string, string>; params?: Record<string, any> }) =>
    request('POST', url, data, options),
  put: (url: string, data?: any, options?: { headers?: Record<string, string>; params?: Record<string, any> }) =>
    request('PUT', url, data, options),
  delete: (url: string, options?: { headers?: Record<string, string>; params?: Record<string, any> }) =>
    request('DELETE', url, undefined, options),
};

export const apiClient = {
  async register(payload: RegisterPayload) {
    const res = await api.post('/auth/register', payload);
    return res.data;
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const res = await api.post('/auth/login', payload);
    const data: AuthResponse = res.data;
    if (typeof window !== 'undefined') {
      localStorage.setItem('researchmate_token', data.access_token);
      localStorage.setItem('researchmate_user', JSON.stringify(data.user));
    }
    return data;
  },

  async getMe(token?: string) {
    const res = await api.get('/auth/me', token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
    return res.data;
  },

  async logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('researchmate_token');
      localStorage.removeItem('researchmate_user');
    }
    try {
      await api.post('/auth/logout');
    } catch (_) {}
    return { success: true };
  },
};
