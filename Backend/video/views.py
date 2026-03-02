from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Avg, Sum
from django.db import models
from django.contrib.auth.models import User
from django.db.models.functions import Coalesce
from datetime import date, timedelta
from .models import Video, Course, Lesson, Discussion, Resource, UserProgress, UserNotes, Rating, Enrollment, UserXP, DailyXP
from .serializers import (
    VideoSerializer,
    CourseListSerializer,
    CourseDetailSerializer,
    LessonSerializer,
    DiscussionSerializer,
    ResourceSerializer,
    UserProgressSerializer,
    UserNotesSerializer,
    RatingSerializer,
    EnrollmentSerializer,
    UserXPSerializer,
    DailyXPSerializer
)


# ========== DEPRECATED (Backward Compatibility) ==========
class VideoViewSet(viewsets.ModelViewSet):
    """DEPRECATED: Kept for backward compatibility. Use CourseViewSet instead."""
    queryset = Video.objects.all()
    serializer_class = VideoSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


# ========== COURSE VIEWS ==========
class CourseViewSet(viewsets.ModelViewSet):
    """
    Course ViewSet
    
    list: GET /api/video/courses/ - Get all courses (for LearningPage)
    retrieve: GET /api/video/courses/{id}/ - Get single course with full details (for CourseVideoPage)
    create/update/destroy: Admin only
    """
    queryset = Course.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        """Use lightweight serializer for list, full details for retrieve"""
        if self.action == 'list':
            return CourseListSerializer
        return CourseDetailSerializer
    
    def get_queryset(self):
        """Filter published courses for regular users, show all for admins"""
        queryset = Course.objects.prefetch_related(
            'lessons', 'discussions', 'resources'
        )
        
        # Show only published courses to non-admin users
        if not (self.request.user.is_authenticated and self.request.user.is_staff):
            queryset = queryset.filter(is_published=True)
        
        return queryset
    
    def get_serializer_context(self):
        """Pass request to serializer for user-specific data"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def get_queryset(self):
        """Filter published courses for regular users, show all for admins"""
        queryset = Course.objects.prefetch_related(
            'lessons', 'discussions', 'resources'
        )
        
        # Show only published courses to non-admin users
        if not (self.request.user.is_authenticated and self.request.user.is_staff):
            queryset = queryset.filter(is_published=True)
        
        return queryset
    
    @action(detail=True, methods=['get'])
    def progress(self, request, pk=None):
        """Get detailed user progress for this course"""
        course = self.get_object()
        
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        lessons = course.lessons.all()
        progress = UserProgress.objects.filter(
            user=request.user,
            course=course
        ).select_related('lesson')
        
        completed_count = progress.filter(completed=True).count()
        total_count = lessons.count()
        
        progress_serializer = UserProgressSerializer(progress, many=True)
        
        return Response({
            'course_id': course.id,
            'course_title': course.title,
            'total_lessons': total_count,
            'completed_lessons': completed_count,
            'progress_percentage': int((completed_count / total_count * 100)) if total_count > 0 else 0,
            'progress_details': progress_serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def user_stats(self, request):
        """Get current user's total XP and learning stats"""
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        user_xp, _ = UserXP.objects.get_or_create(
            user=request.user,
            defaults={'has_seen_welcome': False}
        )
        
        # Count total lessons completed across all courses
        total_completed = UserProgress.objects.filter(
            user=request.user,
            completed=True
        ).count()
        
        # Get enrolled courses count
        enrolled_courses = Enrollment.objects.filter(user=request.user).count()
        
        return Response({
            'user_id': request.user.id,
            'username': request.user.username,
            'total_xp': user_xp.total_xp,
            'total_lessons_completed': total_completed,
            'enrolled_courses': enrolled_courses
        })


# ========== LESSON VIEWS ==========
class LessonViewSet(viewsets.ModelViewSet):
    """
    Lesson/Video ViewSet
    
    Filter by course: GET /api/video/lessons/?course={course_id}
    """
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        """Filter by course if provided"""
        queryset = Lesson.objects.select_related('course')
        
        course_id = self.request.query_params.get('course', None)
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def mark_complete(self, request, pk=None):
        """Mark lesson as completed and award XP from database only
        
        XP MUST come from lesson.time_xp field in database, NEVER random.
        Only awards XP on first completion of a lesson.
        """
        lesson = self.get_object()
        
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        progress, created = UserProgress.objects.get_or_create(
            user=request.user,
            course=lesson.course,
            lesson=lesson
        )
        
        xp_awarded = 0
        
        # Only award XP if this is the first time marking complete
        if not progress.completed:
            progress.completed = True
            progress.completed_at = timezone.now()
            progress.save()
            
            # *** XP MUST come from lesson.time_xp field in database ***
            # Extract XP from lesson's time_xp field (e.g., "450.00" -> 450)
            # NO RANDOM GENERATION - only database values
            if lesson.time_xp:
                try:
                    xp_value = float(lesson.time_xp)
                    xp_awarded = int(xp_value)
                    
                    # Validate XP is positive (sanity check)
                    if xp_awarded < 0:
                        xp_awarded = 0
                    
                except (ValueError, TypeError):
                    # If time_xp is invalid, award 0 XP
                    xp_awarded = 0
                    print(f"Warning: Invalid XP value in lesson {lesson.id}: {lesson.time_xp}")
            
            # Award XP to user (only if xp_awarded > 0)
            if xp_awarded > 0:
                user_xp, _ = UserXP.objects.get_or_create(
                    user=request.user,
                    defaults={'has_seen_welcome': False}
                )
                user_xp.add_xp(xp_awarded)
                
                # Track daily XP for streak calculation
                today = date.today()
                daily_xp, _ = DailyXP.objects.get_or_create(
                    user=request.user,
                    date=today
                )
                daily_xp.xp_earned += xp_awarded
                daily_xp.save()
        else:
            # Lesson already completed, no new XP
            progress.save()
        
        serializer = UserProgressSerializer(progress)
        return Response({
            **serializer.data,
            'xp_awarded': xp_awarded,
            'lesson_title': lesson.title,
            'lesson_xp_value': lesson.time_xp
        })
    
    @action(detail=True, methods=['post'])
    def update_progress(self, request, pk=None):
        """Update watch position for a lesson"""
        lesson = self.get_object()
        
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        last_position = request.data.get('last_position', 0)
        
        progress, created = UserProgress.objects.get_or_create(
            user=request.user,
            course=lesson.course,
            lesson=lesson
        )
        
        progress.last_position = last_position
        progress.save()
        
        serializer = UserProgressSerializer(progress)
        return Response(serializer.data)


# ========== DISCUSSION VIEWS ==========
class DiscussionViewSet(viewsets.ModelViewSet):
    """
    Discussion/Comments ViewSet
    
    Filter by course: GET /api/video/discussions/?course={course_id}
    """
    queryset = Discussion.objects.all()
    serializer_class = DiscussionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        """Filter by course if provided"""
        queryset = Discussion.objects.select_related('course', 'user')
        
        course_id = self.request.query_params.get('course', None)
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        
        return queryset
    
    def perform_create(self, serializer):
        """Auto-set user when creating discussion"""
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        """Increment likes for a discussion"""
        discussion = self.get_object()
        discussion.likes_count += 1
        discussion.save()
        
        serializer = self.get_serializer(discussion)
        return Response(serializer.data)


# ========== RESOURCE VIEWS ==========
class ResourceViewSet(viewsets.ModelViewSet):
    """
    Course Resources ViewSet
    
    Filter by course: GET /api/video/resources/?course={course_id}
    """
    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        """Filter by course if provided"""
        queryset = Resource.objects.select_related('course')
        
        course_id = self.request.query_params.get('course', None)
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        
        return queryset


# ========== USER PROGRESS VIEWS ==========
class UserProgressViewSet(viewsets.ModelViewSet):
    """
    User Progress ViewSet (authenticated users only)
    
    Automatically filters to current user's progress
    """
    serializer_class = UserProgressSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Only show current user's progress"""
        return UserProgress.objects.filter(
            user=self.request.user
        ).select_related('course', 'lesson')
    
    def perform_create(self, serializer):
        """Auto-set user when creating progress"""
        serializer.save(user=self.request.user)


# ========== USER NOTES VIEWS ==========
class UserNotesViewSet(viewsets.ModelViewSet):
    """
    User Notes ViewSet (authenticated users only)
    
    Automatically filters to current user's notes
    Filter by course: GET /api/video/notes/?course={course_id}
    """
    serializer_class = UserNotesSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Only show current user's notes"""
        queryset = UserNotes.objects.filter(
            user=self.request.user
        ).select_related('course')
        
        course_id = self.request.query_params.get('course', None)
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        
        return queryset
    
    def perform_create(self, serializer):
        """Auto-set user when creating notes"""
        serializer.save(user=self.request.user)


# ========== RATING VIEWS ==========
class RatingViewSet(viewsets.ModelViewSet):
    """
    Course Rating ViewSet (authenticated users only)
    
    Users can rate each course once (1-5 stars)
    Filter by course: GET /api/video/ratings/?course={course_id}
    """
    serializer_class = RatingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Show all ratings or filter by course"""
        queryset = Rating.objects.select_related('course', 'user')
        
        course_id = self.request.query_params.get('course', None)
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        
        return queryset
    
    def perform_create(self, serializer):
        """Auto-set user when creating rating"""
        serializer.save(user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        """Create or update rating (one rating per user per course)"""
        course_id = request.data.get('course')
        rating_value = request.data.get('rating')
        
        if not course_id or not rating_value:
            return Response(
                {'error': 'Course and rating are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user already rated this course
        existing_rating = Rating.objects.filter(
            user=request.user,
            course_id=course_id
        ).first()
        
        if existing_rating:
            # Update existing rating
            existing_rating.rating = rating_value
            existing_rating.save()
            serializer = self.get_serializer(existing_rating)
            return Response(serializer.data)
        
        # Create new rating
        return super().create(request, *args, **kwargs)


# ========== ENROLLMENT VIEWS ==========
class EnrollmentViewSet(viewsets.ModelViewSet):
    """
    Course Enrollment ViewSet (authenticated users only)
    
    Auto-enrolls users after 30 seconds of viewing
    GET /api/video/enrollments/ - Get user's enrolled courses
    POST /api/video/enrollments/ - Enroll in a course (with watch time tracking)
    """
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Only show current user's enrollments"""
        return Enrollment.objects.filter(
            user=self.request.user
        ).select_related('course').order_by('-last_accessed')
    
    def perform_create(self, serializer):
        """Auto-set user when creating enrollment"""
        serializer.save(user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        """Create or update enrollment with watch time tracking"""
        course_id = request.data.get('course')
        watch_time = int(request.data.get('watch_time', 0))  # seconds
        
        if not course_id:
            return Response(
                {'error': 'Course ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Verify course exists
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response(
                {'error': f'Course with ID {course_id} does not exist'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if enrollment already exists
        enrollment, created = Enrollment.objects.get_or_create(
            user=request.user,
            course_id=course_id,
            defaults={'total_watch_time': watch_time}
        )
        
        if not created:
            # Update watch time for existing enrollment
            enrollment.total_watch_time += watch_time
            enrollment.save()
        
        serializer = self.get_serializer(enrollment, context={'request': request})
        return Response(
            {
                **serializer.data,
                'created': created,
                'message': 'Enrolled in course' if created else 'Watch time updated'
            },
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )


# ========== USER STATISTICS ENDPOINT ==========

STREAK_THRESHOLD = 150


def calculate_current_streak_for_user(user):
    """Calculate consecutive streak days with STREAK_THRESHOLD+ XP."""
    streak_days = 0
    today = date.today()
    check_date = today

    while True:
        daily_xp = DailyXP.objects.filter(
            user=user,
            date=check_date,
            xp_earned__gte=STREAK_THRESHOLD
        ).first()

        if daily_xp:
            streak_days += 1
            check_date -= timedelta(days=1)
        else:
            # If today has no XP yet, check yesterday to maintain streak
            if check_date == today and streak_days == 0:
                check_date -= timedelta(days=1)
                continue
            break

    return streak_days

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_stats(request):
    """
    Calculate and return user statistics for dashboard:
    - learning_hours: Total time spent watching courses (in hours)
    - streak_days: Consecutive days with at least 150 XP
    - progress: Overall completion percentage
    - achievements: Total completed lessons
    """
    user = request.user
    
    # 1. Calculate learning hours from total watch time
    total_watch_time = Enrollment.objects.filter(user=user).aggregate(
        total=Sum('total_watch_time')
    )['total'] or 0
    learning_hours = round(total_watch_time / 3600, 1)  # Convert seconds to hours
    
    # 2. Calculate current streak (consecutive days with 150+ XP)
    streak_days = calculate_current_streak_for_user(user)
    
    # 3. Calculate progress (percentage of completed lessons)
    total_lessons = Lesson.objects.count()
    completed_lessons = UserProgress.objects.filter(
        user=user,
        completed=True
    ).count()
    progress = int((completed_lessons / total_lessons * 100)) if total_lessons > 0 else 0
    
    # 4. Calculate achievements (completed lessons count)
    achievements = completed_lessons
    
    # 5. Get or create user XP profile for first-time check
    user_xp, created = UserXP.objects.get_or_create(
        user=user,
        defaults={'has_seen_welcome': False}
    )
    is_first_visit = not user_xp.has_seen_welcome
    
    # Debug logging
    print(f"DEBUG - User: {user.username}")
    print(f"DEBUG - UserXP created: {created}")
    print(f"DEBUG - has_seen_welcome: {user_xp.has_seen_welcome}")
    print(f"DEBUG - is_first_visit: {is_first_visit}")
    
    return Response({
        'learning_hours': learning_hours,
        'streak_days': streak_days,
        'progress': progress,
        'achievements': achievements,
        'total_xp': user_xp.total_xp,
        'is_first_visit': is_first_visit
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def daily_activity(request):
    """
    Get user's daily activity data for calendar visualization
    Query params:
    - month: Month number (1-12), defaults to current month
    - year: Year (YYYY), defaults to current year
    
    Returns daily XP, completion status, and streak information
    """
    user = request.user
    
    # Parse month and year from query params
    try:
        month = int(request.GET.get('month', date.today().month))
        year = int(request.GET.get('year', date.today().year))
    except ValueError:
        return Response(
            {'error': 'Invalid month or year parameter'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validate month
    if month < 1 or month > 12:
        return Response(
            {'error': 'Month must be between 1 and 12'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Get first and last day of the month
    from calendar import monthrange
    _, last_day = monthrange(year, month)
    start_date = date(year, month, 1)
    end_date = date(year, month, last_day)
    
    # Fetch all daily XP records for the month
    daily_records = DailyXP.objects.filter(
        user=user,
        date__gte=start_date,
        date__lte=end_date
    ).values('date', 'xp_earned')
    
    # Create a dictionary for easy lookup
    daily_data = {}
    for record in daily_records:
        day_num = record['date'].day
        daily_data[day_num] = {
            'xp': record['xp_earned'],
            'has_activity': record['xp_earned'] > 0,
            'meets_streak': record['xp_earned'] >= 150
        }
    
    # Calculate current streak for context
    streak_days = calculate_current_streak_for_user(user)
    
    return Response({
        'month': month,
        'year': year,
        'days_in_month': last_day,
        'daily_data': daily_data,
        'current_streak': streak_days,
        'streak_threshold': STREAK_THRESHOLD
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def leaderboard(request):
    """
    Leaderboard sorted by total XP descending.
    XP source is UserXP.total_xp (awarded from lesson.time_xp on first completion).
    """
    users = User.objects.filter(is_active=True).annotate(
        total_xp=Coalesce(models.F('xp_profile__total_xp'), 0)
    ).order_by('-total_xp', 'date_joined', 'username')

    leaderboard_rows = []
    for rank, user in enumerate(users, start=1):
        full_name = user.get_full_name().strip()
        leaderboard_rows.append({
            'rank': rank,
            'user_id': user.id,
            'name': full_name or user.username,
            'username': user.username,
            'total_xp': user.total_xp,
            'streak_days': calculate_current_streak_for_user(user)
        })

    return Response({
        'count': len(leaderboard_rows),
        'results': leaderboard_rows
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_welcome_seen(request):
    """
    Mark that user has seen the welcome page (for first-time greeting)
    """
    user = request.user
    user_xp, created = UserXP.objects.get_or_create(
        user=user,
        defaults={'has_seen_welcome': False}
    )
    
    if not user_xp.has_seen_welcome:
        user_xp.has_seen_welcome = True
        user_xp.save()
        return Response({
            'success': True,
            'message': 'Welcome marked as seen'
        })
    
    return Response({
        'success': True,
        'message': 'Already marked as seen'
    })

