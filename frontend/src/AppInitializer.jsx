import { useEffect } from 'react';
import { fetchCsrfToken } from './api';

export default function AppInitializer({ children }) {
  useEffect(() => {
    fetchCsrfToken().catch((error) => {
      // Keep app usable even if CSRF prefetch fails; per-request handlers still run.
      console.warn('Proceeding without initial CSRF prefetch:', error);
    });
  }, []);

  return children;
}
