# Video System Cheat Sheet — One‑Liners (How + Why)

## Backend
- **`Video` model**: Store `title/url/added`; keeps video metadata simple and queryable.
- **`VideoSerializer`**: Expose `{id,title,url,added}`; controls payload shape and stability.
- **`VideoViewSet`**: Auto-CRUD endpoints; minimizes boilerplate and follows REST conventions.
- **Router + URLs**: Mount under `/api/video/videos/`; provides predictable resource path.
- **Permissions**: `IsAuthenticatedOrReadOnly`; allow public reads, protect writes.

## Frontend
- **Axios client**: `baseURL` from `VITE_API_URL`; portable across environments.
- **Auth interceptor**: Adds `Authorization: Bearer <token>` when present; centralizes auth.
- **`fetchVideos()`**: GET `/api/video/videos/`; decouples components from HTTP details.
- **State management**: `videos/loading/error/currentLessonIndex`; drives UI and UX.
- **`toEmbedUrl()`**: Convert watch/short YouTube URLs to embed; makes them playable.
- **`iframe` options**: `allow` + `allowFullScreen`; enable playback features and fullscreen.
- **Lessons sidebar**: Click sets active index; updates player via state.

## UI Fix
- **Overlay clicks**: `pointer-events: none` on overlay; lets clicks reach the iframe.

## Dynamic Course Pages
- **Course model**: Add `Course` and FK from `Video`; ties videos to specific courses.
- **Course endpoints**: `/api/courses/:id` + `/api/courses/:id/videos/`; fetch per course.
- **Routing**: Use `/courses/:courseId`; load course and its videos dynamically.
- **Componentization**: Split panels (`Overview/Resources/Notes/Tutor`); props-driven from API.

## Edtech Enhancements
- **Progress tracking**: Persist watch position per user; resume playback.
- **Assessments**: Timestamped quizzes/checkpoints; reinforce learning.
- **Accessibility**: Captions (WebVTT) + transcripts; inclusive experience.
- **Resources/Notes**: Store per course/user; render markdown.
- **Analytics**: Track engagement and completion; improve content quality.
- **Security**: Validate/sanitize URLs and rich text; safer embeds.
- **Providers**: Support Vimeo/Wistia/HLS; flexibility beyond YouTube.
- **YouTube Player API**: Add `enablejsapi=1`; control playback and collect events.

## Quick Commands
```bash
# Backend (from Backend/)
python manage.py runserver

# Frontend (from frontend/)
npm install
npm run dev

# Frontend env (in frontend/.env)
VITE_API_URL=http://localhost:8000
```