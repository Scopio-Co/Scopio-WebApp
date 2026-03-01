import React, { useState } from 'react';
import './LeaderboardPage.css';
import Footer from '../components/Footer';
import Pagination from '../components/Pagination';
import streakBadge from '../assets/img/streak-badge.svg';
import goldBadge from '../assets/img/Scopio/gold-badge.png';
import silverBadge from '../assets/img/Scopio/silver-badge.png';
import bronzeBadge from '../assets/img/Scopio/bronze-badge.png';

const LeaderboardPage = ({ isLoading }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Sample leaderboard data
  const leaderboardData = [
    {
      rank: 1,
      name: 'Hamdan Hussain',
      username: 'son_of_baheer',
      score: 2459,
      streak: 123,
      bgColor: 'linear-gradient(90deg, rgba(249, 211, 255, 0.30) 8.17%, rgba(148, 26, 255, 0.30) 66.83%, rgba(249, 211, 255, 0.30) 100%)'
    },
    {
      rank: 2,
      name: 'Moun Sando',
      username: 'moun_sando',
      score: 2459,
      streak: 123,
      bgColor: 'linear-gradient(90deg, rgba(192, 225, 255, 0.30) 8.17%, rgba(0, 132, 255, 0.30) 66.83%, rgba(192, 225, 255, 0.30) 100%)'
    },
    {
      rank: 3,
      name: 'Vishal',
      username: 'vishal_123',
      score: 2459,
      streak: 123,
      bgColor: 'linear-gradient(90deg, rgba(175, 255, 242, 0.30) 8.17%, rgba(0, 255, 212, 0.30) 66.83%, rgba(175, 255, 242, 0.30) 100%)'
    },
    {
      rank: 4,
      name: 'Ashva Rishenth',
      username: 'ashva_rishenth',
      score: 2400,
      streak: 120,
      bgColor: 'rgba(255, 255, 255, 0.30)'
    },
    {
      rank: 5,
      name: 'Mohamed Ashif',
      username: 'mohamed_ashif',
      score: 2350,
      streak: 115,
      bgColor: 'rgba(255, 255, 255, 0.30)'
    },
    {
      rank: 6,
      name: 'Rishi',
      username: 'rishi_123',
      score: 2300,
      streak: 110,
      bgColor: 'rgba(255, 255, 255, 0.30)'
    },
    {
      rank: 7,
      name: 'Arjun Kumar',
      username: 'arjun_kumar',
      score: 2250,
      streak: 105,
      bgColor: 'rgba(255, 255, 255, 0.30)'
    },
    {
      rank: 8,
      name: 'Priya Sharma',
      username: 'priya_sharma',
      score: 2200,
      streak: 100,
      bgColor: 'rgba(255, 255, 255, 0.30)'
    },
    {
      rank: 9,
      name: 'Rahul Menon',
      username: 'rahul_menon',
      score: 2150,
      streak: 95,
      bgColor: 'rgba(255, 255, 255, 0.30)'
    },
    {
      rank: 10,
      name: 'Sneha Patel',
      username: 'sneha_patel',
      score: 2100,
      streak: 90,
      bgColor: 'rgba(255, 255, 255, 0.30)'
    },
    {
      rank: 11,
      name: 'Vikram Singh',
      username: 'vikram_singh',
      score: 2050,
      streak: 85,
      bgColor: 'rgba(255, 255, 255, 0.30)'
    },
    {
      rank: 12,
      name: 'Ananya Reddy',
      username: 'ananya_reddy',
      score: 2000,
      streak: 80,
      bgColor: 'rgba(255, 255, 255, 0.30)'
    },
    {
      rank: 13,
      name: 'Karthik Nair',
      username: 'karthik_nair',
      score: 1950,
      streak: 75,
      bgColor: 'rgba(255, 255, 255, 0.30)'
    },
    {
      rank: 14,
      name: 'Divya Iyer',
      username: 'divya_iyer',
      score: 1900,
      streak: 70,
      bgColor: 'rgba(255, 255, 255, 0.30)'
    },
    {
      rank: 15,
      name: 'Aditya Verma',
      username: 'aditya_verma',
      score: 1850,
      streak: 65,
      bgColor: 'rgba(255, 255, 255, 0.30)'
    },
    {
      rank: 16,
      name: 'Meera Gupta',
      username: 'meera_gupta',
      score: 1800,
      streak: 60,
      bgColor: 'rgba(255, 255, 255, 0.30)'
    },
    {
      rank: 17,
      name: 'Rohan Das',
      username: 'rohan_das',
      score: 1750,
      streak: 55,
      bgColor: 'rgba(255, 255, 255, 0.30)'
    },
    {
      rank: 18,
      name: 'Kavya Joshi',
      username: 'kavya_joshi',
      score: 1700,
      streak: 50,
      bgColor: 'rgba(255, 255, 255, 0.30)'
    }
  ];

  // Pagination settings
  const itemsPerPage = 10;

  // Filter leaderboard by search term (case-insensitive name search)
  const filteredLeaderboard = searchTerm.trim()
    ? leaderboardData.filter((entry) => entry.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : leaderboardData;

  // Calculate pagination
  const totalPages = Math.ceil(filteredLeaderboard.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLeaderboard = filteredLeaderboard.slice(startIndex, endIndex);

  const clearSearch = () => {
    setSearchTerm('');
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

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

        <div className="leaderboard-table-container">
          {isLoading ? (
            <table className="leaderboard-table skeleton-table">
              <thead>
                <tr className="table-header-row">
                  <th className="header-rank">Rank</th>
                  <th className="header-learner">Learner</th>
                  <th className="header-score">Score</th>
                  <th className="header-streak">Streak</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 8 }).map((_, i) => (
                  <tr className="leaderboard-row skeleton-row" key={`skele-${i}`}>
                    <td className="rank-cell"><div className="skeleton-line small" /></td>
                    <td className="learner-cell"><div className="skeleton-line medium" /></td>
                    <td className="score-cell"><div className="skeleton-line small" /></td>
                    <td className="streak-cell"><div className="skeleton-line small" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
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
                    key={index} 
                    className="leaderboard-row"
                    style={{ background: entry.bgColor }}
                  >
                    <td className="rank-cell">
                      {entry.rank === 1 ? (
                        <img src={goldBadge} alt="Gold Badge" className="rank-badge-img" />
                      ) : entry.rank === 2 ? (
                        <img src={silverBadge} alt="Silver Badge" className="rank-badge-img" />
                      ) : entry.rank === 3 ? (
                        <img src={bronzeBadge} alt="Bronze Badge" className="rank-badge-img" />
                      ) : (
                        <div 
                          className="rank-badge"
                          style={{ 
                            background: getRankBadgeColor(entry.rank),
                            border: entry.rank ? '2px solid rgba(255, 255, 255, 0.72)' : 'none'
                          }}
                        >
                          {entry.rank}
                        </div>
                      )}
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
          )}
        </div>
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
