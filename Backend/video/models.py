from django.db import models
from django.contrib.auth.models import User
from embed_video.fields import EmbedVideoField


class Course(models.Model):
    """Main course model - matches CourseVideoPage structure"""
    # Basic Info
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, help_text="About this course")
    thumbnail_url = models.URLField(blank=True, help_text="Course card image")
    
    # Instructor Info (from Tutor tab)
    instructor_name = models.CharField(max_length=255, blank=True)
    instructor_title = models.CharField(max_length=255, blank=True, help_text="e.g., 'Web Dev @capestart'")
    instructor_bio = models.TextField(blank=True, help_text="Full bio text from Tutor tab")
    instructor_avatar_url = models.URLField(blank=True)
    instructor_social_links = models.JSONField(
        default=dict, 
        blank=True,
        help_text="Social links: {instagram: '', linkedin: '', whatsapp: '', x: ''}"
    )
    
    # Course Details
    what_you_learn = models.JSONField(
        default=list,
        blank=True,
        help_text="Array of learning points: ['Core concepts', 'JSX', ...]"
    )
    prerequisites = models.TextField(blank=True)
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=0.0, help_text="e.g., 4.3")
    total_duration = models.CharField(max_length=100, blank=True, help_text="e.g., '3 Components', '10 hours'")
    
    # Publishing
    is_published = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    @property
    def total_lessons(self):
        """Count total lessons in this course"""
        return self.lessons.count()
    
    @property
    def completed_count(self):
        """Count of completed lessons (placeholder for now)"""
        return 0  # Will be user-specific


class Lesson(models.Model):
    """Individual video lesson - matches 'Course Lessons' sidebar"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lessons')
    
    # Lesson Info
    title = models.CharField(max_length=255, help_text="e.g., 'Introduction to React JS'")
    duration = models.CharField(max_length=50, blank=True, help_text="e.g., '1:45 min'")
    time_xp = models.CharField(max_length=50, blank=True, help_text="XP/time display: e.g., '451.02'")
    
    # Video Details
    video_url = models.URLField(help_text="YouTube, Vimeo, or other video URL")
    thumbnail_url = models.URLField(blank=True)
    
    # Ordering
    order = models.PositiveIntegerField(default=0, help_text="Lesson number/order")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order', 'created_at']
        unique_together = ['course', 'order']
    
    def __str__(self):
        return f"{self.course.title} - Lesson {self.order}: {self.title}"


class Discussion(models.Model):
    """Course discussions - matches Discussions sidebar"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='discussions')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='course_discussions')
    
    # Discussion Content
    author_name = models.CharField(max_length=255, help_text="Display name")
    author_role = models.CharField(max_length=255, blank=True, help_text="e.g., 'son_of_baheev'")
    comment = models.TextField()
    likes_count = models.PositiveIntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.author_name} on {self.course.title}"


class Resource(models.Model):
    """Course resources - matches Resources tab"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='resources')
    
    label = models.CharField(max_length=100, help_text="e.g., 'Github', 'Code', 'Website'")
    url = models.URLField(help_text="Resource link")
    order = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['order', 'created_at']
    
    def __str__(self):
        return f"{self.course.title} - {self.label}"


class UserProgress(models.Model):
    """Track user progress per lesson"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='lesson_progress')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='user_progress')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='user_progress')
    
    # Progress Tracking
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    last_position = models.PositiveIntegerField(default=0, help_text="Last watched position in seconds")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'lesson']
        verbose_name_plural = "User Progress"
    
    def __str__(self):
        status = "✓" if self.completed else "○"
        return f"{status} {self.user.username} - {self.lesson.title}"


class UserNotes(models.Model):
    """User's course notes - matches Notes tab"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='course_notes')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='user_notes')
    
    notes_text = models.TextField(blank=True, help_text="Markdown supported")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'course']
        verbose_name_plural = "User Notes"
    
    def __str__(self):
        return f"{self.user.username}'s notes - {self.course.title}"


# Keep old Video model for backward compatibility (can be removed later)
class Video(models.Model):
    """DEPRECATED: Use Lesson model instead. Kept for backward compatibility."""
    title = models.CharField(max_length=255)
    added = models.DateTimeField(auto_now_add=True)
    url = models.URLField()

    def __str__(self):
        return str(self.title)
    

