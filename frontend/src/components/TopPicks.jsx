import React from 'react';
import './TopPicks.css';
import courseCardImg from '../assets/img/course card.jpg';

const TopPicks = () => {
  return (
    <section className="top-picks-section">
        <h2 className="top-picks-heading">Your Top Picks</h2>
      <div className="top-picks-container">
        
        <div className="parent-toppicks-grid">
          <div className="child1-toppicks grid-item">
            <div className="course-card large-card">
              <img 
                src={courseCardImg} 
                alt="Course 1" 
                className="course-image"
                onError={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                  e.target.style.display = 'flex';
                  e.target.style.alignItems = 'center';
                  e.target.style.justifyContent = 'center';
                  e.target.style.color = 'white';
                  e.target.style.fontSize = '1.2rem';
                  e.target.innerHTML = 'Course Preview';
                }}
              />
              <div className="course-content">
                <h3>Advanced React Development</h3>
                <p>Master modern React patterns and hooks</p>
                <div className="course-meta">
                  <span className="duration">8 weeks</span>
                  <span className="level">Advanced</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="child2-toppicks grid-item">
            <div className="course-card medium-card">
              <img 
                src={courseCardImg} 
                alt="Course 2" 
                className="course-image"
                onError={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
                  e.target.style.display = 'flex';
                  e.target.style.alignItems = 'center';
                  e.target.style.justifyContent = 'center';
                  e.target.style.color = 'white';
                  e.target.innerHTML = 'Course 2';
                }}
              />
              <div className="course-content compact">
                <h4>UI/UX Design Fundamentals</h4>
                <span className="course-tag">Design</span>
              </div>
            </div>
          </div>

          <div className="child3-toppicks grid-item">
            <div className="course-card small-card">
              <img 
                src={courseCardImg} 
                alt="Course 3" 
                className="course-image"
                onError={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
                  e.target.style.display = 'flex';
                  e.target.style.alignItems = 'center';
                  e.target.style.justifyContent = 'center';
                  e.target.style.color = 'white';
                  e.target.innerHTML = '3';
                }}
              />
            </div>
          </div>

          <div className="child4-toppicks grid-item">
            <div className="course-card medium-card">
              <img 
                src={courseCardImg} 
                alt="Course 4" 
                className="course-image"
                onError={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)';
                  e.target.style.display = 'flex';
                  e.target.style.alignItems = 'center';
                  e.target.style.justifyContent = 'center';
                  e.target.style.color = 'white';
                  e.target.innerHTML = '4';
                }}
              />
              <div className="course-content">
                <h4>Python Programming</h4>
                <p>Learn Python from scratch</p>
              </div>
            </div>
          </div>

          <div className="child5-toppicks grid-item">
            <div className="course-card large-card horizontal">
              <img 
                src={courseCardImg} 
                alt="Course 5" 
                className="course-image"
                onError={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)';
                  e.target.style.display = 'flex';
                  e.target.style.alignItems = 'center';
                  e.target.style.justifyContent = 'center';
                  e.target.style.color = '#333';
                  e.target.innerHTML = '5';
                }}
              />
              <div className="course-content">
                <h4>Data Science Mastery</h4>
                <p>Analytics and Machine Learning</p>
              </div>
            </div>
          </div>

          <div className="child6-toppicks grid-item">
            <div className="course-card small-card">
              <img 
                src={courseCardImg} 
                alt="Course 6" 
                className="course-image"
                onError={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)';
                  e.target.style.display = 'flex';
                  e.target.style.alignItems = 'center';
                  e.target.style.justifyContent = 'center';
                  e.target.style.color = '#333';
                  e.target.innerHTML = '6';
                }}
              />
            </div>
          </div>

          <div className="child7-toppicks grid-item">
            <div className="course-card medium-card">
              <img 
                src={courseCardImg} 
                alt="Course 7" 
                className="course-image"
                onError={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)';
                  e.target.style.display = 'flex';
                  e.target.style.alignItems = 'center';
                  e.target.style.justifyContent = 'center';
                  e.target.style.color = '#333';
                  e.target.innerHTML = '7';
                }}
              />
              <div className="course-content">
                <h4>Mobile Development</h4>
              </div>
            </div>
          </div>

          <div className="child8-toppicks grid-item">
            <div className="course-card large-card horizontal">
              <img 
                src={courseCardImg} 
                alt="Course 8" 
                className="course-image"
                onError={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)';
                  e.target.style.display = 'flex';
                  e.target.style.alignItems = 'center';
                  e.target.style.justifyContent = 'center';
                  e.target.style.color = '#333';
                  e.target.innerHTML = '8';
                }}
              />
              <div className="course-content">
                <h4>Cloud Computing & DevOps</h4>
                <p>AWS, Docker, Kubernetes</p>
              </div>
            </div>
          </div>

          <div className="child9-toppicks grid-item">
            <div className="course-card small-card">
              <img 
                src={courseCardImg} 
                alt="Course 9" 
                className="course-image"
                onError={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)';
                  e.target.style.display = 'flex';
                  e.target.style.alignItems = 'center';
                  e.target.style.justifyContent = 'center';
                  e.target.style.color = 'white';
                  e.target.innerHTML = '9';
                }}
              />
            </div>
          </div>

          <div className="child10-toppicks grid-item">
            <div className="course-card small-card">
              <img 
                src={courseCardImg} 
                alt="Course 10" 
                className="course-image"
                onError={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #fdbb2d 0%, #22c1c3 100%)';
                  e.target.style.display = 'flex';
                  e.target.style.alignItems = 'center';
                  e.target.style.justifyContent = 'center';
                  e.target.style.color = 'white';
                  e.target.innerHTML = '10';
                }}
              />
            </div>
          </div>
          
          <div className="child11-toppicks grid-item">
            <div className="course-card large-card">
              <img 
                src={courseCardImg} 
                alt="Course 11" 
                className="course-image"
                onError={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #ee9ca7 0%, #ffdde1 100%)';
                  e.target.style.display = 'flex';
                  e.target.style.alignItems = 'center';
                  e.target.style.justifyContent = 'center';
                  e.target.style.color = '#333';
                  e.target.innerHTML = '11';
                }}
              />
              <div className="course-content">
                <h4>Cybersecurity Fundamentals</h4>
                <p>Protect digital assets</p>
              </div>
            </div>
          </div>
          
          <div className="child12-toppicks grid-item">
            <div className="course-card large-card horizontal">
              <img 
                src={courseCardImg} 
                alt="Course 12" 
                className="course-image"
                onError={(e) => {
                  e.target.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                  e.target.style.display = 'flex';
                  e.target.style.alignItems = 'center';
                  e.target.style.justifyContent = 'center';
                  e.target.style.color = 'white';
                  e.target.innerHTML = '12';
                }}
              />
              <div className="course-content">
                <h4>Blockchain & Web3</h4>
                <p>Decentralized applications</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TopPicks;