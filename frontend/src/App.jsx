import { useState } from 'react'
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
import react from "react" 
function App() {
  const [count, setCount] = useState(0)
  const [showWelcome, setShowWelcome] = useState(false)
  const [showLearning, setShowLearning] = useState(false)
  const [showExplore, setShowExplore] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [showHome, setShowHome] = useState(true)

  const handleLogout = () => {
    // Clear tokens from localStorage
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    
    setShowWelcome(false)
    setShowLearning(false)
    setShowExplore(false)
    setShowLeaderboard(false)
    setShowHome(true)
  }

  const handleLoginSuccess = () => {
    setShowHome(false)
    setShowWelcome(true)
  }

  react.useEffect(() => {
    const hash = window.location.hash || '';
    if (hash.startsWith('#')) {
      const params = new URLSearchParams(hash.slice(1));
      const access = params.get('access');
      const refresh = params.get('refresh');
      if (access && refresh) {
        localStorage.setItem('access', access);
        localStorage.setItem('refresh', refresh);
        window.history.replaceState(null, '', window.location.pathname);
        handleLoginSuccess();
      }
    }
  }, []);

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
        />
      </div>
      <div className="main-content">
        {showExplore ? (
          <ExplorePage onLogout={handleLogout} />
        ) : showLearning ? (
          <LearningPage onLogout={handleLogout} />
        ) : showLeaderboard ? (
          <LeaderboardPage onLogout={handleLogout} />
        ) : showWelcome ? (
          <>
            <Welcome />
            <HeroSlider />
            <TopPicks />
            <Footer />
          </>
        ) : showHome ? (
          <>
            <Signup onSwitchToWelcome={handleLoginSuccess} />
            <HeroSlider />
            <TopPicks />
            <Footer />
          </>
        ) : (
          <>
            <Signup onSwitchToWelcome={handleLoginSuccess} />
            <HeroSlider />
            <TopPicks />
            <Footer />
          </>
        )}
      </div>
    </div>
  )
}

export default App