# Django Backend Implementation - Code Hoàn Chỉnh

> **File này chứa toàn bộ code implementation chi tiết cho các module còn lại**  
> **Đọc kèm với `/DJANGO_BACKEND_INTEGRATION_GUIDE.md`**

---

## 📦 Products App - Implementation đầy đủ

### File: `apps/products/views.py`

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Product
from .serializers import ProductSerializer, ProductCreateUpdateSerializer
from .filters import ProductFilter

class IsAdminUser(permissions.BasePermission):
    """Custom permission để kiểm tra admin"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'

class ProductViewSet(viewsets.ModelViewSet):
    """ViewSet cho Product CRUD"""
    
    queryset = Product.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'description', 'brand']
    ordering_fields = ['price', 'created_at', 'rating']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ProductCreateUpdateSerializer
        return ProductSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return super().get_permissions()
    
    def list(self, request, *args, **kwargs):
        """GET /api/v1/products/"""
        queryset = self.filter_queryset(self.get_queryset())
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return Response({
                'success': True,
                'data': {
                    'products': serializer.data,
                    'pagination': {
                        'total': self.paginator.page.paginator.count,
                        'page': self.paginator.page.number,
                        'limit': self.paginator.page_size,
                        'totalPages': self.paginator.page.paginator.num_pages,
                    }
                }
            })
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({'success': True, 'data': {'products': serializer.data}})
    
    def retrieve(self, request, *args, **kwargs):
        """GET /api/v1/products/{id}/"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({'success': True, 'data': serializer.data})
    
    def create(self, request, *args, **kwargs):
        """POST /api/v1/products/"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        return Response({
            'success': True,
            'data': ProductSerializer(serializer.instance).data,
            'message': 'Tạo sản phẩm thành công'
        }, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        """PUT /api/v1/products/{id}/"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response({
            'success': True,
            'data': ProductSerializer(serializer.instance).data,
            'message': 'Cập nhật sản phẩm thành công'
        })
    
    def destroy(self, request, *args, **kwargs):
        """DELETE /api/v1/products/{id}/"""
        instance = self.get_object()
        self.perform_destroy(instance)
        
        return Response({
            'success': True,
            'message': 'Xóa sản phẩm thành công'
        }, status=status.HTTP_200_OK)
```

### File: `apps/products/filters.py`

```python
import django_filters
from .models import Product

class ProductFilter(django_filters.FilterSet):
    """Filter cho Product"""
    
    category = django_filters.CharFilter(field_name='category', lookup_expr='iexact')
    brand = django_filters.CharFilter(field_name='brand', lookup_expr='iexact')
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    featured = django_filters.BooleanFilter(field_name='featured')
    search = django_filters.CharFilter(method='filter_search')
    
    class Meta:
        model = Product
        fields = ['category', 'brand', 'featured']
    
    def filter_search(self, queryset, name, value):
        """Custom search filter"""
        return queryset.filter(
            Q(name__icontains=value) | 
            Q(description__icontains=value) |
            Q(brand__icontains=value)
        )
```

### File: `apps/products/urls.py`

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet

app_name = 'products'

router = DefaultRouter()
router.register('', ProductViewSet, basename='product')

urlpatterns = [
    path('', include(router.urls)),
]
```

---

## 🛒 Orders App - Implementation đầy đủ

### File: `apps/orders/serializers.py`

```python
from rest_framework import serializers
from .models import Order, OrderItem
from apps.products.models import Product

class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer cho Order Item"""
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_image', 'quantity', 'price']

class OrderSerializer(serializers.ModelSerializer):
    """Serializer cho Order"""
    
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = ['id', 'user', 'user_name', 'user_email', 'items', 'total', 
                  'status', 'payment_method', 'payment_status', 'wallet_discount',
                  'shipping_address', 'phone', 'notes', 'created_at', 'updated_at']
        read_only_fields = ['id', 'status', 'payment_status', 'created_at', 'updated_at']

class OrderCreateSerializer(serializers.Serializer):
    """Serializer cho tạo đơn hàng"""
    
    user_id = serializers.UUIDField(required=False, allow_null=True)
    user_name = serializers.CharField(max_length=255)
    user_email = serializers.EmailField()
    items = serializers.ListField(child=serializers.DictField())
    total = serializers.DecimalField(max_digits=12, decimal_places=2)
    payment_method = serializers.CharField(max_length=20)
    wallet_discount = serializers.DecimalField(max_digits=12, decimal_places=2, default=0)
    shipping_address = serializers.CharField()
    phone = serializers.CharField(max_length=20)
    notes = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    
    def validate_items(self, value):
        """Validate items"""
        if not value:
            raise serializers.ValidationError("Đơn hàng phải có ít nhất 1 sản phẩm")
        
        for item in value:
            # Validate required fields
            required_fields = ['product_id', 'product_name', 'product_image', 'quantity', 'price']
            for field in required_fields:
                if field not in item:
                    raise serializers.ValidationError(f"Thiếu trường {field} trong item")
            
            # Validate product exists and stock
            try:
                product = Product.objects.get(id=item['product_id'])
                if product.stock < item['quantity']:
                    raise serializers.ValidationError(
                        f"Sản phẩm {product.name} không đủ hàng trong kho. " +
                        f"Còn {product.stock} sản phẩm."
                    )
            except Product.DoesNotExist:
                raise serializers.ValidationError(f"Sản phẩm {item['product_id']} không tồn tại")
        
        return value

class OrderStatusUpdateSerializer(serializers.Serializer):
    """Serializer cho cập nhật trạng thái đơn hàng"""
    
    status = serializers.ChoiceField(choices=Order.STATUS_CHOICES)
    
    def validate_status(self, value):
        """Validate status transition"""
        order = self.context.get('order')
        if not order:
            return value
        
        # Define valid transitions
        valid_transitions = {
            'pending': ['approved', 'rejected', 'cancelled'],
            'approved': ['delivered', 'cancelled'],
            'delivered': ['awaiting_review'],
            'awaiting_review': ['reviewed'],
        }
        
        current_status = order.status
        allowed_statuses = valid_transitions.get(current_status, [])
        
        if value not in allowed_statuses:
            raise serializers.ValidationError(
                f"Không thể chuyển từ {current_status} sang {value}"
            )
        
        return value
```

### File: `apps/orders/views.py`

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from decimal import Decimal

from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderCreateSerializer, OrderStatusUpdateSerializer
from apps.authentication.models import User
from apps.products.models import Product
from apps.wallet.services import WalletService
from apps.payments.services import PaymentGatewayService

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'admin'

class OrderViewSet(viewsets.ModelViewSet):
    """ViewSet cho Order CRUD"""
    
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'payment_method']
    
    def get_permissions(self):
        if self.action == 'create':
            # Cho phép guest checkout
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Order.objects.none()
        
        if user.role == 'admin':
            return Order.objects.all()
        return Order.objects.filter(user=user)
    
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """POST /api/v1/orders/"""
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        
        # Xác định user (authenticated hoặc guest)
        user = None
        if request.user.is_authenticated:
            user = request.user
        elif data.get('user_id'):
            try:
                user = User.objects.get(id=data['user_id'])
            except User.DoesNotExist:
                pass
        
        # Nếu không có user, tạo guest order (không lưu user)
        # Hoặc bạn có thể tạo user role='guest' tạm thời
        
        # Create order
        order = Order.objects.create(
            user=user,
            user_name=data['user_name'],
            user_email=data['user_email'],
            total=data['total'],
            payment_method=data['payment_method'],
            wallet_discount=data.get('wallet_discount', 0),
            shipping_address=data['shipping_address'],
            phone=data['phone'],
            notes=data.get('notes', ''),
        )
        
        # Create order items và giảm stock
        for item_data in data['items']:
            product = Product.objects.get(id=item_data['product_id'])
            
            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=item_data['product_name'],
                product_image=item_data['product_image'],
                quantity=item_data['quantity'],
                price=item_data['price']
            )
            
            # Giảm stock
            product.stock -= item_data['quantity']
            product.save(update_fields=['stock'])
        
        # Process payment
        payment_url = None
        
        if data['payment_method'] == 'wallet':
            # Thanh toán bằng ví
            if not user:
                return Response({
                    'success': False,
                    'error': 'Cần đăng nhập để thanh toán bằng ví'
                }, status=status.HTTP_401_UNAUTHORIZED)
            
            wallet_service = WalletService()
            success, message = wallet_service.process_payment(user, order.total, str(order.id))
            
            if success:
                order.status = 'approved'
                order.payment_status = 'completed'
                order.wallet_discount = order.total * Decimal('0.02')  # 2% discount
                order.save()
            else:
                # Rollback: hoàn lại stock và xóa order
                for item in order.items.all():
                    item.product.stock += item.quantity
                    item.product.save()
                order.delete()
                
                return Response({
                    'success': False,
                    'error': message
                }, status=status.HTTP_400_BAD_REQUEST)
        
        elif data['payment_method'] in ['vnpay', 'momo', 'stripe', 'paypal']:
            # Thanh toán online - tự động duyệt
            order.status = 'approved'
            order.save()
            
            # Generate payment URL
            payment_service = PaymentGatewayService()
            try:
                payment_url = payment_service.create_payment_url(
                    payment_method=data['payment_method'],
                    order_id=str(order.id),
                    amount=float(order.total),
                    description=f"Thanh toán đơn hàng {order.id}"
                )
            except Exception as e:
                # Nếu tạo payment URL fail, vẫn giữ order với status pending
                order.status = 'pending'
                order.save()
        
        elif data['payment_method'] == 'cod':
            # COD - chờ admin duyệt
            order.status = 'pending'
            order.save()
        
        # Response
        response_data = OrderSerializer(order).data
        if payment_url:
            response_data['payment_url'] = payment_url
        
        return Response({
            'success': True,
            'data': response_data,
            'message': 'Đặt hàng thành công'
        }, status=status.HTTP_201_CREATED)
    
    def list(self, request, *args, **kwargs):
        """GET /api/v1/orders/ - Admin only"""
        if request.user.role != 'admin':
            return Response({
                'success': False,
                'error': 'Không có quyền truy cập'
            }, status=status.HTTP_403_FORBIDDEN)
        
        queryset = self.filter_queryset(self.get_queryset())
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return Response({
                'success': True,
                'data': {
                    'orders': serializer.data,
                    'pagination': {
                        'total': self.paginator.page.paginator.count,
                        'page': self.paginator.page.number,
                        'limit': self.paginator.page_size,
                        'totalPages': self.paginator.page.paginator.num_pages,
                    }
                }
            })
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({'success': True, 'data': {'orders': serializer.data}})
    
    @action(detail=False, methods=['get'])
    def my_orders(self, request):
        """GET /api/v1/orders/my_orders/ - User's orders"""
        orders = Order.objects.filter(user=request.user).order_by('-created_at')
        serializer = self.get_serializer(orders, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    @action(detail=True, methods=['patch'], permission_classes=[IsAdminUser])
    def update_status(self, request, pk=None):
        """PATCH /api/v1/orders/{id}/update_status/ - Admin only"""
        order = self.get_object()
        serializer = OrderStatusUpdateSerializer(
            data=request.data,
            context={'order': order}
        )
        serializer.is_valid(raise_exception=True)
        
        new_status = serializer.validated_data['status']
        order.status = new_status
        order.save()
        
        return Response({
            'success': True,
            'data': OrderSerializer(order).data,
            'message': 'Cập nhật trạng thái đơn hàng thành công'
        })
    
    @action(detail=True, methods=['patch'])
    def cancel(self, request, pk=None):
        """PATCH /api/v1/orders/{id}/cancel/"""
        order = self.get_object()
        
        # Validate: chỉ cancel được pending hoặc approved
        if order.status not in ['pending', 'approved']:
            return Response({
                'success': False,
                'error': f'Không thể hủy đơn hàng ở trạng thái {order.status}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Hoàn tiền nếu đã thanh toán bằng ví
        if order.payment_method == 'wallet' and order.payment_status == 'completed':
            wallet_service = WalletService()
            wallet_service.refund_payment(order.user, order.total, str(order.id))
        
        # Hoàn lại stock
        for item in order.items.all():
            item.product.stock += item.quantity
            item.product.save()
        
        # Update order status
        order.status = 'cancelled'
        order.payment_status = 'refunded' if order.payment_method == 'wallet' else order.payment_status
        order.save()
        
        return Response({
            'success': True,
            'data': OrderSerializer(order).data,
            'message': 'Hủy đơn hàng thành công. Tiền đã được hoàn vào ví.' if order.payment_method == 'wallet' else 'Hủy đơn hàng thành công.'
        })
```

### File: `apps/orders/urls.py`

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet

app_name = 'orders'

router = DefaultRouter()
router.register('', OrderViewSet, basename='order')

urlpatterns = [
    path('', include(router.urls)),
]
```

---

## 💰 Wallet App - Implementation đầy đủ

### File: `apps/wallet/services.py`

```python
from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from .models import WalletTransaction
from apps.authentication.models import User

class WalletService:
    """Service xử lý ví điện tử"""
    
    @transaction.atomic
    def process_payment(self, user, amount, order_id):
        """
        Xử lý thanh toán bằng ví
        Returns: (success: bool, message: str)
        """
        
        # Check balance
        if user.wallet_balance < amount:
            needed = amount - user.wallet_balance
            return False, f"Số dư ví không đủ. Cần nạp thêm {needed:,.0f}đ"
        
        # Calculate discount (2%)
        discount = amount * Decimal('0.02')
        final_amount = amount - discount
        
        balance_before = user.wallet_balance
        balance_after = balance_before - final_amount
        
        # Update user balance
        user.wallet_balance = balance_after
        user.save(update_fields=['wallet_balance'])
        
        # Create transaction
        WalletTransaction.objects.create(
            user=user,
            type='payment',
            amount=final_amount,
            balance_before=balance_before,
            balance_after=balance_after,
            description=f"Thanh toán đơn hàng {order_id} (Giảm giá 2%: -{discount:,.0f}đ)",
            status='completed',
            created_at=timezone.now()
        )
        
        return True, "Thanh toán thành công"
    
    @transaction.atomic
    def deposit(self, user, amount, payment_method, transaction_ref):
        """
        Nạp tiền vào ví
        Returns: WalletTransaction
        """
        
        balance_before = user.wallet_balance
        balance_after = balance_before + amount
        
        # Update user balance
        user.wallet_balance = balance_after
        user.save(update_fields=['wallet_balance'])
        
        # Create transaction
        transaction = WalletTransaction.objects.create(
            user=user,
            type='deposit',
            amount=amount,
            balance_before=balance_before,
            balance_after=balance_after,
            description=f"Nạp tiền qua {payment_method.upper()}",
            status='completed',
            payment_method=payment_method,
            transaction_ref=transaction_ref,
            created_at=timezone.now()
        )
        
        return transaction
    
    @transaction.atomic
    def withdraw(self, user, amount, bank_info):
        """
        Rút tiền từ ví
        Returns: WalletTransaction
        Raises: ValueError nếu số dư không đủ
        """
        
        # Minimum withdrawal: 50,000đ
        if amount < 50000:
            raise ValueError("Số tiền rút tối thiểu là 50,000đ")
        
        # Check balance
        if user.wallet_balance < amount:
            raise ValueError("Số dư ví không đủ")
        
        balance_before = user.wallet_balance
        balance_after = balance_before - amount
        
        # Update user balance
        user.wallet_balance = balance_after
        user.save(update_fields=['wallet_balance'])
        
        # Create transaction (pending - chờ admin duyệt)
        transaction = WalletTransaction.objects.create(
            user=user,
            type='withdrawal',
            amount=amount,
            balance_before=balance_before,
            balance_after=balance_after,
            description=f"Rút tiền về {bank_info['bank_name']} - STK: {bank_info['bank_account']} - CTK: {bank_info['bank_owner']}",
            status='pending',
            created_at=timezone.now()
        )
        
        return transaction
    
    @transaction.atomic
    def refund_payment(self, user, amount, order_id):
        """
        Hoàn tiền vào ví (khi hủy đơn hàng)
        Returns: WalletTransaction
        """
        
        balance_before = user.wallet_balance
        balance_after = balance_before + amount
        
        # Update user balance
        user.wallet_balance = balance_after
        user.save(update_fields=['wallet_balance'])
        
        # Create transaction
        transaction = WalletTransaction.objects.create(
            user=user,
            type='refund',
            amount=amount,
            balance_before=balance_before,
            balance_after=balance_after,
            description=f"Hoàn tiền đơn hàng {order_id}",
            status='completed',
            created_at=timezone.now()
        )
        
        return transaction
    
    def get_balance(self, user):
        """Lấy số dư ví"""
        return user.wallet_balance
    
    def get_transactions(self, user, limit=None):
        """Lấy lịch sử giao dịch"""
        queryset = WalletTransaction.objects.filter(user=user).order_by('-created_at')
        if limit:
            queryset = queryset[:limit]
        return queryset
```

### File: `apps/wallet/views.py`

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from datetime import datetime

from .models import WalletTransaction
from .serializers import (
    WalletTransactionSerializer, 
    WalletDepositSerializer, 
    WalletWithdrawSerializer
)
from .services import WalletService
from apps.payments.services import PaymentGatewayService

class WalletViewSet(viewsets.ViewSet):
    """ViewSet cho Wallet"""
    
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def balance(self, request):
        """GET /api/v1/wallet/balance/"""
        wallet_service = WalletService()
        balance = wallet_service.get_balance(request.user)
        
        return Response({
            'success': True,
            'data': {
                'balance': float(balance)
            }
        })
    
    @action(detail=False, methods=['get'])
    def transactions(self, request):
        """GET /api/v1/wallet/transactions/"""
        wallet_service = WalletService()
        transactions = wallet_service.get_transactions(request.user)
        serializer = WalletTransactionSerializer(transactions, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data
        })
    
    @action(detail=False, methods=['post'])
    def deposit(self, request):
        """POST /api/v1/wallet/deposit/"""
        serializer = WalletDepositSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        amount = serializer.validated_data['amount']
        payment_method = serializer.validated_data['payment_method']
        
        # Create unique transaction reference
        transaction_ref = f"WALLET_DEPOSIT_{request.user.id}_{int(datetime.now().timestamp())}"
        
        # Generate payment URL
        try:
            payment_service = PaymentGatewayService()
            payment_url = payment_service.create_payment_url(
                payment_method=payment_method,
                order_id=transaction_ref,
                amount=float(amount),
                description=f"Nạp tiền vào ví - {request.user.email}"
            )
            
            return Response({
                'success': True,
                'data': {
                    'payment_url': payment_url,
                    'transaction_ref': transaction_ref,
                    'amount': float(amount),
                    'payment_method': payment_method
                },
                'message': f'Đang chuyển đến trang thanh toán {payment_method.upper()}'
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': f'Lỗi tạo giao dịch: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def withdraw(self, request):
        """POST /api/v1/wallet/withdraw/"""
        serializer = WalletWithdrawSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        amount = serializer.validated_data['amount']
        bank_info = {
            'bank_name': serializer.validated_data['bank_name'],
            'bank_account': serializer.validated_data['bank_account'],
            'bank_owner': serializer.validated_data['bank_owner']
        }
        
        try:
            wallet_service = WalletService()
            transaction = wallet_service.withdraw(request.user, amount, bank_info)
            
            return Response({
                'success': True,
                'data': WalletTransactionSerializer(transaction).data,
                'message': 'Yêu cầu rút tiền đã được gửi. Admin sẽ xử lý trong vòng 24h.'
            }, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
```

### File: `apps/wallet/urls.py`

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WalletViewSet

app_name = 'wallet'

router = DefaultRouter()
router.register('', WalletViewSet, basename='wallet')

urlpatterns = [
    path('', include(router.urls)),
]
```

---

## 💳 Payment Gateway Services

### File: `apps/payments/services/vnpay.py`

```python
import hashlib
import hmac
import urllib.parse
from datetime import datetime
from django.conf import settings

class VNPayService:
    """Service xử lý thanh toán VNPay"""
    
    def __init__(self):
        self.config = settings.VNPAY_CONFIG
    
    def create_payment_url(self, order_id, amount, description):
        """
        Tạo URL thanh toán VNPay
        
        Args:
            order_id: Mã đơn hàng hoặc transaction ref
            amount: Số tiền (VND)
            description: Mô tả giao dịch
        
        Returns:
            str: Payment URL
        """
        
        # VNPay parameters
        vnp_params = {
            'vnp_Version': '2.1.0',
            'vnp_Command': 'pay',
            'vnp_TmnCode': self.config['TMN_CODE'],
            'vnp_Amount': int(amount * 100),  # VNPay yêu cầu amount * 100
            'vnp_CurrCode': 'VND',
            'vnp_TxnRef': str(order_id),
            'vnp_OrderInfo': description,
            'vnp_OrderType': 'other',
            'vnp_Locale': 'vn',
            'vnp_ReturnUrl': self.config['RETURN_URL'],
            'vnp_CreateDate': datetime.now().strftime('%Y%m%d%H%M%S'),
            'vnp_IpAddr': '127.0.0.1',
        }
        
        # Sort parameters
        sorted_params = sorted(vnp_params.items())
        
        # Create query string
        query_string = '&'.join([
            f"{key}={urllib.parse.quote_plus(str(val))}" 
            for key, val in sorted_params
        ])
        
        # Create secure hash
        hash_data = '&'.join([f"{key}={val}" for key, val in sorted_params])
        secure_hash = hmac.new(
            self.config['HASH_SECRET'].encode('utf-8'),
            hash_data.encode('utf-8'),
            hashlib.sha512
        ).hexdigest()
        
        # Final payment URL
        payment_url = f"{self.config['URL']}?{query_string}&vnp_SecureHash={secure_hash}"
        
        return payment_url
    
    def verify_payment_callback(self, params):
        """
        Xác thực callback từ VNPay
        
        Args:
            params: Dict chứa query parameters từ VNPay callback
        
        Returns:
            tuple: (is_valid: bool, message: str)
        """
        
        vnp_secure_hash = params.get('vnp_SecureHash')
        
        # Remove hash from params for verification
        input_data = {k: v for k, v in params.items() if k != 'vnp_SecureHash'}
        
        # Sort and create hash
        sorted_params = sorted(input_data.items())
        hash_data = '&'.join([f"{key}={val}" for key, val in sorted_params])
        secure_hash = hmac.new(
            self.config['HASH_SECRET'].encode('utf-8'),
            hash_data.encode('utf-8'),
            hashlib.sha512
        ).hexdigest()
        
        # Verify signature
        if secure_hash != vnp_secure_hash:
            return False, 'invalid_signature'
        
        # Check response code
        response_code = params.get('vnp_ResponseCode')
        if response_code == '00':
            return True, 'success'
        else:
            return False, f'payment_failed_code_{response_code}'
```

### File: `apps/payments/services/momo.py`

```python
import hashlib
import hmac
import json
import requests
from datetime import datetime
from django.conf import settings

class MoMoService:
    """Service xử lý thanh toán MoMo"""
    
    def __init__(self):
        self.config = settings.MOMO_CONFIG
    
    def create_payment_url(self, order_id, amount, description):
        """
        Tạo URL thanh toán MoMo
        
        Args:
            order_id: Mã đơn hàng
            amount: Số tiền (VND)
            description: Mô tả giao dịch
        
        Returns:
            str: Payment URL
        """
        
        request_id = f"{order_id}_{int(datetime.now().timestamp())}"
        
        # Request data
        data = {
            'partnerCode': self.config['PARTNER_CODE'],
            'accessKey': self.config['ACCESS_KEY'],
            'requestId': request_id,
            'amount': str(int(amount)),
            'orderId': str(order_id),
            'orderInfo': description,
            'returnUrl': self.config['RETURN_URL'],
            'notifyUrl': self.config['NOTIFY_URL'],
            'extraData': '',
            'requestType': 'captureMoMoWallet',
        }
        
        # Create signature
        raw_signature = (
            f"partnerCode={data['partnerCode']}"
            f"&accessKey={data['accessKey']}"
            f"&requestId={data['requestId']}"
            f"&amount={data['amount']}"
            f"&orderId={data['orderId']}"
            f"&orderInfo={data['orderInfo']}"
            f"&returnUrl={data['returnUrl']}"
            f"&notifyUrl={data['notifyUrl']}"
            f"&extraData={data['extraData']}"
        )
        
        signature = hmac.new(
            self.config['SECRET_KEY'].encode('utf-8'),
            raw_signature.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        data['signature'] = signature
        
        # Send request to MoMo
        try:
            response = requests.post(
                self.config['ENDPOINT'], 
                json=data,
                timeout=10
            )
            result = response.json()
            
            if result.get('errorCode') == 0:
                return result.get('payUrl')
            else:
                raise Exception(f"MoMo error: {result.get('message', 'Unknown error')}")
        except Exception as e:
            raise Exception(f"MoMo request failed: {str(e)}")
    
    def verify_payment_callback(self, params):
        """
        Xác thực callback từ MoMo
        
        Args:
            params: Dict chứa data từ MoMo callback
        
        Returns:
            tuple: (is_valid: bool, message: str)
        """
        
        # Create signature for verification
        raw_signature = (
            f"partnerCode={params.get('partnerCode', '')}"
            f"&accessKey={params.get('accessKey', '')}"
            f"&requestId={params.get('requestId', '')}"
            f"&amount={params.get('amount', '')}"
            f"&orderId={params.get('orderId', '')}"
            f"&orderInfo={params.get('orderInfo', '')}"
            f"&orderType={params.get('orderType', '')}"
            f"&transId={params.get('transId', '')}"
            f"&message={params.get('message', '')}"
            f"&localMessage={params.get('localMessage', '')}"
            f"&responseTime={params.get('responseTime', '')}"
            f"&errorCode={params.get('errorCode', '')}"
            f"&payType={params.get('payType', '')}"
            f"&extraData={params.get('extraData', '')}"
        )
        
        signature = hmac.new(
            self.config['SECRET_KEY'].encode('utf-8'),
            raw_signature.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        # Verify signature
        if signature != params.get('signature'):
            return False, 'invalid_signature'
        
        # Check error code
        if params.get('errorCode') == '0':
            return True, 'success'
        else:
            return False, f"payment_failed_code_{params.get('errorCode')}"
```

### File: `apps/payments/services/__init__.py`

```python
from .vnpay import VNPayService
from .momo import MoMoService

class PaymentGatewayService:
    """Main service quản lý các payment gateway"""
    
    def create_payment_url(self, payment_method, order_id, amount, description):
        """
        Tạo payment URL theo payment method
        
        Args:
            payment_method: 'vnpay', 'momo', 'stripe', 'paypal'
            order_id: Mã đơn hàng
            amount: Số tiền
            description: Mô tả giao dịch
        
        Returns:
            str: Payment URL
        
        Raises:
            ValueError: Nếu payment method không hỗ trợ
        """
        
        if payment_method == 'vnpay':
            service = VNPayService()
            return service.create_payment_url(order_id, amount, description)
        
        elif payment_method == 'momo':
            service = MoMoService()
            return service.create_payment_url(order_id, amount, description)
        
        elif payment_method == 'stripe':
            # TODO: Implement Stripe
            raise NotImplementedError("Stripe chưa được implement")
        
        elif payment_method == 'paypal':
            # TODO: Implement PayPal
            raise NotImplementedError("PayPal chưa được implement")
        
        else:
            raise ValueError(f"Payment method không hỗ trợ: {payment_method}")
    
    def verify_callback(self, payment_method, params):
        """
        Xác thực callback từ payment gateway
        
        Args:
            payment_method: 'vnpay', 'momo', etc
            params: Callback parameters
        
        Returns:
            tuple: (is_valid: bool, message: str)
        """
        
        if payment_method == 'vnpay':
            service = VNPayService()
            return service.verify_payment_callback(params)
        
        elif payment_method == 'momo':
            service = MoMoService()
            return service.verify_payment_callback(params)
        
        else:
            return False, 'unsupported_payment_method'
```

### File: `apps/payments/views.py`

```python
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.shortcuts import redirect
from django.db import transaction

from .services import VNPayService, MoMoService
from apps.orders.models import Order
from apps.wallet.services import WalletService

class VNPayCallbackView(APIView):
    """Callback từ VNPay sau khi thanh toán"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        """GET /api/v1/payments/vnpay/callback"""
        
        vnpay_service = VNPayService()
        is_valid, message = vnpay_service.verify_payment_callback(request.GET.dict())
        
        transaction_ref = request.GET.get('vnp_TxnRef', '')
        
        if is_valid:
            # Check if this is wallet deposit or order payment
            if transaction_ref.startswith('WALLET_DEPOSIT_'):
                # Wallet deposit
                try:
                    user_id = transaction_ref.split('_')[2]
                    amount = float(request.GET.get('vnp_Amount', 0)) / 100
                    
                    from apps.authentication.models import User
                    user = User.objects.get(id=user_id)
                    
                    wallet_service = WalletService()
                    wallet_service.deposit(
                        user=user,
                        amount=amount,
                        payment_method='vnpay',
                        transaction_ref=transaction_ref
                    )
                    
                    return redirect(f'http://localhost:3000/dashboard?tab=wallet&success=deposit&amount={amount}')
                except Exception as e:
                    return redirect(f'http://localhost:3000/payment/failed?error=deposit_failed')
            else:
                # Order payment
                try:
                    order = Order.objects.get(id=transaction_ref)
                    order.payment_status = 'completed'
                    order.save()
                    
                    return redirect(f'http://localhost:3000/payment/success?orderId={transaction_ref}')
                except Order.DoesNotExist:
                    return redirect('http://localhost:3000/payment/failed?error=order_not_found')
        else:
            return redirect(f'http://localhost:3000/payment/failed?error={message}')

class MoMoCallbackView(APIView):
    """Callback từ MoMo"""
    permission_classes = [AllowAny]
    
    def get(self, request):
        """GET callback from browser redirect"""
        return self.process_callback(request.GET.dict())
    
    def post(self, request):
        """POST webhook from MoMo server"""
        return self.process_callback(request.data)
    
    def process_callback(self, data):
        """Process MoMo callback"""
        
        momo_service = MoMoService()
        is_valid, message = momo_service.verify_payment_callback(data)
        
        transaction_ref = data.get('orderId', '')
        
        if is_valid:
            # Similar logic như VNPay
            if transaction_ref.startswith('WALLET_DEPOSIT_'):
                # Wallet deposit
                try:
                    user_id = transaction_ref.split('_')[2]
                    amount = float(data.get('amount', 0))
                    
                    from apps.authentication.models import User
                    user = User.objects.get(id=user_id)
                    
                    wallet_service = WalletService()
                    wallet_service.deposit(
                        user=user,
                        amount=amount,
                        payment_method='momo',
                        transaction_ref=transaction_ref
                    )
                    
                    if 'HTTP_REFERER' in data:
                        # Browser redirect
                        return redirect(f'http://localhost:3000/dashboard?tab=wallet&success=deposit')
                    else:
                        # Webhook
                        return Response({'success': True, 'message': 'Nạp tiền thành công'})
                except Exception as e:
                    return Response({'success': False, 'error': str(e)})
            else:
                # Order payment
                try:
                    order = Order.objects.get(id=transaction_ref)
                    order.payment_status = 'completed'
                    order.save()
                    
                    return Response({'success': True})
                except Order.DoesNotExist:
                    return Response({'success': False, 'error': 'order_not_found'})
        else:
            return Response({'success': False, 'error': message})
```

### File: `apps/payments/urls.py`

```python
from django.urls import path
from .views import VNPayCallbackView, MoMoCallbackView

app_name = 'payments'

urlpatterns = [
    path('vnpay/callback', VNPayCallbackView.as_view(), name='vnpay-callback'),
    path('momo/callback', MoMoCallbackView.as_view(), name='momo-callback'),
    path('momo/webhook', MoMoCallbackView.as_view(), name='momo-webhook'),
]
```

---

## 🔧 Custom Permissions

### File: `apps/authentication/permissions.py`

```python
from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """Chỉ admin mới có quyền"""
    
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'admin'
        )

class IsOwnerOrAdmin(permissions.BasePermission):
    """Owner hoặc admin mới có quyền"""
    
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        
        # Check if obj has user field
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        return False
```

---

## 📧 Email Templates

### File: `apps/authentication/email_templates.py`

```python
def get_welcome_email_template(user):
    """Email chào mừng"""
    return f"""
    <html>
    <body>
        <h2>Chào mừng {user.name} đến với Homely Store!</h2>
        <p>Cảm ơn bạn đã đăng ký tài khoản.</p>
        <p>Email: {user.email}</p>
        <p>Bắt đầu mua sắm ngay: <a href="http://localhost:3000">Homely Store</a></p>
    </body>
    </html>
    """

def get_order_confirmation_template(order):
    """Email xác nhận đơn hàng"""
    items_html = ''.join([
        f"<li>{item.product_name} x {item.quantity} - {item.price:,.0f}đ</li>"
        for item in order.items.all()
    ])
    
    return f"""
    <html>
    <body>
        <h2>Xác nhận đơn hàng #{order.id}</h2>
        <p>Xin chào {order.user_name},</p>
        <p>Đơn hàng của bạn đã được xác nhận.</p>
        
        <h3>Chi tiết:</h3>
        <ul>{items_html}</ul>
        
        <p><strong>Tổng tiền: {order.total:,.0f}đ</strong></p>
        <p>Địa chỉ: {order.shipping_address}</p>
        <p>SĐT: {order.phone}</p>
    </body>
    </html>
    """
```

---

## 🎯 Final Checklist

### Backend Setup:

- [x] Models created
- [x] Serializers implemented
- [x] Views & URLs configured
- [x] Authentication với JWT
- [x] CORS configuration
- [x] File upload handling
- [x] Payment gateway services
- [x] Wallet system
- [x] Email templates
- [x] Custom permissions
- [x] Error handling

### Testing:

```bash
# Test toàn bộ API
python manage.py test

# Test từng app
python manage.py test apps.authentication
python manage.py test apps.products
python manage.py test apps.orders
python manage.py test apps.wallet
```

### Deployment:

```bash
# Collect static files
python manage.py collectstatic --noinput

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run with Gunicorn
gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4
```

---

**🎉 Hoàn thành! Backend Django đã sẵn sàng kết nối với React Frontend.**
