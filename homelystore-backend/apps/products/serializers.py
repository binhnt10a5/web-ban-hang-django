from rest_framework import serializers
from .models import Product, ProductImage

class ProductImageSerializer(serializers.ModelSerializer):
    """Serializer cho Product Images"""
    
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'order']

class ProductSerializer(serializers.ModelSerializer):
    """Serializer cho Product"""
    
    images = ProductImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'category', 'brand', 
                  'image', 'images', 'stock', 'rating', 'featured', 'discount', 
                  'tags', 'created_at', 'updated_at']
        read_only_fields = ['id', 'rating', 'created_at', 'updated_at']

class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer cho tạo/cập nhật Product"""
    
    gallery_images = serializers.ListField(
        child=serializers.ImageField(), 
        write_only=True, 
        required=False
    )
    
    class Meta:
        model = Product
        fields = ['name', 'description', 'price', 'category', 'brand', 
                  'image', 'gallery_images', 'stock', 'featured', 'discount', 'tags']
    
    def validate_image(self, value):
        """Validate image file"""
        if value.size > 2 * 1024 * 1024:  # 2MB
            raise serializers.ValidationError("Kích thước ảnh không được vượt quá 2MB")
        
        if value.content_type not in ['image/jpeg', 'image/png']:
            raise serializers.ValidationError("Chỉ chấp nhận ảnh JPG và PNG")
        
        return value
    
    def create(self, validated_data):
        gallery_images = validated_data.pop('gallery_images', [])
        product = Product.objects.create(**validated_data)
        
        # Create gallery images
        for idx, image in enumerate(gallery_images):
            ProductImage.objects.create(product=product, image=image, order=idx)
        
        return product
    
    def update(self, instance, validated_data):
        gallery_images = validated_data.pop('gallery_images', None)
        
        # Update product
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update gallery images if provided
        if gallery_images is not None:
            instance.images.all().delete()
            for idx, image in enumerate(gallery_images):
                ProductImage.objects.create(product=instance, image=image, order=idx)
        
        return instance