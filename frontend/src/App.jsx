import { useState, useEffect, useRef } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom'
import reactLogo from './assets/img/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Navbar from './components/Navbar'
import Signup from './components/Signup'
import Login from './components/Login'
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
import ProtectedRoute from './components/ProtectedRoute';
import api from './api';

// Pull-to-refresh on mobile: swipe down when at top to reload the page
function PullToRefresh() {
  const [display, setDisplay] = useState({ distance: 0, refreshing: false });
  const touchStartY = useRef(0);
  const currentPull = useRef(0);
  const THRESHOLD = 70;

  useEffect(() => {
    const getScrollTop = () => {
      const mainEl = document.querySelector('.main-content');
      return mainEl ? mainEl.scrollTop : window.scrollY;
    };

    const handleTouchStart = (e) => {
      if (getScrollTop() === 0) {
        touchStartY.current = e.touches[0].clientY;
      } else {
        touchStartY.current = 0;
      }
    };

    const handleTouchMove = (e) => {
      if (!touchStartY.current) return;
      const distance = e.touches[0].clientY - touchStartY.current;
      if (distance > 0 && getScrollTop() === 0) {
        currentPull.current = Math.min(distance * 0.5, THRESHOLD + 24);
        setDisplay(d => ({ ...d, distance: currentPull.current }));
      }
    };

    const handleTouchEnd = () => {
      if (currentPull.current >= THRESHOLD) {
        setDisplay({ distance: currentPull.current, refreshing: true });
        setTimeout(() => window.location.reload(), 400);
      } else {
        currentPull.current = 0;
        setDisplay({ distance: 0, refreshing: false });
      }
      touchStartY.current = 0;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  if (display.distance === 0 && !display.refreshing) return null;

  const progress = Math.min(display.distance / THRESHOLD, 1);
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      zIndex: 99999, display: 'flex', alignItems: 'center',
      justifyContent: 'center', height: `${display.distance}px`,
      background: 'var(--bg-primary, #fff)',
      borderBottom: '1px solid var(--border-primary, rgba(0,0,0,0.1))',
    }}>
      <svg width="24" height="24" viewBox="0 0 24 24" style={{
        transform: display.refreshing ? 'none' : `rotate(${progress * 270}deg)`,
        animation: display.refreshing ? 'ptr-spin 0.6s linear infinite' : 'none',
        opacity: progress,
        color: 'var(--text-tertiary, #888)',
      }}>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" fill="none"
          strokeLinecap="round" strokeDasharray="40 20" />
      </svg>
      <style>{`@keyframes ptr-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

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
  
  // Initialize welcome state from localStorage (cached like auth)
  const [welcomeData, setWelcomeData] = useState(() => {
    try {
      const cached = localStorage.getItem('welcomeData');
      if (cached) {
        const data = JSON.parse(cached);
        console.log('📱 [App] Loaded cached welcome data from localStorage');
        return data;
      }
    } catch (e) {
      console.error('❌ Error loading cached welcome data:', e);
    }
    return {
      isFirstVisit: null,
      isLoading: true,
      displayName: 'User',
      stats: {
        learningHours: 0,
        streakDays: 0,
        progress: 0,
        achievements: 0
      },
      userRank: { rank: 0, totalUsers: 0 },
      fetchedAt: null
    };
  });
  
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authError, setAuthError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Validate tokens with backend on mount
  useEffect(() => {
    const validateTokens = async () => {
      console.log('🔐 [App] Validating tokens with backend on mount...');
      setIsCheckingAuth(true);
      
      if (isAuthenticated) {
        try {
          // Try a simple authenticated request to validate tokens
          const response = await api.get('/api/auth/status/', { 
            skipAuth: false,
            _retry: false // Prevent automatic retry on first check
          });
          console.log('✓ [App] Tokens validated with backend:', response.data);
          setIsCheckingAuth(false);
        } catch (error) {
          console.error('❌ [App] Token validation failed:', error.response?.status, error.message);
          
          // If we get a 401/403, tokens are invalid - log out and redirect
          if (error.response?.status === 401 || error.response?.status === 403) {
            console.log('🚪 [App] Invalid or expired tokens detected - logging out');
            localStorage.removeItem('access');
            localStorage.removeItem('refresh');
            localStorage.removeItem('welcomeData');
            setIsAuthenticated(false);
            setWelcomeData(prev => ({ ...prev, isFirstVisit: null, isLoading: false }));
            setAuthError('Session expired. Please log in again.');
            navigate('/', { replace: true });
          }
          setIsCheckingAuth(false);
        }
      } else {
        console.log('⏭️ [App] Not authenticated, skipping token validation');
        setIsCheckingAuth(false);
      }
    };

    validateTokens();
  }, []);

  // Set up global 401 error handler for when tokens become invalid during session
  useEffect(() => {
    const handleUnauthorized = (event) => {
      console.log('🚨 [App] Global 401 error detected - logging out user');
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      localStorage.removeItem('welcomeData');
      setIsAuthenticated(false);
      setWelcomeData(prev => ({ ...prev, isFirstVisit: null, isLoading: false }));
      setAuthError('Your session has expired. Please log in again.');
      navigate('/', { replace: true });
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [navigate]);

  // Auto-clear auth error after 10 seconds
  useEffect(() => {
    if (authError) {
      const timer = setTimeout(() => {
        setAuthError(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [authError]);

  // Verify tokens persist correctly (run on location change)
  useEffect(() => {
    console.log('🔄 [App] Checking auth persistence on route change...');
    const currentAuth = isUserAuthenticated();
    
    if (currentAuth !== isAuthenticated) {
      console.log('⚠️ [App] Auth state mismatch - fixing:', { current: currentAuth, state: isAuthenticated });
      setIsAuthenticated(currentAuth);
    }
  }, [location.pathname, isAuthenticated]);

  // Fetch and cache welcome data once when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      // Clear welcome data on logout
      setWelcomeData(prev => ({ ...prev, isFirstVisit: null, isLoading: false }));
      return;
    }

    // Only fetch if not already cached with recent data
    if (welcomeData.fetchedAt && Date.now() - welcomeData.fetchedAt < 5 * 60 * 1000) {
      // Cache is fresh (less than 5 minutes old)
      setWelcomeData(prev => ({ ...prev, isLoading: false }));
      return;
    }

    const fetchWelcomeData = async () => {
      console.log('📥 [App] Fetching welcome data...');
      setWelcomeData(prev => ({ ...prev, isLoading: true }));
      try {
        const [statsResponse, profileResponse] = await Promise.all([
          api.get('/api/video/user-stats/'),
          api.get('/api/auth/profile/')
        ]);

        const fullName = (profileResponse?.data?.full_name || '').trim();
        const username = (profileResponse?.data?.username || '').trim();
        const firstName = fullName ? fullName.split(/\s+/)[0] : '';
        const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');
        const displayName = capitalize(firstName) || capitalize(username) || 'User';

        const isFirstVisit = statsResponse.data.is_first_visit === true;
        
        const newWelcomeData = {
          isFirstVisit,
          isLoading: false,
          displayName,
          stats: {
            learningHours: statsResponse.data.learning_hours || 0,
            streakDays: statsResponse.data.streak_days || 0,
            progress: statsResponse.data.progress || 0,
            achievements: statsResponse.data.achievements || 0
          },
          userRank: { rank: 3, totalUsers: 250 }, // TODO: Replace with actual API call
          fetchedAt: Date.now()
        };

        console.log('✓ [App] Welcome data cached:', newWelcomeData);
        setWelcomeData(newWelcomeData);

        // Save to localStorage for persistence across page reloads
        try {
          localStorage.setItem('welcomeData', JSON.stringify(newWelcomeData));
          console.log('✓ [App] Welcome data saved to localStorage');
        } catch (e) {
          console.error('❌ Error saving welcome data to localStorage:', e);
        }

        // Mark welcome as seen if it's first visit
        if (isFirstVisit) {
          try {
            await api.post('/api/video/mark-welcome-seen/');
            console.log('✓ [App] Welcome marked as seen');
          } catch (error) {
            console.error('❌ Failed to mark welcome as seen:', error);
          }
        }
      } catch (error) {
        console.error('❌ Failed to fetch welcome data:', error);
        setWelcomeData(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchWelcomeData();
  }, [isAuthenticated]);

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
    
    // Clear any previous auth errors
    setAuthError(null);
    
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

  const handleLogoClick = (e) => {
    e.preventDefault();
    const path = location.pathname;
    const mainEl = document.querySelector('.main-content');
    if (path === '/home' || path === '/') {
      // If already on welcome/home, smoothly scroll to top
      if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'smooth' });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // From other pages, go to home without adding history entry
      navigate('/home', { replace: true });
      // ensure top upon navigation (ScrollToTop component will handle, but reset main-content if present)
      if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'auto' });
    }
    setMobileOpen(false);
  };

  // Home page with signup/login or welcome based on auth
  const HomePage = () => (
    <>
      {isAuthenticated ? <Welcome welcomeData={welcomeData} /> : <Signup onSwitchToWelcome={handleLoginSuccess} />}
      <HeroSlider />
      <TopPicks />
      <Footer />
    </>
  );

  return (
    <div className="app-layout">
      <ScrollToTop />
      <PullToRefresh />
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
          <button type="button" className="hamburger-logo-text" onClick={handleLogoClick}>Scopio</button>
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
                  <Welcome welcomeData={welcomeData} />
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
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App