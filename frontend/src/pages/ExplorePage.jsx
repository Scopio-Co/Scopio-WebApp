import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import './ExplorePage.css';
import CourseCard from '../components/CourseCard';
import Footer from '../components/Footer';
import courseCardImage from '../assets/img/course_card.webp';
import api from '../api';
import { ExplorePageSkeleton } from '../components/skeletons';

const ExplorePage = () => {
  const navigate = useNavigate();
  const scrollRef1 = useRef(null);
  const scrollRef2 = useRef(null);
  const scrollRef3 = useRef(null);
  const scrollRef4 = useRef(null);
  const scrollRef5 = useRef(null);
  const scrollRef6 = useRef(null);

  // State for courses from API
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);

  // Fallback dummy courses for when API is unavailable
  const dummyCourses = [
    {
      id: null,
      image: courseCardImage,
      imageFilter: 'hue-rotate(-10deg) saturate(115%)',
      title: "Demo Course - React Fundamentals",
      duration: "5 hours, 48 minutes",
      rating: 4.7,
      description: "This is a demo course. Real courses from your database will appear here when backend is connected.",
      progress: 0,
      authorName: "Demo Instructor",
      authorTitle: "Sample Teacher"
    }
  ];

  // Fetch courses from backend
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/video/courses/');
        
        // Transform API data to CourseCard format
        if (response.data && response.data.length > 0) {
          const transformedCourses = response.data.map((course) => ({
            id: course.id,
            image: course.thumbnail_url || courseCardImage,
            title: course.title,
            duration: course.total_duration || `${course.total_lessons || 0} lessons`,
            rating: parseFloat(course.rating) || 0,
            description: course.description || '',
            progress: course.progress_percentage || 0,
            authorName: course.instructor_name || 'Instructor',
            authorTitle: course.instructor_title || ''
          }));
          
          setCourses(transformedCourses);
          setUsingFallback(false);
          setError(null);
        } else {
          // No courses in DB, use dummy data
          setCourses(dummyCourses);
          setUsingFallback(true);
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
        console.log('Using fallback dummy data instead');
        setCourses(dummyCourses);
        setUsingFallback(true);
        setError(null); // Don't show error, just use fallback
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const onCourseClick = (courseId) => {
    if (!courseId) return;
    navigate(`/course/${courseId}`);
  };

  const handleScroll = (ref, direction) => {
    if (ref.current) {
      // Scroll by the visible container width so on small screens
      // each click advances exactly one card (which takes full width).
      const containerWidth = ref.current.clientWidth || ref.current.offsetWidth || 360;
      const scrollAmount = containerWidth;
      ref.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  // Filter courses by search term (case-insensitive)
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestionsVisible, setSuggestionsVisible] = useState(false);
  const inputRef = useRef(null);
  const [suggestionPos, setSuggestionPos] = useState({ top: 0, left: 0, width: 0 });

  const filteredCourses = searchTerm.trim()
    ? courses.filter((c) => c.title.toLowerCase().includes(searchTerm.toLowerCase()))
    : courses;

  const suggestionList = searchTerm.trim()
    ? courses
        .map((c) => c.title)
        .filter((t) => t.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter((v, i, a) => a.indexOf(v) === i)
    : [];

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    setSuggestionsVisible(!!val.trim());
    // update portal position when input changes
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setSuggestionPos({ top: rect.bottom, left: rect.left, width: rect.width });
    }
  };

  const handleSuggestionClick = (value) => {
    setSearchTerm(value);
    setSuggestionsVisible(false);
  };

  const handleInputBlur = () => {
    // small timeout so click on suggestion registers
    setTimeout(() => setSuggestionsVisible(false), 150);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSuggestionsVisible(false);
    if (inputRef.current) inputRef.current.focus();
  };

  const updateSuggestionPos = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setSuggestionPos({ top: rect.bottom, left: rect.left, width: rect.width });
    }
  };

  useEffect(() => {
    if (!suggestionsVisible) return;
    updateSuggestionPos();
    window.addEventListener('resize', updateSuggestionPos);
    window.addEventListener('scroll', updateSuggestionPos, true);
    return () => {
      window.removeEventListener('resize', updateSuggestionPos);
      window.removeEventListener('scroll', updateSuggestionPos, true);
    };
  }, [suggestionsVisible]);

  return (
    <div className="explore-page">
      {/* Main Content */}
      <div className="learning-page-content">
        <div className="learning-page-header explore-page-header">
          <h1 className="learning-page-title">Explore</h1>
          <div className="explore-search">
            <input 
              ref={inputRef}
              type="text" 
              placeholder="Find" 
              className="explore-search-input"
              value={searchTerm}
              onChange={handleInputChange}
              onFocus={() => { setSuggestionsVisible(!!searchTerm.trim()); updateSuggestionPos(); }}
              onBlur={handleInputBlur}
            />
            {searchTerm && (
              <button
                type="button"
                aria-label="Clear search"
                className="search-clear-btn"
                onMouseDown={(e) => { e.preventDefault(); clearSearch(); }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
            {suggestionsVisible && suggestionList.length > 0 && inputRef.current && createPortal(
              <ul
                className="search-suggestions"
                style={{
                  position: 'fixed',
                  top: `${suggestionPos.top}px`,
                  left: `${suggestionPos.left}px`,
                  width: suggestionPos.width,
                  zIndex: 2147483647
                }}
              >
                {suggestionList.map((s, i) => (
                  <li key={i} onMouseDown={() => handleSuggestionClick(s)} className="suggestion-item">{s}</li>
                ))}
              </ul>,
              document.body
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-tertiary)' }}>
            <p>Loading courses...</p>
          </div>
        )}

        {/* Fallback Notice */}
        {usingFallback && !loading && (
          <div style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '8px',
            padding: '12px 16px',
            margin: '0 20px 24px',
            color: '#856404',
            fontSize: '14px'
          }}>
            📌 Showing demo courses. Real courses from your database will appear after starting the backend server.
          </div>
        )}

        {/* Course Sections */}
        {loading ? (
          <ExplorePageSkeleton />
        ) : (
        <div className="explore-sections">
          {searchTerm.trim() ? (
            <div className="explore-section">
              <h2 className="section-title">Search Results</h2>
              <div className="section-container">
                {filteredCourses.length > 0 ? (
                  <>
                    <button className="arrow-btn arrow-left" onClick={() => handleScroll(scrollRef1, 'left')}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <div className="courses-scroll-container" ref={scrollRef1}>
                      <div className="courses-row">
                        {filteredCourses.map((course, index) => (
                          <div key={`search-${index}`} style={{ position: 'relative', opacity: course.id ? 1 : 0.85 }}>
                            <CourseCard {...course} />
                            {!course.id && (
                              <div style={{
                                position: 'absolute',
                                top: '12px',
                                right: '12px',
                                backgroundColor: '#ffc107',
                                color: '#000',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                zIndex: 10
                              }}>
                                DEMO
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <button className="arrow-btn arrow-right" onClick={() => handleScroll(scrollRef1, 'right')}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </>
                ) : (
                  <div className="no-results">No result found</div>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Section 1 */}
              <div className="explore-section">
                <h2 className="section-title">Latest</h2>
                <div className="section-container">
                  <button className="arrow-btn arrow-left" onClick={() => handleScroll(scrollRef1, 'left')}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <div className="courses-scroll-container" ref={scrollRef1}>
                    <div className="courses-row">
                      {courses.map((course, index) => (
                        <div key={`latest-${index}`} style={{ position: 'relative', opacity: course.id ? 1 : 0.85 }}>
                          <CourseCard {...course} onCourseClick={course.id ? onCourseClick : undefined} />
                          {!course.id && (
                            <div style={{
                              position: 'absolute',
                              top: '12px',
                              right: '12px',
                              backgroundColor: '#ffc107',
                              color: '#000',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              zIndex: 10
                            }}>
                              DEMO
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <button className="arrow-btn arrow-right" onClick={() => handleScroll(scrollRef1, 'right')}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Section 2 */}
              <div className="explore-section">
                <h2 className="section-title">Latest</h2>
                <div className="section-container">
                  <button className="arrow-btn arrow-left" onClick={() => handleScroll(scrollRef2, 'left')}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <div className="courses-scroll-container" ref={scrollRef2}>
                    <div className="courses-row">
                      {courses.map((course, index) => (
                        <div key={`section2-${index}`} style={{ position: 'relative', opacity: course.id ? 1 : 0.85 }}>
                          <CourseCard {...course} onCourseClick={course.id ? onCourseClick : undefined} />
                          {!course.id && (
                            <div style={{
                              position: 'absolute',
                              top: '12px',
                              right: '12px',
                              backgroundColor: '#ffc107',
                              color: '#000',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              zIndex: 10
                            }}>
                              DEMO
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <button className="arrow-btn arrow-right" onClick={() => handleScroll(scrollRef2, 'right')}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Section 3 */}
              <div className="explore-section">
                <h2 className="section-title">Latest</h2>
                <div className="section-container">
                  <button className="arrow-btn arrow-left" onClick={() => handleScroll(scrollRef3, 'left')}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <div className="courses-scroll-container" ref={scrollRef3}>
                    <div className="courses-row">
                      {courses.map((course, index) => (
                        <div key={`section3-${index}`} style={{ position: 'relative', opacity: course.id ? 1 : 0.85 }}>
                          <CourseCard {...course} onCourseClick={course.id ? onCourseClick : undefined} />
                          {!course.id && (
                            <div style={{
                              position: 'absolute',
                              top: '12px',
                              right: '12px',
                              backgroundColor: '#ffc107',
                              color: '#000',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              zIndex: 10
                            }}>
                              DEMO
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <button className="arrow-btn arrow-right" onClick={() => handleScroll(scrollRef3, 'right')}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Section 4 */}
              <div className="explore-section">
                <h2 className="section-title">Latest</h2>
                <div className="section-container">
                  <button className="arrow-btn arrow-left" onClick={() => handleScroll(scrollRef4, 'left')}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <div className="courses-scroll-container" ref={scrollRef4}>
                    <div className="courses-row">
                      {courses.map((course, index) => (
                        <div key={`section4-${index}`} style={{ position: 'relative', opacity: course.id ? 1 : 0.85 }}>
                          <CourseCard {...course} onCourseClick={course.id ? onCourseClick : undefined} />
                          {!course.id && (
                            <div style={{
                              position: 'absolute',
                              top: '12px',
                              right: '12px',
                              backgroundColor: '#ffc107',
                              color: '#000',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              zIndex: 10
                            }}>
                              DEMO
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <button className="arrow-btn arrow-right" onClick={() => handleScroll(scrollRef4, 'right')}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Section 5 */}
              <div className="explore-section">
                <h2 className="section-title">Latest</h2>
                <div className="section-container">
                  <button className="arrow-btn arrow-left" onClick={() => handleScroll(scrollRef5, 'left')}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <div className="courses-scroll-container" ref={scrollRef5}>
                    <div className="courses-row">
                      {courses.map((course, index) => (
                        <div key={`section5-${index}`} style={{ position: 'relative', opacity: course.id ? 1 : 0.85 }}>
                          <CourseCard {...course} onCourseClick={course.id ? onCourseClick : undefined} />
                          {!course.id && (
                            <div style={{
                              position: 'absolute',
                              top: '12px',
                              right: '12px',
                              backgroundColor: '#ffc107',
                              color: '#000',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              zIndex: 10
                            }}>
                              DEMO
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <button className="arrow-btn arrow-right" onClick={() => handleScroll(scrollRef5, 'right')}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Section 6 */}
              <div className="explore-section">
                <h2 className="section-title">Latest</h2>
                <div className="section-container">
                  <button className="arrow-btn arrow-left" onClick={() => handleScroll(scrollRef6, 'left')}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <div className="courses-scroll-container" ref={scrollRef6}>
                    <div className="courses-row">
                      {courses.map((course, index) => (
                        <div key={`section6-${index}`} style={{ position: 'relative', opacity: course.id ? 1 : 0.85 }}>
                          <CourseCard {...course} onCourseClick={course.id ? onCourseClick : undefined} />
                          {!course.id && (
                            <div style={{
                              position: 'absolute',
                              top: '12px',
                              right: '12px',
                              backgroundColor: '#ffc107',
                              color: '#000',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              zIndex: 10
                            }}>
                              DEMO
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <button className="arrow-btn arrow-right" onClick={() => handleScroll(scrollRef6, 'right')}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ExplorePage;
