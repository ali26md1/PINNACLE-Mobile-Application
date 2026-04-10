import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiLogin, apiRegister, apiLogout, setAuthToken, clearAuthToken } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from storage
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('pinnacle_user');
        const token  = await AsyncStorage.getItem('pinnacle_token');
        if (stored && token) {
          setAuthToken(token);
          setUser(JSON.parse(stored));
        }
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  const login = async (email, password) => {
    const result = await apiLogin(email, password);
    if (result.success) {
      const u = result.data;
      const token = u.token; // Use the token from backend
      setAuthToken(token);
      await AsyncStorage.setItem('pinnacle_user',  JSON.stringify(u));
      await AsyncStorage.setItem('pinnacle_token', token);
      setUser(u);
    }
    return result;
  };

  const register = async (name, email, password, role) => {
    const result = await apiRegister(name, email, password, role);
    if (result.success) {
      const u = result.data;
      const token = u.token; // Use the token from backend
      setAuthToken(token);
      await AsyncStorage.setItem('pinnacle_user',  JSON.stringify(u));
      await AsyncStorage.setItem('pinnacle_token', token);
      setUser(u);
    }
    return result;
  };

  const logout = async () => {
    await apiLogout();
    clearAuthToken();
    await AsyncStorage.multiRemove(['pinnacle_user', 'pinnacle_token']);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
