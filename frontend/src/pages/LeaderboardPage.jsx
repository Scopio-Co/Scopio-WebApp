import React, { useState, useEffect } from 'react';
import './LeaderboardPage.css';
import Footer from '../components/Footer';
import Pagination from '../components/Pagination';
import streakBadge from '../assets/img/streak-badge.svg';
import api from '../api';
import { LeaderboardPageSkeleton } from '../components/skeletons';

const LeaderboardPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isPageLoading, setIsPageLoading] = useState(true);

  function getRowBackground(rank) {
    if (rank === 1) return 'linear-gradient(90deg, rgba(249, 211, 255, 0.30) 8.17%, rgba(148, 26, 255, 0.30) 66.83%, rgba(249, 211, 255, 0.30) 100%)';
    if (rank === 2) return 'linear-gradient(90deg, rgba(192, 225, 255, 0.30) 8.17%, rgba(0, 132, 255, 0.30) 66.83%, rgba(192, 225, 255, 0.30) 100%)';
    if (rank === 3) return 'linear-gradient(90deg, rgba(175, 255, 242, 0.30) 8.17%, rgba(0, 255, 212, 0.30) 66.83%, rgba(175, 255, 242, 0.30) 100%)';
    return 'rgba(255, 255, 255, 0.30)';
  }

  useEffect(() => {
    let isMounted = true;

    const fetchLeaderboard = async () => {
      setIsPageLoading(true);
      try {
        const response = await api.get('/api/video/leaderboard/');
        const rows = Array.isArray(response.data?.results) ? response.data.results : [];

        const mappedRows = rows.map((entry, index) => {
          const rank = entry.rank ?? index + 1;
          return {
            userId: entry.user_id,
            rank,
            name: entry.name || entry.username || 'Unknown User',
            username: entry.username || 'unknown',
            score: Number(entry.total_xp) || 0,
            streak: Number(entry.streak_days) || 0,
            bgColor: getRowBackground(rank)
          };
        });

        if (isMounted) {
          setLeaderboardData(mappedRows);
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
        if (isMounted) {
          setLeaderboardData([]);
        }
      } finally {
        if (isMounted) {
          setIsPageLoading(false);
        }
      }
    };

    fetchLeaderboard();

    return () => {
      isMounted = false;
    };
  }, []);

  // Pagination settings
  const itemsPerPage = 10;

  // Filter leaderboard by search term (case-insensitive name search)
  const filteredLeaderboard = searchTerm.trim()
    ? leaderboardData.filter(
        (entry) =>
          entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : leaderboardData;

  // Calculate pagination
  const totalPages = Math.ceil(filteredLeaderboard.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLeaderboard = filteredLeaderboard.slice(startIndex, endIndex);

  const clearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const showLoading = typeof isLoading === 'boolean' ? isLoading : isPageLoading;

  const getRankBadgeColor = (rank) => {
    if (rank === 1) return 'radial-gradient(45.28% 45.31% at 50.91% 50%, rgba(200, 0, 255, 0.66) 0%, rgba(243, 201, 255, 0.66) 100%)';
    if (rank === 2) return 'radial-gradient(45.28% 45.31% at 50.91% 50%, rgba(68, 0, 255, 0.66) 0%, rgba(202, 201, 255, 0.66) 100%)';
    if (rank === 3) return 'radial-gradient(45.28% 45.31% at 50.91% 50%, rgba(173, 0, 58, 0.66) 0%, rgba(255, 201, 201, 0.66) 100%)';
    return 'radial-gradient(45.28% 45.31% at 50.91% 50%, rgba(243, 201, 255, 0.66) 100%)';
  };

  return (
    <div className="explore-page">
      <div className="learning-page-content">
        {/* Header */}
        <div className="learning-page-header explore-page-header">
          <h1 className="learning-page-title">Leaderboard</h1>
          <div className="explore-search">
            <input 
              type="text" 
              placeholder="Find" 
              className="explore-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                aria-label="Clear search"
                className="search-clear-btn"
                onClick={clearSearch}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="explore-sections">

        {isLoading ? (
          <LeaderboardPageSkeleton />
        ) : (
          <div className="leaderboard-table-container">
            <table className="leaderboard-table">
              <thead>
                <tr className="table-header-row">
                  <th className="header-rank">Rank</th>
                  <th className="header-learner">Learner</th>
                  <th className="header-score">Score</th>
                  <th className="header-streak">Streak</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLeaderboard.map((entry, index) => (
                  <tr 
                    key={entry.userId || index} 
                    className="leaderboard-row"
                    style={{ background: entry.bgColor }}
                  >
                    <td className="rank-cell">
                      <div 
                        className="rank-badge"
                        style={{ 
                          background: getRankBadgeColor(entry.rank),
                          border: entry.rank ? '2px solid rgba(255, 255, 255, 0.72)' : 'none'
                        }}
                      >
                        {entry.rank}
                      </div>
                    </td>
                    <td className="learner-cell">
                      <div className="learner-info">
                        <div className="learner-avatar"></div>
                        <div className="learner-details">
                          <div className="learner-name">{entry.name}</div>
                          <div className="learner-username">{entry.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="score-cell">
                      <div className="score-badge">{entry.score}</div>
                    </td>
                    <td className="streak-cell">
                      <div className="streak-badge">
                        <img src={streakBadge} alt="Streak Icon" />
                        <span className="streak-number">{entry.streak}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </div>

        {/* Pagination */}
        <div className="leaderboard-pagination">
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={handlePageChange} 
          />
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LeaderboardPage;
