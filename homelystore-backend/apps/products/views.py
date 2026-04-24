from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .models import Product
from .serializers import ProductSerializer, ProductCreateUpdateSerializer
from .filters import ProductFilter
from rest_framework import permissions

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