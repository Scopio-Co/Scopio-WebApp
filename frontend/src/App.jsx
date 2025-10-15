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

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app-layout">
      <div className="navbar-section">
        <Navbar />
      </div>
      <div className="main-content">
        <Signup />
        <HeroSlider />
        <TopPicks />
        <Footer />
      </div>
    </div>
  )
}

export default App
