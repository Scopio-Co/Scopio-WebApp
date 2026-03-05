import './Welcome.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from './calendar.jsx';
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

const WelcomeDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    learningHours: 0,
    streakDays: 0,
    progress: 0,
    achievements: 0
  });

  const [loading, setLoading] = useState(true);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [greetingMessage, setGreetingMessage] = useState('Welcome Back!');
  const [displayName, setDisplayName] = useState('User');
  const [userRank, setUserRank] = useState({ rank: 0, totalUsers: 0 });
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });

  // Fetch user statistics on component mount
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const [statsResponse, profileResponse] = await Promise.all([
          api.get('/api/video/user-stats/'),
          api.get('/api/auth/profile/')
        ]);

        console.log('✓ User stats fetched:', statsResponse.data);
        console.log('DEBUG - is_first_visit from API:', statsResponse.data.is_first_visit);

        const fullName = (profileResponse?.data?.full_name || '').trim();
        const username = (profileResponse?.data?.username || '').trim();
        // Use only the first name (before any whitespace) and capitalize first letter
        const firstName = fullName ? fullName.split(/\s+/)[0] : '';
        const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');
        setDisplayName(capitalize(firstName) || capitalize(username) || 'Username');
        
        setStats({
          learningHours: statsResponse.data.learning_hours || 0,
          streakDays: statsResponse.data.streak_days || 0,
          progress: statsResponse.data.progress || 0,
          achievements: statsResponse.data.achievements || 0
        });
        
        // Set greeting based on first visit
        const firstVisit = statsResponse.data.is_first_visit === true;
        console.log('DEBUG - firstVisit calculated:', firstVisit);
        
        setIsFirstVisit(firstVisit);
        const greeting = firstVisit ? 'Welcome to Scopio!' : 'Welcome Back!';
        console.log('DEBUG - Setting greeting to:', greeting);
        setGreetingMessage(greeting);
        
        setLoading(false);
        
        // Mark welcome as seen if it's first visit
        if (firstVisit) {
          try {
            await api.post('/api/video/mark-welcome-seen/');
            console.log('✓ Welcome marked as seen');
          } catch (error) {
            console.error('❌ Failed to mark welcome as seen:', error);
          }
        }
      } catch (error) {
        console.error('❌ Failed to fetch user stats:', error);
        setLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  // Fetch user rank
  useEffect(() => {
    const fetchUserRank = async () => {
      try {
        // Mock data - replace with actual API call
        setUserRank({ rank: 3, totalUsers: 250 });
      } catch (error) {
        console.error('❌ Failed to fetch user rank:', error);
      }
    };

    fetchUserRank();
  }, []);

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