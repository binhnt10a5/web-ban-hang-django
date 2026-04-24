# Hướng dẫn Tích hợp Backend Django - Homely Store

> **Tài liệu chi tiết về việc tích hợp Frontend React với Backend Python Django**

---

## 📋 Mục lục

1. [Tổng quan kiến trúc](#tổng-quan-kiến-trúc)
2. [Cài đặt Django Backend](#cài-đặt-django-backend)
3. [Database Models](#database-models)
4. [API Endpoints](#api-endpoints)
5. [Frontend Integration](#frontend-integration)
6. [Testing & Deployment](#testing--deployment)

---

## 🎯 Tổng quan kiến trúc

### Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                         │
│              React + TypeScript + Tailwind CSS              │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/HTTPS
                         │ REST API
                         │ JSON
┌────────────────────────▼────────────────────────────────────┐
│                   BACKEND SERVER                            │
│                   Django REST Framework                      │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Auth Service │  │Product Service│  │Order Service │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ User Service │  │Wallet Service │  │Review Service│     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────────┬────────────────────────────────────┘
                         │ ORM (Django)
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   DATABASE SERVER                           │
│                   PostgreSQL / MySQL                        │
└─────────────────────────────────────────────────────────────┘
```

### Tech Stack

**Frontend:**
- React 18+
- TypeScript
- Tailwind CSS v4
- React Router v7
- Context API (State Management)

**Backend:**
- Django 5.x
- Django REST Framework
- PostgreSQL / MySQL
- Redis (Caching & Sessions)
- Celery (Background Tasks)

**DevOps:**
- Docker & Docker Compose
- Nginx (Reverse Proxy)
- Gunicorn (WSGI Server)
- AWS S3 / Cloudinary (File Storage)

---

## 🚀 Cài đặt Django Backend

### 1. Tạo Django Project

```bash
# Tạo thư mục dự án
mkdir homelystore-backend
cd homelystore-backend

# Tạo virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Cài đặt Django và dependencies
pip install django djangorestframework djangorestframework-simplejwt
pip install django-cors-headers psycopg2-binary pillow
pip install python-decouple celery redis

# Tạo Django project
django-admin startproject homelystore .

# Tạo Django apps
python manage.py startapp authentication
python manage.py startapp products
python manage.py startapp orders
python manage.py startapp users
python manage.py startapp wallet
python manage.py startapp reviews
```

### 2. Cấu hình Settings (settings.py)

```python
# homelystore/settings.py

from pathlib import Path
from decouple import config
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config('SECRET_KEY', default='your-secret-key-here')
DEBUG = config('DEBUG', default=True, cast=bool)
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=lambda v: [s.strip() for s in v.split(',')])

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    
    # Local apps
    'authentication',
    'products',
    'orders',
    'users',
    'wallet',
    'reviews',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # CORS middleware
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'homelystore.urls'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME', default='homelystore_db'),
        'USER': config('DB_USER', default='postgres'),
        'PASSWORD': config('DB_PASSWORD', default=''),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
    }
}

# Custom User Model
AUTH_USER_MODEL = 'users.User'

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour'
    }
}

# JWT Settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=24),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

# CORS Settings
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:3000,http://localhost:5173',
    cast=lambda v: [s.strip() for s in v.split(',')]
)

CORS_ALLOW_CREDENTIALS = True

# Media Files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Static Files
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Email Configuration
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = config('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = config('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = True
EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')

# Celery Configuration
CELERY_BROKER_URL = config('CELERY_BROKER_URL', default='redis://localhost:6379/1')
CELERY_RESULT_BACKEND = config('CELERY_RESULT_BACKEND', default='redis://localhost:6379/2')

# Payment Gateways
VNPAY_TMN_CODE = config('VNPAY_TMN_CODE', default='')
VNPAY_HASH_SECRET = config('VNPAY_HASH_SECRET', default='')
VNPAY_URL = config('VNPAY_URL', default='https://sandbox.vnpayment.vn/paymentv2/vpcpay.html')

MOMO_PARTNER_CODE = config('MOMO_PARTNER_CODE', default='')
MOMO_ACCESS_KEY = config('MOMO_ACCESS_KEY', default='')
MOMO_SECRET_KEY = config('MOMO_SECRET_KEY', default='')
```

### 3. Tạo .env file

```bash
# .env
DEBUG=True
SECRET_KEY=your-super-secret-key-here-change-in-production

# Database
DB_ENGINE=django.db.backends.postgresql
DB_NAME=homelystore_db
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=noreply@homelystore.vn
EMAIL_HOST_PASSWORD=your-email-password

# Payment Gateways
VNPAY_TMN_CODE=your-vnpay-code
VNPAY_HASH_SECRET=your-vnpay-secret
MOMO_PARTNER_CODE=your-momo-code
MOMO_ACCESS_KEY=your-momo-access-key
MOMO_SECRET_KEY=your-momo-secret-key
```

---

## 🗄️ Database Models

### User Model (users/models.py)

```python
import uuid
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.utils import timezone

class UserManager(BaseUserManager):
    def create_user(self, email, name, password=None, **extra_fields):
        if not email:
            raise ValueError('Email là bắt buộc')
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        return self.create_user(email, name, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('guest', 'Guest'),
        ('user', 'User'),
        ('admin', 'Admin'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, db_index=True)
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    
    # Security features
    is_locked = models.BooleanField(default=False)
    failed_login_attempts = models.IntegerField(default=0)
    
    # Wallet system
    wallet_balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    # Django required fields
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']
    
    class Meta:
        db_table = 'users'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['role']),
        ]
    
    def __str__(self):
        return self.email

class ShippingAddress(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='shipping_addresses')
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    address = models.TextField()
    province = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    ward = models.CharField(max_length=100)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'shipping_addresses'
        ordering = ['-is_default', '-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.address}"
```

### Product Model (products/models.py)

```python
import uuid
from django.db import models

class Product(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, db_index=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=12, decimal_places=2)
    category = models.CharField(max_length=100, db_index=True)
    brand = models.CharField(max_length=100)
    image = models.ImageField(upload_to='products/', max_length=500)
    stock = models.IntegerField(default=0)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    featured = models.BooleanField(default=False)
    discount = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    tags = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'products'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['category']),
            models.Index(fields=['featured']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return self.name

class ProductImage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/gallery/', max_length=500)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'product_images'
        ordering = ['order', 'created_at']
```

---

## 🔌 API Endpoints Implementation

### Authentication Views (authentication/views.py)

```python
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, RegisterSerializer

User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
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

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Email hoặc mật khẩu không đúng'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    # Check if account is locked
    if user.is_locked:
        return Response({
            'success': False,
            'error': 'Tài khoản đã bị khóa do đăng nhập sai 5 lần. Vui lòng liên hệ admin.'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Check password
    if user.check_password(password):
        # Reset failed attempts
        user.failed_login_attempts = 0
        user.save()
        
        refresh = RefreshToken.for_user(user)
        return Response({
            'success': True,
            'data': {
                'user': UserSerializer(user).data,
                'access_token': str(refresh.access_token),
                'refresh_token': str(refresh),
            },
            'message': 'Đăng nhập thành công'
        })
    else:
        # Increment failed attempts
        user.failed_login_attempts += 1
        if user.failed_login_attempts >= 5:
            user.is_locked = True
            user.save()
            return Response({
                'success': False,
                'error': 'Tài khoản đã bị khóa do đăng nhập sai 5 lần.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        user.save()
        remaining = 5 - user.failed_login_attempts
        return Response({
            'success': False,
            'error': f'Email hoặc mật khẩu không đúng. Còn {remaining} lần thử.',
            'failedAttempts': user.failed_login_attempts,
            'remainingAttempts': remaining
        }, status=status.HTTP_401_UNAUTHORIZED)
```

### Products Views (products/views.py)

```python
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.response import Response
from .models import Product
from .serializers import ProductSerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'destroy']:
            return [IsAdminUser()]
        return [AllowAny()]
    
    def get_queryset(self):
        queryset = Product.objects.all()
        
        # Filters
        category = self.request.query_params.get('category')
        search = self.request.query_params.get('search')
        min_price = self.request.query_params.get('minPrice')
        max_price = self.request.query_params.get('maxPrice')
        featured = self.request.query_params.get('featured')
        
        if category:
            queryset = queryset.filter(category=category)
        if search:
            queryset = queryset.filter(name__icontains=search)
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        if featured:
            queryset = queryset.filter(featured=True)
        
        return queryset
    
    def list(self, request):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                'success': True,
                'data': {
                    'products': serializer.data
                }
            })
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })
```

---

## 🔗 Frontend Integration

### 1. Cập nhật API Service (src/app/services/api.ts)

```typescript
// src/app/services/api.ts

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Helper function to get auth token
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    
    const data = await response.json();
    
    if (data.success && data.data.access_token) {
      localStorage.setItem('access_token', data.data.access_token);
      localStorage.setItem('refresh_token', data.data.refresh_token);
      localStorage.setItem('currentUser', JSON.stringify(data.data.user));
    }
    
    return data;
  },

  async register(registerData: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData)
    });
    
    const data = await response.json();
    
    if (data.success && data.data.access_token) {
      localStorage.setItem('access_token', data.data.access_token);
      localStorage.setItem('refresh_token', data.data.refresh_token);
      localStorage.setItem('currentUser', JSON.stringify(data.data.user));
    }
    
    return data;
  },

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('currentUser');
  }
};

export const productsApi = {
  async getAll(params?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    featured?: boolean;
  }): Promise<ApiResponse<Product[]>> {
    const queryString = new URLSearchParams(
      params as Record<string, string>
    ).toString();
    
    const response = await fetch(
      `${API_BASE_URL}/products?${queryString}`,
      { headers: getAuthHeaders() }
    );
    
    return await response.json();
  },

  async getById(id: string): Promise<ApiResponse<Product>> {
    const response = await fetch(
      `${API_BASE_URL}/products/${id}`,
      { headers: getAuthHeaders() }
    );
    
    return await response.json();
  },

  async create(product: Partial<Product>): Promise<ApiResponse<Product>> {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(product)
    });
    
    return await response.json();
  }
};
```

### 2. Tạo .env file cho Frontend

```bash
# .env.local (React/Vite)
VITE_API_URL=http://localhost:8000/api/v1
```

---

## 🧪 Testing & Deployment

### 1. Testing Backend

```bash
# Run Django tests
python manage.py test

# Create test data
python manage.py loaddata fixtures/initial_data.json
```

### 2. Docker Setup

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["gunicorn", "homelystore.wsgi:application", "--bind", "0.0.0.0:8000"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: homelystore_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  backend:
    build: .
    command: python manage.py runserver 0.0.0.0:8000
    volumes:
      - .:/app
    ports:
      - "8000:8000"
    depends_on:
      - db
      - redis
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/homelystore_db

volumes:
  postgres_data:
```

### 3. Deployment

```bash
# Collect static files
python manage.py collectstatic --noinput

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run with Gunicorn
gunicorn homelystore.wsgi:application --bind 0.0.0.0:8000
```

---

## 📚 Tài liệu tham khảo

- **API Documentation đầy đủ:** `/API_DOCUMENTATION.md`
- **Hướng dẫn Frontend:** `/HUONG_DAN.md`
- **Django Documentation:** https://docs.djangoproject.com/
- **Django REST Framework:** https://www.django-rest-framework.org/

---

**Cập nhật lần cuối:** March 11, 2024  
**Phiên bản:** 1.0.0
