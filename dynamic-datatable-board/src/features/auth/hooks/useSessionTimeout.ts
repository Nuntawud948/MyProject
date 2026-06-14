import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

/**
 * Custom hook to monitor user inactivity and automatically log them out.
 * 
 * It listens to standard user interaction events (mousemove, keydown, click, scroll)
 * and resets a timer. If the timer reaches 15 minutes (900,000 ms), the user is
 * logged out via the auth store and redirected to the login page.
 */
export function useSessionTimeout() {
  const timeoutId = useRef<number | null>(null);
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = useAuthStore((state) => !!state.token);

  const TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

  // Memoized callback to reset the inactivity timer
  const resetTimer = useCallback(() => {
    if (timeoutId.current) {
      window.clearTimeout(timeoutId.current);
    }
    
    // Set a new timeout that will log the user out if reached
    timeoutId.current = window.setTimeout(() => {
      logout();
      navigate('/login', { replace: true });
    }, TIMEOUT_MS);
  }, [logout, navigate, TIMEOUT_MS]);

  useEffect(() => {
    // Only set up listeners if the user is authenticated
    if (!isAuthenticated) return;

    // Initialize the timer
    resetTimer();

    // The events that indicate user activity
    const events = ['mousemove', 'keydown', 'scroll', 'click'];
    
    // Attach passive listeners for better performance
    events.forEach(event => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    // Cleanup: Remove listeners and clear timeout when component unmounts
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
      if (timeoutId.current) {
        window.clearTimeout(timeoutId.current);
      }
    };
  }, [isAuthenticated, resetTimer]);
}
