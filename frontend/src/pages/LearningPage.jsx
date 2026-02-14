import React from 'react';
import './LearningPage.css';
import Footer from '../components/Footer';
import Pagination from '../components/Pagination';
import RatingComponent from '../components/RatingComponent';
import heroCardImg from '../assets/img/Hero Card img.png';

const LearningPage = ({ onLogout, onCourseClick, isLoading }) => {
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
          <h1 className="learning-page-title">Learning</h1>
          <div className="learning-page-sort">
            <button className="sort-button">Sort <svg xmlns="http://www.w3.org/2000/svg" width="14" height="12" viewBox="0 0 16 16" fill="none">
  <path d="M4.14225 13.8296V0H3.01725V13.8296L0.795375 11.6077L0 12.4031L3.18206 15.5852C3.28755 15.6906 3.4306 15.7499 3.57975 15.7499C3.7289 15.7499 3.87195 15.6906 3.97744 15.5852L7.1595 12.4031L6.36413 11.6077L4.14225 13.8296ZM15.0345 3.34687L11.8524 0.164812C11.747 0.05936 11.6039 0.000120163 11.4548 0.000120163C11.3056 0.000120163 11.1625 0.05936 11.0571 0.164812L7.875 3.34687L8.67037 4.14225L10.8923 1.92037V15.75H12.0173V1.92037L14.2391 4.14225L15.0345 3.34687Z"/>
</svg></button>
          </div>
        </div>

        {/* Learning Design Content */}
        <div className="learning-design-container">
          <div className="course-grid">
            {/* Course Card 1 */}
            <div className="course-card" onClick={onCourseClick} style={{ cursor: onCourseClick ? 'pointer' : 'default' }}>
              <div className="course-image-card">
                <img src={heroCardImg} alt="Course Image" className="course-img" />
                <div className="continue-button-wrapper">
                    <button className="continue-btn">Continue</button>
                </div>
              </div>
              <div className="course-info">
                <h3 className="course-title">America is natives' again</h3>
                <div className="course-progress">
                  <span className="progress-text">95% Completed</span>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: getProgressPercentage('95% Completed')}}></div>
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
                      <span className="author-name">Donald J Trump</span>
                      <span className="author-title">Web Dev @capestart</span>
                    </div>
                  </div>
                  <RatingComponent rating={5} />
                </div>
              </div>
            </div>

            {/* Course Card 2 */}
            <div className="course-card" onClick={onCourseClick} style={{ cursor: onCourseClick ? 'pointer' : 'default' }}>
              <div className="course-image-card">
                <img src={heroCardImg} alt="Course Image" className="course-img" />
                <div className="continue-button-wrapper">
                    <button className="continue-btn">Continue</button>
                </div>
              </div>
              <div className="course-info">
                <h3 className="course-title">America is natives' again</h3>
                <div className="course-progress">
                  <span className="progress-text">60% Completed</span>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: getProgressPercentage('60% Completed')}}></div>
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
                      <span className="author-name">Donald J Trump</span>
                      <span className="author-title">45th US president</span>
                    </div>
                  </div>
                  <RatingComponent rating={4.0} />
                </div>
              </div>
            </div>

            {/* Course Card 3 */}
            <div className="course-card" onClick={onCourseClick} style={{ cursor: onCourseClick ? 'pointer' : 'default' }}>
              <div className="course-image-card">
                <img src={heroCardImg} alt="Course Image" className="course-img" />
                <div className="continue-button-wrapper">
                    <button className="continue-btn">Continue</button>
                </div>
              </div>
              <div className="course-info">
                <h3 className="course-title">America is natives' again</h3>
                <div className="course-progress">
                  <span className="progress-text">25% Completed</span>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: getProgressPercentage('25% Completed')}}></div>
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
                      <span className="author-name">Donald J Trump</span>
                      <span className="author-title">45th US president</span>
                    </div>
                  </div>
                  <RatingComponent rating={3.8} />
                </div>
              </div>
            </div>

            {/* Course Card 4 */}
            <div className="course-card" onClick={onCourseClick} style={{ cursor: onCourseClick ? 'pointer' : 'default' }}>
              <div className="course-image-card">
                <img src={heroCardImg} alt="Course Image" className="course-img" />
                <div className="continue-button-wrapper">
                    <button className="continue-btn">Continue</button>
                </div>
              </div>
              <div className="course-info">
                <h3 className="course-title">America is natives' again</h3>
                <div className="course-progress">
                  <span className="progress-text">45% Completed</span>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: getProgressPercentage('45% Completed')}}></div>
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
                      <span className="author-name">Donald J Trump</span>
                      <span className="author-title">45th US president</span>
                    </div>
                  </div>
                  <RatingComponent rating={4.5} />
                </div>
              </div>
            </div>
          </div>

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
