from django.urls import path
from .import views


urlpatterns = [
    path('', views.api_root, name='api-root'),
    path('notes/', views.NoteListCreateView.as_view(), name='note-list'),
    path('notes/delete/<int:pk>/', views.NoteDelete.as_view(), name='note-delete'),
    path('users/', views.CreateUserView.as_view()),
]