import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './ExplorePage.css';
import CourseCard from '../components/CourseCard';
import Footer from '../components/Footer';
import courseCardImage from '../assets/img/course_card.webp';
import { ExplorePageSkeleton } from '../components/skeletons';

const ExplorePage = ({ onCourseClick }) => {
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef1 = useRef(null);
  const scrollRef2 = useRef(null);
  const scrollRef3 = useRef(null);
  const scrollRef4 = useRef(null);
  const scrollRef5 = useRef(null);
  const scrollRef6 = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Scroll to top after state update
      setTimeout(() => {
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
          mainContent.scrollTop = 0;
        }
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 0);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleScroll = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = 400;
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const courses = [
    {
      image: courseCardImage,
      imageFilter: 'hue-rotate(-10deg) saturate(115%)',
      title: "Mangal Sutra - Introduction to run longer",
      duration: "5 hours, 48 minutes",
      rating: 4.7,
      description: "Robust training of how to run longer with your mangal sutra. Complete beginners guide to cover long distances within limited stamina.",
      progress: 75,
      authorName: "Ashva Rishenth",
      authorTitle: "Lover @Kanyakumari"
    },
    {
      image: courseCardImage,
      imageFilter: 'hue-rotate(25deg) saturate(120%)',
      title: "CSS - Basics to Advanced",
      duration: "5 hours, 48 minutes",
      rating: 4.5,
      description: "Robust training of how to run longer with your mangal sutra. Complete beginners guide to cover long distances.",
      progress: 60,
      authorName: "Ashva Rishenth",
      authorTitle: "Lover @Kanyakumari"
    },
    {
      image: courseCardImage,
      imageFilter: 'hue-rotate(60deg) saturate(118%) brightness(1.05)',
      title: "JavaScript - From Zero to Hero",
      duration: "5 hours, 48 minutes",
      rating: 4.8,
      description: "Robust training of how to run longer with your mangal sutra. Complete beginners guide.",
      progress: 90,
      authorName: "Ashva Rishenth",
      authorTitle: "Lover @Kanyakumari"
    },
    {
      image: courseCardImage,
      imageFilter: 'hue-rotate(120deg) saturate(110%)',
      title: "React - Building Interactive UIs",
      duration: "5 hours, 48 minutes",
      rating: 4.6,
      description: "Robust training of how to run longer with your mangal sutra.",
      progress: 45,
      authorName: "Ashva Rishenth",
      authorTitle: "Lover @Kanyakumari"
    },
    {
      image: courseCardImage,
      imageFilter: 'hue-rotate(180deg) saturate(115%) brightness(0.95)',
      title: "Backend Development with Node.js",
      duration: "5 hours, 48 minutes",
      rating: 4.9,
      description: "Robust training of how to run longer with your mangal sutra. Complete beginners guide to cover long distances.",
      progress: 80,
      authorName: "Ashva Rishenth",
      authorTitle: "Lover @Kanyakumari"
    },
    {
      image: courseCardImage,
      imageFilter: 'hue-rotate(230deg) saturate(120%)',
      title: "Introduction to Database Management",
      duration: "5 hours, 48 minutes",
      rating: 4.4,
      description: "Robust training of how to run longer with your mangal sutra.",
      progress: 55,
      authorName: "Ashva Rishenth",
      authorTitle: "Lover @Kanyakumari"
    }
  ];

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

        {/* Course Sections */}
        {isLoading ? (
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
                          <CourseCard key={`search-${index}`} {...course} onCourseClick={onCourseClick} />
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
                        <CourseCard key={`latest-${index}`} {...course} onCourseClick={onCourseClick} />
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
                        <CourseCard key={`section2-${index}`} {...course} onCourseClick={onCourseClick} />
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
                        <CourseCard key={`section3-${index}`} {...course} onCourseClick={onCourseClick} />
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
                        <CourseCard key={`section4-${index}`} {...course} onCourseClick={onCourseClick} />
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
                        <CourseCard key={`section5-${index}`} {...course} onCourseClick={onCourseClick} />
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
                        <CourseCard key={`section6-${index}`} {...course} onCourseClick={onCourseClick} />
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
