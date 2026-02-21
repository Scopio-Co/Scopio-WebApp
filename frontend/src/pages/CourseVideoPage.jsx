import React, { useState, useEffect } from 'react';
import './CourseVideoPage.css';
import courseVideoImage from '../assets/img/course video.webp';
import Footer from '../components/Footer';
import instagramIcon from '../assets/img/instagram.svg';
import linkedinIcon from '../assets/img/Linkedin.svg';
import whatsappIcon from '../assets/img/Whatsapp.svg';
import xIcon from '../assets/img/x.svg';

const CourseVideoPage = ({ selectedCourse, onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentLessonIndex, setCurrentLessonIndex] = useState(null);

  useEffect(() => {
    // ensure main content container is scrolled to top when opening this page
    const mainEl = document.querySelector('.main-content');
    if (mainEl && typeof mainEl.scrollTo === 'function') {
      mainEl.scrollTo({ top: 0, behavior: 'auto' });
    }
    // fallback to window
    if (typeof window !== 'undefined') window.scrollTo(0, 0);
  }, []);

  const lessons = [
    { id: 1, title: "Introduction to React JS", duration: "1:45 min", completed: true, time: "451.02" },
    { id: 2, title: "Node Installation", duration: "2:30 min", completed: true, time: "452.10" },
    { id: 3, title: "Components", duration: "3:15 min", completed: true, time: "453.00" },
    { id: 4, title: "Lifecycle", duration: "2:45 min", completed: true, time: "453.45" },
    { id: 5, title: "State Management", duration: "4:20 min", completed: false, time: "454.30" },
    { id: 6, title: "Node Installation", duration: "1:58 min", completed: false, time: "455.00" },
    { id: 7, title: "Node Installation", duration: "2:15 min", completed: false, time: "455.30" },
    { id: 8, title: "Node Installation", duration: "3:00 min", completed: false, time: "456.00" },
    { id: 9, title: "Node Installation", duration: "2:45 min", completed: false, time: "456.45" },
  ];

  const discussions = [
    {
      id: 1,
      author: "Hamdan Husain",
      role: "son_of_baheev",
      comment: "Greyt lesson! The examples really helped me understand the concepts better.",
      likes: 12
    },
    {
      id: 2,
      author: "Hamdan Husain",
      role: "son_of_baheev",
      comment: "Greyt lesson! The examples really helped me understand the concepts better.",
      likes: 12
    },
    {
      id: 3,
      author: "Hamdan Husain",
      role: "son_of_baheev",
      comment: "Greyt lesson! The examples really helped me understand the concepts better.",
      likes: 12
    }
  ];

  return (
    <div className="course-video-page">
      <div className="course-video-container">
        {/* Header */}
          <div className="course-video-header">
          <div className="header-left">
            <div className="course-detail">
              <h1>{selectedCourse?.title || 'Course Name'}</h1>
              <p className="component-count">{selectedCourse?.duration || '3 Components'}</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="course-content-grid">
          {/* Top Container: Video and Lessons */}
          <div className="video-lessons-container">
            {/* Video Player */}
            <div className="video-player">
              <img src={courseVideoImage} alt={selectedCourse?.title || 'Course Video'} />

              <button
                type="button"
                className="play-center"
                onClick={() => setCurrentLessonIndex(0)}
                aria-label="Play video"
              >
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 5v14l11-7L8 5z" fill="#fff"/>
                </svg>
              </button>

              <div className="video-overlay">
                {currentLessonIndex !== null && (
                  <>
                    <h2>Lesson {currentLessonIndex + 1}</h2>
                    <p className="video-subtitle">{lessons[currentLessonIndex]?.title || 'Lesson Title'}</p>
                  </>
                )}
              </div>
            </div>

            {/* Course Lessons */}
            <div className="lessons-sidebar">
              <div className="lessons-header">
                <h2>Course Lessons</h2>
                <p className="progress-text">4/12 completed</p>
              </div>

              <div className="lessons-scroll-container">
                <div className="lessons-list">
                {lessons.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    className={`lesson-item ${lesson.completed ? 'completed' : ''} ${currentLessonIndex === index ? 'active-lesson' : ''}`}
                    onClick={() => setCurrentLessonIndex(index)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="lesson-play-btn">
                      <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
  <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 19.4 5.6 25 12.5 25C19.4 25 25 19.4 25 12.5C25 5.6 19.4 0 12.5 0ZM15.825 14.6625L14.225 15.5875L12.625 16.5125C10.5625 17.7 8.875 16.725 8.875 14.35V12.5V10.65C8.875 8.2625 10.5625 7.3 12.625 8.4875L14.225 9.4125L15.825 10.3375C17.8875 11.525 17.8875 13.475 15.825 14.6625Z" fill="#292D32"/>
</svg>
                    </div>
                    <div className="lesson-content">
                      <p className="lesson-number">Lesson {index + 1}</p>
                      <p className="lesson-title">{lesson.title}</p>
                    </div>
                    <div className="lesson-meta">
                      <p className="lesson-duration">{lesson.duration}</p>
                      <p className="lesson-xp">{lesson.time}</p>
                    </div>
                  </div>
                ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Container: Discussions and Overview */}
          <div className="discussions-overview-container">
            {/* Discussions - Left */}
            <div className="discussions-sidebar">
              <div className="discussions-section">
                <div className="discussions-header">
                  <h3>Discussions</h3>
                  <p className="discussion-count">14</p>
                </div>
                
                <div className="discussions-list">
                  {discussions.map((discussion) => (
                    <div key={discussion.id} className="discussion-item">
                      <div className="discussion-base">
                        <div className="discussion-avatar">
                            <div className="avatar-circle"></div>
                        <div className="discussion-header">
                          <span className="author-name">{discussion.author}</span>
                          <span className="author-role">{discussion.role}</span>
                        </div>
                        </div>
                        
                        <div className="discussion-likes">
                        <span className="likes-count">{discussion.likes}</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="23" height="20" viewBox="0 0 23 20" fill="none">
  <path d="M16.6064 0.25C20.003 0.250236 22.75 2.95184 22.75 6.28125C22.7499 10.1283 20.9289 13.1946 18.6807 15.4453C16.4294 17.699 13.766 19.1177 12.1338 19.6621H12.1318C11.9708 19.7176 11.7413 19.75 11.5 19.75C11.2587 19.75 11.0292 19.7176 10.8682 19.6621H10.8662C9.23396 19.1177 6.57059 17.699 4.31934 15.4453C2.07112 13.1946 0.250111 10.1283 0.25 6.28125C0.25 2.95184 2.99701 0.250236 6.39355 0.25C8.40601 0.25 10.1851 1.20031 11.3008 2.66797C11.3481 2.73016 11.4219 2.7666 11.5 2.7666C11.5781 2.7666 11.6519 2.73016 11.6992 2.66797C12.8147 1.20051 14.6052 0.25 16.6064 0.25Z" fill="#B39DFF" stroke="#D3C7FF" stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
                      </div>
                      </div>
                      
                      <div className="discussion-content">
                        <p className="discussion-comment">{discussion.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Overview - Right */}
            <div className="overview-container">
              {/* Tabs */}
              <div className="course-tabs">
                <button 
                  className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                </button>
                <button 
                  className={`tab ${activeTab === 'resources' ? 'active' : ''}`}
                  onClick={() => setActiveTab('resources')}
                >
                  Resources
                </button>
                <button 
                  className={`tab ${activeTab === 'notes' ? 'active' : ''}`}
                  onClick={() => setActiveTab('notes')}
                >
                  Notes
                </button>
                <button 
                  className={`tab ${activeTab === 'tutor' ? 'active' : ''}`}
                  onClick={() => setActiveTab('tutor')}
                >
                  Tutor
                </button>
              </div>

              {/* Tab Content */}
              <div className="tab-content">
                {activeTab === 'overview' && (
                  <>
                    <div className="about-section">
                      <h3>About This Lesson</h3>
                      <p>In this comprehensive lesson, you'll learn the fundamental concepts and advanced techniques that will help you master the subject. Our expert instructors have carefully designed this content to ensure maximum learning effectiveness.</p>
                    </div>

                    <div className="what-learn-section">
                      <div className="learn-content">
                        <h3>What you'll learn:</h3>
                        <ul>
                          <li>Core concepts</li>
                          <li>Javascript xml JSX</li>
                          <li>Components and Props</li>
                          <li>Hooks in React</li>
                        </ul>
                      </div>
                      <div className="rating-display">
                        <span className="rating-number">4.3</span>
                        <div className="stars">
                          {[1, 2, 3, 4].map((star) => (
                            <svg key={star} width="20" height="20" viewBox="0 0 24 24" fill="#FFD700">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                          ))}
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {activeTab === 'resources' && (
                  <div className="resources-content">
                    <h3>Course Resources:</h3>
                    <div className="resources-list">
                      <div className="resource-item">
                        <span className="resource-label">Github:</span>
                        <a href="#" className="resource-link">Click</a>
                      </div>
                      <div className="resource-item">
                        <span className="resource-label">Code:</span>
                        <a href="#" className="resource-link">Click</a>
                      </div>
                      <div className="resource-item">
                        <span className="resource-label">Website:</span>
                        <a href="#" className="resource-link">Click</a>
                      </div>
                      <div className="resource-item">
                        <span className="resource-label">Folder Zip:</span>
                        <a href="#" className="resource-link">Click</a>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'notes' && (
                  <div className="notes-content">
                    <h3>My Notes:</h3>
                    <textarea 
                      className="notes-textarea" 
                      placeholder="Markdown supported"
                    ></textarea>
                    <div className="notes-actions">
                      <button className="notes-reset-btn">Reset</button>
                      <button className="notes-save-btn">Save</button>
                    </div>
                  </div>
                )}
                {activeTab === 'tutor' && (
                  <div className="tutor-content">
                    <h3>About the Tutor:</h3>
                    <div className="tutor-profile">
                      <div className="tutor-avatar"></div>
                      <div className="tutor-info">
                        <h4 className="tutor-name">Donald J Trump</h4>
                        <p className="tutor-role">Web Dev @copestart</p>
                      </div>
                    </div>
                    <p className="tutor-bio">
                      Ben Hong is a Staff Developer Experience (DX) Engineer and a part of the Vue.js Core Team and Angular Team. He is also a developer / psychologist / educator hybrid who is passionate about creating products that help to empower people with new skills and knowledge regardless of their background.
                    </p>
                    <div className="tutor-social">
                      <button
                        type="button"
                        className="social-button Instagram"
                      >
                        <img src={instagramIcon} alt="Instagram" className="social-icon" />
                      </button>
                      <button
                        type="button"
                        className="social-button linkedin"
                      >
                        <img src={linkedinIcon} alt="LinkedIn" className="social-icon" />
                      </button>
                      <button
                        type="button"
                        className="social-button whatsapp"
                      >
                        <img src={whatsappIcon} alt="WhatsApp" className="social-icon" />
                      </button>
                      <button
                        type="button"
                        className="social-button x"
                      >
                        <img src={xIcon} alt="X" className="social-icon" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CourseVideoPage;

