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