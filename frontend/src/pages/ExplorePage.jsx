import React, { useRef } from 'react';
import './ExplorePage.css';
import CourseCard from '../components/CourseCard';
import Footer from '../components/Footer';
import defaultCourseImage from '../assets/img/course card.jpg';

const ExplorePage = () => {
  const scrollRef1 = useRef(null);
  const scrollRef2 = useRef(null);
  const scrollRef3 = useRef(null);
  const scrollRef4 = useRef(null);
  const scrollRef5 = useRef(null);
  const scrollRef6 = useRef(null);

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
      image: defaultCourseImage,
      title: "Mangal Sutra - Introduction to run longer",
      duration: "5 hours, 48 minutes",
      rating: 4.7,
      description: "Robust training of how to run longer with your mangal sutra. Complete beginners guide to cover long distances within limited stamina.",
      progress: 75,
      authorName: "Ashva Rishemh",
      authorTitle: "Lover @Kanyakumari"
    },
    {
      image: defaultCourseImage,
      title: "Mangal Sutra - Introduction to run longer",
      duration: "5 hours, 48 minutes",
      rating: 4.5,
      description: "Robust training of how to run longer with your mangal sutra. Complete beginners guide to cover long distances.",
      progress: 60,
      authorName: "Ashva Rishemh",
      authorTitle: "Lover @Kanyakumari"
    },
    {
      image: defaultCourseImage,
      title: "Mangal Sutra - Introduction to run longer",
      duration: "5 hours, 48 minutes",
      rating: 4.8,
      description: "Robust training of how to run longer with your mangal sutra. Complete beginners guide.",
      progress: 90,
      authorName: "Ashva Rishemh",
      authorTitle: "Lover @Kanyakumari"
    },
    {
      image: defaultCourseImage,
      title: "Mangal Sutra - Introduction to run longer",
      duration: "5 hours, 48 minutes",
      rating: 4.6,
      description: "Robust training of how to run longer with your mangal sutra.",
      progress: 45,
      authorName: "Ashva Rishemh",
      authorTitle: "Lover @Kanyakumari"
    },
    {
      image: defaultCourseImage,
      title: "Mangal Sutra - Introduction to run longer",
      duration: "5 hours, 48 minutes",
      rating: 4.9,
      description: "Robust training of how to run longer with your mangal sutra. Complete beginners guide to cover long distances.",
      progress: 80,
      authorName: "Ashva Rishemh",
      authorTitle: "Lover @Kanyakumari"
    },
    {
      image: defaultCourseImage,
      title: "Mangal Sutra - Introduction to run longer",
      duration: "5 hours, 48 minutes",
      rating: 4.4,
      description: "Robust training of how to run longer with your mangal sutra.",
      progress: 55,
      authorName: "Ashva Rishemh",
      authorTitle: "Lover @Kanyakumari"
    }
  ];

  return (
    <div className="explore-page">
      {/* Main Content */}
      <div className="explore-page-content">
        <div className="explore-page-header">
          <h1 className="explore-page-title">Explore</h1>
          <div className="explore-search">
            <input 
              type="text" 
              placeholder="Find" 
              className="explore-search-input"
            />
          </div>
        </div>

        {/* Course Sections */}
        <div className="explore-sections">
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
                    <CourseCard
                      key={`latest-${index}`}
                      image={course.image}
                      title={course.title}
                      duration={course.duration}
                      rating={course.rating}
                      description={course.description}
                      progress={course.progress}
                      authorName={course.authorName}
                      authorTitle={course.authorTitle}
                    />
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
                    <CourseCard
                      key={`section2-${index}`}
                      image={course.image}
                      title={course.title}
                      duration={course.duration}
                      rating={course.rating}
                      description={course.description}
                      progress={course.progress}
                      authorName={course.authorName}
                      authorTitle={course.authorTitle}
                    />
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
                    <CourseCard
                      key={`section3-${index}`}
                      image={course.image}
                      title={course.title}
                      duration={course.duration}
                      rating={course.rating}
                      description={course.description}
                      progress={course.progress}
                      authorName={course.authorName}
                      authorTitle={course.authorTitle}
                    />
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
                    <CourseCard
                      key={`section4-${index}`}
                      image={course.image}
                      title={course.title}
                      duration={course.duration}
                      rating={course.rating}
                      description={course.description}
                      progress={course.progress}
                      authorName={course.authorName}
                      authorTitle={course.authorTitle}
                    />
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
                    <CourseCard
                      key={`section5-${index}`}
                      image={course.image}
                      title={course.title}
                      duration={course.duration}
                      rating={course.rating}
                      description={course.description}
                      progress={course.progress}
                      authorName={course.authorName}
                      authorTitle={course.authorTitle}
                    />
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
                    <CourseCard
                      key={`section6-${index}`}
                      image={course.image}
                      title={course.title}
                      duration={course.duration}
                      rating={course.rating}
                      description={course.description}
                      progress={course.progress}
                      authorName={course.authorName}
                      authorTitle={course.authorTitle}
                    />
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
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ExplorePage;
