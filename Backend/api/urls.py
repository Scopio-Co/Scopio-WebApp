from django.urls import path
from .import views


urlpatterns = [
    path('', views.api_root, name='api-root'),
    path('users/', views.CreateUserView.as_view()),
]