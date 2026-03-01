import { useState, useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import AuthWarningModal from './AuthWarningModal';

const ProtectedRoute = ({ children, isAuthenticated, isCheckingAuth }) => {
  const [showModal, setShowModal] = useState(false);
  const [hasShownModal, setHasShownModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Show loading while checking authentication
  if (isCheckingAuth) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-primary)' }}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Handle unauthenticated access
  useEffect(() => {
    console.log('🔐 [ProtectedRoute] State Check:', {
      isAuthenticated,
      isCheckingAuth,
      hasShownModal,
      shouldShowModal: !isAuthenticated && !isCheckingAuth && !hasShownModal
    });
    
    if (!isAuthenticated && !isCheckingAuth && !hasShownModal) {
      console.log('⚠️ [ProtectedRoute] User not authenticated, will show modal');
      // Small delay to ensure component is mounted
      const timer = setTimeout(() => {
        console.log('⚠️ [ProtectedRoute] Showing authentication modal');
        setShowModal(true);
        setHasShownModal(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isCheckingAuth, hasShownModal, location.pathname]);

  const handleModalClose = () => {
    setShowModal(false);
    // Redirect after animation completes
    setTimeout(() => {
      navigate('/', { replace: true });
    }, 300);
  };

  const handleLogin = () => {
    setShowModal(false);
    navigate('/', { replace: true });
  };

  // If authenticated, render children
  if (isAuthenticated) {
    return children;
  }

  // If not authenticated and modal hasn't been shown yet, don't render anything
  if (!hasShownModal) {
    return null;
  }

  // Show modal with blurred content
  return (
    <>
      <AuthWarningModal 
        isOpen={showModal} 
        onClose={handleModalClose}
        onLogin={handleLogin}
      />
      <div style={{ 
        filter: showModal ? 'blur(8px)' : 'none', 
        pointerEvents: 'none',
        transition: 'filter 0.3s ease'
      }}>
        {children}
      </div>
    </>
  );
};

export default ProtectedRoute;
