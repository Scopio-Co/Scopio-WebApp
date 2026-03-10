
from django.contrib import admin
from django.urls import path, include
from django.views.generic.base import RedirectView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Backend root lands on DRF browsable API entry.
    path('', RedirectView.as_view(url='/api/', permanent=False)),
    
    # Redirect legacy URLs without trailing slash
    path('user/register', RedirectView.as_view(url='/api/user/register/', permanent=True)),
    path('accounts/profile/', RedirectView.as_view(url='/glogin/google/finalize/', permanent=False)),
    
    # API routes: /api/ prefix is added globally here, app-level urls.py have no /api/ prefix
    path('api/', include('api.urls')),
    path('api/video/', include('video.urls')),
    
    # OAuth, allauth, admin
    path('api-auth/', include('rest_framework.urls')),
    path('accounts/', include('allauth.urls')),
    path('glogin/', include('glogin.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
