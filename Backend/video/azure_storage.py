"""
Azure Blob Storage utility for uploading course resources
Supports uploading profile pictures, videos, and thumbnails to separate containers
"""

import os
from uuid import uuid4
from azure.storage.blob import BlobServiceClient
from django.conf import settings


class AzureStorageManager:
    """Manages file uploads to Azure Blob Storage containers"""
    
    def __init__(self):
        self.connection_string = os.getenv('AZURE_STORAGE_CONNECTION_STRING')
        self.account_name = os.getenv('AZURE_STORAGE_ACCOUNT_NAME')
        
        if not self.connection_string and not self.account_name:
            raise ValueError(
                "Azure credentials not configured. Set AZURE_STORAGE_CONNECTION_STRING "
                "or AZURE_STORAGE_ACCOUNT_NAME and AZURE_STORAGE_ACCOUNT_KEY in .env"
            )
        
        if self.connection_string:
            self.blob_service_client = BlobServiceClient.from_connection_string(
                self.connection_string
            )
        else:
            account_key = os.getenv('AZURE_STORAGE_ACCOUNT_KEY')
            self.blob_service_client = BlobServiceClient(
                account_url=f"https://{self.account_name}.blob.core.windows.net",
                credential=account_key
            )
    
    def upload_file(self, file, container_name, resource_type='pfp'):
        """
        Upload a file to Azure Blob Storage
        
        Args:
            file: Django UploadedFile object
            container_name: Name of the container (pfp, videos, or thumbnails)
            resource_type: Type of resource (pfp, video, thumbnail)
        
        Returns:
            URL of the uploaded blob
        """
        try:
            # Generate unique blob name with original extension
            file_extension = os.path.splitext(file.name)[1]
            blob_name = f"{resource_type}/{uuid4()}{file_extension}"
            
            # Get container client
            container_client = self.blob_service_client.get_container_client(container_name)
            
            # Upload file
            blob_client = container_client.get_blob_client(blob_name)
            blob_client.upload_blob(file, overwrite=True)
            
            # Return the blob URL
            blob_url = blob_client.url
            return blob_url
            
        except Exception as e:
            raise Exception(f"Failed to upload file to Azure: {str(e)}")
    
    def upload_profile_picture(self, file):
        """Upload profile picture to pfp container"""
        return self.upload_file(
            file,
            os.getenv('AZURE_CONTAINER_PFP', 'pfp'),
            resource_type='profile'
        )
    
    def upload_video(self, file):
        """Upload video to videos container"""
        return self.upload_file(
            file,
            os.getenv('AZURE_CONTAINER_VIDEOS', 'videos'),
            resource_type='video'
        )
    
    def upload_thumbnail(self, file):
        """Upload thumbnail to thumbnails container"""
        return self.upload_file(
            file,
            os.getenv('AZURE_CONTAINER_THUMBNAILS', 'thumbnails'),
            resource_type='thumbnail'
        )
    
    def delete_blob(self, blob_url):
        """
        Delete a blob from Azure Storage
        
        Args:
            blob_url: Full URL of the blob
        """
        try:
            # Extract container and blob name from URL
            # URL format: https://account.blob.core.windows.net/container/blob
            parts = blob_url.split('/')
            container_name = parts[-2]
            blob_name = parts[-1]
            
            container_client = self.blob_service_client.get_container_client(container_name)
            container_client.delete_blob(blob_name)
            
        except Exception as e:
            print(f"Failed to delete blob: {str(e)}")


# Singleton instance
def get_azure_storage():
    """Get Azure Storage Manager instance"""
    return AzureStorageManager()
