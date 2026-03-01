from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    VideoViewSet,
    CourseViewSet,
    LessonViewSet,
    DiscussionViewSet,
    ResourceViewSet,
    UserProgressViewSet,
    UserNotesViewSet,
    RatingViewSet,
    EnrollmentViewSet,
    user_stats
)

router = DefaultRouter()

# Deprecated (backward compatibility)
router.register(r'videos', VideoViewSet, basename='video')

# New endpoints
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'lessons', LessonViewSet, basename='lesson')
router.register(r'discussions', DiscussionViewSet, basename='discussion')
router.register(r'resources', ResourceViewSet, basename='resource')
router.register(r'progress', UserProgressViewSet, basename='user-progress')
router.register(r'notes', UserNotesViewSet, basename='user-notes')
router.register(r'ratings', RatingViewSet, basename='rating')
router.register(r'enrollments', EnrollmentViewSet, basename='enrollment')

urlpatterns = [
    path('', include(router.urls)),
    path('user-stats/', user_stats, name='user-stats'),
]
