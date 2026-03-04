import React, { useRef } from 'react';
import HeroCard from './HeroCard';
import './HeroSlider.css';
import heroImage from '../assets/img/Hero Card img.png';

const HeroSlider = () => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    const { current } = scrollRef;
    if (direction === 'left') {
      current.scrollBy({ left: -600, behavior: 'smooth' });
    } else {
      current.scrollBy({ left: 600, behavior: 'smooth' });
    }
  };

  const cardsData = [
    {
      title: "Kick Like Benz",
      description:
        "The 34-year-old Carlsen made the revelation on X as he shared the screenshots of his conversation with ChatGPT. He captioned the post: \"I sometimes get bored while travelling.\" In the first screenshot, ChatGPT can be seen conceding defeat as it surrendered to Carlsen with the message: \"All my pawns are gone. You haven't lost a single piece. You fulfilled your win condition perfectly... As agreed, I resign.\"",
      rating: 4.6,
      maxRating: 5,
      image: heroImage,
    },
    {
      title: "Advanced React Development",
      description:
        "Master the latest React features and build scalable applications with hooks, context, and modern patterns. Learn from industry experts and work on real-world projects that will enhance your portfolio and prepare you for senior developer roles.",
      rating: 3,
      maxRating: 5,
      image: heroImage,
    },
    {
      title: "Python Data Science Mastery",
      description:
        "Dive deep into data analysis, visualization, and machine learning with Python. Learn pandas, numpy, matplotlib, and scikit-learn to become a data science expert. Work on real datasets and build predictive models.",
      rating: 4.3,
      maxRating: 5,
      image: heroImage,
    },
  ];

  return (
    <div className="hero-slider-container">
      <h2 className="slider-heading">Trending</h2>

      <div className="slider-wrapper">
        <button className="nav-arrow left" onClick={() => scroll('left')}>
          &#10094;
        </button>

        <div className="slider-content" ref={scrollRef}>
          {cardsData.map((card, index) => (
            <div className="slider-item" key={index}>
              <HeroCard {...card} />
            </div>
          ))}
        </div>

        <button className="nav-arrow right" onClick={() => scroll('right')}>
          &#10095;
        </button>
      </div>
    </div>
  );
};

export default HeroSlider;
