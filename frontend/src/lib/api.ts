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

export const apiClient = {
  async register(payload: RegisterPayload) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Registration failed');
    }

    return response.json();
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Invalid email or password');
    }

    const data: AuthResponse = await response.json();
    if (typeof window !== 'undefined') {
      localStorage.setItem('researchmate_token', data.access_token);
      localStorage.setItem('researchmate_user', JSON.stringify(data.user));
    }
    return data;
  },

  async getMe(token?: string) {
    const activeToken =
      token || (typeof window !== 'undefined' ? localStorage.getItem('researchmate_token') : null);

    if (!activeToken) throw new Error('No authentication token');

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${activeToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Session expired or invalid');
    }

    return response.json();
  },

  async logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('researchmate_token');
      localStorage.removeItem('researchmate_user');
    }
    return { success: true };
  },
};
