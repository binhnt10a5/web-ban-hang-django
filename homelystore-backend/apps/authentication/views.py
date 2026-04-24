from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.conf import settings
import secrets
import string

from .models import User
from .serializers import UserSerializer, RegisterSerializer, LoginSerializer, PasswordResetSerializer

class RegisterView(APIView):
    """API Đăng ký tài khoản"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'success': True,
                'data': {
                    'user': UserSerializer(user).data,
                    'access_token': str(refresh.access_token),
                    'refresh_token': str(refresh),
                },
                'message': 'Đăng ký thành công'
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'error': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    """API Đăng nhập"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({
                'success': False,
                'error': 'Dữ liệu không hợp lệ'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Email hoặc mật khẩu không đúng'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Kiểm tra tài khoản bị khóa
        if user.is_locked:
            return Response({
                'success': False,
                'error': 'Tài khoản đã bị khóa do đăng nhập sai 5 lần. Vui lòng liên hệ admin.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Xác thực mật khẩu
        if user.check_password(password):
            # Đăng nhập thành công
            user.reset_failed_attempts()
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'success': True,
                'data': {
                    'user': UserSerializer(user).data,
                    'access_token': str(refresh.access_token),
                    'refresh_token': str(refresh),
                },
                'message': 'Đăng nhập thành công'
            }, status=status.HTTP_200_OK)
        else:
            # Đăng nhập sai
            user.increment_failed_attempts()
            remaining_attempts = 5 - user.failed_login_attempts
            
            if user.is_locked:
                return Response({
                    'success': False,
                    'error': 'Tài khoản đã bị khóa do đăng nhập sai 5 lần. Vui lòng liên hệ admin.'
                }, status=status.HTTP_403_FORBIDDEN)
            
            return Response({
                'success': False,
                'error': f'Email hoặc mật khẩu không đúng. Còn {remaining_attempts} lần thử.',
                'failedAttempts': user.failed_login_attempts,
                'remainingAttempts': remaining_attempts
            }, status=status.HTTP_401_UNAUTHORIZED)

class ForgotPasswordView(APIView):
    """API Quên mật khẩu"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response({
                'success': False,
                'error': 'Email không hợp lệ'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data['email']
        
        try:
            user = User.objects.get(email=email)
            
            # Tạo mật khẩu mới random
            new_password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(12))
            user.set_password(new_password)
            user.save()
            
            # Gửi email
            send_mail(
                subject='[Homely Store] Đặt lại mật khẩu',
                message=f'Mật khẩu mới của bạn là: {new_password}\n\nVui lòng đăng nhập và đổi mật khẩu ngay.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
            
            return Response({
                'success': True,
                'message': 'Mật khẩu mới đã được gửi đến email của bạn'
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            # Vẫn trả về success để tránh attacker biết email có tồn tại không
            return Response({
                'success': True,
                'message': 'Nếu email tồn tại, mật khẩu mới đã được gửi đến email của bạn'
            }, status=status.HTTP_200_OK)

class LogoutView(APIView):
    """API Đăng xuất"""

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh') or request.data.get('refresh_token')

            if not refresh_token:
                return Response({
                    "success": False,
                    "error": "Refresh token required"
                }, status=status.HTTP_400_BAD_REQUEST)

            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response({
                "success": True,
                "message": "Đăng xuất thành công"
            }, status=status.HTTP_200_OK)

        except Exception:
            return Response({
                "success": False,
                "error": "Token không hợp lệ"
            }, status=status.HTTP_400_BAD_REQUEST)