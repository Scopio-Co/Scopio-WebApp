import { useState, useEffect, useCallback, useRef } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import Signup from './components/Signup'
import Login from './components/Login'
import HeroCard from './components/HeroCard'
import HeroSlider from './components/HeroSlider'
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
import { ACCESS_TOKEN, REFRESH_TOKEN } from './constants';
import {
  clearAuthCache,
  getCachedLeaderboard,
  getCachedProfile,
  getCachedStats,
  getActiveUserId,
  getUserIdFromAccessToken,
  getUserScopedJson,
  handleUserSwitch,
  setCachedLeaderboard,
  setCachedProfile,
  setCachedStats,
  setUserScopedJson,
} from './authCache';

const DEFAULT_WELCOME_DATA = {
  isFirstVisit: null,
  isLoading: true,
  displayName: 'User',
  profileImageUrl: '',
  stats: {
    learningHours: 0,
    streakDays: 0,
    progress: 0,
    achievements: 0
  },
  userRank: { rank: 0, totalUsers: 0 },
  fetchedAt: null
};

// ScrollToTop component for smooth navigation
function ScrollToTop() {
  const location = useLocation();
  // Disable browser automatic scroll restoration so back/forward won't restore positions
  useEffect(() => {
    try {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
    } catch (e) {
      // ignore if not supported or blocked
    }

    return () => {
      try {
        if ('scrollRestoration' in window.history) {
          window.history.scrollRestoration = 'auto';
        }
      } catch (e) {}
    };
  }, []);

  useEffect(() => {
    // Scroll the top-level window and the app's main content container (if present)
    try {
      window.scrollTo({ top: 0, behavior: 'auto' });
    } catch (e) {}

    const mainEl = document.querySelector('.main-content');
    if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  return null;
}

// Pull-to-refresh on mobile: swipe down when at top to reload the page
function PullToRefresh() {
  const [display, setDisplay] = useState({ distance: 0, refreshing: false });
  const touchStartY = useRef(0);
  const currentPull = useRef(0);
  const THRESHOLD = 70;

  useEffect(() => {
    const isMobile = () => window.matchMedia('(max-width: 425px)').matches;

    const getScrollTop = () => {
      const mainEl = document.querySelector('.main-content');
      return mainEl ? mainEl.scrollTop : window.scrollY;
    };

    const handleTouchStart = (e) => {
      if (!isMobile()) {
        touchStartY.current = 0;
        return;
      }

      if (getScrollTop() === 0) {
        touchStartY.current = e.touches[0].clientY;
      } else {
        touchStartY.current = 0;
      }
    };

    const handleTouchMove = (e) => {
      if (!isMobile() || !touchStartY.current) return;
      const distance = e.touches[0].clientY - touchStartY.current;
      if (distance > 0 && getScrollTop() === 0) {
        currentPull.current = Math.min(distance * 0.5, THRESHOLD + 24);
        setDisplay((d) => ({ ...d, distance: currentPull.current }));
      }
    };

    const handleTouchEnd = () => {
      if (!isMobile()) {
        touchStartY.current = 0;
        currentPull.current = 0;
        setDisplay({ distance: 0, refreshing: false });
        return;
      }

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
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: `${display.distance}px`,
        background: 'var(--bg-primary, #fff)',
        borderBottom: '1px solid var(--border-primary, rgba(0,0,0,0.1))',
      }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        style={{
          transform: display.refreshing ? 'none' : `rotate(${progress * 270}deg)`,
          animation: display.refreshing ? 'ptr-spin 0.6s linear infinite' : 'none',
          opacity: progress,
          color: 'var(--text-tertiary, #888)',
        }}
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="40 20"
        />
      </svg>
      <style>{`@keyframes ptr-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
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
    const accessToken = localStorage.getItem(ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN);
    
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
  
  const [activeUserId, setActiveUserId] = useState(() => {
    return getActiveUserId() || getUserIdFromAccessToken();
  });

  // Initialize welcome state from user-scoped cache only.
  const [welcomeData, setWelcomeData] = useState(() => ({ ...DEFAULT_WELCOME_DATA }));
  
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authError, setAuthError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const resetWelcomeState = useCallback((isLoading = false) => {
    setWelcomeData({
      ...DEFAULT_WELCOME_DATA,
      isLoading,
    });
  }, []);

  const applyResolvedUserId = useCallback((candidateUserId) => {
    const resolvedUserId = String(candidateUserId || '').trim();
    if (!resolvedUserId) {
      setActiveUserId(null);
      return null;
    }

    const activeId = handleUserSwitch(resolvedUserId);
    setActiveUserId(activeId);
    return activeId;
  }, []);

  const performClientLogout = useCallback(async ({
    redirect = true,
    authMessage = null,
    invalidateServerCookies = false,
  } = {}) => {
    if (invalidateServerCookies) {
      try {
        await api.post('/auth/logout/', {}, { skipAuth: true });
      } catch (error) {
        console.warn('⚠️ [App] Backend logout cookie invalidation failed:', error?.message || error);
      }
    }

    clearAuthCache();
    setIsAuthenticated(false);
    setActiveUserId(null);
    resetWelcomeState(false);

    if (authMessage) {
      setAuthError(authMessage);
    }

    if (redirect) {
      navigate('/', { replace: true });
    }
  }, [navigate, resetWelcomeState]);

  // Validate tokens with backend on mount
  useEffect(() => {
    const validateTokens = async () => {
      console.log('🔐 [App] Validating tokens with backend on mount...');
      setIsCheckingAuth(true);
      
      if (isAuthenticated) {
        try {
          // Try a simple authenticated request to validate tokens
          const response = await api.get('/auth/status/', { 
            skipAuth: false,
            _retry: false // Prevent automatic retry on first check
          });
          console.log('✓ [App] Tokens validated with backend:', response.data);

          const backendUserId = response?.data?.user?.id;
          const tokenUserId = getUserIdFromAccessToken();
          applyResolvedUserId(backendUserId || tokenUserId);
          setIsCheckingAuth(false);
        } catch (error) {
          console.error('❌ [App] Token validation failed:', error.response?.status, error.message);
          
          // If we get a 401/403, tokens are invalid - log out and redirect
          if (error.response?.status === 401 || error.response?.status === 403) {
            console.log('🚪 [App] Invalid or expired tokens detected - logging out');
            await performClientLogout({
              authMessage: 'Session expired. Please log in again.',
              invalidateServerCookies: true,
            });
          }
          setIsCheckingAuth(false);
        }
      } else {
        console.log('⏭️ [App] Not authenticated, skipping token validation');
        setIsCheckingAuth(false);
      }
    };

    validateTokens();
  }, [isAuthenticated, applyResolvedUserId, performClientLogout]);

  // Set up global 401 error handler for when tokens become invalid during session
  useEffect(() => {
    const handleUnauthorized = async () => {
      console.log('🚨 [App] Global 401 error detected - logging out user');
      await performClientLogout({
        authMessage: 'Your session has expired. Please log in again.',
        invalidateServerCookies: true,
      });
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [performClientLogout]);

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
    if (isCheckingAuth) {
      resetWelcomeState(true);
      return;
    }

    if (!isAuthenticated) {
      // Clear welcome data on logout
      resetWelcomeState(false);
      return;
    }

    if (!activeUserId) {
      resetWelcomeState(true);
      return;
    }

    const cachedProfile = getCachedProfile(activeUserId);
    const cachedStats = getCachedStats(activeUserId);
    const cachedLeaderboard = getCachedLeaderboard(activeUserId);
    const cachedWelcomeData = getUserScopedJson('welcomeData', activeUserId);
    if (cachedProfile && cachedStats && cachedLeaderboard && cachedWelcomeData) {
      setWelcomeData({
        ...DEFAULT_WELCOME_DATA,
        ...cachedWelcomeData,
        isLoading: false,
      });
    } else {
      resetWelcomeState(true);
    }

    const fetchWelcomeData = async () => {
      console.log('📥 [App] Fetching welcome data...');
      setWelcomeData((prev) => ({ ...prev, isLoading: true }));
      try {
        const [statsResult, profileResult, leaderboardResult] = await Promise.allSettled([
          api.get('/video/user-stats/'),
          api.get('/auth/profile/'),
          api.get('/video/leaderboard/')
        ]);

        const statsData = statsResult.status === 'fulfilled' ? (statsResult.value?.data || {}) : {};
        const profileData = profileResult.status === 'fulfilled' ? (profileResult.value?.data || {}) : {};
        const leaderboardData = leaderboardResult.status === 'fulfilled' ? (leaderboardResult.value?.data || {}) : {};

        const fullName = (profileData.full_name || '').trim();
        const username = (profileData.username || '').trim();
        const firstName = fullName ? fullName.split(/\s+/)[0] : '';
        const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');
        const displayName = capitalize(firstName) || capitalize(username) || 'User';

        const isFirstVisit = statsData.is_first_visit === true;
        const leaderboardRows = Array.isArray(leaderboardData.results) ? leaderboardData.results : [];
        const leaderboardCount = Number(leaderboardData.count) || leaderboardRows.length || 0;
        const currentUserRow = leaderboardRows.find((row) => {
          const rowUsername = (row?.username || '').toLowerCase();
          return rowUsername && rowUsername === username.toLowerCase();
        });

        const userRank = {
          rank: Number(currentUserRow?.rank) || 0,
          totalUsers: leaderboardCount
        };
        
        const newWelcomeData = {
          isFirstVisit,
          isLoading: false,
          displayName,
          profileImageUrl: profileData.profile_image_url || '',
          stats: {
            learningHours: statsData.learning_hours || 0,
            streakDays: statsData.streak_days || 0,
            progress: statsData.progress || 0,
            achievements: statsData.achievements || 0
          },
          userRank,
          fetchedAt: Date.now()
        };

        console.log('✓ [App] Welcome data cached:', newWelcomeData);
        setWelcomeData(newWelcomeData);

        // Save user-scoped caches so data can never leak across accounts.
        setCachedStats(activeUserId, statsData);
        setCachedProfile(activeUserId, profileData);
        setCachedLeaderboard(activeUserId, leaderboardData);
        setUserScopedJson('welcomeData', activeUserId, newWelcomeData);
        setUserScopedJson('courseProgress', activeUserId, {
          progress: statsData.progress || 0,
          fetchedAt: newWelcomeData.fetchedAt,
        });

        // Mark welcome as seen if it's first visit
        if (isFirstVisit) {
          try {
            await api.post('/video/mark-welcome-seen/');
            console.log('✓ [App] Welcome marked as seen');
          } catch (error) {
            console.error('❌ Failed to mark welcome as seen:', error);
          }
        }
      } catch (error) {
        console.error('❌ Failed to fetch welcome data:', error);
        setWelcomeData((prev) => ({ ...prev, isLoading: false }));
      }
    };

    fetchWelcomeData();
  }, [isAuthenticated, activeUserId, isCheckingAuth, resetWelcomeState]);

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
      clearAuthCache();

      // Store tokens in localStorage only (more reliable)
      localStorage.setItem(ACCESS_TOKEN, accessToken);
      localStorage.setItem(REFRESH_TOKEN, refreshToken);

      const oauthUserId = getUserIdFromAccessToken();
      applyResolvedUserId(oauthUserId);
      resetWelcomeState(true);
      
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
        clearAuthCache();

        // Store tokens in localStorage
        localStorage.setItem(ACCESS_TOKEN, hashAccessToken);
        localStorage.setItem(REFRESH_TOKEN, hashRefreshToken);

        const oauthUserId = getUserIdFromAccessToken();
        applyResolvedUserId(oauthUserId);
        resetWelcomeState(true);
        
        // Update authentication state
        setIsAuthenticated(true);
        
        console.log('✓ OAuth tokens stored successfully (from hash in localStorage)');
        
        // Navigate to home page and clean URL
        window.history.replaceState({}, document.title, '/home');
        navigate('/home', { replace: true });
      }
    }
  }, [navigate, applyResolvedUserId, resetWelcomeState]);

  // Callback for successful login/signup
  const handleLoginSuccess = () => {
    console.log('✓ [App] handleLoginSuccess callback triggered');
    
    // Double-check tokens are in localStorage
    const access = localStorage.getItem(ACCESS_TOKEN);
    const refresh = localStorage.getItem(REFRESH_TOKEN);
    
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

    const tokenUserId = getUserIdFromAccessToken();
    const previousUserId = getActiveUserId();
    if (previousUserId && tokenUserId && previousUserId !== tokenUserId) {
      // Immediate full auth cache reset on account switch prevents stale UI from flashing.
      clearAuthCache();
      localStorage.setItem(ACCESS_TOKEN, access);
      localStorage.setItem(REFRESH_TOKEN, refresh);
    }

    applyResolvedUserId(tokenUserId);
    resetWelcomeState(true);
    
    // Set authenticated state
    console.log('✓ [App] Setting isAuthenticated to true');
    setIsAuthenticated(true);
    
    // Navigate to home
    console.log('✓ [App] Navigating to /home');
    navigate('/home');
  };

  const handleLogout = async () => {
    console.log('🚪 [App] Logging out user...');
    await performClientLogout({ invalidateServerCookies: true });
    console.log('🚪 [App] User logged out and cache cleared');
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
      {isCheckingAuth ? null : (isAuthenticated ? <Welcome welcomeData={welcomeData} /> : <Signup onSwitchToWelcome={handleLoginSuccess} />)}
      <HeroSlider />
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