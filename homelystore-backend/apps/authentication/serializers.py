from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User

class UserSerializer(serializers.ModelSerializer):
    """Serializer cho User"""
    
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'role', 'phone', 'address', 
                  'wallet_balance', 'is_locked', 'failed_login_attempts', 'created_at']
        read_only_fields = ['id', 'wallet_balance', 'is_locked', 'failed_login_attempts', 'created_at']

class RegisterSerializer(serializers.ModelSerializer):
    """Serializer cho đăng ký"""
    
    password = serializers.CharField(write_only=True, validators=[validate_password])
    
    class Meta:
        model = User
        fields = ['email', 'password', 'name', 'phone']
    
    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            name=validated_data['name'],
            password=validated_data['password'],
            phone=validated_data.get('phone', '')
        )
        return user

class LoginSerializer(serializers.Serializer):
    """Serializer cho đăng nhập"""
    
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            raise serializers.ValidationError("Email và mật khẩu là bắt buộc")
        
        return data

class PasswordResetSerializer(serializers.Serializer):
    """Serializer cho quên mật khẩu"""
    
    email = serializers.EmailField()