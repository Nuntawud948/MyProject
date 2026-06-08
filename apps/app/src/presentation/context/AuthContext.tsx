import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser } from '../../data/apis/auth.api';
import type { LoginRequest } from '../../data/dtos/auth/login.request';
import type { LoginResponse } from '../../data/dtos/auth/login.response';

const TOKEN_KEY = '@attendance:token';
const SESSION_KEY = '@attendance:session';

interface AuthState {
  token: string | null;
  session: LoginResponse | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: null,
    session: null,
    isLoading: false,
    error: null,
  });

  const persistSession = useCallback(async (response: LoginResponse) => {
    await AsyncStorage.setItem(TOKEN_KEY, response.token);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(response));
    setState(prev => ({
      ...prev,
      token: response.token,
      session: response,
      error: null,
    }));
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await loginUser(credentials);
      await persistSession(response);
    } catch (err: any) {
      const message: string =
        err?.response?.data?.message ?? err?.message ?? 'Login failed.';
      setState(prev => ({ ...prev, error: message, isLoading: false }));
      throw err;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [persistSession]);

  const restoreSession = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const raw = await AsyncStorage.getItem(SESSION_KEY);
      if (raw) {
        const session: LoginResponse = JSON.parse(raw);
        setState({ token: session.token, session, isLoading: false, error: null });
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(SESSION_KEY);
    setState({ token: null, session: null, isLoading: false, error: null });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        isAuthenticated: !!state.token,
        login,
        logout,
        restoreSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
