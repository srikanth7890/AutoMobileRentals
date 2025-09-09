from rest_framework import serializers
from .models import Vehicle, VehicleCategory, VehicleBrand, VehicleImage


class VehicleImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleImage
        fields = ['id', 'image', 'caption', 'is_primary']


class VehicleBrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleBrand
        fields = ['id', 'name', 'logo']


class VehicleCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleCategory
        fields = ['id', 'name', 'description', 'icon']


class VehicleListSerializer(serializers.ModelSerializer):
    """Serializer for vehicle listing with basic info."""
    brand = VehicleBrandSerializer(read_only=True)
    category = VehicleCategorySerializer(read_only=True)
    main_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Vehicle
        fields = [
            'id', 'name', 'brand', 'category', 'model_year', 'fuel_type',
            'transmission', 'seating_capacity', 'daily_rate', 'location',
            'status', 'main_image_url', 'features'
        ]
    
    def get_main_image_url(self, obj):
        if obj.main_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.main_image.url)
        return None


class VehicleDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for vehicle details page."""
    brand = VehicleBrandSerializer(read_only=True)
    category = VehicleCategorySerializer(read_only=True)
    images = VehicleImageSerializer(many=True, read_only=True)
    main_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Vehicle
        fields = [
            'id', 'name', 'brand', 'category', 'model_year', 'fuel_type',
            'transmission', 'engine_capacity', 'seating_capacity', 'mileage',
            'daily_rate', 'weekly_rate', 'monthly_rate', 'location', 'status',
            'description', 'features', 'insurance_valid_until', 'registration_number',
            'main_image_url', 'images', 'created_at', 'updated_at'
        ]
    
    def get_main_image_url(self, obj):
        if obj.main_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.main_image.url)
        return None


class VehicleCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating vehicles (admin only)."""
    images = VehicleImageSerializer(many=True, required=False)
    
    class Meta:
        model = Vehicle
        fields = [
            'name', 'brand', 'category', 'model_year', 'fuel_type',
            'transmission', 'engine_capacity', 'seating_capacity', 'mileage',
            'daily_rate', 'weekly_rate', 'monthly_rate', 'location', 'status',
            'description', 'features', 'insurance_valid_until', 'registration_number',
            'main_image', 'images'
        ]
    
    def create(self, validated_data):
        images_data = validated_data.pop('images', [])
        vehicle = Vehicle.objects.create(**validated_data)
        
        for image_data in images_data:
            VehicleImage.objects.create(vehicle=vehicle, **image_data)
        
        return vehicle
    
    def update(self, instance, validated_data):
        images_data = validated_data.pop('images', [])
        
        # Update vehicle fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update images if provided
        if images_data:
            instance.images.all().delete()  # Remove existing images
            for image_data in images_data:
                VehicleImage.objects.create(vehicle=instance, **image_data)
        
        return instance
