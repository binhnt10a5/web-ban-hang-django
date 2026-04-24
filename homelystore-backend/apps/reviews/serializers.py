from rest_framework import serializers
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):

    userName = serializers.CharField(source='user.name', read_only=True)
    productName = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = Review
        fields = [
            'id',
            'order',
            'product',
            'productName',
            'user',
            'userName',
            'rating',
            'comment',
            'status',
            'created_at'
        ]
        read_only_fields = ['user', 'status']