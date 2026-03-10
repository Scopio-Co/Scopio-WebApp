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

  // State for courses from API
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [arrowState, setArrowState] = useState({
    section1: { left: false, right: false },
    section2: { left: false, right: false },
    section3: { left: false, right: false },
  });

  // Fetch courses from backend
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await api.get('/video/courses/');
        
        // Transform API data to CourseCard format
        if (response.data && response.data.length > 0) {
          const transformedCourses = response.data.map((course) => ({
            id: course.id,
            image: course.thumbnail_url || courseCardImage,
            title: course.title,
            duration: course.total_duration || `${course.total_lessons || 0} lessons`,
            // Prefer average_rating when available from list endpoint.
            rating: Number(course.average_rating ?? course.rating ?? 0),
            description: course.description || '',
            progress: course.progress_percentage || 0,
            authorName: course.instructor_name || 'Instructor',
            authorTitle: course.instructor_title || ''
          }));
          
          setCourses(transformedCourses);
          setError(null);

          // Enrich ratings from each course detail endpoint in parallel.
          // This matches LearningPage behavior and fixes stale/zero ratings in Explore info cards.
          try {
            const detailResponses = await Promise.allSettled(
              transformedCourses.map((course) => api.get(`/video/courses/${course.id}/`))
            );

            const coursesWithLiveRatings = transformedCourses.map((course, index) => {
              const detailResult = detailResponses[index];
              if (detailResult?.status !== 'fulfilled') return course;

              const detail = detailResult.value?.data || {};
              const totalRatings = Number(detail.total_ratings ?? 0);
              const averageRating = Number(detail.average_rating ?? detail.rating ?? 0);

              return {
                ...course,
                rating: totalRatings > 0 ? averageRating : 0,
              };
            });

            setCourses(coursesWithLiveRatings);
          } catch (ratingErr) {
            // Keep initial list ratings if enrichment fails.
            console.warn('Could not enrich explore ratings from course details:', ratingErr);
          }
        } else {
          // No courses in DB
          setCourses([]);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
        setCourses([]);
        setError('Unable to load courses. Please try again later.');
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

  const getArrowVisibility = (element) => {
    if (!element) return { left: false, right: false };
    const maxScrollLeft = element.scrollWidth - element.clientWidth;
    if (maxScrollLeft <= 1) return { left: false, right: false };

    return {
      left: element.scrollLeft > 1,
      right: element.scrollLeft < maxScrollLeft - 1,
    };
  };

  const updateArrowState = (sectionKey, ref) => {
    if (!ref.current) return;
    const next = getArrowVisibility(ref.current);
    setArrowState((prev) => ({
      ...prev,
      [sectionKey]: next,
    }));
  };

  const handleScroll = (ref, direction, sectionKey) => {
    if (ref.current) {
      // Scroll by the visible container width so on small screens
      // each click advances exactly one card (which takes full width).
      const containerWidth = ref.current.clientWidth || ref.current.offsetWidth || 360;
      const scrollAmount = containerWidth;
      ref.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
      setTimeout(() => updateArrowState(sectionKey, ref), 280);
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

  const scopioOriginalCourses = courses.filter((course) =>
    String(course.description || '').toUpperCase().includes('SCOPIO(O)')
  );

  const freeCodeCampCourses = courses.filter((course) =>
    String(course.description || '').toUpperCase().includes('FCC')
  );

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

  useEffect(() => {
    const refreshAllArrows = () => {
      updateArrowState('section1', scrollRef1);
      updateArrowState('section2', scrollRef2);
      updateArrowState('section3', scrollRef3);
    };

    const rafId = requestAnimationFrame(refreshAllArrows);
    window.addEventListener('resize', refreshAllArrows);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', refreshAllArrows);
    };
  }, [loading, searchTerm, filteredCourses.length, scopioOriginalCourses.length, freeCodeCampCourses.length]);

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

        
        {/* Course Sections */}
        {loading ? (
          <ExplorePageSkeleton />
        ) : error ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 40px',
            color: '#666'
          }}>
            <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Unable to Load Courses</h2>
            <p style={{ fontSize: '14px', marginBottom: '24px' }}>{error}</p>
            <p style={{ fontSize: '13px', color: '#999' }}>Make sure the backend server is running and try refreshing the page.</p>
          </div>
        ) : courses.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '80px 40px',
            color: '#666'
          }}>
            <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>No Courses Available</h2>
            <p style={{ fontSize: '14px', color: '#999' }}>Check back soon for new courses!</p>
          </div>
        ) : (
        <div className="explore-sections">
          {searchTerm.trim() ? (
            <div className="explore-section">
              <h2 className="section-title">Search Results</h2>
              <div className="section-container">
                {filteredCourses.length > 0 ? (
                  <>
                    {arrowState.section1.left ? (
                      <button className="arrow-btn arrow-left" onClick={() => handleScroll(scrollRef1, 'left', 'section1')}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    ) : null}
                    <div className="courses-scroll-container" ref={scrollRef1} onScroll={() => updateArrowState('section1', scrollRef1)}>
                      <div className="courses-row">
                        {filteredCourses.map((course, index) => (
                          <div className="course-card-cont" key={`search-${index}`}>
                            <CourseCard {...course} />
                          </div>
                        ))}
                      </div>
                    </div>
                    {arrowState.section1.right ? (
                      <button className="arrow-btn arrow-right" onClick={() => handleScroll(scrollRef1, 'right', 'section1')}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    ) : null}
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
                  {arrowState.section1.left ? (
                    <button className="arrow-btn arrow-left" onClick={() => handleScroll(scrollRef1, 'left', 'section1')}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  ) : null}
                  <div className="courses-scroll-container" ref={scrollRef1} onScroll={() => updateArrowState('section1', scrollRef1)}>
                    <div className="courses-row">
                      {courses.map((course, index) => (
                        <div className="course-card-cont" key={`latest-${index}`}>
                          <CourseCard {...course} onCourseClick={onCourseClick} />
                        </div>
                      ))}
                    </div>
                  </div>
                  {arrowState.section1.right ? (
                    <button className="arrow-btn arrow-right" onClick={() => handleScroll(scrollRef1, 'right', 'section1')}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  ) : null}
                </div>
              </div>

              {/* Section 2 */}
              <div className="explore-section">
                <h2 className="section-title">Scopio Originals</h2>
                <div className="section-container">
                  {scopioOriginalCourses.length > 0 ? (
                    <>
                      {arrowState.section2.left ? (
                      <button className="arrow-btn arrow-left" onClick={() => handleScroll(scrollRef2, 'left', 'section2')}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      ) : null}
                      <div className="courses-scroll-container" ref={scrollRef2} onScroll={() => updateArrowState('section2', scrollRef2)}>
                        <div className="courses-row">
                          {scopioOriginalCourses.map((course, index) => (
                            <div className="course-card-cont" key={`section2-${index}`}>
                              <CourseCard {...course} onCourseClick={onCourseClick} />
                            </div>
                          ))}
                        </div>
                      </div>
                      {arrowState.section2.right ? (
                      <button className="arrow-btn arrow-right" onClick={() => handleScroll(scrollRef2, 'right', 'section2')}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      ) : null}
                    </>
                  ) : (
                    <div className="no-results">No Scopio Originals found</div>
                  )}
                </div>
              </div>

              {/* Section 3 */}
              <div className="explore-section">
                <h2 className="section-title">Freecodecamp</h2>
                <div className="section-container">
                  {freeCodeCampCourses.length > 0 ? (
                    <>
                      {arrowState.section3.left ? (
                      <button className="arrow-btn arrow-left" onClick={() => handleScroll(scrollRef3, 'left', 'section3')}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      ) : null}
                      <div className="courses-scroll-container" ref={scrollRef3} onScroll={() => updateArrowState('section3', scrollRef3)}>
                        <div className="courses-row">
                          {freeCodeCampCourses.map((course, index) => (
                            <div className="course-card-cont" key={`section3-${index}`}>
                              <CourseCard {...course} onCourseClick={onCourseClick} />
                            </div>
                          ))}
                        </div>
                      </div>
                      {arrowState.section3.right ? (
                      <button className="arrow-btn arrow-right" onClick={() => handleScroll(scrollRef3, 'right', 'section3')}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      ) : null}
                    </>
                  ) : (
                    <div className="no-results">No Freecodecamp courses found</div>
                  )}
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
