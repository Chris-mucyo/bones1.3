import { useState, useEffect } from 'react';
import type { AuthState, LoginCredentials, RegisterCredentials } from '../types/auth.types';
import { authService } from '../services/authService';

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const user = authService.getUser();
    setState({ user, loading: false, error: null });
  }, []);

  async function login(credentials: LoginCredentials) {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const user = await authService.login(credentials);
      authService.saveUser(user, credentials.rememberMe);
      setState({ user, loading: false, error: null });
      return user;
    } catch (err: any) {
      setState(s => ({ ...s, loading: false, error: err.message }));
      throw err;
    }
  }

  async function register(credentials: RegisterCredentials) {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const user = await authService.register(credentials);
      authService.saveUser(user, false);
      setState({ user, loading: false, error: null });
      return user;
    } catch (err: any) {
      setState(s => ({ ...s, loading: false, error: err.message }));
      throw err;
    }
  }

  function logout() {
    authService.clearUser();
    setState({ user: null, loading: false, error: null });
  }

  return { ...state, login, register, logout };
}
