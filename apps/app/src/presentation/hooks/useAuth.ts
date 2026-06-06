/**
 * @file useAuth.ts
 * @description Presentation hook — encapsulates login state and auth actions.
 */

import { useState, useCallback } from 'react';
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

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    token: null,
    session: null,
    isLoading: false,
    error: null,
  });

  /** Persist token + session to AsyncStorage and update local state. */
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

  /** Attempt login — stores JWT + session on success. */
  const login = useCallback(async (credentials: LoginRequest) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await loginUser(credentials);
      await persistSession(response);
    } catch (err: any) {
      const message: string =
        err?.response?.data?.message ?? err?.message ?? 'Login failed.';
      setState(prev => ({ ...prev, error: message, isLoading: false }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [persistSession]);

  /** Restore session from AsyncStorage on app boot. */
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

  /** Clear session from storage and memory. */
  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(SESSION_KEY);
    setState({ token: null, session: null, isLoading: false, error: null });
  }, []);

  return {
    ...state,
    isAuthenticated: !!state.token,
    login,
    logout,
    restoreSession,
  };
}
