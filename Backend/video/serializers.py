from rest_framework import serializers
from .models import Video, Course, Lesson, Discussion, Resource, UserProgress, UserNotes, Rating, Enrollment, UserXP


# ========== DEPRECATED (Backward Compatibility) ==========
class VideoSerializer(serializers.ModelSerializer):
    """DEPRECATED: Kept for backward compatibility"""
    class Meta:
        model = Video
        fields = ['id', 'title', 'url', 'added']


# ========== LESSON SERIALIZERS ==========
class LessonSerializer(serializers.ModelSerializer):
    """Full lesson details"""
    class Meta:
        model = Lesson
        fields = [
            'id', 'course', 'title', 'duration', 'time_xp',
            'video_url', 'thumbnail_url', 'order',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class LessonMinimalSerializer(serializers.ModelSerializer):
    """Minimal lesson info for course detail view"""
    completed = serializers.SerializerMethodField()
    
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'duration', 'time_xp', 'video_url', 'thumbnail_url', 'order', 'completed']
    
    def get_completed(self, obj):
        """Check if current user completed this lesson"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            progress = UserProgress.objects.filter(user=request.user, lesson=obj).first()
            return progress.completed if progress else False
        return False


# ========== DISCUSSION SERIALIZERS ==========
class DiscussionSerializer(serializers.ModelSerializer):
    """Discussion/comments for courses"""
    author_name = serializers.CharField(required=False, allow_blank=True)
    author_role = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = Discussion
        fields = [
            'id', 'course', 'user', 'author_name', 'author_role',
            'comment', 'likes_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at', 'likes_count']
    
    def create(self, validated_data):
        """Auto-populate author info from user if not provided"""
        user = self.context['request'].user
        if not validated_data.get('author_name'):
            validated_data['author_name'] = user.get_full_name() or user.username
        if not validated_data.get('author_role'):
            validated_data['author_role'] = 'Student'
        validated_data['user'] = user
        return super().create(validated_data)


# ========== RESOURCE SERIALIZERS ==========
class ResourceSerializer(serializers.ModelSerializer):
    """Course resources (Github, Code, etc.)"""
    class Meta:
        model = Resource
        fields = ['id', 'course', 'label', 'url', 'order', 'created_at']
        read_only_fields = ['created_at']


# ========== COURSE SERIALIZERS ==========
class CourseListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for course listing (LearningPage)"""
    total_lessons = serializers.IntegerField(read_only=True)
    progress_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'thumbnail_url',
            'instructor_name', 'instructor_title', 'instructor_avatar_url',
            'rating', 'total_duration', 'total_lessons',
            'progress_percentage', 'is_published', 'created_at'
        ]
    
    def get_progress_percentage(self, obj):
        """Calculate user's progress percentage for this course"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            total = obj.lessons.count()
            if total == 0:
                return 0
            completed = UserProgress.objects.filter(
                user=request.user,
                course=obj,
                completed=True
            ).count()
            return int((completed / total) * 100)
        return 0


class CourseDetailSerializer(serializers.ModelSerializer):
    """Full course details (CourseVideoPage) - includes lessons, discussions, resources"""
    lessons = LessonMinimalSerializer(many=True, read_only=True)
    discussions = DiscussionSerializer(many=True, read_only=True)
    resources = ResourceSerializer(many=True, read_only=True)
    total_lessons = serializers.IntegerField(read_only=True)
    progress_info = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    user_rating = serializers.SerializerMethodField()
    total_ratings = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'thumbnail_url',
            'instructor_name', 'instructor_title', 'instructor_bio',
            'instructor_avatar_url', 'instructor_social_links',
            'what_you_learn', 'prerequisites', 'rating', 'average_rating', 
            'user_rating', 'total_ratings', 'total_duration',
            'total_lessons', 'progress_info',
            'lessons', 'discussions', 'resources',
            'is_published', 'created_at', 'updated_at'
        ]
    
    def get_progress_info(self, obj):
        """Get progress like '4/12 completed'"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            total = obj.lessons.count()
            completed = UserProgress.objects.filter(
                user=request.user,
                course=obj,
                completed=True
            ).count()
            return {
                'completed': completed,
                'total': total,
                'text': f"{completed}/{total} completed"
            }
        return {'completed': 0, 'total': obj.lessons.count(), 'text': '0/0 completed'}
    
    def get_average_rating(self, obj):
        """Calculate average rating from all user ratings"""
        from django.db.models import Avg
        avg = obj.ratings.aggregate(Avg('rating'))['rating__avg']
        return round(avg, 1) if avg else 0.0
    
    def get_user_rating(self, obj):
        """Get current user's rating for this course"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            user_rating = obj.ratings.filter(user=request.user).first()
            return user_rating.rating if user_rating else None
        return None
    
    def get_total_ratings(self, obj):
        """Get total number of ratings"""
        return obj.ratings.count()


# ========== PROGRESS SERIALIZERS ==========
class UserProgressSerializer(serializers.ModelSerializer):
    """Track user lesson progress"""
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    
    class Meta:
        model = UserProgress
        fields = [
            'id', 'user', 'course', 'lesson', 'lesson_title',
            'completed', 'completed_at', 'last_position',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']



# ========== RATING SERIALIZERS ==========
class RatingSerializer(serializers.ModelSerializer):
    """User ratings for courses"""
    class Meta:
        model = Rating
        fields = [
            'id', 'user', 'course', 'rating',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        """Auto-populate user from request"""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
    
    def validate_rating(self, value):
        """Ensure rating is between 1 and 5"""
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value

# ========== NOTES SERIALIZERS ==========
class UserNotesSerializer(serializers.ModelSerializer):
    """User's course notes"""
    course_title = serializers.CharField(source='course.title', read_only=True)
    
    class Meta:
        model = UserNotes
        fields = [
            'id', 'user', 'course', 'course_title',
            'notes_text', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']


# ========== USER XP SERIALIZER ==========
class UserXPSerializer(serializers.ModelSerializer):
    """Track user's total XP from lesson completions"""
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = UserXP
        fields = [
            'id', 'user', 'username', 'total_xp',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['total_xp', 'created_at', 'updated_at']


# ========== ENROLLMENT SERIALIZERS ==========
class EnrollmentSerializer(serializers.ModelSerializer):
    """User course enrollments with progress tracking"""
    course_title = serializers.CharField(source='course.title', read_only=True)
    course_thumbnail = serializers.URLField(source='course.thumbnail_url', read_only=True)
    course_description = serializers.CharField(source='course.description', read_only=True)
    instructor_name = serializers.CharField(source='course.instructor_name', read_only=True)
    instructor_title = serializers.CharField(source='course.instructor_title', read_only=True)
    total_duration = serializers.CharField(source='course.total_duration', read_only=True)
    rating = serializers.DecimalField(source='course.rating', max_digits=3, decimal_places=1, read_only=True)
    total_lessons = serializers.IntegerField(source='course.total_lessons', read_only=True)
    progress_percentage = serializers.SerializerMethodField()
    completed_lessons = serializers.SerializerMethodField()
    
    class Meta:
        model = Enrollment
        fields = [
            'id', 'user', 'course', 'course_title', 'course_thumbnail',
            'course_description', 'instructor_name', 'instructor_title',
            'total_duration', 'rating', 'total_lessons',
            'progress_percentage', 'completed_lessons',
            'enrolled_at', 'total_watch_time', 'last_accessed'
        ]
        read_only_fields = ['user', 'enrolled_at', 'last_accessed']
    
    def get_progress_percentage(self, obj):
        """Calculate user's progress percentage for this course"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            total = obj.course.lessons.count()
            if total == 0:
                return 0
            completed = UserProgress.objects.filter(
                user=request.user,
                course=obj.course,
                completed=True
            ).count()
            return int((completed / total) * 100)
        return 0
    
    def get_completed_lessons(self, obj):
        """Get count of completed lessons"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            completed = UserProgress.objects.filter(
                user=request.user,
                course=obj.course,
                completed=True
            ).count()
            return completed
        return 0
