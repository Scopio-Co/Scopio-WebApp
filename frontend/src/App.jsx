import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import reactLogo from './assets/img/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Navbar from './components/Navbar'
import Signup from './components/Signup'
import Login from './components/Login'
import ErrorPopup from './components/ErrorPopup'
import HeroCard from './components/HeroCard'
import HeroSlider from './components/HeroSlider'
import TopPicks from './components/TopPicks'
import Footer from './components/Footer'
import Welcome from './components/Welcome'
import LearningPage from './pages/LearningPage'
import ExplorePage from './pages/ExplorePage'
import LeaderboardPage from './pages/LeaderboardPage';
import SettingsPage from './pages/SettingsPage';
import CourseVideoPage from './pages/CourseVideoPage';
import ArticlePage from './pages/ArticlePage'
import ArticleDetailPage from './pages/ArticleDetailPage'
import SettingsPage from './pages/SettingsPage';
import ProtectedRoute from './components/ProtectedRoute';

// ScrollToTop component for smooth navigation
function ScrollToTop() {
  const location = useLocation();
  
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  return null;
}

// Main App component with authentication wrapper
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

// Helper function to check if user is authenticated (synchronous)
function isUserAuthenticated() {
  try {
    const accessToken = localStorage.getItem('access');
    const refreshToken = localStorage.getItem('refresh');
    
    const isAuthenticated = !!(accessToken && refreshToken);
    
    console.log('🔐 [Auth] isUserAuthenticated check:', { 
      isAuthenticated, 
      hasAccessToken: !!accessToken, 
      hasRefreshToken: !!refreshToken,
      accessTokenLength: accessToken?.length || 0,
      refreshTokenLength: refreshToken?.length || 0
    });
    
    return isAuthenticated;
  } catch (err) {
    console.error('❌ [Auth] Error checking authentication:', err);
    return false;
  }
}

// AppContent component handles authentication and routing
function AppContent() {
  // Initialize auth state synchronously from localStorage to prevent logout on hard refresh
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const result = isUserAuthenticated();
    console.log('📱 [App] Initial mount - isAuthenticated:', result);
    return result;
  });
  
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authError, setAuthError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Verify tokens persist correctly (run on mount and location change)
  useEffect(() => {
    console.log('🔄 [App] Checking auth persistence on mount/route change...');
    const currentAuth = isUserAuthenticated();
    
    if (currentAuth !== isAuthenticated) {
      console.log('⚠️ [App] Auth state mismatch - fixing:', { current: currentAuth, state: isAuthenticated });
      setIsAuthenticated(currentAuth);
    }
  }, [location.pathname, isAuthenticated]);

  // Handle OAuth callbacks
  useEffect(() => {
    // Check for OAuth callback in URL (query params)
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const message = urlParams.get('message');
    const accessToken = urlParams.get('access');
    const refreshToken = urlParams.get('refresh');
    
    // Handle OAuth success - tokens in query params
    if (accessToken && refreshToken) {
      // Store tokens in localStorage only (more reliable)
      localStorage.setItem('access', accessToken);
      localStorage.setItem('refresh', refreshToken);
      
      console.log('✓ OAuth tokens stored successfully in localStorage');
      
      // Update authentication state
      setIsAuthenticated(true);
      
      // Navigate to home page and clean URL
      window.history.replaceState({}, document.title, '/home');
      navigate('/home', { replace: true });
      return;
    }
    
    // Handle OAuth errors
    if (error) {
      if (message) {
        setAuthError(decodeURIComponent(message));
      } else if (error === 'google_auth_failed') {
        setAuthError('Google authentication failed. Please try again.');
      } else if (error === 'auth_error') {
        setAuthError('An authentication error occurred. Please try again.');
      } else {
        setAuthError(`Authentication error: ${error}`);
      }
    }

    // Also check URL hash for backward compatibility
    const hash = window.location.hash.substring(1);
    if (hash) {
      const hashParams = new URLSearchParams(hash);
      const hashAccessToken = hashParams.get('access');
      const hashRefreshToken = hashParams.get('refresh');
      
      if (hashAccessToken && hashRefreshToken) {
        // Store tokens in localStorage
        localStorage.setItem('access', hashAccessToken);
        localStorage.setItem('refresh', hashRefreshToken);
        
        // Update authentication state
        setIsAuthenticated(true);
        
        console.log('✓ OAuth tokens stored successfully (from hash in localStorage)');
        
        // Navigate to home page and clean URL
        window.history.replaceState({}, document.title, '/home');
        navigate('/home', { replace: true });
      }
    }
  }, [navigate]);

  // Callback for successful login/signup
  const handleLoginSuccess = () => {
    console.log('✓ [App] handleLoginSuccess callback triggered');
    
    // Double-check tokens are in localStorage
    const access = localStorage.getItem('access');
    const refresh = localStorage.getItem('refresh');
    
    console.log('✓ [App] Checking tokens in handleLoginSuccess:', {
      hasAccess: !!access,
      hasRefresh: !!refresh,
      accessLength: access?.length || 0,
      refreshLength: refresh?.length || 0
    });
    
    if (!access || !refresh) {
      console.error('❌ [App] Tokens missing from localStorage!');
      window.alert('Error: Authentication tokens not found. Please try logging in again.');
      return;
    }
    
    // Set authenticated state
    console.log('✓ [App] Setting isAuthenticated to true');
    setIsAuthenticated(true);
    
    // Navigate to home
    console.log('✓ [App] Navigating to /home');
    navigate('/home');
  };

  const handleLogout = () => {
    console.log('🚪 [App] Logging out user...');
    // Clear tokens from localStorage
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    
    console.log('🚪 [App] Tokens cleared from localStorage');
    
    // Update authentication state
    setIsAuthenticated(false);
    
    console.log('🚪 [App] isAuthenticated set to false, navigating to home');
    // Navigate to login page
    navigate('/');
  };

  // Home page with signup/login or welcome based on auth
  const HomePage = () => (
    <>
      {isAuthenticated ? <Welcome /> : <Signup onSwitchToWelcome={handleLoginSuccess} />}
      <HeroSlider />
      <TopPicks />
      <Footer />
    </>
  );

  // Show loading screen while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="app-layout" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-primary)' }}>
          <p>Verifying session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <ScrollToTop />
      <div className="navbar-section">
        <Navbar 
          onLogout={handleLogout} 
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          isAuthenticated={isAuthenticated}
        />
      </div>
      <div className="main-content">
        <div className="hamburger-container">
          <button
            className={`hamburger ${mobileOpen ? 'is-active' : ''}`}
            aria-label="Toggle navigation"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span className="hamburger-box">
              <span className="hamburger-inner" />
            </span>
          </button>
        </div>
        <Routes>
          {/* Public route - Login/Signup or Welcome */}
          <Route path="/" element={<HomePage />} />
          
          {/* Protected routes */}
          <Route 
            path="/home" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isCheckingAuth={isCheckingAuth}>
                <>
                  <Welcome />
                  <HeroSlider />
                  <TopPicks />
                  <Footer />
                </>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/learning" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isCheckingAuth={isCheckingAuth}>
                <LearningPage onLogout={handleLogout} />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/explore" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isCheckingAuth={isCheckingAuth}>
                <ExplorePage onLogout={handleLogout} />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/leaderboard" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isCheckingAuth={isCheckingAuth}>
                <LeaderboardPage onLogout={handleLogout} />
              </ProtectedRoute>
            } 
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isCheckingAuth={isCheckingAuth}>
                <SettingsPage onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          
          <Route 
            path="/course/:courseId" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isCheckingAuth={isCheckingAuth}>
                <CourseVideoPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/articles" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isCheckingAuth={isCheckingAuth}>
                <ArticlePage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/articles/:articleId" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isCheckingAuth={isCheckingAuth}>
                <ArticleDetailPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated} isCheckingAuth={isCheckingAuth}>
                <SettingsPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <ErrorPopup error={authError} onClose={() => setAuthError(null)} />
    </div>
  );
}

export default App