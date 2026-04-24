import django_filters
from .models import Product
from django.db.models import Q

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