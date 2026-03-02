from django.contrib.auth.models import User
from rest_framework import serializers
from allauth.socialaccount.models import SocialAccount
from .models import UserProfile
import base64


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name','password']
        extra_kwargs = {'password': {'write_only': True}}
        #validates data before creating a user

    def validate_username(self, value):
        """Check if username already exists."""
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError(
                "This username is already taken. Please choose a different username."
            )
        return value

    def validate_email(self, value):
        """Check if email already exists (including OAuth accounts)."""
        if not value:
            raise serializers.ValidationError("Email is required.")
        
        # Check if email exists in User model
        if User.objects.filter(email__iexact=value).exists():
            existing_user = User.objects.get(email__iexact=value)
            
            # Check if this user has a Google OAuth account
            has_google_account = SocialAccount.objects.filter(
                user=existing_user,
                provider='google'
            ).exists()
            
            if has_google_account:
                raise serializers.ValidationError(
                    "This email is already registered with Google. "
                    "Please sign in using 'Continue with Google' instead."
                )
            else:
                raise serializers.ValidationError(
                    "This email is already registered. Please use a different email or log in."
                )
        
        return value

    def create(self, validated_data): #after validating data, create a user
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            password=validated_data['password']
        )
        return user


class ProfileSettingsSerializer(serializers.Serializer):
    full_name = serializers.CharField(required=False, allow_blank=True, max_length=150)
    username = serializers.CharField(required=False, max_length=150)
    email = serializers.EmailField(read_only=True)
    college = serializers.CharField(required=False, allow_blank=True, max_length=255)
    bio = serializers.CharField(required=False, allow_blank=True)
    profile_image = serializers.ImageField(required=False, allow_null=True, write_only=True)
    profile_image_url = serializers.CharField(read_only=True)

    def validate_profile_image(self, value):
        if value is None:
            return value

        max_size = 5 * 1024 * 1024
        if value.size > max_size:
            raise serializers.ValidationError("Profile image must be 5MB or smaller.")

        allowed_types = {"image/jpeg", "image/png", "image/webp", "image/gif"}
        content_type = getattr(value, 'content_type', '')
        if content_type and content_type not in allowed_types:
            raise serializers.ValidationError("Only JPG, PNG, WEBP, or GIF images are allowed.")

        return value

    def validate_username(self, value):
        cleaned = value.strip()
        if not cleaned:
            raise serializers.ValidationError("Username cannot be empty.")

        request = self.context.get('request')
        current_user = getattr(request, 'user', None)

        exists = User.objects.filter(username__iexact=cleaned)
        if current_user and current_user.is_authenticated:
            exists = exists.exclude(pk=current_user.pk)

        if exists.exists():
            raise serializers.ValidationError("This username is already taken. Please choose a different username.")
        return cleaned

    @staticmethod
    def to_representation_for(user: User, profile: UserProfile, request=None):
        image_url = ''
        if profile.profile_image:
            content_type = profile.profile_image_content_type or 'image/png'
            encoded = base64.b64encode(profile.profile_image).decode('ascii')
            image_url = f"data:{content_type};base64,{encoded}"

        return {
            'full_name': user.get_full_name(),
            'username': user.username,
            'email': user.email,
            'college': profile.college or '',
            'bio': profile.bio or '',
            'profile_image_url': image_url,
        }