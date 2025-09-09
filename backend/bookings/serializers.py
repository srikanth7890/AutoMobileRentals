from rest_framework import serializers
from django.utils import timezone
from .models import Booking, BookingStatusHistory, Payment
from vehicles.serializers import VehicleListSerializer
from users.serializers import UserProfileSerializer


class BookingCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new bookings."""
    
    class Meta:
        model = Booking
        fields = [
            'id', 'vehicle', 'start_date', 'end_date', 'pickup_time', 'return_time',
            'pickup_location', 'return_location', 'special_requests'
        ]
        read_only_fields = ['id']
    
    def validate(self, attrs):
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')
        
        if start_date and end_date:
            if start_date < timezone.now().date():
                raise serializers.ValidationError("Start date cannot be in the past")
            
            if start_date >= end_date:
                raise serializers.ValidationError("End date must be after start date")
            
            # Check if booking is for more than 30 days
            if (end_date - start_date).days > 30:
                raise serializers.ValidationError("Maximum booking duration is 30 days")
        
        return attrs


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            'id', 'amount', 'payment_method', 'transaction_id', 'payment_gateway',
            'payment_status', 'payment_date', 'failure_reason', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class BookingStatusHistorySerializer(serializers.ModelSerializer):
    changed_by = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = BookingStatusHistory
        fields = ['old_status', 'new_status', 'changed_by', 'reason', 'created_at']


class BookingListSerializer(serializers.ModelSerializer):
    """Serializer for booking list view."""
    vehicle = VehicleListSerializer(read_only=True)
    payment = PaymentSerializer(read_only=True)
    user = serializers.SerializerMethodField()
    
    class Meta:
        model = Booking
        fields = [
            'id', 'user', 'vehicle', 'start_date', 'end_date', 'total_days',
            'total_amount', 'status', 'payment_status', 'payment', 'created_at'
        ]
    
    def get_user(self, obj):
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'email': obj.user.email,
            'first_name': obj.user.first_name,
            'last_name': obj.user.last_name,
        }


class BookingDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for booking details."""
    vehicle = VehicleListSerializer(read_only=True)
    user = UserProfileSerializer(read_only=True)
    payment = PaymentSerializer(read_only=True)
    status_history = BookingStatusHistorySerializer(many=True, read_only=True)
    
    class Meta:
        model = Booking
        fields = [
            'id', 'user', 'vehicle', 'start_date', 'end_date', 'pickup_time', 'return_time',
            'daily_rate', 'total_days', 'subtotal', 'tax_amount', 'total_amount',
            'status', 'payment_status', 'pickup_location', 'return_location',
            'special_requests', 'notes', 'created_at', 'updated_at', 'confirmed_at',
            'cancelled_at', 'payment', 'status_history'
        ]


class BookingUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating booking status (admin only)."""
    
    class Meta:
        model = Booking
        fields = ['status', 'notes']
    
    def validate_status(self, value):
        # Add business logic for status transitions
        valid_transitions = {
            'pending': ['confirmed', 'cancelled'],
            'confirmed': ['active', 'cancelled'],
            'active': ['completed', 'cancelled'],
            'completed': [],
            'cancelled': []
        }
        
        # This would need the current status from the instance
        # For now, we'll allow all transitions
        return value


class BookingSummarySerializer(serializers.ModelSerializer):
    """Serializer for booking summary in checkout."""
    vehicle = serializers.SerializerMethodField()
    user = serializers.SerializerMethodField()
    
    class Meta:
        model = Booking
        fields = [
            'id', 'vehicle', 'user', 'start_date', 'end_date', 'pickup_time', 'return_time',
            'pickup_location', 'return_location', 'special_requests', 'status',
            'total_days', 'daily_rate', 'subtotal', 'tax_amount', 'total_amount',
            'created_at', 'updated_at'
        ]
    
    def get_vehicle(self, obj):
        """Get vehicle details."""
        try:
            vehicle = obj.vehicle
            return {
                'id': vehicle.id,
                'name': vehicle.name,
                'model': vehicle.name,  # Use name as model since there's no separate model field
                'year': vehicle.model_year,
                'brand': {
                    'id': vehicle.brand.id,
                    'name': vehicle.brand.name
                } if vehicle.brand else None,
                'category': {
                    'id': vehicle.category.id,
                    'name': vehicle.category.name
                } if vehicle.category else None,
                'daily_rate': vehicle.daily_rate,
                'main_image_url': self.get_vehicle_image(obj)
            }
        except Exception as e:
            return None
    
    def get_user(self, obj):
        """Get user details."""
        try:
            user = obj.user
            return {
                'id': user.id,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,
                'phone_number': user.phone_number
            }
        except Exception as e:
            return None
    
    def get_vehicle_image(self, obj):
        """Get vehicle image URL."""
        try:
            if obj.vehicle.main_image:
                request = self.context.get('request')
                if request:
                    return request.build_absolute_uri(obj.vehicle.main_image.url)
        except Exception as e:
            pass
        return None
