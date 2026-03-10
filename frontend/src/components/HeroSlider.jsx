import React, { useEffect, useRef, useState } from 'react';
import HeroCard from './HeroCard';
import './HeroSlider.css';
import api from '../api';
import courseCardImage from '../assets/img/course_card.webp';
import { HeroSliderSkeleton } from './skeletons';

const HeroSlider = () => {
  const scrollRef = useRef(null);
  const [topCourses, setTopCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopReviewedCourses = async () => {
      setLoading(true);
      try {
        const response = await api.get('/video/courses/');
        const courseList = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.results)
            ? response.data.results
            : [];

        if (!courseList.length) {
          setTopCourses([]);
          setLoading(false);
          return;
        }

        // Fetch each course detail to get accurate per-course review stats
        // (average_rating + total_ratings), then rank top 3.
        const detailResponses = await Promise.allSettled(
          courseList.map((course) => api.get(`/video/courses/${course.id}/`))
        );

        const detailedCourses = detailResponses
          .map((result, index) => {
            const fallbackCourse = courseList[index] || {};
            const detail = result.status === 'fulfilled' ? (result.value?.data || {}) : {};

            return {
              id: detail.id || fallbackCourse.id,
              title: detail.title || fallbackCourse.title,
              description: detail.description || fallbackCourse.description,
              thumbnail_url: detail.thumbnail_url || fallbackCourse.thumbnail_url,
              average_rating: Number(detail.average_rating || detail.rating || fallbackCourse.rating || 0),
              total_ratings: Number(detail.total_ratings || 0),
            };
          })
          .filter((course) => !!course.id);

        const ranked = detailedCourses
          .sort((a, b) => {
            const aReviews = Number(a?.total_ratings || 0);
            const bReviews = Number(b?.total_ratings || 0);
            if (bReviews !== aReviews) return bReviews - aReviews;

            const aAvg = Number(a?.average_rating || 0);
            const bAvg = Number(b?.average_rating || 0);
            return bAvg - aAvg;
          })
          .slice(0, 3)
          .map((course) => ({
            courseId: course.id,
            title: course.title || 'Untitled course',
            description: course.description || 'No description available.',
            rating: Number(course.average_rating || 0),
            image: course.thumbnail_url || courseCardImage,
          }));

        setTopCourses(ranked);
      } catch (error) {
        console.error('Failed to fetch top reviewed courses:', error);
        setTopCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopReviewedCourses();
  }, []);

  const scroll = (direction) => {
    const { current } = scrollRef;
    if (!current) return;

    if (direction === 'left') {
      current.scrollBy({ left: -300, behavior: 'smooth' });
    } else {
      current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  
  return (
    <div className="hero-slider-container">
      <h2 className="slider-heading">Trending</h2>

      <div className="slider-wrapper">
        <button className="nav-arrow left" onClick={() => scroll('left')}>
          &#10094;
        </button>

        <div className="slider-content" ref={scrollRef}>
          {loading ? (
            <HeroSliderSkeleton count={3} />
          ) : topCourses.length > 0 ? (
            topCourses.map((course) => (
              <div className="slider-item" key={course.courseId}>
                <HeroCard {...course} />
              </div>
            ))
          ) : (
            <div className="slider-item">
              <HeroCard />
            </div>
          )}
        </div>

        <button className="nav-arrow right" onClick={() => scroll('right')}>
          &#10095;
        </button>
      </div>
    </div>
  );
};

export default HeroSlider;
