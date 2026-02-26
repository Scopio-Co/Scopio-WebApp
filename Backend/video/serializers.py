from rest_framework import serializers
from .models import Video, Course, Lesson, Discussion, Resource, UserProgress, UserNotes


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
        fields = ['id', 'title', 'duration', 'time_xp', 'video_url', 'order', 'completed']
    
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
    class Meta:
        model = Discussion
        fields = [
            'id', 'course', 'user', 'author_name', 'author_role',
            'comment', 'likes_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']


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
    
    class Meta:
        model = Course
        fields = [
            'id', 'title', 'description', 'thumbnail_url',
            'instructor_name', 'instructor_title', 'instructor_bio',
            'instructor_avatar_url', 'instructor_social_links',
            'what_you_learn', 'prerequisites', 'rating', 'total_duration',
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
