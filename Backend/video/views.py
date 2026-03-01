from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Avg
from .models import Video, Course, Lesson, Discussion, Resource, UserProgress, UserNotes, Rating, Enrollment
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
    EnrollmentSerializer
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
        """Mark lesson as completed"""
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
        
        progress.completed = True
        progress.completed_at = timezone.now()
        progress.save()
        
        serializer = UserProgressSerializer(progress)
        return Response(serializer.data)
    
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
        
        serializer = self.get_serializer(enrollment)
        return Response(
            {
                **serializer.data,
                'created': created,
                'message': 'Enrolled in course' if created else 'Watch time updated'
            },
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )

