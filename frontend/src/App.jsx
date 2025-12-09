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

function App() {
  const [count, setCount] = useState(0)
  const [showWelcome, setShowWelcome] = useState(false)
  const [showLearning, setShowLearning] = useState(false)
  const [showExplore, setShowExplore] = useState(false)
  const [showHome, setShowHome] = useState(true)

  const handleLogout = () => {
    setShowWelcome(false)
    setShowLearning(false)
    setShowExplore(false)
    setShowHome(true)
  }

  return (
    <div className="app-layout">
      <div className="navbar-section">
        <Navbar 
          onLogout={handleLogout} 
          setShowHome={setShowHome}
          setShowLearning={setShowLearning}
          setShowExplore={setShowExplore}
          setShowWelcome={setShowWelcome}
        />
      </div>
      <div className="main-content">
        {showExplore ? (
          <ExplorePage onLogout={handleLogout} />
        ) : showLearning ? (
          <LearningPage onLogout={handleLogout} />
        ) : showWelcome ? (
          <>
            <Welcome />
            <HeroSlider />
            <TopPicks />
            <Footer />
          </>
        ) : showHome ? (
          <>
            <Signup onSwitchToWelcome={() => setShowWelcome(true)} />
            <HeroSlider />
            <TopPicks />
            <Footer />
          </>
        ) : (
          <>
            <Signup onSwitchToWelcome={() => setShowWelcome(true)} />
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