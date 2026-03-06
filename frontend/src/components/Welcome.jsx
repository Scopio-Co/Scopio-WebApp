import './Welcome.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from './calendar.jsx';
import { WelcomeSkeleton } from './skeletons';
import profilePic from '../assets/img/profilePic.webp';
import badge1 from '../assets/img/Award 4.png';
import badge2 from '../assets/img/Award 5.png';
import badge3 from '../assets/img/Award 6.png';
import medal from '../assets/img/Medal Purple.png';
import clockIcon from '../assets/img/timer.png';
import targetIcon from '../assets/img/progress.png';
import flameIcon from '../assets/img/fire.png';
import achievementIcon from '../assets/img/achieved.png';
import trophyIcon from '../assets/img/trophy-cham.png';
import api from '../api';

const WelcomeDashboard = ({ welcomeData = null }) => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    learningHours: welcomeData?.stats?.learningHours || 0,
    streakDays: welcomeData?.stats?.streakDays || 0,
    progress: welcomeData?.stats?.progress || 0,
    achievements: welcomeData?.stats?.achievements || 0
  });

  const [loading, setLoading] = useState(!welcomeData || welcomeData.isLoading);
  const [isFirstVisit, setIsFirstVisit] = useState(welcomeData?.isFirstVisit ?? false);
  const [greetingMessage, setGreetingMessage] = useState(
    welcomeData?.isFirstVisit ? 'Welcome to Scopio!' : 'Welcome Back!'
  );
  const [displayName, setDisplayName] = useState(welcomeData?.displayName || 'User');
  const [userRank, setUserRank] = useState(welcomeData?.userRank || { rank: 0, totalUsers: 0 });
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });

  // Initialize from cached welcome data on mount
  useEffect(() => {
    if (welcomeData && !welcomeData.isLoading) {
      console.log('✓ [Welcome] Using cached welcome data:', welcomeData);
      
      setStats({
        learningHours: welcomeData.stats?.learningHours || 0,
        streakDays: welcomeData.stats?.streakDays || 0,
        progress: welcomeData.stats?.progress || 0,
        achievements: welcomeData.stats?.achievements || 0
      });
      
      setDisplayName(welcomeData.displayName || 'User');
      setIsFirstVisit(welcomeData.isFirstVisit === true);
      setGreetingMessage(welcomeData.isFirstVisit === true ? 'Welcome to Scopio!' : 'Welcome Back!');
      setUserRank(welcomeData.userRank || { rank: 0, totalUsers: 0 });
      setLoading(false);
    } else if (welcomeData && welcomeData.isLoading) {
      console.log('⏳ [Welcome] Waiting for welcome data to load...');
      setLoading(true);
    } else {
      // Fallback: no cached data, show loading
      console.log('⚠️ [Welcome] No welcome data provided, using defaults');
      setLoading(false);
    }
  }, [welcomeData]);

  // Countdown timer for streak
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      
      const diff = midnight - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setCountdown({ hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  // Handle streak update from calendar
  const handleStreakUpdate = (newStreak) => {
    setStats(prevStats => ({
      ...prevStats,
      streakDays: newStreak
    }));
  };

  const updateStat = (statName, value) => {
    setStats(prevStats => ({
      ...prevStats,
      [statName]: value
    }));
  };

  const incrementStat = (statName, amount = 1) => {
    setStats(prevStats => ({
      ...prevStats,
      [statName]: prevStats[statName] + amount
    }));
  };

  // Show skeleton while data is loading (dynamic)
  if (loading || welcomeData?.isLoading) {
    return <WelcomeSkeleton displayName={displayName} />;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-wrapper">
        <h1 className="dashboard-title">{greetingMessage}</h1>
        
        <div className="dashboard-grid">
          <div className='left-column'>
          <div className="dashboard-column">
            {/* Learning Hours */}
            <div className={`stat-card ${loading ? 'loading' : ''}`}>
              <div className="icon-circle icon-red">
                <img 
                  src={clockIcon} 
                  alt="Clock" 
                  className="icon-image"
                />
              </div>
              <div className="stat-content">
                <div className={`stat-value ${loading ? 'loading-skeleton' : ''}`}>
                  {loading ? '---' : `${stats.learningHours} hr`}
                </div>
                <div className="stat-label">of learning</div>
              </div>
            </div>

            {/* Streak Days */}
            <div className={`stat-card ${loading ? 'loading' : ''}`}>
              <div className="icon-circle icon-orange">
                <img 
                  src={flameIcon} 
                  alt="Flame" 
                  className="icon-image"
                />
              </div>
              <div className="stat-content">
                <div className={`stat-value ${loading ? 'loading-skeleton' : ''}`}>
                  {loading ? '--' : stats.streakDays}
                </div>
                <div className="stat-label">days streak</div>
              </div>
            </div>
           
          </div>

          <div className="dashboard-column">
             {/* Progress */}
            <div className={`stat-card ${loading ? 'loading' : ''}`}>
              <div className="icon-circle icon-red">
                <img 
                  src= {targetIcon}
                  alt="Target" 
                  className="icon-image"
                />
              </div>
              <div className="stat-content">
                <div className={`stat-value ${loading ? 'loading-skeleton' : ''}`}>
                  {loading ? '--' : `${stats.progress}%`}
                </div>
                <div className="stat-label">progress</div>
              </div>
            </div>

            {/* Achievements */}
            <div className={`stat-card ${loading ? 'loading' : ''}`}>
              <div className="icon-circle icon-indigo">
                <img 
                  src={achievementIcon}
                  alt="Achievement" 
                  className="icon-image"
                />
              </div>
              <div className="stat-content">
                <div className={`stat-value ${loading ? 'loading-skeleton' : ''}`}>
                  {loading ? '--' : stats.achievements}
                </div>
                <div className="stat-label">achieved</div>
              </div>
            </div>
          </div>

          
            <div className="menu-column">
              {/* Portfolio */}
              {/* <div className="portfolio">
                <a href='#' className="menu-title">Portfolio</a>
              </div> */}

              {/* Events */}
              {/* <div className="events">
                <div className="menu-title">Events</div>
                <div className="menu-list">
                  <div className="menu-item" onClick={() => navigate('/explore')}>
                    <li style={{ cursor: 'pointer' }}>Explore</li>
                  </div>
                  <div className="menu-item" onClick={() => navigate('/leaderboard')}>
                    <li style={{ cursor: 'pointer' }}>Leaderboards</li>
                  </div>
                  <div className="menu-item">
                    <li style={{ cursor: 'pointer' }}>Hands ON</li>
                  </div>
                </div>
              </div> */}
            </div>
            
        </div>

        <div className="rightColumn">
          {/* Profile */}
          <div className="dashboard-column">
            <div className="profile-card">
              <div className="profile-wrapper">
                <div className={`speed-text ${loading ? 'blinking' : ''}`}>{displayName}</div>
                
                <div className="profile-image-container">
                  <img 
                    src={profilePic} 
                    alt="Profile" 
                    className="profile-image"
                  />
                </div>
                
              
              </div>

            </div>
          </div>

        </div>
          

        </div>
        <div className='calendar-row'>
          {/* Calendar - Left */}
          <div className="calendar-container">
            <Calendar onStreakUpdate={handleStreakUpdate} />
          </div>

          {/* Right Side Stats Containers */}
          <div className="calendar-side-stats">
            {/* User Rank Container */}
            <div className="rank-container">
              <div className="rank-trophy">
                <img src={trophyIcon} alt="Trophy" className="trophy-icon" />
              </div>
              <div className="rank-content">
                <div className="rank-title">Your Rank</div>
                <div className="rank-value">#{userRank.rank}</div>
                <div className="rank-subtitle">Among {userRank.totalUsers} learners</div>
              </div>
            </div>

            {/* Streak Countdown Container */}
            <div className="streak-countdown-container">
              <div className="countdown-header">
                <div className="countdown-title">Streak Ends In</div>
                <div className="countdown-timer">
                  {String(countdown.hours).padStart(2, '0')}:
                  {String(countdown.minutes).padStart(2, '0')}:
                  {String(countdown.seconds).padStart(2, '0')}
                </div>
                <div className="countdown-subtitle">Complete a lesson to maintain your streak</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeDashboard;