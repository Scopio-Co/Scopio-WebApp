import React, { useState, useEffect, useRef } from 'react';
import './calendar.css';
import StreakBadge from '../assets/img/streak-badge.svg';
import api from '../api';

const Calendar = ({ onStreakUpdate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activityData, setActivityData] = useState({});
  const [currentStreak, setCurrentStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const latestRequestRef = useRef(0);
  
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Fetch daily activity data from backend
  const fetchActivityData = async (month, year) => {
    const requestId = latestRequestRef.current + 1;
    latestRequestRef.current = requestId;

    try {
      setLoading(true);
      setHoveredDay(null);

      const response = await api.get('/video/daily-activity/', {
        params: { month: month + 1, year }
      });

      if (latestRequestRef.current !== requestId) {
        return;
      }
      
      setActivityData(response.data.daily_data || {});
      setCurrentStreak(response.data.current_streak || 0);
      
      // Notify parent component of streak update
      if (onStreakUpdate) {
        onStreakUpdate(response.data.current_streak || 0);
      }
    } catch (error) {
      if (latestRequestRef.current !== requestId) {
        return;
      }

      console.error('Failed to fetch activity data:', error);
      setActivityData({});
      setCurrentStreak(0);
      if (onStreakUpdate) {
        onStreakUpdate(0);
      }
    } finally {
      if (latestRequestRef.current === requestId) {
        setLoading(false);
      }
    }
  };
  
  // Fetch data when component mounts or month changes
  useEffect(() => {
    fetchActivityData(currentDate.getMonth(), currentDate.getFullYear());
  }, [currentDate]);
  
  // Navigate to previous month
  const previousMonth = () => {
    if (loading) {
      return;
    }

    setLoading(true);
    setHoveredDay(null);
    setCurrentDate((previousDate) => new Date(previousDate.getFullYear(), previousDate.getMonth() - 1, 1));
  };
  
  // Navigate to next month
  const nextMonth = () => {
    if (loading) {
      return;
    }

    const today = new Date();
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const nextMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);

    if (nextMonthDate > currentMonthStart) {
      return;
    }

    setLoading(true);
    setHoveredDay(null);
    setCurrentDate(nextMonthDate);
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
  
  const getStreakSegmentClass = (day, index, days) => {
    if (!day || !activityData[day]?.meets_streak) {
      return '';
    }

    const currentRow = Math.floor(index / 7);
    const previousDay = days[index - 1];
    const nextDay = days[index + 1];

    const hasPreviousStreakDay =
      previousDay === day - 1 &&
      Math.floor((index - 1) / 7) === currentRow &&
      activityData[previousDay]?.meets_streak;

    const hasNextStreakDay =
      nextDay === day + 1 &&
      Math.floor((index + 1) / 7) === currentRow &&
      activityData[nextDay]?.meets_streak;

    if (hasPreviousStreakDay && hasNextStreakDay) {
      return 'streak-middle';
    }

    if (hasPreviousStreakDay) {
      return 'streak-end';
    }

    if (hasNextStreakDay) {
      return 'streak-start';
    }

    return 'streak-single';
  };
  
  // Handle day hover for tooltip
  const handleDayHover = (day, event) => {
    if (day && activityData[day]) {
      setHoveredDay(day);
      const rect = event.currentTarget.getBoundingClientRect();
      const tooltipWidth = 140; // Approximate tooltip width
      setTooltipPosition({ 
        x: rect.left + (rect.width / 2) - (tooltipWidth / 2), 
        y: rect.top - 80 
      });
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
  const daysInMonth = getDaysInMonth();

  return (
    <div className="streak-calendar">
      <div className="calendar-header">
        <button 
          className="nav-button" 
          onClick={previousMonth}
          disabled={loading}
          style={{ opacity: loading ? 0.5 : 1 }}
          aria-label="Previous month"
        >
          ‹
        </button>
        <div className="month-label">{currentMonthLabel}</div>
        <button 
          className="nav-button" 
          onClick={nextMonth}
          disabled={loading || !canNavigateNext()}
          style={{ opacity: loading ? 0.5 : canNavigateNext() ? 1 : 0.3 }}
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
        {daysInMonth.map((day, index) => {
          const streakSegmentClass = loading ? '' : getStreakSegmentClass(day, index, daysInMonth);
          const hasStreakProgress = !loading && !!day && !!activityData[day]?.meets_streak;

          return (
            <div 
              key={index} 
              className={`calendar-day-container${loading ? ' loading' : ''}${streakSegmentClass ? ` ${streakSegmentClass}` : ''}${hasStreakProgress ? ' has-streak-progress' : ''}`}
              onMouseEnter={loading ? undefined : (e) => handleDayHover(day, e)}
              onMouseLeave={loading ? undefined : handleDayLeave}
            >
              {day === null ? (
                <div className="calendar-day empty"></div>
              ) : loading ? (
                <div className="calendar-day loading" aria-hidden="true"></div>
              ) : activityData[day]?.has_activity ? (
                <div className={`calendar-day active${activityData[day]?.meets_streak ? ' streak-day' : ''}`}>
                  <img 
                    src={StreakBadge} 
                    alt="streak" 
                    className="streak-fire-icon" 
                  />
                </div>
              ) : (
                <div className="calendar-day inactive"></div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Tooltip */}
      {!loading && hoveredDay && activityData[hoveredDay] && (
        <div 
          className="day-tooltip"
          style={{
            position: 'fixed',
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
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
    </div>
  );
};

export default Calendar;