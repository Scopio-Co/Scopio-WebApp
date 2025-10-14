import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Navbar from './components/Navbar'
import Signup from './components/Signup'
import Login from './components/Login'
import HeroCard from './components/HeroCard'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app-layout">
      <div className="navbar-section">
        <Navbar />
      </div>
      <div className="main-content">
        <Signup />
      </div>
    </div>
  )
}

export default App
