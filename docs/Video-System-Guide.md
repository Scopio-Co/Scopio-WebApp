# Video Fetching & Embedding: How It Works and How To Grow It

This guide explains, in beginner-friendly terms, how your app fetches video data from Django and displays it in React, why it was built this way, and practical steps to evolve it into a dynamic, full-featured edtech experience.

## Overview
- **Backend (Django + DRF)**: Stores video records (title, URL, timestamp) and exposes them over REST at `/api/video/videos/` using a `ModelViewSet` (CRUD API, secured with permissive read access).
- **Frontend (React + Axios)**: Calls the API via `fetchVideos()`, keeps results in component state, converts normal YouTube links into embeddable URLs, and renders them in an `<iframe>` with a lessons list.
- **Auth**: Axios attaches a JWT `Authorization` header when present. Unauthenticated users can read videos due to `IsAuthenticatedOrReadOnly`.

## Data Flow (End-to-End)
1. **Database row**: A `Video` row holds `title`, `url`, and `added` timestamp.
2. **Serializer**: `VideoSerializer` describes how to turn a `Video` model into JSON: `{ id, title, url, added }`.
3. **ViewSet**: `VideoViewSet` provides list/detail/create/update/delete endpoints automatically (thanks to DRF’s `ModelViewSet`).
4. **Routing**: `video/urls.py` registers `videos` under a router. `main/urls.py` mounts it at `/api/video/`, giving you `/api/video/videos/`.
5. **Frontend API client**: `frontend/src/api.js` creates an Axios instance with `baseURL = VITE_API_URL` and adds JWT if available. `fetchVideos()` GETs `/api/video/videos/`.
6. **React page**: `CourseVideoPage.jsx` calls `fetchVideos()` on mount, stores the response in `videos`, derives `lessons = videos.map(...)`, and renders:
   - a preview image and a play button (before a lesson is selected)
   - when a lesson is selected, an `<iframe>` pointing to `https://www.youtube.com/embed/<id>`
   - a right-hand list of lessons that sets the active video

## Why These Choices
- **ModelViewSet + Router**: Quick, conventional way to expose CRUD endpoints for a simple resource like `Video`.
- **Serializer**: Keeps API responses controlled, predictable, and versionable.
- **Axios Interceptor**: Centralizes auth header handling so individual API calls stay clean.
- **YouTube embed**: Using the standard embed URL avoids hosting and streaming costs, and works across devices.

## How Videos Connect to React (Conceptual)
- React asks Django for `videos` → Django returns JSON array.
- React holds that array in state → transforms regular watch links (e.g. `https://youtube.com/watch?v=abc`) to embed links (`https://www.youtube.com/embed/abc`).
- React renders the embed in an `<iframe>`. The overlay now has `pointer-events: none`, so clicks reach the player.
- The lesson sidebar is just the same data, clickable to change the `currentLessonIndex`.

## Making Course Pages Dynamic (Mentor Guidance)
Right now the “Overview/Resources/Notes/Tutor” are template text. To make each course page truly dynamic:

### 1) Model Your Domain
- Add a `Course` model (title, description, tutor, resources, etc.).
- Relate `Video` to `Course` via `ForeignKey(course, related_name='videos')`.
- Optional: Add `Lesson` model to store duration, order, and content separate from raw video URL.

### 2) Design REST Endpoints
- `GET /api/courses/` → list of courses (with minimal fields)
- `GET /api/courses/:id/` → detailed course (including tutor, resources, notes metadata)
- `GET /api/courses/:id/videos/` → the list of videos for that course
- Optional: nest videos inside course detail if page always needs them (`CourseSerializer` with `videos = VideoSerializer(many=True)`).

### 3) Client-Side Routing and Data Fetching
- Use a dynamic route like `/courses/:courseId`.
- In `CourseVideoPage`, read `courseId` from the route params, then fetch:
  - Course detail → populate overview text, tutor, resources, etc.
  - Course videos → populate lessons list and player
- Consider React Query (or SWR) for caching, loading states, retries, and syncing.

### 4) Componentize the Page
- Split the page into small components driven purely by props:
  - `VideoPlayer` (accepts `embedUrl` and shows the iframe)
  - `LessonsSidebar` (renders lessons, emits `onSelect(index)`)
  - `OverviewPanel`, `ResourcesPanel`, `NotesPanel`, `TutorPanel`
- Each component maps to a backend field. If the backend data changes, the UI updates without code edits.

### 5) Content Management and Admin UX
- Use Django Admin to author courses, videos, and resources.
- Add admin validations for correct video URL formats and required fields.

## Enhancements Roadmap (Edtech Features)
- **Playback UX**: Save progress per user (resume where left off). Store `last_watched_position` per `user/course/video`.
- **Assessments**: Add quizzes tied to timestamps. Show “Checkpoints” in the lesson.
- **Transcripts & Accessibility**: Provide captions (WebVTT), transcript search, keyboard shortcuts.
- **Resources**: Make resources data-driven (link list in DB), attach to course or lesson.
- **Notes**: Persist notes per user/course in the backend; support Markdown rendering.
- **Analytics**: Track watch time, completion, drop-off points; display tutor dashboards.
- **Performance**: Lazy-load iframes, prefetch next lesson, use thumbnails.
- **Security**: Sanitize rich text, set a sensible CSP, validate URLs server-side.
- **Video Providers**: Support Vimeo, Wistia, or self-hosted HLS (via `hls.js`) for non-YouTube content.
- **YouTube API**: Add `enablejsapi=1` to embed and use the Player API for fine-grained control (play/pause events, progress).

## Concrete Backend Changes (Example Sketch)
> Not exact code—this is a conceptual plan you can implement.

1. Create `Course` model:
   - `title`, `description`, `tutor_name`, `tutor_bio`, `resources (JSON)`
2. Update `Video` model:
   - Add `course = models.ForeignKey(Course, related_name='videos', on_delete=models.CASCADE)`
3. Serializers:
   - `CourseSerializer` with nested `videos` or separate endpoints
4. Views/URLs:
   - `CourseViewSet` and routes under `/api/courses/`
   - Sub-route or filter for `/api/courses/:id/videos/`

## Concrete Frontend Changes (Example Sketch)
1. Routing:
   - Add route: `/courses/:courseId` → `CourseVideoPage`
2. Data Fetching:
   - `fetchCourse(courseId)` and `fetchCourseVideos(courseId)`
3. State:
   - Keep `course` and `videos` in state; render panels from `course` fields instead of hardcoded text.
4. Player:
   - Add a `toEmbedUrl()` that supports multiple providers; add `enablejsapi=1` when needed.

## Environment & Dev Tips
- Set `VITE_API_URL` in your frontend env (e.g. `http://localhost:8000`).
- Ensure CORS is configured in Django (you have `django-cors-headers` installed). Allow your frontend origin.
- Use pagination for large video lists and show loading states gracefully.

## Summary
You’ve built a clean pipeline: Django exposes video data → React consumes it and renders YouTube embeds. To transform this into a fully dynamic course experience, introduce a `Course` domain model, course-centric endpoints, route by `courseId`, and drive each page panel from server data. Layer on edtech features like progress, assessments, transcripts, and resources, and you’ll have a robust, scalable learning platform.
