import './Welcome.css';

const WelcomeDashboard = () => {

  return (
    <div className="dashboard-container">
      <div className="dashboard-wrapper">
        <h1 className="dashboard-title">Welcome Back!</h1>
        
        <div className="dashboard-grid">
          <div className="dashboard-column">
            {/* Learning Hours */}
            <div className="stat-card">
              <div className="icon-circle icon-red">
                <img 
                  src="/path-to-your-clock-icon.png" 
                  alt="Clock" 
                  className="icon-image"
                />
              </div>
              <div className="stat-content">
                <div className="stat-value">12 hr</div>
                <div className="stat-label">of learning</div>
              </div>
            </div>

            {/* Progress */}
            <div className="stat-card">
              <div className="icon-circle icon-red">
                <img 
                  src="/path-to-your-target-icon.png" 
                  alt="Target" 
                  className="icon-image"
                />
              </div>
              <div className="stat-content">
                <div className="stat-value">78%</div>
                <div className="stat-label">progress</div>
              </div>
            </div>
          </div>

          <div className="dashboard-column">
            {/* Streak Days */}
            <div className="stat-card">
              <div className="icon-circle icon-orange">
                <img 
                  src="/path-to-your-flame-icon.png" 
                  alt="Flame" 
                  className="icon-image"
                />
              </div>
              <div className="stat-content">
                <div className="stat-value">120</div>
                <div className="stat-label">days</div>
              </div>
            </div>

            {/* Achievements */}
            <div className="stat-card">
              <div className="icon-circle icon-indigo">
                <img 
                  src="/path-to-your-achievement-icon.png" 
                  alt="Achievement" 
                  className="icon-image"
                />
              </div>
              <div className="stat-content">
                <div className="stat-value">28</div>
                <div className="stat-label">achieved</div>
              </div>
            </div>
          </div>

          {/* Profile */}
          <div className="dashboard-column">
            <div className="profile-card">
              <div className="profile-wrapper">
                {/* Speed text overlay */}
                <div className="speed-text">Speed</div>
                
                {/* Profile image */}
                <div className="profile-image-container">
                  <img 
                    src="./assets/profile-image.jpg" 
                    alt="Profile" 
                    className="profile-image"
                  />
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