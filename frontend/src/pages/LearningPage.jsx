import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './LearningPage.css';
import Footer from '../components/Footer';
import Pagination from '../components/Pagination';
import RatingComponent from '../components/RatingComponent';
import heroCardImg from '../assets/img/Hero Card img.png';
import profilePic from '../assets/img/profilePic (2).png';
import tutorAvatar from '../assets/img/scopio/tutor-dolmo.webp';
import api from '../api';
import { LearningPageSkeleton } from '../components/skeletons';

const LearningPage = ({ onLogout, isLoading }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userXP, setUserXP] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortAsc, setSortAsc] = useState(false);
  const navigate = useNavigate();

  // Pagination constants
  const COURSES_PER_PAGE = 6;

  const fetchEnrolledCourses = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      console.log('🔍 Fetching enrolled courses from API...');
      const response = await api.get('/video/enrollments/');
      console.log('✓ Received enrollments:', response.data);
      if (response.data && response.data.length > 0) {
        const enrolledCourses = response.data.map((enrollment) => ({
          id: enrollment.course,
          title: enrollment.course_title,
          description: enrollment.course_description,
          thumbnail_url: enrollment.course_thumbnail,
          instructor_name: enrollment.instructor_name,
          instructor_title: enrollment.instructor_title,
          rating: enrollment.rating,
          total_duration: enrollment.total_duration,
          progress_percentage: enrollment.progress_percentage,
          completed_lessons: enrollment.completed_lessons,
          total_lessons: enrollment.total_lessons,
          is_published: true
        }));

        // Fetch per-course details to get accurate rating data when available
        try {
          const ratingResponses = await Promise.allSettled(
            enrolledCourses.map((course) => api.get(`/video/courses/${course.id}/`))
          );

          const coursesWithLiveRatings = enrolledCourses.map((course, index) => {
            const detailResult = ratingResponses[index];
            const detail = detailResult?.status === 'fulfilled' ? (detailResult.value?.data || {}) : {};
            const totalRatings = Number(detail.total_ratings ?? 0);
            const averageRating = Number(detail.average_rating ?? 0);
            const fallbackRating = Number(course.rating ?? 0);
            const hasDetail = detailResult?.status === 'fulfilled';

            return {
              ...course,
              // Keep true zero ratings as zero; never fallback because 0 is falsy.
              rating: hasDetail ? (totalRatings > 0 ? averageRating : 0) : fallbackRating,
            };
          });

          setCourses(coursesWithLiveRatings);
          setError(null);
          console.log(`✓ Loaded ${coursesWithLiveRatings.length} enrolled course(s) with live ratings`);
        } catch (innerErr) {
          // If per-course detail fetch fails, fall back to the basic enrollments
          console.warn('⚠️ Could not fetch per-course details, using enrollment data', innerErr);
          setCourses(enrolledCourses);
          setError(null);
        }
      } else {
        console.warn('⚠️ No enrolled courses found');
        setCourses([]);
      }
    } catch (err) {
      console.error('❌ Error fetching enrolled courses:', err);
      console.error('Error details:', err.response?.data || err.message);

      if (err.response?.status === 401) {
        setCourses([]);
        setError(null);
      } else {
        setError('Failed to load courses. Please check your connection.');
        setCourses([]);
      }
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  // Fetch enrolled courses from backend
  useEffect(() => {
    fetchEnrolledCourses(true);
  }, [fetchEnrolledCourses]);
  // Refresh on tab/window focus so updated tracking reflects immediately
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchEnrolledCourses(false);
      }
    };

    const handleFocus = () => fetchEnrolledCourses(false);

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchEnrolledCourses]);

  // Fetch user XP and stats
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const response = await api.get('/video/courses/user_stats/');
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

  // Sorting: ascending by title when sortAsc is true
  const sortedCourses = sortAsc
    ? [...courses].sort((a, b) => a.title.localeCompare(b.title))
    : courses;

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(sortedCourses.length / COURSES_PER_PAGE));
  const startIndex = (currentPage - 1) * COURSES_PER_PAGE;
  const endIndex = startIndex + COURSES_PER_PAGE;
  const displayCourses = sortedCourses.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Reset to page 1 when courses change
  useEffect(() => {
    setCurrentPage(1);
  }, [courses.length]);

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
            <button
              className="sort-button"
              onClick={() => {
                setSortAsc(prev => !prev);
                setCurrentPage(1);
              }}
            >
              Sort{' '}
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M4.14225 13.8296V0H3.01725V13.8296L0.795375 11.6077L0 12.4031L3.18206 15.5852C3.28755 15.6906 3.4306 15.7499 3.57975 15.7499C3.7289 15.7499 3.87195 15.6906 3.97744 15.5852L7.1595 12.4031L6.36413 11.6077L4.14225 13.8296ZM15.0345 3.34687L11.8524 0.164812C11.747 0.05936 11.6039 0.000120163 11.4548 0.000120163C11.3056 0.000120163 11.1625 0.05936 11.0571 0.164812L7.875 3.34687L8.67037 4.14225L10.8923 1.92037V15.75H12.0173V1.92037L14.2391 4.14225L15.0345 3.34687Z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Learning Design Content */}
        {loading ? (
          <LearningPageSkeleton />
        ) : (
        <>
        <div className="learning-design-container">

          {courses.length === 0 && !error && (
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

          {error && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#ff4444' }}>
              <p>{error}</p>
              <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>Unable to connect to the server. Please try again later.</p>
            </div>
          )}

          {courses.length > 0 && (
            <>
              <div className="course-grid">
                {displayCourses.map((course, index) => (
                  <div 
                    key={course.id} 
                    className="course-card" 
                    onClick={() => navigate(`/course/${course.id}`, { state: { source: 'learning' } })}
                    style={{ cursor: 'pointer' }}
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
                      <img src={tutorAvatar} alt={course.instructor_name} className="author-avatar-img" />
                    </div>
                          <div className="author-info">
                            <span className="author-name">{course.instructor_name || 'Instructor'}</span>
                            <span className="author-title">{course.instructor_title || ''}</span>
                          </div>
                        </div>
                        <RatingComponent
                          courseId={course.id}
                          rating={parseFloat(course.rating) || 0}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination-wrapper">
            <Pagination
              currentPage={currentPage}
              totalItems={sortedCourses.length}
              itemsPerPage={COURSES_PER_PAGE}
              onPageChange={handlePageChange}
            />
          </div>
        )}
        </>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LearningPage;
