import React, { useState, useEffect } from 'react';
import './calendar.css';
import SmallFireIcon from '../assets/img/Small.png';
import api from '../api';

const Calendar = ({ onStreakUpdate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activityData, setActivityData] = useState({});
  const [currentStreak, setCurrentStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Fetch daily activity data from backend
  const fetchActivityData = async (month, year) => {
    try {
      setLoading(true);
      const response = await api.get('/api/video/daily-activity/', {
        params: { month: month + 1, year }
      });
      
      setActivityData(response.data.daily_data);
      setCurrentStreak(response.data.current_streak);
      
      // Notify parent component of streak update
      if (onStreakUpdate) {
        onStreakUpdate(response.data.current_streak);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch activity data:', error);
      setLoading(false);
    }
  };
  
  // Fetch data when component mounts or month changes
  useEffect(() => {
    fetchActivityData(currentDate.getMonth(), currentDate.getFullYear());
  }, [currentDate]);
  
  // Navigate to previous month
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };
  
  // Navigate to next month
  const nextMonth = () => {
    const today = new Date();
    const nextMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);
    
    // Don't allow navigation to future months
    if (nextMonthDate <= today) {
      setCurrentDate(nextMonthDate);
    }
  };
  
  // Get days in current month with proper offset
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get first day of month (0 = Sunday, 1 = Monday, etc.)
    const firstDay = new Date(year, month, 1).getDay();
    // Convert Sunday (0) to 7 for our Monday-first calendar
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    
    // Get number of days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Create array with null values for offset, then day numbers
    const days = Array(offset).fill(null);
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };
  
  // Calculate streak ranges (consecutive days with 150+ XP)
  const getStreakRanges = () => {
    const activeDays = Object.keys(activityData)
      .filter(day => activityData[day].meets_streak)
      .map(day => parseInt(day))
      .sort((a, b) => a - b);
    
    if (activeDays.length === 0) return [];
    
    const streakRanges = [];
    let streakStart = activeDays[0];
    let streakEnd = activeDays[0];
    
    for (let i = 1; i < activeDays.length; i++) {
      if (activeDays[i] === activeDays[i - 1] + 1) {
        streakEnd = activeDays[i];
      } else {
        if (streakEnd - streakStart >= 2) {
          streakRanges.push({ start: streakStart, end: streakEnd });
        }
        streakStart = activeDays[i];
        streakEnd = activeDays[i];
      }
    }
    
    if (streakEnd - streakStart >= 2) {
      streakRanges.push({ start: streakStart, end: streakEnd });
    }
    
    return streakRanges;
  };
  
  // Check if day is part of a streak
  const isInStreak = (day) => {
    if (!day || !activityData[day]) return false;
    const streakRanges = getStreakRanges();
    return streakRanges.some(range => day >= range.start && day <= range.end);
  };
  
  // Handle day hover for tooltip
  const handleDayHover = (day, event) => {
    if (day && activityData[day]) {
      setHoveredDay(day);
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltipPosition({ x: rect.left, y: rect.top - 40 });
    }
  };
  
  const handleDayLeave = () => {
    setHoveredDay(null);
  };
  
  // Check if we can navigate to next month
  const canNavigateNext = () => {
    const today = new Date();
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);
    return nextMonth <= new Date(today.getFullYear(), today.getMonth(), 1);
  };
  
  const currentMonthLabel = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  return (
    <div className="streak-calendar">
      <div className="calendar-header">
        <button 
          className="nav-button" 
          onClick={previousMonth}
          aria-label="Previous month"
        >
          ‹
        </button>
        <div className="month-label">{currentMonthLabel}</div>
        <button 
          className="nav-button" 
          onClick={nextMonth}
          disabled={!canNavigateNext()}
          style={{ opacity: canNavigateNext() ? 1 : 0.3 }}
          aria-label="Next month"
        >
          ›
        </button>
      </div>
      
      {/* Day labels */}
      <div className="day-labels">
        {dayLabels.map(label => (
          <div key={label} className="day-label">
            {label}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="calendar-grid">
        {getDaysInMonth().map((day, index) => (
          <div 
            key={index} 
            className="calendar-day-container"
            onMouseEnter={(e) => handleDayHover(day, e)}
            onMouseLeave={handleDayLeave}
          >
            <div
              className={`calendar-day ${
                day === null 
                  ? 'empty' 
                  : activityData[day]?.has_activity
                  ? 'active'
                  : 'inactive'
              }`}
            >
              {day && activityData[day]?.has_activity && isInStreak(day) && (
                <img 
                  src={SmallFireIcon} 
                  alt="streak" 
                  className="streak-fire-icon" 
                />
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Tooltip */}
      {hoveredDay && activityData[hoveredDay] && (
        <div 
          className="day-tooltip"
          style={{
            position: 'fixed',
            left: tooltipPosition.x + 'px',
            top: tooltipPosition.y + 'px',
          }}
        >
          <div className="tooltip-date">
            {monthNames[currentDate.getMonth()]} {hoveredDay}, {currentDate.getFullYear()}
          </div>
          <div className="tooltip-xp">
            {activityData[hoveredDay].xp} XP earned
          </div>
          {activityData[hoveredDay].meets_streak && (
            <div className="tooltip-streak">🔥 Streak day!</div>
          )}
        </div>
      )}
      
      {loading && (
        <div className="calendar-loading">Loading...</div>
      )}
    </div>
  );
};

export default Calendar;