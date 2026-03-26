const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getToken(): string | null {
  return localStorage.getItem('accessToken');
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    ...(options.body && !(options.body instanceof FormData)
      ? { 'Content-Type': 'application/json' }
      : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> ?? {}),
  };

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    // Token expired — try refresh
    const refreshed = await tryRefresh();
    if (refreshed) {
      return request<T>(endpoint, options);
    }
    localStorage.clear();
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.errors?.[0] ?? data.message ?? 'Request failed');
  }

  return data;
}

async function tryRefresh(): Promise<boolean> {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;

    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return false;

    const { data } = await res.json();
    localStorage.setItem('accessToken',  data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

export const api = {
  get:    <T>(url: string)                         => request<T>(url, { method: 'GET' }),
  post:   <T>(url: string, body?: unknown)         => request<T>(url, { method: 'POST',  body: JSON.stringify(body) }),
  put:    <T>(url: string, body?: unknown)         => request<T>(url, { method: 'PUT',   body: JSON.stringify(body) }),
  patch:  <T>(url: string, body?: unknown)         => request<T>(url, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(url: string)                         => request<T>(url, { method: 'DELETE' }),
  upload: <T>(url: string, formData: FormData)     => request<T>(url, { method: 'POST',  body: formData }),
  uploadPut: <T>(url: string, formData: FormData)  => request<T>(url, { method: 'PUT',   body: formData }),
};
