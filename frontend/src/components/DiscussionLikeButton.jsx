import React, { useEffect, useRef, useState } from 'react';
import api from '../api';

const DiscussionLikeButton = ({ commentId, initialLikeCount = 0, initiallyLiked = false }) => {
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [liked, setLiked] = useState(initiallyLiked);
  const lastRequestIdRef = useRef(0);

  useEffect(() => {
    setLikeCount(initialLikeCount);
    setLiked(initiallyLiked);
    lastRequestIdRef.current = 0;
  }, [commentId, initialLikeCount, initiallyLiked]);

  const toggleLike = async () => {
    const prevLiked = liked;
    const prevLikeCount = likeCount;
    const nextLiked = !prevLiked;
    const nextLikeCount = nextLiked
      ? prevLikeCount + 1
      : Math.max(0, prevLikeCount - 1);

    setLiked(nextLiked);
    setLikeCount(nextLikeCount);

    const requestId = lastRequestIdRef.current + 1;
    lastRequestIdRef.current = requestId;

    try {
      const response = await api.post(`/api/video/discussions/${commentId}/set_like/`, {
        liked: nextLiked,
      });

      if (requestId !== lastRequestIdRef.current) {
        return;
      }

      const serverCount = response?.data?.likes_count;
      const serverLiked = response?.data?.is_liked;

      if (typeof serverCount === 'number') {
        setLikeCount(serverCount);
      }
      if (typeof serverLiked === 'boolean') {
        setLiked(serverLiked);
      }
    } catch (error) {
      if (requestId !== lastRequestIdRef.current) {
        return;
      }
      setLiked(prevLiked);
      setLikeCount(prevLikeCount);
      console.error('Failed to toggle discussion like:', error);
    }
  };

  return (
    <div className="discussion-likes">
      <span className="likes-count">{likeCount}</span>
      <button
        type="button"
        className={`discussion-like-button ${liked ? 'liked' : ''}`}
        onClick={toggleLike}
        aria-label={liked ? 'Unlike discussion' : 'Like discussion'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="23" height="20" viewBox="0 0 23 20" fill="none">
          <path
            d="M16.6064 0.25C20.003 0.250236 22.75 2.95184 22.75 6.28125C22.7499 10.1283 20.9289 13.1946 18.6807 15.4453C16.4294 17.699 13.766 19.1177 12.1338 19.6621H12.1318C11.9708 19.7176 11.7413 19.75 11.5 19.75C11.2587 19.75 11.0292 19.7176 10.8682 19.6621H10.8662C9.23396 19.1177 6.57059 17.699 4.31934 15.4453C2.07112 13.1946 0.250111 10.1283 0.25 6.28125C0.25 2.95184 2.99701 0.250236 6.39355 0.25C8.40601 0.25 10.1851 1.20031 11.3008 2.66797C11.3481 2.73016 11.4219 2.7666 11.5 2.7666C11.5781 2.7666 11.6519 2.73016 11.6992 2.66797C12.8147 1.20051 14.6052 0.25 16.6064 0.25Z"
            fill={liked ? '#B39DFF' : 'none'}
            stroke="#D3C7FF"
            strokeWidth="0.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
};

export default DiscussionLikeButton;
