const BASE = '/api';

let accessToken = localStorage.getItem('access_token');
let refreshToken = localStorage.getItem('refresh_token');

export function setTokens(access, refresh) {
  accessToken = access;
  refreshToken = refresh;
  if (access) {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  } else {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
}

export function getAccessToken() {
  return accessToken;
}

async function refreshAccessToken() {
  if (!refreshToken) throw new Error('No refresh token');
  const res = await fetch(`${BASE}/auth/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: refreshToken }),
  });
  if (!res.ok) throw new Error('Refresh failed');
  const data = await res.json();
  setTokens(data.access, refreshToken);
  return data.access;
}

export async function api(path, options = {}) {
  const url = `${BASE}${path}`;
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  let res = await fetch(url, { ...options, headers });

  if (res.status === 401 && refreshToken) {
    try {
      const newToken = await refreshAccessToken();
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(url, { ...options, headers });
    } catch {
      setTokens(null, null);
      window.location.href = '/login';
      throw new Error('Session expired');
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const error = new Error(err.detail || JSON.stringify(err) || res.statusText);
    error.status = res.status;
    error.data = err;
    throw error;
  }

  if (res.status === 204) return null;
  return res.json();
}
