import { useEffect, useState } from 'react';
import { fetchCsrfToken } from './api';

function FullscreenLoader() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#f7f8fa',
        color: '#111827',
        fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: 36,
            height: 36,
            border: '3px solid #d1d5db',
            borderTopColor: '#111827',
            borderRadius: '50%',
            margin: '0 auto 12px',
            animation: 'scopio-spin 0.9s linear infinite',
          }}
        />
        <div style={{ fontSize: 14, opacity: 0.85 }}>Preparing secure session...</div>
      </div>
      <style>{`@keyframes scopio-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function AppInitializer({ children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        await fetchCsrfToken();
      } catch (error) {
        // Keep app usable even if CSRF prefetch fails; per-request handlers still run.
        console.warn('Proceeding without initial CSRF prefetch:', error);
      } finally {
        if (mounted) {
          setReady(true);
        }
      }
    }

    initialize();

    return () => {
      mounted = false;
    };
  }, []);

  if (!ready) {
    return <FullscreenLoader />;
  }

  return children;
}
