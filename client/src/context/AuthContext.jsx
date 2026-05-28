import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { setApiToken } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Keep axios instance in sync whenever access token changes
  useEffect(() => {
    setApiToken(accessToken);
  }, [accessToken]);

  // Try to restore session on mount using refresh token cookie
  useEffect(() => {
    (async () => {
      try {
        const res = await api.post('/auth/refresh');
        const token = res.data.accessToken;
        setApiToken(token); // set immediately so the profile fetch is authenticated
        setAccessToken(token);
        const profile = await api.get('/settings/profile');
        setUser(profile.data);
      } catch {
        // No valid refresh token — stay logged out
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const token = res.data.accessToken;
    setApiToken(token);
    setAccessToken(token);
    setUser(res.data.user);
    return res.data;
  }, []);

  const register = useCallback(async (email, displayName, password) => {
    const res = await api.post('/auth/register', { email, displayName, password });
    const token = res.data.accessToken;
    setApiToken(token);
    setAccessToken(token);
    setUser(res.data.user);
    return res.data;
  }, []);

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch {}
    setApiToken(null);
    setAccessToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((data) => {
    setUser(prev => ({ ...prev, ...data }));
  }, []);

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, register, logout, updateUser, setAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
