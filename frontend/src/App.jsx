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

function App() {
  const [count, setCount] = useState(0)
  const [showWelcome, setShowWelcome] = useState(false)
  const [showLearning, setShowLearning] = useState(false)

  const handleNavigateToLearning = () => {
    setShowLearning(true)
    setShowWelcome(false)
  }

  const handleLogout = () => {
    setShowWelcome(false)
    setShowLearning(false)
  }

  return (
    <div className="app-layout">
      <div className="navbar-section">
        <Navbar 
          onLogout={handleLogout} 
          onNavigateToLearning={handleNavigateToLearning}
        />
      </div>
      <div className="main-content">
        {showLearning ? (
          <LearningPage onLogout={handleLogout} />
        ) : showWelcome ? (
          <>
            <Welcome />
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
