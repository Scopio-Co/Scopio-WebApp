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
import CourseVideoPage from './pages/CourseVideoPage';

function App() {
  const [count, setCount] = useState(0)
  const [showWelcome, setShowWelcome] = useState(false)
  const [showLearning, setShowLearning] = useState(false)
  const [showExplore, setShowExplore] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [showHome, setShowHome] = useState(true)
  const [showCourseVideo, setShowCourseVideo] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)

  const handleLogout = () => {
    setShowWelcome(false)
    setShowLearning(false)
    setShowExplore(false)
    setShowLeaderboard(false)
    setShowHome(true)
    setShowCourseVideo(false)
  }

  const handleCourseClick = (course) => {
    setSelectedCourse(course || null)
    setShowCourseVideo(true)
    setShowWelcome(false)
    setShowLearning(false)
    setShowExplore(false)
    setShowLeaderboard(false)
    setShowHome(false)
  }

  const handleBackFromCourse = () => {
    setShowCourseVideo(false)
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
          showCourseVideo={showCourseVideo}
        />
      </div>
      <div className="main-content">
        {showCourseVideo ? (
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
    </div>
  )
}

export default App