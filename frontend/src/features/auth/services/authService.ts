import type { LoginCredentials, RegisterCredentials, User } from '../types/auth.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const authService = {
  async login(credentials: LoginCredentials): Promise<User> {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
  },

  async register(credentials: RegisterCredentials): Promise<User> {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data;
  },

  loginWithGoogle(): void {
    window.location.href = `${API_URL}/auth/google`;
  },

  saveUser(user: User, remember: boolean) {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('user', JSON.stringify(user));
  },

  getUser(): User | null {
    try {
      const raw = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (!raw || raw === 'undefined' || raw === 'null') return null;
      return JSON.parse(raw);
    } catch {
      // Corrupt value — wipe it so it doesn't keep crashing
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      return null;
    }
  },

  clearUser() {
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
  },
};
