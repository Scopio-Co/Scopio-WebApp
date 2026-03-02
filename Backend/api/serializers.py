from django.contrib.auth.models import User
from rest_framework import serializers
from allauth.socialaccount.models import SocialAccount


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


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile."""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']

    def validate_username(self, value):
        """Check if username already exists (excluding current user)."""
        user = self.instance
        if User.objects.filter(username__iexact=value).exclude(id=user.id).exists():
            raise serializers.ValidationError(
                "This username is already taken. Please choose a different username."
            )
        return value

    def validate_email(self, value):
        """Check if email already exists (excluding current user)."""
        if not value:
            raise serializers.ValidationError("Email is required.")
        
        user = self.instance
        # Check if email exists in User model (excluding current user)
        if User.objects.filter(email__iexact=value).exclude(id=user.id).exists():
            existing_user = User.objects.get(email__iexact=value)
            
            # Check if this user has a Google OAuth account
            has_google_account = SocialAccount.objects.filter(
                user=existing_user,
                provider='google'
            ).exists()
            
            if has_google_account:
                raise serializers.ValidationError(
                    "This email is already registered with Google."
                )
            else:
                raise serializers.ValidationError(
                    "This email is already registered. Please use a different email."
                )
        
        return value