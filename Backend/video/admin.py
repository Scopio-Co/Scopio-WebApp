from django.contrib import admin
from .models import Video, Course, Lesson, Discussion, Resource, UserProgress, UserNotes


# ========== INLINE ADMINS ==========
class LessonInline(admin.TabularInline):
    """Inline admin for lessons within a course"""
    model = Lesson
    extra = 1
    fields = ['title', 'duration', 'time_xp', 'video_url', 'order']
    ordering = ['order']


class ResourceInline(admin.TabularInline):
    """Inline admin for resources within a course"""
    model = Resource
    extra = 1
    fields = ['label', 'url', 'order']
    ordering = ['order']


class DiscussionInline(admin.TabularInline):
    """Inline admin for discussions within a course"""
    model = Discussion
    extra = 0
    fields = ['author_name', 'comment', 'likes_count']
    readonly_fields = ['author_name', 'user']
    can_delete = True


# ========== MAIN ADMINS ==========
@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'instructor_name', 'rating', 'total_lessons',
        'is_published', 'created_at'
    ]
    list_filter = ['is_published', 'created_at', 'rating']
    search_fields = ['title', 'description', 'instructor_name']
    inlines = [LessonInline, ResourceInline, DiscussionInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'thumbnail_url', 'is_published')
        }),
        ('Instructor Details', {
            'fields': (
                'instructor_name', 'instructor_title', 'instructor_bio',
                'instructor_avatar_url', 'instructor_social_links'
            )
        }),
        ('Course Details', {
            'fields': ('what_you_learn', 'prerequisites', 'rating', 'total_duration')
        }),
    )
    
    readonly_fields = ['total_lessons']


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'order', 'duration', 'created_at']
    list_filter = ['course', 'created_at']
    search_fields = ['title', 'course__title']
    ordering = ['course', 'order']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('course', 'title', 'order')
        }),
        ('Video Details', {
            'fields': ('video_url', 'thumbnail_url', 'duration', 'time_xp')
        }),
    )


@admin.register(Discussion)
class DiscussionAdmin(admin.ModelAdmin):
    list_display = ['author_name', 'course', 'likes_count', 'created_at']
    list_filter = ['course', 'created_at']
    search_fields = ['author_name', 'comment', 'course__title']
    readonly_fields = ['user', 'created_at', 'updated_at']


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ['label', 'course', 'url', 'order']
    list_filter = ['course']
    search_fields = ['label', 'course__title']
    ordering = ['course', 'order']


@admin.register(UserProgress)
class UserProgressAdmin(admin.ModelAdmin):
    list_display = ['user', 'lesson', 'course', 'completed', 'last_position', 'updated_at']
    list_filter = ['completed', 'course', 'updated_at']
    search_fields = ['user__username', 'lesson__title', 'course__title']
    readonly_fields = ['created_at', 'updated_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'course', 'lesson')


@admin.register(UserNotes)
class UserNotesAdmin(admin.ModelAdmin):
    list_display = ['user', 'course', 'updated_at']
    list_filter = ['course', 'updated_at']
    search_fields = ['user__username', 'course__title', 'notes_text']
    readonly_fields = ['created_at', 'updated_at']


# Keep old Video model registered for backward compatibility
admin.site.register(Video)
