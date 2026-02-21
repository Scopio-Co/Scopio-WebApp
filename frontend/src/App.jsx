import { useState, useEffect } from 'react'
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
import CourseVideoPage from './pages/CourseVideoPage';
import ArticlePage from './pages/ArticlePage';
import ArticleDetailPage from './pages/ArticleDetailPage';

function App() {
  const [count, setCount] = useState(0)
  const [showWelcome, setShowWelcome] = useState(false)
  const [showLearning, setShowLearning] = useState(false)
  const [showExplore, setShowExplore] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [showHome, setShowHome] = useState(true)
  const [showCourseVideo, setShowCourseVideo] = useState(false)
  const [showArticles, setShowArticles] = useState(false)
  const [showArticleDetail, setShowArticleDetail] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    // Check for OAuth callback errors in URL
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const message = urlParams.get('message');
    
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
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleLogout = () => {
    setShowWelcome(false)
    setShowLearning(false)
    setShowExplore(false)
    setShowLeaderboard(false)
    setShowHome(true)
    setShowCourseVideo(false)
    setShowArticles(false)
    setShowArticleDetail(false)
  }

  const handleCourseClick = (course) => {
    setSelectedCourse(course || null)
    setShowCourseVideo(true)
    setShowWelcome(false)
    setShowLearning(false)
    setShowExplore(false)
    setShowLeaderboard(false)
    setShowHome(false)
    setShowArticles(false)
    setShowArticleDetail(false)
  }

  const handleBackFromCourse = () => {
    setShowCourseVideo(false)
    setShowWelcome(true)
  }

  const handleArticleClick = (article) => {
    setSelectedArticle(article)
    setShowArticleDetail(true)
    setShowArticles(false)
    // ensure the main content (and window) scrolls to top when opening an article
    const mainEl = document.querySelector('.main-content');
    if (mainEl) mainEl.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  const handleBackFromArticleDetail = () => {
    setShowArticleDetail(false)
    setShowArticles(true)
    // scroll back to top when returning to the articles list
    const mainEl = document.querySelector('.main-content');
    if (mainEl) mainEl.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  const handleBackFromArticles = () => {
    setShowArticles(false)
    setShowWelcome(true)
  }

  return (
    <div className="app-layout">
      <div className="navbar-section">
        <Navbar 
          onLogout={handleLogout} 
          setShowHome={setShowHome}
          setShowLearning={setShowLearning}
          setShowExplore={setShowExplore}
          setShowLeaderboard={setShowLeaderboard}
          setShowWelcome={setShowWelcome}
          setShowCourseVideo={setShowCourseVideo}
          setShowArticles={setShowArticles}
          setShowArticleDetail={setShowArticleDetail}
          showCourseVideo={showCourseVideo}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
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
        {showArticleDetail ? (
          <ArticleDetailPage article={selectedArticle} onBack={handleBackFromArticleDetail} />
        ) : showArticles ? (
          <ArticlePage onArticleClick={handleArticleClick} />
        ) : showCourseVideo ? (
          <CourseVideoPage selectedCourse={selectedCourse} onBack={handleBackFromCourse} />
        ) : showExplore ? (
          <ExplorePage onLogout={handleLogout} onCourseClick={handleCourseClick} />
        ) : showLearning ? (
          <LearningPage onLogout={handleLogout} onCourseClick={handleCourseClick} />
        ) : showLeaderboard ? (
          <LeaderboardPage onLogout={handleLogout} />
        ) : showWelcome ? (
          <>
            <Welcome />
            <HeroSlider />
            <TopPicks onCourseClick={handleCourseClick} />
            <Footer />
          </>
        ) : showHome ? (
          <>
            <Signup onSwitchToWelcome={() => setShowWelcome(true)} />
            <HeroSlider />
            <TopPicks onCourseClick={handleCourseClick} />
            <Footer />
          </>
        ) : (
          <>
            <Signup onSwitchToWelcome={() => setShowWelcome(true)} />
            <HeroSlider />
            <TopPicks onCourseClick={handleCourseClick} />
            <Footer />
          </>
        )}
      </div>
      <ErrorPopup error={authError} onClose={() => setAuthError(null)} />
    </div>
  )
}

export default App