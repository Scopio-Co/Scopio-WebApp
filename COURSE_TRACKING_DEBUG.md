## Course Tracking & Enrollment System - Debug Guide

### ✅ Database Status (Verified)
- **React JS Masterclass** (ID: 8)
  - Status: Published ✓
  - Lessons: 5
    * Introduction to React JS: 450.00 XP (from database)
    * Setting Up Environment: 380.50 XP (from database)
    * Components and Props: 520.25 XP (from database)
    * Understanding React Hooks: 485.75 XP (from database)
    * State Management: 570.00 XP (from database)

- **Test 1** (ID: 7)
  - Status: Published ✓
  - Lessons: 3
    * Module 1: 250 XP (from database)
    * Module 2: 250 XP (from database)
    * Module 3: 250 XP (from database)

### ✅ XP System (Guaranteed Database Only)
- **XP Source**: lesson.time_xp field in database ONLY
- **No Random Generation**: Explicitly prevented in backend code
- **Flow**:
  1. User clicks "Mark as Complete" button
  2. Backend reads lesson.time_xp from database
  3. Converts to integer (451.02 → 451)
  4. Awards XP only on FIRST completion
  5. Subsequent completions don't award XP again

### ✅ Enrollment System (Updated)
**Endpoint**: `POST /api/video/enrollments/`
**Request Body**:
```json
{
  "course": 8,
  "watch_time": 1
}
```
**Expected Response**:
```json
{
  "id": xxx,
  "course": 8,
  "course_title": "React JS Masterclass",
  "course_thumbnail": "...",
  "total_lessons": 5,
  "progress_percentage": 0,
  "completed_lessons": 0,
  "created": true,
  "message": "Enrolled in course"
}
```

### Troubleshooting Enrollment Issues

#### Issue #1: Courses Not Showing on Explore Page
**Checklist**:
- [ ] Backend server running on port 8000? Check
- [ ] API URL correct in `.env`? (Should be `http://127.0.0.1:8000`)
- [ ] Courses marked as `is_published=True`? ✓ (verified)
- [ ] Authentication token in localStorage? Check DevTools → Application → localStorage

**Test in Browser Console**:
```javascript
fetch('http://127.0.0.1:8000/api/video/courses/', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}` }
})
.then(r => r.json())
.then(d => console.log('Courses:', d.length))
```

#### Issue #2: Enrollment Modal Shows But Won't Enroll
**Debug Steps**:
1. Open DevTools → Console
2. Click "Enroll Now" button
3. Look for logs like:
   - `✓ Enrolled in course:` → Success
   - `Error enrolling in course:` → Check error message
4. Check Network tab for the POST request
   - Status should be 201 (Created) or 200 (OK)

**Common Errors**:
- `401 Unauthorized`: User not authenticated (re-login)
- `400 Bad Request`: Course ID not sent (frontend bug)
- `404 Not Found`: Course doesn't exist (use ID 7 or 8)

#### Issue #3: Enrollment Succeeds But Can't See Enrolled Courses
**Check**:
- Go to Learning page
- Should show enrolled courses with progress bars
- If empty: User not actually enrolled (check DB directly)

**Test in Browser Console**:
```javascript
fetch('http://127.0.0.1:8000/api/video/enrollments/', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}` }
})
.then(r => r.json())
.then(d => console.log('Enrollments:', d))
```

### Direct Database Check

```bash
cd d:\Scopio\Backend
python check_courses.py  # Shows all courses and XP values
```

Or via Django shell:
```bash
python manage.py shell
>>> from video.models import Course, Enrollment
>>> Course.objects.count()  # Should be 2
>>> Enrollment.objects.count()  # Should increase after enrollment
>>> from django.contrib.auth.models import User
>>> Enrollment.objects.filter(user=User.objects.first())  # User's enrollments
```

### XP Verification

**Backend Validation**: All XP comes from `lesson.time_xp` field
- Extracts float value safely
- Converts to integer (truncates decimals)
- Validates positive value
- Falls back to 0 if invalid
- Only awards on first completion

**Frontend Validation**: No random generation anywhere
- XP displays only what backend returns
- Backend response includes `xp_awarded` and `lesson_xp_value`
- Console logs show source: `XP from database: {value} → Awarded: {value}`

### API Endpoints (All Require Authentication)

```
GET  /api/video/courses/                    # List all published courses
GET  /api/video/courses/{id}/               # Course details + lessons
GET  /api/video/enrollments/                # User's enrolled courses
POST /api/video/enrollments/                # Enroll in a course
POST /api/video/lessons/{id}/mark_complete/ # Mark lesson as done + award XP
GET  /api/video/courses/user_stats/         # Get user XP + lesson count
```

### Next Steps to Debug
1. Check Explore page loads courses ✓
2. Try enrolling using browser console test above
3. Check Learning page shows enrollments
4. Try marking a lesson complete and check XP awarded
5. Verify XP only comes from database values

