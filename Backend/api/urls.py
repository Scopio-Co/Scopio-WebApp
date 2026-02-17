from django.urls import path
from .import views


urlpatterns = [
    path('', views.api_root, name='api-root'),
    path('users/', views.CreateUserView.as_view()),
    # Cookie-based JWT auth endpoints (optional; existing /api/token/ remains)
    path('auth/login/', views.CookieTokenObtainPairView.as_view(), name='cookie_token_obtain_pair'),
    path('auth/refresh/', views.CookieTokenRefreshView.as_view(), name='cookie_token_refresh'),
    path('auth/logout/', views.cookie_logout, name='cookie_logout'),
]