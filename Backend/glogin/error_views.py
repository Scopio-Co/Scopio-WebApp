"""
Custom views for allauth to handle errors gracefully
"""
from django.shortcuts import redirect
from django.views.generic import TemplateView
import os


class AuthErrorView(TemplateView):
    """Custom error view that redirects to frontend"""
    template_name = 'socialaccount/authentication_error.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['frontend_url'] = os.getenv('FRONTEND_URL', 'http://localhost:5173')
        return context
    
    def get(self, request, *args, **kwargs):
        # Direct redirect instead of template
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
        error_msg = request.GET.get('message', 'Authentication failed')
        return redirect(f"{frontend_url}/?error=auth_failed&message={error_msg}")


class SignupClosedView(TemplateView):
    """Handle signup closed errors"""
    
    def get(self, request, *args, **kwargs):
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
        return redirect(f"{frontend_url}/?error=signup_closed")
