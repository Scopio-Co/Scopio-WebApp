
from django.contrib import admin
from django.urls import path, include
from django.views.generic.base import RedirectView
from api.views import CreateUserView 
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView    #allow us to obtain access and refresh JWT tokens  

urlpatterns = [
    path('admin/', admin.site.urls),
    # Helpful redirects for common paths
    path('', RedirectView.as_view(url='/api/', permanent=False)),
    path('user/register', RedirectView.as_view(url='/api/user/register/', permanent=True)),
    path('api/user/register/', CreateUserView.as_view(), name='register'), #endpoint for user registration
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'), #endpoint for obtaining JWT tokens
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'), #endpoint for refreshing JWT tokens
    path('api-auth/', include('rest_framework.urls')),
    path('api/', include('api.urls')),
    path('accounts/', include('allauth.urls')),
    path('glogin/', include('glogin.urls')),
]
