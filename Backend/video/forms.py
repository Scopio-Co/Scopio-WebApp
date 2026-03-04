"""
Custom Django admin forms and widgets for Azure Blob Storage uploads
"""

from django import forms
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from .models import CourseResourceAzure
from .azure_storage import get_azure_storage
import os


class AzureFileUploadWidget(forms.ClearableFileInput):
    """Custom widget for Azure file uploads with progress and preview"""
    
    template_name = 'admin/azure_file_input.html'
    
    def get_context(self, name, value, attrs):
        context = super().get_context(name, value, attrs)
        context['widget']['is_azure_upload'] = True
        return context


class CourseResourceAzureForm(forms.ModelForm):
    """Form for uploading course resources to Azure Blob Storage"""
    
    file_upload = forms.FileField(
        required=False,
        label="Upload File to Azure",
        widget=AzureFileUploadWidget(attrs={
            'accept': 'image/*,video/*',
            'class': 'azure-file-input'
        }),
        help_text="Upload file (will be stored in Azure Blob Storage)"
    )
    
    class Meta:
        model = CourseResourceAzure
        fields = ['course', 'resource_type', 'label', 'order', 'blob_url']
        widgets = {
            'course': forms.Select(attrs={'class': 'form-control'}),
            'resource_type': forms.Select(attrs={'class': 'form-control'}),
            'label': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g., Intro Video'}),
            'order': forms.NumberInput(attrs={'class': 'form-control'}),
            'blob_url': forms.URLInput(attrs={'class': 'form-control', 'placeholder': 'Azure URL (auto-filled after upload)'}),
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Make blob_url read-only if it already has a value
        if self.instance.pk:
            self.fields['blob_url'].widget.attrs['readonly'] = True
            self.fields['file_upload'].required = False
    
    def clean(self):
        cleaned_data = super().clean()
        file_upload = cleaned_data.get('file_upload')
        blob_url = cleaned_data.get('blob_url')
        resource_type = cleaned_data.get('resource_type')
        
        # New resource - must have file or URL
        if not self.instance.pk and not file_upload and not blob_url:
            raise ValidationError(
                _('Either upload a file or provide an Azure blob URL')
            )
        
        # Validate file if uploading
        if file_upload:
            if file_upload.size > 500 * 1024 * 1024:  # 500MB limit
                raise ValidationError(_('File size must not exceed 500MB'))
            
            # Validate file type based on resource type
            content_type = file_upload.content_type
            
            if resource_type == 'pfp' and not content_type.startswith('image/'):
                raise ValidationError(_('Profile picture must be an image file'))
            elif resource_type == 'video' and not content_type.startswith('video/'):
                raise ValidationError(_('Video resource must be a video file'))
            elif resource_type == 'thumbnail' and not content_type.startswith('image/'):
                raise ValidationError(_('Thumbnail must be an image file'))
        
        return cleaned_data
    
    def save(self, commit=True):
        instance = super().save(commit=False)
        file_upload = self.cleaned_data.get('file_upload')
        
        # Upload to Azure if file provided
        if file_upload:
            try:
                storage = get_azure_storage()
                
                # Upload based on resource type
                if instance.resource_type == 'pfp':
                    blob_url = storage.upload_profile_picture(file_upload)
                elif instance.resource_type == 'video':
                    blob_url = storage.upload_video(file_upload)
                elif instance.resource_type == 'thumbnail':
                    blob_url = storage.upload_thumbnail(file_upload)
                else:
                    raise ValueError(f"Unknown resource type: {instance.resource_type}")
                
                # Store URL and metadata
                instance.blob_url = blob_url
                instance.blob_name = blob_url.split('/')[-1]
                instance.original_filename = file_upload.name
                instance.file_size = file_upload.size
                
            except Exception as e:
                raise ValidationError(
                    _('Failed to upload file to Azure: %(error)s'),
                    code='azure_upload_failed',
                    params={'error': str(e)},
                )
        
        if commit:
            instance.save()
        
        return instance


class CourseResourceAzureInlineForm(CourseResourceAzureForm):
    """Inline form version for CourseResourceAzure in CourseAdmin"""
    pass
