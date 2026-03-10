# Frontend API Usage - Quick Reference Guide

## How It Works Now

### Development
```
You: npm run dev
  ↓
Frontend runs at: http://localhost:5173
  ↓
All API calls made to: /api/...
  ↓
Vite Proxy (configured in vite.config.js)
  ↓
Backend at: http://localhost:8000
  ↓
Result: API call succeeds ✅
```

### Production
```
You: (deployed to https://scopio.in)
  ↓
Frontend at: https://scopio.in
  ↓
All API calls made to: /api/...
  ↓
Nginx Reverse Proxy
  ↓
Backend
  ↓
Result: API call succeeds ✅
```

## Making API Calls

### Import the api instance

```javascript
import api from '../api';
```

### GET Request

```javascript
// Fetch user profile
const response = await api.get('/api/auth/profile/');
console.log(response.data);
```

### POST Request

```javascript
// Login
const response = await api.post('/api/auth/login/', {
  username: 'user@example.com',
  password: 'password123'
});
```

### With Parameters

```javascript
// Fetch notes for a course
const response = await api.get('/api/video/notes/', {
  params: { course: courseId }
});
```

### With Headers

```javascript
// Automatic - handled by interceptors:
// - Authorization: Bearer <access_token>
// - X-CSRFToken: <csrf_token>
// - withCredentials: true

// Skip auth for certain endpoints:
await api.get('/api/auth/csrf/', { skipAuth: true });
```

### Error Handling

```javascript
try {
  const response = await api.get('/api/auth/profile/');
  console.log(response.data);
} catch (error) {
  if (error.response?.status === 401) {
    console.log('Unauthorized - redirecting to login');
  } else {
    console.log('Error:', error.message);
  }
}
```

## Common Endpoints

### Authentication
```
POST /api/auth/login/           - Login with credentials
POST /api/auth/logout/          - Logout (destroy session)
GET  /api/auth/csrf/            - Get CSRF token
POST /api/auth/refresh/         - Refresh JWT token
GET  /api/auth/status/          - Check if logged in
GET  /api/auth/profile/         - Get user profile
```

### Courses & Learning
```
GET  /api/video/courses/        - List all courses
GET  /api/video/courses/{id}/   - Get course details
GET  /api/video/enrollments/    - Get user's enrolled courses
POST /api/video/enrollments/    - Enroll in a course
```

### Progress & Stats
```
GET  /api/video/user-stats/     - Get user statistics
GET  /api/video/leaderboard/    - Get leaderboard
GET  /api/video/daily-activity/ - Get daily activity
POST /api/video/mark-welcome-seen/ - Mark welcome video as seen
```

### Video Content
```
POST /api/video/notes/                              - Add notes
GET  /api/video/notes/?course={id}                 - Get notes
POST /api/video/lessons/{id}/update_watch_percentage/ - Update progress
POST /api/video/discussions/                        - Create discussion
POST /api/video/ratings/                           - Submit rating
```

### OAuth / Social Login
```
GET /glogin/google/start/    - Start Google OAuth flow (Not under /api!)
GET /glogin/google/finalize/ - Complete OAuth flow (Not under /api!)
GET /glogin/error/           - OAuth error handler (Not under /api!)
```

## Important Notes

### ⚠️ Important: Google OAuth URLs are NOT under `/api`
```javascript
// WRONG ❌
// Don't use API_BASE_URL for glogin
api.post('/api/glogin/google/start/'); 

// CORRECT ✅
// Use absolute paths for OAuth endpoints
window.location.href = '/glogin/google/start/?frontend_origin=...';
```

### ⚠️ File uploads
For file uploads, use the same `api` instance:

```javascript
const formData = new FormData();
formData.append('file', file);

const response = await api.post('/api/upload/', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});
```

### ⚠️ Environment Variables
- **Development**: No environment variables needed
- **Production**: No environment variables needed
- The app automatically works with relative paths (`/api`)

### ⚠️ CORS Headers
- You don't need to worry about CORS
- Relative paths work seamlessly
- Nginx in production handles routing

## Debugging

### Check Network Requests
1. Open DevTools → Network tab
2. Make an API call
3. Look for `/api/...` requests
4. Do NOT see `http://localhost:8000` or `127.0.0.1`
5. Do NOT see `https://scopio.in` with full backend domain

### If Something Goes Wrong

1. **Check vite.config.js proxy settings**
   - Should have `/api` → `http://localhost:8000`
   - Should have `changeOrigin: true`

2. **Check .env file**
   - Should be empty or have comments only
   - Should NOT have `VITE_API_URL=...`

3. **Check api.js**
   - Should have `export const API_BASE_URL = '/api'`
   - Should NOT have hardcoded backend URLs

4. **Check Django backend logs**
   - Requests should come from Vite proxy in dev
   - Requests should come from Nginx in production

## Examples

### Example 1: Fetch and Display Courses
```javascript
import { useEffect, useState } from 'react';
import api from '../api';

export function CourseList() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    async function loadCourses() {
      const response = await api.get('/api/video/courses/');
      setCourses(response.data);
    }
    loadCourses();
  }, []);

  return (
    <ul>
      {courses.map(course => (
        <li key={course.id}>{course.title}</li>
      ))}
    </ul>
  );
}
```

### Example 2: Handle Login with CSRF
```javascript
import { fetchCsrfToken, login } from '../api';

async function handleLogin(username, password) {
  try {
    // CSRF token is fetched automatically by login function
    const result = await login(username, password);
    console.log('Logged in as:', result.username);
  } catch (error) {
    console.error('Login failed:', error.message);
  }
}
```

### Example 3: Enroll in Course
```javascript
async function enrollCourse(courseId) {
  try {
    const response = await api.post('/api/video/enrollments/', {
      course: courseId
    });
    console.log('Enrolled successfully:', response.data);
  } catch (error) {
    if (error.response?.status === 401) {
      alert('Please login first');
    } else {
      alert('Enrollment failed');
    }
  }
}
```

## DO's and DON'Ts

### ✅ DO's
- ✅ Use `import api from '../api'`
- ✅ Make calls like `api.get('/api/endpoint/')`
- ✅ Let axios handle credentials and headers
- ✅ Use try/catch for error handling
- ✅ Use async/await for clean code

### ❌ DON'Ts
- ❌ Don't hardcode `localhost:8000`
- ❌ Don't hardcode `127.0.0.1`
- ❌ Don't hardcode `scopio.in`
- ❌ Don't use direct `axios.get()` or `fetch()`
- ❌ Don't include the domain in the path
- ❌ Don't forget `/api` prefix (except for `/glogin`)

## Support

If you encounter issues:
1. Check this guide
2. Review the verification report
3. Check browser DevTools Network tab
4. Review Django backend logs
5. Check vite.config.js proxy settings
