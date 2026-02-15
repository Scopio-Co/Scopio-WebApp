from django.urls import path
from . import views

urlpatterns = [
    path('google/start/', views.google_start, name='google_start'),
    path('google/finalize/', views.google_finalize, name='google_finalize'),
    path('google/logout/', views.google_logout, name='google_logout'),
]