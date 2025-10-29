import React, { useState } from 'react';
import './calendar.css';
import SmallFireIcon from '../assets/img/Small.png';

const calendar = () => {
  const [currentMonth, setCurrentMonth] = useState('JAN 2025');
  
  // Sample activity data - days with activity (1-31)
  const activityDays = [5, 6, 12,13,14,15, 19, 20, 27, 28, 29, 30, 31];
  
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const getDaysInMonth = () => {
    return Array.from({ length: 31 }, (_, i) => i + 1);
  };
  
  const getStreakRanges = () => {
  if (activityDays.length === 0) return [];
  
  const sortedDays = [...activityDays].sort((a, b) => a - b);
  const streakRanges = [];
  let streakStart = sortedDays[0];
  let streakEnd = sortedDays[0];
  
  for (let i = 1; i < sortedDays.length; i++) {
    if (sortedDays[i] === sortedDays[i - 1] + 1) {
      // Continue the streak
      streakEnd = sortedDays[i];
    } else {
      // Streak broken, save if it's 3+ days
      if (streakEnd - streakStart >= 2) {
        streakRanges.push({ start: streakStart, end: streakEnd });
      }
      streakStart = sortedDays[i];
      streakEnd = sortedDays[i];
    }
  }
  
  // Don't forget the last streak
  if (streakEnd - streakStart >= 2) {
    streakRanges.push({ start: streakStart, end: streakEnd });
  }
  
  return streakRanges;
};

const isInStreak = (day) => {
  const streakRanges = getStreakRanges();
  return streakRanges.some(range => day >= range.start && day <= range.end);
};

  return (
    <div className="streak-calendar">
      <div className="calendar-header">
        <button className="nav-button">‹</button>
        <div className="month-label">{currentMonth}</div>
        <button className="nav-button">›</button>
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
    <div key={index} className="calendar-day-container">
        <div
            className={`calendar-day ${
            day === null 
                ? 'empty' 
                : activityDays.includes(day) 
                ? 'active' 
                : 'inactive'
            }`}
        >
        {day && activityDays.includes(day) && isInStreak(day) && (
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
    </div>
  );
};

export default calendar;