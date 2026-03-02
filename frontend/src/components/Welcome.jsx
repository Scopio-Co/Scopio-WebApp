import './Welcome.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from './calendar.jsx';
import profilePic from '../assets/img/profilePic.png';
import badge1 from '../assets/img/Award 4.png';
import badge2 from '../assets/img/Award 5.png';
import badge3 from '../assets/img/Award 6.png';
import medal from '../assets/img/Medal Purple.png';
import clockIcon from '../assets/img/timer.png';
import targetIcon from '../assets/img/progress.png';
import flameIcon from '../assets/img/fire.png';
import achievementIcon from '../assets/img/achieved.png';
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

  // Fetch user statistics on component mount
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const response = await api.get('/api/video/user-stats/');
        console.log('✓ User stats fetched:', response.data);
        console.log('DEBUG - is_first_visit from API:', response.data.is_first_visit);
        
        setStats({
          learningHours: response.data.learning_hours || 0,
          streakDays: response.data.streak_days || 0,
          progress: response.data.progress || 0,
          achievements: response.data.achievements || 0
        });
        
        // Set greeting based on first visit
        const firstVisit = response.data.is_first_visit === true;
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

          <div className='calendar-row'>
            {/* Calendar */}
            <Calendar onStreakUpdate={handleStreakUpdate} />
            <div className="menu-column">
              {/* Portfolio */}
              <div className="portfolio">
                <a href='#' className="menu-title">Portfolio</a>
              </div>

              {/* Events */}
              <div className="events">
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
              </div>
            </div>
          </div>
        </div>

        <div className="rightColumn">
          {/* Profile */}
          <div className="dashboard-column">
            <div className="profile-card">
              <div className="profile-wrapper">
                <div className="speed-text">Speed</div>
                
                <div className="profile-image-container">
                  <img 
                    src={profilePic} 
                    alt="Profile" 
                    className="profile-image"
                  />
                </div>
              {/* Badges */}
                <div className="badges-container">
                  {/* Badge 1 */}
                  <div className="badge">
                    <img 
                      src={badge1} 
                      alt="Badge 1" 
                      className="badge-image"
                    />
                  </div>
                  
                  {/* Badge 2 */}
                  <div className="badge">
                    <img 
                      src={badge2}
                      alt="Badge 2" 
                      className="badge-image"
                    />
                  </div>
                  
                  {/* Badge 3 */}
                  <div className="badge">
                    <img 
                      src={badge3}
                      alt="Badge 3" 
                      className="badge-image"
                    />
                  </div>
                  
                  {/* medal */}
                  <div className="badge medal">
                    <img 
                      src={medal} 
                      alt="Coin" 
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
          

        </div>
      </div>
    </div>
  );
};

export default WelcomeDashboard;