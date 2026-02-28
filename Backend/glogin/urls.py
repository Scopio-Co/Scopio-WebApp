from django.urls import path
from . import views
from .error_views import AuthErrorView, SignupClosedView

urlpatterns = [
    path('google/start/', views.google_start, name='google_start'),
    path('google/finalize/', views.google_finalize, name='google_finalize'),
    path('google/logout/', views.google_logout, name='google_logout'),
    # Error handling views
    path('error/', AuthErrorView.as_view(), name='auth_error'),
    path('signup-closed/', SignupClosedView.as_view(), name='signup_closed'),
]