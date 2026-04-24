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
from rest_framework import permissions

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