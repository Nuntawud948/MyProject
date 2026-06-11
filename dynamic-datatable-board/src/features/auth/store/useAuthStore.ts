import { create } from 'zustand';

interface User {
  username: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  user: localStorage.getItem('username')
    ? {
        username: localStorage.getItem('username') || '',
        role: localStorage.getItem('role') || '',
      }
    : null,
  login: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', user.username);
    localStorage.setItem('role', user.role);
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    set({ token: null, user: null });
  },
}));
