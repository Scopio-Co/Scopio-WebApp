from django.urls import path
from .import views


urlpatterns = [
    path('', views.api_root, name='api-root'),
    path('users/', views.CreateUserView.as_view()),
    path('users/list/', views.users_list, name='users_list'),
    path('users/profile/', views.UpdateUserProfileView.as_view(), name='update_profile'),
    # Authentication endpoints
    path('auth/login/', views.CookieTokenObtainPairView.as_view(), name='cookie_token_obtain_pair'),
    path('auth/refresh/', views.CookieTokenRefreshView.as_view(), name='cookie_token_refresh'),
    path('auth/logout/', views.cookie_logout, name='cookie_logout'),
    path('auth/status/', views.auth_status, name='auth_status'),
    path('auth/profile/', views.auth_profile, name='auth_profile'),
    path('auth/csrf/', views.get_csrf_token, name='csrf_token'),
]