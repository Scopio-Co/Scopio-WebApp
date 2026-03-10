import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './CourseVideoPage.css';
import courseVideoImage from '../assets/img/course video.webp';
import Footer from '../components/Footer';
import instagramIcon from '../assets/img/instagram.svg';
import linkedinIcon from '../assets/img/Linkedin.svg';
import whatsappIcon from '../assets/img/Whatsapp.svg';
import xIcon from '../assets/img/x.svg';
import defaultProfileAvatar from '../assets/img/profileDefault.webp';
import api from '../api';
import { getActiveUserId, getCachedProfile } from '../authCache';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { CourseVideoSkeleton } from '../components/skeletons';
import DiscussionLikeButton from '../components/DiscussionLikeButton';
import CertificateModal from '../components/CertificateModal';

// Helper function to extract video embed URL
const getVideoEmbedUrl = (url) => {
  if (!url) return null;
  const normalizedUrl = url.trim();
  
  // YouTube URLs
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/;
  const youtubeMatch = normalizedUrl.match(youtubeRegex);
  if (youtubeMatch && youtubeMatch[1]) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1&mute=1`;
  }
  
  // Vimeo URLs
  const vimeoRegex = /vimeo\.com\/(\d+)/;
  const vimeoMatch = normalizedUrl.match(vimeoRegex);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
  }

  // For Azure blob/direct-hosted videos and other providers, use URL directly in HTML5 <video>
  return normalizedUrl;
};

const isVimeoVideo = (url) => {
  if (!url) return false;
  return /vimeo\.com/.test(url);
};

const CourseVideoPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState('');
  const [submittingDiscussion, setSubmittingDiscussion] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [userNotes, setUserNotes] = useState('');
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const [notesError, setNotesError] = useState('');
  const [notesId, setNotesId] = useState(null);
  const [notesMode, setNotesMode] = useState('edit'); // 'edit' or 'preview'
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [showXpNotification, setShowXpNotification] = useState(false);
  const [videoWatchedTime, setVideoWatchedTime] = useState(0); // Track video playback in seconds
  const [completedLessons, setCompletedLessons] = useState(new Set()); // Track completed lesson IDs
  const [autoCompletingLessonId, setAutoCompletingLessonId] = useState(null);
  const [youtubePlayer, setYoutubePlayer] = useState(null); // YouTube player instance
  const [playerReady, setPlayerReady] = useState(false);
  const [lessonsVisible, setLessonsVisible] = useState(false); // Mobile lessons visibility
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [certificateData, setCertificateData] = useState(null);
  const [hasShownCertificate, setHasShownCertificate] = useState(false);
  const [certificateUserName, setCertificateUserName] = useState('Student');
  const directVideoRef = useRef(null);
  const directVideoAutoplayAttemptedRef = useRef(false);
  const directVideoTrackingRef = useRef({
    lastTrackedSecond: -1,
    lastTrackedPercentage: 0
  });

  const refreshCourseData = useCallback(async (showLoader = false) => {
    if (!courseId) return;

    try {
      if (showLoader) setLoading(true);
      const response = await api.get(`/video/courses/${courseId}/`);
      setCourseData(response.data);
      setUserRating(response.data.user_rating);
      setError(null);
    } catch (err) {
      console.error('Error refreshing course details:', err);
      if (showLoader) {
        setError('Failed to load course details');
      }
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [courseId]);

  // Generate helper functions for certificate
  const generateCertificateId = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `CERT-${timestamp}-${random}`;
  };

  const formatCertificateName = (profile) => {
    if (!profile) return '';

    const fullNameFromParts = [profile.first_name, profile.last_name]
      .filter(Boolean)
      .join(' ')
      .trim();

    const fullName = (
      profile.full_name
      || fullNameFromParts
      || profile.username
      || profile.name
      || ''
    ).toString().trim();

    return fullName;
  };

  const getUserName = () => {
    try {
      if (certificateUserName && certificateUserName !== 'Student') {
        return certificateUserName;
      }

      const activeUserId = getActiveUserId();
      if (activeUserId) {
        const cachedProfile = getCachedProfile(activeUserId);
        const cachedName = formatCertificateName(cachedProfile);
        if (cachedName) return cachedName;
      }

      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const localName = formatCertificateName(user);
        if (localName) return localName;
      }
    } catch (e) {
      console.error('Error getting user name:', e);
    }
    return 'Student';
  };

  useEffect(() => {
    const hydrateCertificateName = async () => {
      try {
        const activeUserId = getActiveUserId();
        if (activeUserId) {
          const cachedProfile = getCachedProfile(activeUserId);
          const cachedName = formatCertificateName(cachedProfile);
          if (cachedName) {
            setCertificateUserName(cachedName);
            return;
          }
        }

        const response = await api.get('/auth/profile/');
        const resolvedName = formatCertificateName(response.data);
        if (resolvedName) {
          setCertificateUserName(resolvedName);
        }
      } catch (err) {
        // Silent fallback to other local sources / placeholder
        console.debug('Certificate name hydration fallback:', err?.message || err);
      }
    };

    hydrateCertificateName();
  }, []);

  const viewCertificate = () => {
    // Use backend-provided flag `certificate_unlocked` instead of local 100% checks
    const isUnlocked = courseData?.certificate_unlocked === true;
    if (!isUnlocked) {
      setToast({ visible: true, message: 'Finish the course to unlock the certificate.', type: 'error' });
      setTimeout(() => setToast({ visible: false, message: '', type: 'info' }), 3000);
      return;
    }

    // Prepare certificate data and show modal
    setCertificateData({
      userName: getUserName(),
      courseTitle: courseData?.title || 'Course',
      completionDate: new Date().toISOString(),
      certificateId: generateCertificateId()
    });
    setShowCertificateModal(true);
  };

  const handleCertificateDownload = async (certificateElement) => {
    try {
      if (!certificateElement) {
        setToast({ visible: true, message: 'Certificate preview not ready. Try again.', type: 'error' });
        setTimeout(() => setToast({ visible: false, message: '', type: 'info' }), 2500);
        return;
      }

      setToast({ visible: true, message: 'Preparing certificate PDF...', type: 'info' });

      // Render at high quality while keeping memory safe for mobile devices.
      const desktopViewportWidth = 1600;
      const desktopViewportHeight = 1132;
      const baseScale = (window.devicePixelRatio || 1) * 1.6;
      let captureScale = Math.min(3, Math.max(2, baseScale));

      const targetPixels = desktopViewportWidth * desktopViewportHeight * captureScale * captureScale;
      const maxPixels = 16_000_000; // mobile-safe upper bound
      if (targetPixels > maxPixels) {
        captureScale = Math.max(1.5, Math.sqrt(maxPixels / (desktopViewportWidth * desktopViewportHeight)));
      }

      const canvas = await html2canvas(certificateElement, {
        scale: captureScale,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: desktopViewportWidth,
        windowHeight: desktopViewportHeight,
        scrollX: 0,
        scrollY: -window.scrollY,
      });

      const imageData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imageAspect = canvas.width / canvas.height;
      const pageAspect = pageWidth / pageHeight;
      let renderWidth = pageWidth;
      let renderHeight = pageWidth / imageAspect;

      if (imageAspect < pageAspect) {
        renderHeight = pageHeight;
        renderWidth = pageHeight * imageAspect;
      }

      const offsetX = (pageWidth - renderWidth) / 2;
      const offsetY = (pageHeight - renderHeight) / 2;
      pdf.addImage(imageData, 'PNG', offsetX, offsetY, renderWidth, renderHeight, undefined, 'FAST');
      const fileName = `${(courseData?.title || 'course').replace(/\s+/g, '-')}-certificate.pdf`;
      pdf.save(fileName);

      setToast({ visible: true, message: 'Certificate download started', type: 'info' });
      setTimeout(() => setToast({ visible: false, message: '', type: 'info' }), 3000);
    } catch (err) {
      console.error('Error downloading certificate:', err);
      setToast({ visible: true, message: 'Failed to download certificate.', type: 'error' });
      setTimeout(() => setToast({ visible: false, message: '', type: 'info' }), 3000);
    }
  };

  // Fetch course data from API
  useEffect(() => {
    if (!courseId) {
      setError('No course ID provided');
      setLoading(false);
      return;
    }

    refreshCourseData(true);
  }, [courseId, refreshCourseData]);

  // Fetch user notes from API
  useEffect(() => {
    if (!courseId) return;

    const fetchUserNotes = async () => {
      try {
        setNotesLoading(true);
        const response = await api.get(`/video/notes/?course=${courseId}`);
        if (response.data && response.data.length > 0) {
          setUserNotes(response.data[0].notes_text || '');
          setNotesId(response.data[0].id);
        }
      } catch (err) {
        console.error('Error fetching notes:', err);
        // Don't show error, just leave notes empty
      } finally {
        setNotesLoading(false);
      }
    };

    fetchUserNotes();
  }, [courseId]);

  useEffect(() => {
    // ensure main content container is scrolled to top when opening this page
    const mainEl = document.querySelector('.main-content');
    if (mainEl && typeof mainEl.scrollTo === 'function') {
      mainEl.scrollTo({ top: 0, behavior: 'auto' });
    }
    // fallback to window
    if (typeof window !== 'undefined') window.scrollTo(0, 0);

    // Scroll to top after mount
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.scrollTop = 0;
    }
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // Check if user is already enrolled
  useEffect(() => {
    if (!courseId) return;
    
    const checkEnrollment = async () => {
      try {
        const response = await api.get('/api/video/enrollments/');
        const isUserEnrolled = response.data.some(enrollment => enrollment.course === parseInt(courseId));
        setIsEnrolled(isUserEnrolled);
      } catch (err) {
        // If 401, user is not authenticated, so not enrolled
        if (err.response?.status === 401) {
          setIsEnrolled(false);
        }
      }
    };
    
    checkEnrollment();
  }, [courseId]);

  // Load YouTube IFrame API
  useEffect(() => {
    // Load YouTube IFrame API script if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // Track actual YouTube player time and send progress updates
  useEffect(() => {
    if (!youtubePlayer || !playerReady || !isVideoPlaying) return;

    const interval = setInterval(() => {
      try {
        // Get current playback time from YouTube player
        const currentTime = youtubePlayer.getCurrentTime();
        const duration = youtubePlayer.getDuration();
        
        if (currentTime > 0 && duration > 0) {
          const newWatchedTime = Math.floor(currentTime);
          setVideoWatchedTime(newWatchedTime);
          
          // Calculate watch percentage
          const watchPercentage = Math.min(Math.round((currentTime / duration) * 100), 100);
          
          // Send progress update to backend every 5 seconds
          if (currentTime % 5 < 1) {
            updateVideoProgressOnBackend(watchPercentage, Math.floor(duration));
          }
          
          // Log when video reaches important milestones
          if (watchPercentage === 90) {
            console.log('🎯 Video 90% watched - ready for completion!');
          }

          const activeLesson = courseData?.lessons?.[currentLessonIndex];
          if (
            watchPercentage >= 90 &&
            activeLesson?.id &&
            !completedLessons.has(activeLesson.id) &&
            autoCompletingLessonId !== activeLesson.id
          ) {
            setAutoCompletingLessonId(activeLesson.id);
            markLessonComplete(activeLesson.id)
              .finally(() => setAutoCompletingLessonId(null));
          }
        }
      } catch (err) {
        console.error('Error getting YouTube player time:', err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [youtubePlayer, playerReady, isVideoPlaying, courseData, currentLessonIndex, completedLessons, autoCompletingLessonId]);
  
  // Send video progress update to backend
  const updateVideoProgressOnBackend = async (watchPercentage, videoDuration) => {
    const currentLesson = courseData?.lessons?.[currentLessonIndex];
    
    if (!currentLesson) {
      console.warn(`⚠️ No lesson found at index ${currentLessonIndex}`);
      console.warn(`courseData.lessons count: ${courseData?.lessons?.length || 0}`);
      return;
    }
    
    if (!currentLesson.id) {
      console.error(`❌ Lesson has no ID! Lesson:`, currentLesson);
      return;
    }
    
    console.log(`📤 Updating progress: Lesson ${currentLesson.id} (${currentLesson.title}) - ${watchPercentage}%`);
    
    try {
      const response = await api.post(`/video/lessons/${currentLesson.id}/update_watch_percentage/`, {
        watch_percentage: watchPercentage,
        video_duration: videoDuration
      });
      console.log(`✅ Backend progress update successful:`, response.data);
    } catch (err) {
      // Log detailed error but silently fail for progress updates (not critical)
      if (err.response?.status === 500) {
        console.error(`❌ Server error on progress update:`, err.response?.data);
      } else {
        console.debug('Progress update silent fail');
      }
    }
  };

  // Reset watch-time when switching lessons
  useEffect(() => {
    setVideoWatchedTime(0);
    setIsVideoPlaying(false);
    setPlayerReady(false);
    directVideoAutoplayAttemptedRef.current = false;
    directVideoTrackingRef.current = { lastTrackedSecond: -1, lastTrackedPercentage: 0 };
    
    // Destroy previous YouTube player instance
    if (youtubePlayer) {
      try {
        youtubePlayer.destroy();
      } catch (err) {
        console.error('Error destroying YouTube player:', err);
      }
      setYoutubePlayer(null);
    }
  }, [currentLessonIndex]);

  // Load completed lessons status
  useEffect(() => {
    if (!courseData || !courseData.lessons) return;

    const completed = new Set();
    courseData.lessons.forEach(lesson => {
      if (lesson.completed) {
        completed.add(lesson.id);
      }
    });
    setCompletedLessons(completed);
  }, [courseData]);

  // Check if video is YouTube
  const isYouTubeVideo = (url) => {
    if (!url) return false;
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/;
    return youtubeRegex.test(url);
  };

  const startCurrentLessonPlayback = () => {
    const currentLesson = courseData?.lessons?.[currentLessonIndex];
    const isYoutube = isYouTubeVideo(currentLesson?.video_url);

    if (isYoutube && window.YT && window.YT.Player) {
      const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/;
      const youtubeMatch = currentLesson?.video_url?.match(youtubeRegex);

      if (youtubeMatch && youtubeMatch[1]) {
        const videoId = youtubeMatch[1];
        const playerElement = document.getElementById('youtube-player-container');

        if (playerElement && !playerElement.querySelector('iframe')) {
          try {
            const player = new window.YT.Player('youtube-player-container', {
              videoId: videoId,
              playerVars: {
                autoplay: 1,
                mute: 0,
                  controls: 1,
                  fs: 1,
                enablejsapi: 1,
                modestbranding: 1,
                rel: 0
              },
              events: {
                onReady: (event) => {
                  console.log('✅ YouTube player ready');
                  setYoutubePlayer(event.target);
                  setPlayerReady(true);
                  setIsVideoPlaying(true);
                  event.target.playVideo();
                },
                onStateChange: (event) => {
                  const PlayerState = window.YT.PlayerState;
                  switch(event.data) {
                    case PlayerState.UNSTARTED:
                      console.log('⏳ Video unstarted');
                      break;
                    case PlayerState.PLAYING:
                      console.log('▶️ Video playing');
                      break;
                    case PlayerState.PAUSED:
                      console.log('⏸️ Video paused');
                      break;
                    case PlayerState.BUFFERING:
                      console.log('⏳ Video buffering');
                      break;
                    case PlayerState.CUED:
                      console.log('📽️ Video cued');
                      break;
                    case PlayerState.ENDED:
                      console.log('🏁 Video ended!');
                      markLessonComplete();
                      break;
                    default:
                      break;
                  }
                },
                onError: (event) => {
                  console.error('❌ YouTube player error:', event.data);
                }
              }
            });
          } catch (err) {
            console.error('Error initializing YouTube player:', err);
            setIsVideoPlaying(true);
          }
        } else {
          setIsVideoPlaying(true);
        }
      }
    } else {
      setIsVideoPlaying(true);
    }
  };

  // Handle play button - check enrollment
  const handlePlayClick = () => {
    if (!isEnrolled) {
      setShowEnrollModal(true);
    } else {
      startCurrentLessonPlayback();
    }
  };

  // Enroll user in course
  const enrollInCourse = async () => {
    if (!courseId) {
      alert('Invalid course ID');
      return;
    }

    console.log(`📝 Enrolling in course ${courseId}...`);
    
    try {
      setEnrolling(true);
      const response = await api.post('/video/enrollments/', {
        course: parseInt(courseId),
        watch_time: 1
      });
      
      console.log('✓ Enrolled in course:', response.data);
      setIsEnrolled(true);
      setShowEnrollModal(false);
      navigate('/learning');
    } catch (err) {
      console.error('❌ Error enrolling in course:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      if (err.response?.status === 401) {
        alert('Please log in to enroll in this course.');
      } else if (err.response?.status === 400) {
        alert('Invalid enrollment data. Please try again.');
      } else {
        alert('Failed to enroll. Please try again.');
      }
    } finally {
      setEnrolling(false);
    }
  };

  // Mark current lesson as complete and award XP
  const markLessonComplete = async (lessonId = null) => {
    // Validate course data exists
    if (!courseData || !courseData.lessons || courseData.lessons.length === 0) {
      console.error('❌ No course data available for marking lesson complete');
      return;
    }

    // Find the target lesson
    const targetLesson = lessonId
      ? courseData.lessons.find(lesson => lesson.id === lessonId)
      : courseData.lessons[currentLessonIndex];

    if (!targetLesson) {
      console.error('❌ No target lesson found');
      return;
    }

    // Check if user is enrolled
    if (!isEnrolled) {
      console.error('❌ User not enrolled in course');
      alert('Please enroll in the course first to mark lessons complete.');
      return;
    }

    // Validate lesson ID
    if (!targetLesson.id) {
      console.error('❌ Lesson ID is missing:', targetLesson);
      alert('Invalid lesson data. Please refresh the page.');
      return;
    }
    
    console.log(`🎯 Attempting to mark lesson ${targetLesson.id} (${targetLesson.title}) as complete...`);
    
    try {
      // Make API call with full URL validation
      const markCompleteUrl = `/video/lessons/${targetLesson.id}/mark_complete/`;
      console.log(`📡 POST ${markCompleteUrl}`);
      
      const response = await api.post(markCompleteUrl);
      console.log('✓ Lesson marked complete:', response.data);
      
      // XP awarded comes ONLY from database (lesson.time_xp), never random
      const xpAwarded = response.data.xp_awarded || 0;
      const lessonXpValue = response.data.lesson_xp_value;
      
      console.log(`💰 XP from database: ${lessonXpValue} → Awarded: ${xpAwarded}`);
      
      // Add lesson to completed set for visual indicator
      setCompletedLessons(prev => new Set([...prev, targetLesson.id]));
      setCourseData(prev => {
        if (!prev?.lessons) return prev;
        return {
          ...prev,
          lessons: prev.lessons.map(lesson =>
            lesson.id === targetLesson.id ? { ...lesson, completed: true } : lesson
          )
        };
      });
      
      // Show XP notification if XP was awarded
      if (xpAwarded > 0) {
        setXpEarned(xpAwarded);
        setShowXpNotification(true);
        
        // Auto-hide notification after 3 seconds
        setTimeout(() => {
          setShowXpNotification(false);
        }, 3000);
      } else {
        console.log('ℹ️ No XP awarded (lesson already completed or no XP value)');
      }
      
      // Auto-navigate to next lesson if available
      if (!lessonId && currentLessonIndex < courseData.lessons.length - 1) {
        console.log('📍 Moving to next lesson...');
        setTimeout(() => {
          setCurrentLessonIndex(currentLessonIndex + 1);
          setIsVideoPlaying(false);
        }, 2000); // Wait 2 seconds before moving to next
      }

      // Refresh latest progress/completion from backend so it survives refresh and syncs all cards
      refreshCourseData(false);
      
    } catch (err) {
      console.error('❌ Error marking lesson complete:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        lessonId: targetLesson.id,
        url: err.config?.url
      });
      
      // Provide specific error messages
      if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
        alert('Network error. Please check your internet connection and try again.');
      } else if (err.response?.status === 401) {
        alert('Authentication failed. Please log in again.');
      } else if (err.response?.status === 400) {
        // 90% watch requirement not met
        const watchPercentage = err.response?.data?.watch_percentage || 0;
        const required = err.response?.data?.required_percentage || 90;
        console.log(`⚠️ Video must be ${required}% watched. Current: ${watchPercentage}%`);
        setToast({ visible: true, message: `Please watch at least ${required}% of the video before completing the lesson. Currently watched: ${watchPercentage}%` });
        setTimeout(() => setToast({ visible: false, message: '' }), 3500);
      } else if (err.response?.status === 403) {
        alert('You do not have permission to mark this lesson complete.');
      } else if (err.response?.status === 404) {
        alert('Lesson not found. Please refresh the page.');
      } else {
        alert('Failed to mark lesson complete. Please try again or contact support if the issue persists.');
      }
    }
  };

  // Helper: Parse duration string (e.g., "6:50" or "20 mins") to seconds
  const parseDurationToSeconds = (duration) => {
    if (!duration) return 120; // Default 2 minutes if no duration
    
    // Format: "MM:SS" or "HH:MM:SS"
    const timeMatch = duration.match(/(\d+):(\d+)(?::(\d+))?/);
    if (timeMatch) {
      const hours = timeMatch[3] ? parseInt(timeMatch[1]) : 0;
      const minutes = timeMatch[3] ? parseInt(timeMatch[2]) : parseInt(timeMatch[1]);
      const seconds = timeMatch[3] ? parseInt(timeMatch[3]) : parseInt(timeMatch[2]);
      return hours * 3600 + minutes * 60 + seconds;
    }
    
    // Format: "20 mins" or "30 minutes"
    const minsMatch = duration.match(/(\d+)\s*min/);
    if (minsMatch) {
      return parseInt(minsMatch[1]) * 60;
    }
    
    return 120; // Default 2 minutes if parsing fails
  };

  const trackDirectVideoProgress = (videoElement) => {
    if (!videoElement) return;

    const currentTime = Math.floor(videoElement.currentTime || 0);
    const metadataDuration = Number.isFinite(videoElement.duration) ? videoElement.duration : 0;
    const fallbackDuration = parseDurationToSeconds(currentLesson?.duration);
    const duration = Math.floor(metadataDuration > 0 ? metadataDuration : fallbackDuration);

    if (currentTime <= 0 || duration <= 0) return;

    setVideoWatchedTime(currentTime);
    const watchPercentage = Math.min(Math.round((currentTime / duration) * 100), 100);

    const { lastTrackedSecond, lastTrackedPercentage } = directVideoTrackingRef.current;
    const isFiveSecondCheckpoint = currentTime % 5 === 0 && currentTime !== lastTrackedSecond;
    const crossedCompletionThreshold = watchPercentage >= 90 && lastTrackedPercentage < 90;

    if (isFiveSecondCheckpoint || crossedCompletionThreshold) {
      directVideoTrackingRef.current = {
        lastTrackedSecond: currentTime,
        lastTrackedPercentage: watchPercentage
      };
      updateVideoProgressOnBackend(watchPercentage, duration);
    }

    if (
      watchPercentage >= 90 &&
      currentLesson?.id &&
      !completedLessons.has(currentLesson.id) &&
      autoCompletingLessonId !== currentLesson.id
    ) {
      setAutoCompletingLessonId(currentLesson.id);
      markLessonComplete(currentLesson.id)
        .finally(() => setAutoCompletingLessonId(null));
    }
  };

  const handleDirectVideoEnded = (videoElement) => {
    if (!videoElement) return;

    const metadataDuration = Number.isFinite(videoElement.duration) ? videoElement.duration : 0;
    const fallbackDuration = parseDurationToSeconds(currentLesson?.duration);
    const duration = Math.floor(metadataDuration > 0 ? metadataDuration : fallbackDuration);

    updateVideoProgressOnBackend(100, duration);
    markLessonComplete();
  };

  // Handle discussion submission
  const handleDiscussionSubmit = async (e) => {
    e.preventDefault();
    if (!newDiscussion.trim()) return;

    try {
      setSubmittingDiscussion(true);
      const response = await api.post('/video/discussions/', {
        course: courseData.id,
        comment: newDiscussion
      });

      // Update local state with new discussion
      setCourseData(prev => ({
        ...prev,
        discussions: [...(prev.discussions || []), response.data]
      }));

      setNewDiscussion('');
    } catch (err) {
      console.error('Error submitting discussion:', err);
      alert('Failed to submit discussion. Please try again.');
    } finally {
      setSubmittingDiscussion(false);
    }
  };

  // Handle rating submission
  const handleRatingSubmit = async (rating) => {
    try {
      await api.post('/video/ratings/', {
        course: courseData.id,
        rating: rating
      });

      setUserRating(rating);

      // Refresh course data to get updated average rating
      const response = await api.get(`/video/courses/${courseData.id}/`);
      setCourseData(response.data);
    } catch (err) {
      console.error('Error submitting rating:', err);
      alert('Failed to submit rating. Please try again.');
    }
  };

  // Handle notes save
  const handleNotesSave = async () => {
    try {
      setNotesError('');
      setNotesSaved(false);
      
      if (notesId) {
        // Update existing notes
        await api.put(`/video/notes/${notesId}/`, {
          notes_text: userNotes,
          course: courseData.id
        });
      } else {
        // Create new notes
        const response = await api.post('/video/notes/', {
          course: courseData.id,
          notes_text: userNotes
        });
        setNotesId(response.data.id);
      }
      
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 3000); // Show success message for 3 seconds
    } catch (err) {
      console.error('Error saving notes:', err);
      setNotesError('Failed to save notes. Please try again.');
      setTimeout(() => setNotesError(''), 3000);
    }
  };

  // Handle notes reset
  const handleNotesReset = () => {
    if (window.confirm('Are you sure you want to clear all notes?')) {
      setUserNotes('');
      setNotesSaved(false);
      setNotesError('');
    }
  };

  // Use real data from API or fallback to dummy data
  const lessons = courseData?.lessons || [
    { id: 1, title: "Introduction to React JS", duration: "1:45 min", completed: true, time_xp: "451.02" },
    { id: 2, title: "Node Installation", duration: "2:30 min", completed: true, time_xp: "452.10" },
  ];

  const discussions = courseData?.discussions?.map(d => ({
    id: d.id,
    author: d.author_name,
    role: d.author_role,
    avatar: d.author_profile_image_url,
    comment: d.comment,
    likes: d.likes_count || 0,
    isLiked: !!d.is_liked
  })) || [
    {
      id: 1,
      author: "Hamdan Husain",
      role: "son_of_baheer",
      avatar: defaultProfileAvatar,
      comment: "Greyt lesson! The examples really helped me understand the concepts better.",
      likes: 12,
      isLiked: false
    }
  ];

  const resources = courseData?.resources?.map(r => ({
    id: r.id,
    title: r.label,
    url: r.url
  })) || [
    { id: 1, title: "Github", url: "#" },
    { id: 2, title: "Code", url: "#" }
  ];

  // Extract course info from API data or fallback
  const courseTitle = courseData?.title || 'Course Name';
  const courseDuration = courseData?.total_duration || '3 Components';
  const courseDescription = courseData?.description || 'In this comprehensive lesson, you will learn fundamental concepts.';
  const courseRating = courseData?.average_rating ? parseFloat(courseData.average_rating) : 0.0;
  const totalRatings = courseData?.total_ratings || 0;
  const whatLearn = courseData?.what_you_learn ? 
    (Array.isArray(courseData.what_you_learn) ? courseData.what_you_learn : 
      (typeof courseData.what_you_learn === 'string' ? courseData.what_you_learn.split('\n').filter(item => item.trim()) : 
        ['Core concepts', 'Javascript xml JSX', 'Components and Props', 'Hooks in React'])) : 
    ['Core concepts', 'Javascript xml JSX', 'Components and Props', 'Hooks in React'];
  const instructorName = courseData?.instructor_name || 'Donald J Trump';
  const instructorTitle = courseData?.instructor_title || 'Web Dev @copestart';
  const instructorBio = courseData?.instructor_bio || 'Ben Hong is a Staff Developer Experience (DX) Engineer...';
  const instructorAvatar = courseData?.instructor_avatar_url || defaultProfileAvatar;
  const totalLessons = lessons.length;
  const completedLessonsCount = Math.max(completedLessons.size, lessons.filter(l => l.completed).length);
  
  // Get current lesson's video URL
  const currentLesson = lessons[currentLessonIndex] || lessons[0];
  const currentVideoUrl = currentLesson?.video_url;
  const videoEmbedUrl = getVideoEmbedUrl(currentVideoUrl);

  useEffect(() => {
    if (!currentLesson) return;
    const provider = isYouTubeVideo(currentVideoUrl)
      ? 'youtube'
      : isVimeoVideo(currentVideoUrl)
        ? 'vimeo'
        : 'direct';

    const sourceInfo = {
      lessonId: currentLesson.id,
      lessonTitle: currentLesson.title,
      provider,
      rawUrl: currentVideoUrl || null,
      resolvedUrl: videoEmbedUrl || null
    };
    console.log(`🎬 Current lesson video source: ${JSON.stringify(sourceInfo)}`);
  }, [currentLessonIndex, currentLesson, currentVideoUrl, videoEmbedUrl]);

  useEffect(() => {
    if (!courseData?.certificate_unlocked) return;
    if (hasShownCertificate) return;

    setCertificateData({
      userName: getUserName(),
      courseTitle: courseData?.title || 'Course',
      completionDate: new Date().toISOString(),
      certificateId: generateCertificateId()
    });
    setShowCertificateModal(true);
    setHasShownCertificate(true);
  }, [courseData?.certificate_unlocked, courseData?.title, hasShownCertificate]);

  useEffect(() => {
    if (!isVideoPlaying) return;
    if (isYouTubeVideo(currentVideoUrl) || isVimeoVideo(currentVideoUrl)) return;
    if (!videoEmbedUrl) return;

    const videoElement = directVideoRef.current;
    if (!videoElement) return;

    // Run autoplay helper only once per lesson/source to avoid overriding user controls
    if (directVideoAutoplayAttemptedRef.current) return;
    directVideoAutoplayAttemptedRef.current = true;

    // If user already started playback manually, don't interfere
    if (!videoElement.paused || videoElement.currentTime > 0) return;

    const attemptPlay = async () => {
      try {
        videoElement.muted = false;
        await videoElement.play();
      } catch (firstError) {
        try {
          videoElement.muted = true;
          await videoElement.play();
          setToast({ visible: true, message: 'Video started muted. Use controls to unmute.', type: 'info' });
          setTimeout(() => setToast({ visible: false, message: '', type: 'info' }), 2500);
        } catch (secondError) {
          console.error('❌ Direct video autoplay blocked/failed:', {
            src: videoEmbedUrl,
            firstAttempt: { message: firstError?.message, name: firstError?.name },
            secondAttempt: { message: secondError?.message, name: secondError?.name }
          });
          setToast({ visible: true, message: 'Tap play on the video controls to start playback.', type: 'info' });
          setTimeout(() => setToast({ visible: false, message: '', type: 'info' }), 3000);
        }
      }
    };

    attemptPlay();
  }, [isVideoPlaying, currentVideoUrl, videoEmbedUrl]);

  if (loading) {
    return <CourseVideoSkeleton />;
  }

  if (error && !courseData) {
    return (
      <div className="course-video-page">
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-tertiary)' }}>
          <p>{error}</p>
          <button onClick={() => navigate(-1)} style={{ marginTop: '20px', padding: '10px 20px' }}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="course-video-page">
      {/* XP Earned Notification */}
      {showXpNotification && (
        <div className="xp-notification">
          <div className="xp-notification-content">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#A749FF"/>
            </svg>
            <div className="xp-text">
              <h4>Lesson Completed!</h4>
              <p>+{xpEarned} XP Earned</p>
            </div>
          </div>
        </div>
      )}
      <div className="course-video-container">
        {/* Header */}
          <div className="course-video-header">
          <div className="header-left">
            <div className="course-detail">
              <h1>{courseTitle}</h1>
              <p className="component-count">{courseDuration}</p>
            </div>
          </div>
          <div className="header-right">
            <button
              type="button"
              className={`certificate-btn ${(courseData?.certificate_unlocked === true) ? 'unlocked' : 'locked'}`}
              onClick={viewCertificate}
              aria-label={(courseData?.certificate_unlocked === true) ? 'Download certificate' : 'Certificate locked'}
            >
              {(courseData?.certificate_unlocked === true) ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M12 17a2 2 0 100-4 2 2 0 000 4z" fill="currentColor" />
                  <path d="M17 8h-1V7a4 4 0 10-8 0v1H7a1 1 0 00-1 1v9a1 1 0 001 1h10a1 1 0 001-1V9a1 1 0 00-1-1zm-8-1a3 3 0 116 0v1H9V7z" fill="currentColor" />
                </svg>
              )}
              <span className="certificate-text">Certificate</span>
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="course-content-grid">
          {/* Top Container: Video and Lessons */}
          <div className="video-lessons-container">
            {/* Video Player */}
            <div className="video-player">
              {/* YouTube Player Container - Only for YouTube videos */}
              {isYouTubeVideo(currentVideoUrl) && (
                <div 
                  id="youtube-player-container"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: isVideoPlaying ? 'block' : 'block',
                    zIndex: 10
                  }}
                />
              )}
              
              {/* Non-YouTube Video Player (Vimeo, direct videos, etc.) */}
              {!isYouTubeVideo(currentVideoUrl) && isVideoPlaying && videoEmbedUrl && (
                isVimeoVideo(currentVideoUrl) ? (
                  <iframe
                    src={videoEmbedUrl}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      zIndex: 10
                    }}
                    allow="autoplay; fullscreen; picture-in-picture"
                    title="Video Player"
                  />
                ) : (
                  <video
                    key={videoEmbedUrl}
                    ref={directVideoRef}
                    src={videoEmbedUrl}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      zIndex: 10
                    }}
                    controls
                    autoPlay
                    playsInline
                    preload="metadata"
                    onLoadedMetadata={(event) => {
                      console.log('✅ Video metadata loaded:', {
                        src: event.currentTarget.currentSrc || videoEmbedUrl,
                        duration: event.currentTarget.duration
                      });
                    }}
                    onCanPlay={(event) => {
                      console.log('▶️ Video can play:', {
                        src: event.currentTarget.currentSrc || videoEmbedUrl
                      });
                    }}
                    onTimeUpdate={(event) => {
                      trackDirectVideoProgress(event.currentTarget);
                    }}
                    onEnded={(event) => {
                      handleDirectVideoEnded(event.currentTarget);
                    }}
                    onError={(event) => {
                      const mediaError = event.currentTarget.error;
                      const errorCode = mediaError?.code;
                      const errorMap = {
                        1: 'MEDIA_ERR_ABORTED',
                        2: 'MEDIA_ERR_NETWORK',
                        3: 'MEDIA_ERR_DECODE',
                        4: 'MEDIA_ERR_SRC_NOT_SUPPORTED'
                      };
                      const errorName = errorMap[errorCode] || 'UNKNOWN_MEDIA_ERROR';
                      const failingSrc = event.currentTarget.currentSrc || videoEmbedUrl;
                      console.error('❌ Video playback error:', {
                        src: failingSrc,
                        code: errorCode,
                        type: errorName,
                        mediaError
                      });
                      setToast({ visible: true, message: `Video failed (${errorName}). Check console/network.`, type: 'error' });
                      setTimeout(() => setToast({ visible: false, message: '', type: 'info' }), 3500);
                    }}
                  />
                )
              )}
              
              {/* Thumbnail and Play Button - Show when not playing */}
              {!isVideoPlaying || !videoEmbedUrl ? (
                <>
                  <img 
                    src={currentLesson?.thumbnail_url || courseData?.thumbnail_url || courseVideoImage} 
                    alt={courseTitle}
                  />

                  <button
                    type="button"
                    className="play-center"
                    onClick={handlePlayClick}
                    aria-label="Play video"
                  >
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 5v14l11-7L8 5z" fill="#fff"/>
                    </svg>
                  </button>

                  <div className="video-overlay">
                    <h2>Lesson {currentLessonIndex + 1}</h2>
                    <p className="video-subtitle">{currentLesson?.title || 'Lesson Title'}</p>
                  </div>
                </>
              ) : null}
            </div>

            {/* Course Lessons */}
            <div className={`lessons-sidebar ${lessonsVisible ? 'lessons-visible' : ''}`}>
              <div
                className="lessons-header"
                onClick={() => setLessonsVisible(!lessonsVisible)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setLessonsVisible(!lessonsVisible); }}
              >
                <div className="lessons-header-content">
                  <h2>Course Lessons</h2>
                  <p className="progress-text">{completedLessonsCount}/{totalLessons} completed</p>
                </div>
                  <button 
                    className="lessons-toggle-btn"
                    aria-label="Toggle lessons"
                    tabIndex={-1}
                  >
                  <svg 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className={`chevron-icon ${lessonsVisible ? 'chevron-up' : 'chevron-down'}`}
                  >
                    <path 
                      d="M7 10l5 5 5-5" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>

              <div className="lessons-scroll-container">
                <div className="lessons-list">
                {lessons.map((lesson, index) => (
                  <div
                    key={lesson.id}
                    className={`lesson-item ${completedLessons.has(lesson.id) ? 'completed' : ''} ${currentLessonIndex === index ? 'active-lesson' : ''}`}
                    onClick={() => {
                      setCurrentLessonIndex(index);
                      setIsVideoPlaying(false);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="lesson-play-btn">
                      {completedLessons.has(lesson.id) ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#4ECB71"/>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
                          <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 19.4 5.6 25 12.5 25C19.4 25 25 19.4 25 12.5C25 5.6 19.4 0 12.5 0ZM15.825 14.6625L14.225 15.5875L12.625 16.5125C10.5625 17.7 8.875 16.725 8.875 14.35V12.5V10.65C8.875 8.2625 10.5625 7.3 12.625 8.4875L14.225 9.4125L15.825 10.3375C17.8875 11.525 17.8875 13.475 15.825 14.6625Z" fill="#292D32"/>
                        </svg>
                      )}
                    </div>
                    <div className="lesson-content">
                      <p className="lesson-number">Lesson {index + 1}</p>
                      <p className="lesson-title">{lesson.title}</p>
                    </div>
                    <div className="lesson-meta">
                      <p className="lesson-duration">{lesson.duration}</p>
                      <p className="lesson-xp">{lesson.time_xp || lesson.time}</p>
                    </div>
                  </div>
                ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Container: Discussions and Overview */}
          <div className="discussions-overview-container">
            {/* Discussions - Left */}
            <div className="discussions-sidebar">
              <div className="discussions-section">
                <div className="discussions-header">
                  <h3>Discussions</h3>
                  <p className="discussion-count">{discussions.length}</p>
                </div>
                
                {/* Discussion Input Form */}
                <form onSubmit={handleDiscussionSubmit} style={{ marginBottom: '20px', padding: '0 15px' }}>
                  <textarea
                    value={newDiscussion}
                    onChange={(e) => setNewDiscussion(e.target.value)}
                    placeholder="Share your thoughts about this course..."
                    style={{
                      width: '100%',
                      minHeight: '80px',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.8)',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      marginBottom: '10px'
                    }}
                  />
                  <button
                    type="submit"
                    disabled={submittingDiscussion || !newDiscussion.trim()}
                    style={{
                      padding: '8px 20px',
                      borderRadius: '6px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: submittingDiscussion || !newDiscussion.trim() ? 'not-allowed' : 'pointer',
                      opacity: submittingDiscussion || !newDiscussion.trim() ? 0.6 : 1
                    }}
                  >
                    {submittingDiscussion ? 'Posting...' : 'Post Discussion'}
                  </button>
                </form>
                
                <div className="discussions-list">
                  {discussions.map((discussion) => (
                    <div key={discussion.id} className="discussion-item">
                      <div className="discussion-base">
                        <div className="discussion-avatar">
                            <div className="avatar-circle">
                              <img
                                src={discussion.avatar || defaultProfileAvatar}
                                alt={discussion.author}
                                className="avatar-circle-image"
                                onError={(e) => {
                                  e.currentTarget.src = defaultProfileAvatar;
                                }}
                              />
                            </div>
                        <div className="discussion-header">
                          <span className="author-name">{discussion.author}</span>
                          <span className="author-role">{discussion.role}</span>
                        </div>
                        </div>
                        
                        <DiscussionLikeButton
                          commentId={discussion.id}
                          initialLikeCount={discussion.likes}
                          initiallyLiked={discussion.isLiked}
                        />
                      </div>
                      
                      <div className="discussion-content">
                        <p className="discussion-comment">{discussion.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Overview - Right */}
            <div className={`overview-container ${activeTab === 'notes' ? 'notes-active' : ''}`}>
              {/* Tabs */}
              <div className="course-tabs">
                <button 
                  className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                </button>
                <button 
                  className={`tab ${activeTab === 'resources' ? 'active' : ''}`}
                  onClick={() => setActiveTab('resources')}
                >
                  Resources
                </button>
                <button 
                  className={`tab ${activeTab === 'notes' ? 'active' : ''}`}
                  onClick={() => setActiveTab('notes')}
                >
                  Notes
                </button>
                <button 
                  className={`tab ${activeTab === 'tutor' ? 'active' : ''}`}
                  onClick={() => setActiveTab('tutor')}
                >
                  Tutor
                </button>
              </div>

              {/* Tab Content */}
              <div className="tab-content">
                {activeTab === 'overview' && (
                  <>
                    <div className="about-section">
                      <h3>About This Lesson</h3>
                      <p>{courseDescription}</p>
                    </div>

                    <div className="what-learn-section">
                      <div className="learn-content">
                        <h3>What you'll learn:</h3>
                        <ul>
                          {whatLearn.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="rating-display-in-cdp">
                        <div>
                          <span className="rating-number">{courseRating.toFixed(1)}</span>
                          <span style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginLeft: '5px' }}>
                            ({totalRatings} rating{totalRatings !== 1 ? 's' : ''})
                          </span>
                        </div>
                        <div className="stars" style={{ display: 'flex', gap: '4px' }}>
                          {[1, 2, 3, 4, 5].map((star) => {
                            const isHovered = hoverRating >= star;
                            const isRated = (userRating || 0) >= star;
                            const shouldFill = isHovered || (!hoverRating && isRated);
                            
                            return (
                              <svg 
                                key={star} 
                                width="24" 
                                height="24" 
                                viewBox="0 0 24 24" 
                                fill={shouldFill ? "#FFD700" : "none"}
                                stroke="#FFD700"
                                strokeWidth="2"
                                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => handleRatingSubmit(star)}
                              >
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                              </svg>
                            );
                          })}
                        </div>
                        
                      </div>
                    </div>
                  </>
                )}
                {activeTab === 'resources' && (
                  <div className="resources-content">
                    <h3>Course Resources:</h3>
                    {resources.length > 0 ? (
                      <div className="resources-list">
                        {resources.map((resource) => (
                          <div key={resource.id} className="resource-item">
                            <span className="resource-label">{resource.title}:</span>
                            <a href={resource.url} target="_blank" rel="noopener noreferrer" className="resource-link">Click</a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: 'var(--text-tertiary)', marginTop: '20px' }}>No resources available for this course yet.</p>
                    )}
                  </div>
                )}
                {activeTab === 'notes' && (
                  <div className="notes-content">
                    <div className="notes-header">
                      <h3>My Notes:</h3>
                      <div className="notes-mode-toggle">
                        <button
                          className={`mode-toggle-btn ${notesMode === 'edit' ? 'active' : ''}`}
                          onClick={() => setNotesMode('edit')}
                          disabled={notesLoading}
                        >
                          Edit
                        </button>
                        <button
                          className={`mode-toggle-btn ${notesMode === 'preview' ? 'active' : ''}`}
                          onClick={() => setNotesMode('preview')}
                          disabled={notesLoading}
                        >
                          Preview
                        </button>
                      </div>
                    </div>
                    {notesLoading && <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>Loading notes...</p>}
                    {notesMode === 'edit' ? (
                      <textarea 
                        className="notes-textarea" 
                        placeholder="Write your notes here... Supports Markdown:\n• # Heading\n• **bold** and *italic*\n• - Bullet points\n• 1. Numbered lists\n• [links](url)\n• > Quotes\n• \`code\`"
                        value={userNotes}
                        onChange={(e) => setUserNotes(e.target.value)}
                        disabled={notesLoading}
                      ></textarea>
                    ) : (
                      <div className="notes-preview markdown-body">
                        {userNotes ? (
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {userNotes}
                          </ReactMarkdown>
                        ) : (
                          <p style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                            No notes yet. Switch to Edit mode to start writing.
                          </p>
                        )}
                      </div>
                    )}
                    <div className="notes-actions">
                      <button 
                        className="notes-reset-btn"
                        onClick={handleNotesReset}
                        disabled={notesLoading}
                      >
                        Clear
                      </button>
                      <button 
                        className="notes-save-btn"
                        onClick={handleNotesSave}
                        disabled={notesLoading}
                      >
                        {notesLoading ? 'Saving...' : 'Save Notes'}
                      </button>
                    </div>
                    {notesSaved && (
                      <p style={{ color: '#4ade80', fontSize: '0.9rem', marginTop: '10px' }}>
                        ✓ Notes saved successfully
                      </p>
                    )}
                    {notesError && (
                      <p style={{ color: '#ff4444', fontSize: '0.9rem', marginTop: '10px' }}>
                        ✗ {notesError}
                      </p>
                    )}
                  </div>
                )}
                {activeTab === 'tutor' && (
                  <div className="tutor-content">
                    <h3>About the Tutor:</h3>
                    <div className="tutor-profile">
                      <div className="tutor-avatar">
                        <img
                          src={instructorAvatar}
                          alt={instructorName}
                          className="tutor-avatar-image"
                          onError={(e) => {
                            e.currentTarget.src = defaultProfileAvatar;
                          }}
                        />
                      </div>
                      <div className="tutor-info">
                        <h4 className="tutor-name">{instructorName}</h4>
                        <p className="tutor-role">{instructorTitle}</p>
                      </div>
                    </div>
                    <p className="tutor-bio">
                      {instructorBio}
                    </p>
                    <div className="tutor-social">
                      <button
                        type="button"
                        className="social-button Instagram"
                      >
                        <img src={instagramIcon} alt="Instagram" className="social-icon" />
                      </button>
                      <button
                        type="button"
                        className="social-button linkedin"
                      >
                        <img src={linkedinIcon} alt="LinkedIn" className="social-icon" />
                      </button>
                      <button
                        type="button"
                        className="social-button whatsapp"
                      >
                        <img src={whatsappIcon} alt="WhatsApp" className="social-icon" />
                      </button>
                      <button
                        type="button"
                        className="social-button x"
                      >
                        <img src={xIcon} alt="X" className="social-icon" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enrollment Modal */}
      {showEnrollModal && (
        <div className="enrollment-modal-overlay">
          <div className="enrollment-modal">
            <button
              type="button"
              className="enrollment-modal-close"
              onClick={() => setShowEnrollModal(false)}
              aria-label="Close modal"
            >
              ✕
            </button>

            <div className="enrollment-modal-content">
              <h2 className="enrollment-modal-title">Unlock This Course</h2>
              
              <div className="enrollment-modal-course-info">
                <img 
                  src={courseData?.thumbnail_url || courseVideoImage} 
                  alt={courseTitle}
                  className="enrollment-modal-image"
                />
                <div className="enrollment-modal-details">
                  <h3>{courseTitle}</h3>
                  <span className="enrollment-instructor">{instructorName}</span>
                  <span className="enrollment-duration">{courseDuration}</span>
                </div>
              </div>

              <p className="enrollment-modal-description">
                Enroll now to unlock full access to all lessons, discussions, notes, and resources.
              </p>

              <div className="enrollment-modal-actions">
                <button
                  type="button"
                  className="enrollment-modal-cancel"
                  onClick={() => setShowEnrollModal(false)}
                  disabled={enrolling}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="enrollment-modal-enroll"
                  onClick={enrollInCourse}
                  disabled={enrolling}
                >
                  {enrolling ? 'Enrolling...' : 'Enroll Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
        userName={certificateData?.userName}
        courseTitle={certificateData?.courseTitle}
        completionDate={certificateData?.completionDate}
        certificateId={certificateData?.certificateId}
        onDownload={handleCertificateDownload}
      />

      <Footer />
      {toast.visible && (
        <div className={`toast ${toast.type || ''} ${toast.visible ? '' : 'hide'}`} role="status" aria-live="polite">
          {toast.type === 'error' && <span className="toast-icon">✕</span>}
          {toast.type !== 'error' && <span className="toast-icon">✓</span>}
          <span className="toast-message">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default CourseVideoPage;

