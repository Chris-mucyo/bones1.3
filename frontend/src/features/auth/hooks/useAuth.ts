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

 // login() — authService.login() returns { user, accessToken, refreshToken }
async function login(credentials: LoginCredentials) {
  setState(s => ({ ...s, loading: true, error: null }));
  try {
    const { user, accessToken, refreshToken } = await authService.login(credentials);
    authService.saveUser(user, { accessToken, refreshToken }, credentials.rememberMe ?? false);
    setState({ user, loading: false, error: null });
    return user;
  } catch (err: any) {
    setState(s => ({ ...s, loading: false, error: err.message }));
    throw err;
  }
}

// register() — authService.register() returns only User, no tokens
async function register(credentials: RegisterCredentials) {
  setState(s => ({ ...s, loading: true, error: null }));
  try {
    const user = await authService.register(credentials);
    // No tokens returned from register, so don't call saveUser here.
    // Just update state; user will log in after email verification.
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
