import './Welcome.css';
import React, { useState } from 'react';
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

const WelcomeDashboard = () => {

  const [stats, setStats] = useState({
    learningHours: 12,
    streakDays: 120,
    progress: 78,
    achievements: 28
  });

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
        <h1 className="dashboard-title">Welcome Back!</h1>
        
        <div className="dashboard-grid">
          <div className='left-column'>
          <div className="dashboard-column">
            {/* Learning Hours */}
            <div className="stat-card">
              <div className="icon-circle icon-red">
                <img 
                  src={clockIcon} 
                  alt="Clock" 
                  className="icon-image"
                />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.learningHours} hr</div>
                <div className="stat-label">of learning</div>
              </div>
            </div>

            {/* Streak Days */}
            <div className="stat-card">
              <div className="icon-circle icon-orange">
                <img 
                  src={flameIcon} 
                  alt="Flame" 
                  className="icon-image"
                />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.streakDays}</div>
                <div className="stat-label">days</div>
              </div>
            </div>
           
          </div>

          <div className="dashboard-column">
             {/* Progress */}
            <div className="stat-card">
              <div className="icon-circle icon-red">
                <img 
                  src= {targetIcon}
                  alt="Target" 
                  className="icon-image"
                />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.progress}</div>
                <div className="stat-label">progress</div>
              </div>
            </div>

            {/* Achievements */}
            <div className="stat-card">
              <div className="icon-circle icon-indigo">
                <img 
                  src={achievementIcon}
                  alt="Achievement" 
                  className="icon-image"
                />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stats.achievements}</div>
                <div className="stat-label">achieved</div>
              </div>
            </div>
          </div>

          <div className='calendar-row'>
            {/* Calendar */}
            <Calendar/>
            <div className="menu-column">
              {/* Portfolio */}
              <div className="portfolio">
                <a href='#' className="menu-title">Portfolio</a>
              </div>

              {/* Events */}
              <div className="events">
                <div className="menu-title">Events</div>
                <div className="menu-list">
                  <div className="menu-item"><a href="#"><li>Explore</li></a></div>
                  <div className="menu-item"><a href="#"><li>Leaderboards</li></a></div>
                  <div className="menu-item"><a href="#"><li>Hands ON</li></a></div>
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