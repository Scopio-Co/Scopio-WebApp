"""
Custom views for allauth to handle errors gracefully
"""
from django.shortcuts import redirect
from django.views.generic import TemplateView
from django.conf import settings


class AuthErrorView(TemplateView):
    """Custom error view that redirects to frontend"""
    template_name = 'socialaccount/authentication_error.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['frontend_url'] = settings.FRONTEND_URL
        return context
    
    def get(self, request, *args, **kwargs):
        # Direct redirect instead of template
        frontend_url = settings.FRONTEND_URL
        error_msg = request.GET.get('message', 'Authentication failed')
        return redirect(f"{frontend_url}/?error=auth_failed&message={error_msg}")


class SignupClosedView(TemplateView):
    """Handle signup closed errors"""
    
    def get(self, request, *args, **kwargs):
        frontend_url = settings.FRONTEND_URL
        return redirect(f"{frontend_url}/?error=signup_closed")
