import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LearningPage.css';
import Footer from '../components/Footer';
import Pagination from '../components/Pagination';
import RatingComponent from '../components/RatingComponent';
import heroCardImg from '../assets/img/Hero Card img.png';
import profilePic from '../assets/img/profilePic (2).png';
import api from '../api';

const LearningPage = ({ onLogout, isLoading }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [userXP, setUserXP] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(0);
  const navigate = useNavigate();

  // Fallback dummy courses for when API is unavailable
  const dummyCourses = [
    {
      id: null, // null ID indicates dummy data
      title: "Sample Course 1",
      description: "This is a sample course. Real courses will appear here when connected to the backend.",
      thumbnail_url: heroCardImg,
      instructor_name: "Demo Instructor",
      instructor_title: "Sample Teacher",
      rating: 4.5,
      total_duration: "5 hours",
      progress_percentage: 0,
      total_lessons: 10,
      is_published: true
    }
  ];

  // Fetch enrolled courses from backend
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching enrolled courses from API...');
        const response = await api.get('/api/video/enrollments/');
        console.log('✓ Received enrollments:', response.data);
        
        if (response.data && response.data.length > 0) {
          // Transform enrollment data to course format
          const enrolledCourses = response.data.map((enrollment) => ({
            id: enrollment.course,
            title: enrollment.course_title,
            description: enrollment.course_description,
            thumbnail_url: enrollment.course_thumbnail,
            instructor_name: enrollment.instructor_name,
            instructor_title: enrollment.instructor_title,
            rating: enrollment.rating,
            total_duration: enrollment.total_duration,
            progress_percentage: enrollment.progress_percentage, // Now from backend
            completed_lessons: enrollment.completed_lessons, // Lessons completed
            total_lessons: enrollment.total_lessons,
            is_published: true
          }));
          
          setCourses(enrolledCourses);
          setUsingFallback(false);
          setError(null);
          console.log(`✓ Loaded ${enrolledCourses.length} enrolled course(s)`);
        } else {
          // No enrollments yet
          console.warn('⚠️ No enrolled courses found');
          setCourses([]);
          setUsingFallback(false);
        }
      } catch (err) {
        console.error('❌ Error fetching enrolled courses:', err);
        console.error('Error details:', err.response?.data || err.message);
        
        // If user is not authenticated, don't show error
        if (err.response?.status === 401) {
          setCourses([]);
          setError(null);
        } else {
          setError('Failed to load courses. Please check your connection.');
          setCourses([]);
        }
        setUsingFallback(false);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, []);

  // Fetch user XP and stats
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const response = await api.get('/api/video/courses/user_stats/');
        console.log('✓ User stats:', response.data);
        setUserXP(response.data.total_xp || 0);
        setCompletedLessons(response.data.total_lessons_completed || 0);
      } catch (err) {
        console.warn('Could not fetch user stats:', err.message);
        // Don't show error for stats - it's not critical
      }
    };

    fetchUserStats();
  }, []);

  // Function to extract percentage from progress text
  const getProgressPercentage = (progressText) => {
    const match = progressText.match(/(\d+)%/);
    return match ? match[1] + '%' : '0%';
  };

  return (
    <div className="learning-page">
      {/* Main Content */}
      <div className="learning-page-content">
        <div className="learning-page-header">
          <div className="learning-page-title-section">
            <h1 className="learning-page-title">Learning</h1>
            <div className="learning-stats">
              <div className="stat-item">
                <span className="stat-label">XP Earned</span>
                <span className="stat-value">{userXP}</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-label">Lessons Completed</span>
                <span className="stat-value">{completedLessons}</span>
              </div>
            </div>
          </div>
          <div className="learning-page-sort">
            <button className="sort-button">Sort <svg xmlns="http://www.w3.org/2000/svg" width="14" height="12" viewBox="0 0 16 16" fill="none">
  <path d="M4.14225 13.8296V0H3.01725V13.8296L0.795375 11.6077L0 12.4031L3.18206 15.5852C3.28755 15.6906 3.4306 15.7499 3.57975 15.7499C3.7289 15.7499 3.87195 15.6906 3.97744 15.5852L7.1595 12.4031L6.36413 11.6077L4.14225 13.8296ZM15.0345 3.34687L11.8524 0.164812C11.747 0.05936 11.6039 0.000120163 11.4548 0.000120163C11.3056 0.000120163 11.1625 0.05936 11.0571 0.164812L7.875 3.34687L8.67037 4.14225L10.8923 1.92037V15.75H12.0173V1.92037L14.2391 4.14225L15.0345 3.34687Z"/>
</svg></button>
          </div>
        </div>

        {/* Learning Design Content */}
        <div className="learning-design-container">
          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-tertiary)' }}>
              <p>Loading your courses...</p>
            </div>
          )}

          {!loading && courses.length === 0 && !error && (
            <div className="empty-state">
              <div className="empty-state-icon">
                <img src={profilePic} alt="Start Learning" className="empty-state-profile" />
              </div>
              <h2 className="empty-state-title">Start Your Learning Journey</h2>
              <p className="empty-state-description">
                You haven't enrolled in any courses yet. Explore our course catalog and start learning today!
              </p>
              <button 
                className="explore-courses-btn" 
                onClick={() => navigate('/explore')}
              >
                Explore Courses
              </button>
            </div>
          )}

          {!loading && error && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#ff4444' }}>
              <p>{error}</p>
              <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>Make sure the backend server is running at http://127.0.0.1:8000</p>
            </div>
          )}

          {!loading && courses.length > 0 && (
            <>
              <div className="course-grid">
                {courses.map((course, index) => (
                  <div 
                    key={course.id || `demo-${index}`} 
                    className="course-card" 
                    onClick={() => navigate(`/course/${course.id}`)}
                    style={{ 
                      cursor: 'pointer'
                    }}
                  >
                    <div className="course-image-card">
                      <img src={course.thumbnail_url || heroCardImg} alt={course.title} className="course-img" />
                      <div className="continue-button-wrapper">
                        <button className="continue-btn">
                          {course.progress_percentage > 0 ? 'Continue' : 'Start'}
                        </button>
                      </div>
                    </div>
                    <div className="course-info">
                      <h3 className="course-title">
                        {course.title}
                      </h3>
                      <div className="course-progress">
                        <span className="progress-text">{course.progress_percentage}% Completed</span>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{width: `${course.progress_percentage}%`}}></div>
                        </div>
                      </div>
                      <div className="course-author">
                        <div className="author-section">
                          <div className="author-avatar">
                            <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 34 34" fill="none">
                              <circle cx="17" cy="17" r="14.5" fill="white" stroke="#8A8A8A" strokeWidth="5"/>
                            </svg>
                          </div>
                          <div className="author-info">
                            <span className="author-name">{course.instructor_name || 'Instructor'}</span>
                            <span className="author-title">{course.instructor_title || ''}</span>
                          </div>
                        </div>
                        <RatingComponent rating={parseFloat(course.rating) || 0} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
          {/* Pagination */}
          <div className="pagination-wrapper">
            <Pagination currentPage={2} totalPages={3} onPageChange={() => { /* noop for now */ }} />
          </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LearningPage;
