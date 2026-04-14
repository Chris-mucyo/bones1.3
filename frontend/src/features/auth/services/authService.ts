import type { LoginCredentials, RegisterCredentials, User } from '../types/auth.types';

const API_URL = 'http://localhost:3000/api/v1';

export const authService = {
  async login(credentials: LoginCredentials): Promise<{
    user: User;
    accessToken: string;
    refreshToken: string;
  }> {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Login failed');
    }

    const data = await res.json();
    return data;
  },

  

  async register(credentials: RegisterCredentials): Promise<User> {
    const res = await fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Registration failed');
    }

    const data = await res.json();
    return data;
  },

  loginWithGoogle(): void {
    window.location.href = `${API_URL}/auth/google`;
  },

  // 🔥 IMPROVED: Also handles tokens!
  saveUser(user: User, tokens: { accessToken: string; refreshToken: string }, remember: boolean) {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('user', JSON.stringify(user));
    storage.setItem('accessToken', tokens.accessToken);
    storage.setItem('refreshToken', tokens.refreshToken);
  },

  getUser(): User | null {
    try {
      // Check both storages (sessionStorage takes priority for "remember=false")
      const raw = sessionStorage.getItem('user') || localStorage.getItem('user');
      if (!raw || raw === '' || raw === 'null') return null;
      return JSON.parse(raw);
    } catch {
      this.clearUser();
      return null;
    }
  },

  async resendVerification(email: string) {
    const res = await fetch(`${API_URL}/auth/send-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Failed to resend');
    }

    return res.json();
  },

  getToken(): string | null {
    return sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
  },

  clearUser() {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
  },
};