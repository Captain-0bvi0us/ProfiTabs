import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, setTokens, getAccessToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const data = await api('/auth/me/');
      setUser(data);
    } catch {
      setUser(null);
      setTokens(null, null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (getAccessToken()) {
      fetchMe();
    } else {
      setLoading(false);
    }
  }, [fetchMe]);

  const login = async (username, password) => {
    const data = await api('/auth/token/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    setTokens(data.access, data.refresh);
    await fetchMe();
  };

  const register = async (username, password, email, displayName) => {
    await api('/auth/register/', {
      method: 'POST',
      body: JSON.stringify({
        username,
        password,
        email,
        display_name: displayName,
      }),
    });
    await login(username, password);
  };

  const logout = () => {
    setTokens(null, null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
