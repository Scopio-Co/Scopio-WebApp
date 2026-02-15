from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import UserSerializer, NoteSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.urls import reverse
from .models import Note


class NoteListCreateView(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)
    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(author=self.request.user) 
        else:
            print(serializer.errors)
class NoteDelete(generics.DestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all() #all obj we gonna look after in order to create a user
    serializer_class = UserSerializer #serializer class - make sure what we need to create a user is valid
    permission_classes = [AllowAny]  # Allow anyone to create a user
    authentication_classes = []      # Do not attempt JWT auth on this endpoint


@api_view(["GET"])  # Simple API root to help discover endpoints
@permission_classes([AllowAny])
def api_root(request):
    return Response({
        "register": request.build_absolute_uri(reverse("register")),
        "token": request.build_absolute_uri(reverse("token_obtain_pair")),
        "token_refresh": request.build_absolute_uri(reverse("token_refresh")),
        "notes": request.build_absolute_uri("/api/notes/"),
        "notes_delete": request.build_absolute_uri("/api/notes/delete/<id>/"),
        "users": request.build_absolute_uri("/api/users/")
    })