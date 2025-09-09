from rest_framework import generics, filters, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Avg
from .models import Vehicle, VehicleCategory, VehicleBrand
from .serializers import (
    VehicleListSerializer, 
    VehicleDetailSerializer, 
    VehicleCreateUpdateSerializer,
    VehicleCategorySerializer,
    VehicleBrandSerializer
)


class VehicleListView(generics.ListAPIView):
    """List all available vehicles with filtering and search."""
    serializer_class = VehicleListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['brand', 'category', 'fuel_type', 'transmission', 'status', 'location']
    search_fields = ['name', 'brand__name', 'description', 'features']
    ordering_fields = ['daily_rate', 'model_year', 'created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = Vehicle.objects.select_related('brand', 'category').prefetch_related('images')
        
        # Filter by availability by default
        available_only = self.request.query_params.get('available_only', 'true').lower() == 'true'
        if available_only:
            queryset = queryset.filter(status='available')
        
        # Price range filter
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        
        if min_price:
            queryset = queryset.filter(daily_rate__gte=min_price)
        if max_price:
            queryset = queryset.filter(daily_rate__lte=max_price)
        
        # Seating capacity filter
        min_seating = self.request.query_params.get('min_seating')
        if min_seating:
            queryset = queryset.filter(seating_capacity__gte=min_seating)
        
        return queryset


class VehicleDetailView(generics.RetrieveAPIView):
    """Get detailed information about a specific vehicle."""
    queryset = Vehicle.objects.select_related('brand', 'category').prefetch_related('images')
    serializer_class = VehicleDetailSerializer
    permission_classes = [permissions.AllowAny]


class VehicleCreateView(generics.CreateAPIView):
    """Create a new vehicle (admin only)."""
    queryset = Vehicle.objects.all()
    serializer_class = VehicleCreateUpdateSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]


class VehicleUpdateView(generics.UpdateAPIView):
    """Update vehicle information (admin only)."""
    queryset = Vehicle.objects.all()
    serializer_class = VehicleCreateUpdateSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]


class VehicleDeleteView(generics.DestroyAPIView):
    """Delete a vehicle (admin only)."""
    queryset = Vehicle.objects.all()
    permission_classes = [IsAuthenticated, IsAdminUser]


class VehicleCategoryListView(generics.ListAPIView):
    """List all vehicle categories."""
    queryset = VehicleCategory.objects.all()
    serializer_class = VehicleCategorySerializer
    permission_classes = [permissions.AllowAny]


class VehicleBrandListView(generics.ListAPIView):
    """List all vehicle brands."""
    queryset = VehicleBrand.objects.all()
    serializer_class = VehicleBrandSerializer
    permission_classes = [permissions.AllowAny]


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def vehicle_search(request):
    """Advanced vehicle search with multiple criteria."""
    query = request.GET.get('q', '')
    location = request.GET.get('location', '')
    min_price = request.GET.get('min_price')
    max_price = request.GET.get('max_price')
    fuel_type = request.GET.get('fuel_type')
    transmission = request.GET.get('transmission')
    min_seating = request.GET.get('min_seating')
    
    queryset = Vehicle.objects.select_related('brand', 'category').filter(status='available')
    
    # Text search
    if query:
        queryset = queryset.filter(
            Q(name__icontains=query) |
            Q(brand__name__icontains=query) |
            Q(description__icontains=query) |
            Q(features__icontains=query)
        )
    
    # Location filter
    if location:
        queryset = queryset.filter(location__icontains=location)
    
    # Price range
    if min_price:
        queryset = queryset.filter(daily_rate__gte=min_price)
    if max_price:
        queryset = queryset.filter(daily_rate__lte=max_price)
    
    # Other filters
    if fuel_type:
        queryset = queryset.filter(fuel_type=fuel_type)
    if transmission:
        queryset = queryset.filter(transmission=transmission)
    if min_seating:
        queryset = queryset.filter(seating_capacity__gte=min_seating)
    
    serializer = VehicleListSerializer(queryset, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def vehicle_availability(request, vehicle_id):
    """Check vehicle availability for specific dates."""
    from datetime import datetime, date
    from bookings.models import Booking
    
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    
    if not start_date or not end_date:
        return Response({'error': 'start_date and end_date are required'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    try:
        start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
    except ValueError:
        return Response({'error': 'Invalid date format. Use YYYY-MM-DD'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    if start_date >= end_date:
        return Response({'error': 'Start date must be before end date'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    try:
        vehicle = Vehicle.objects.get(id=vehicle_id)
    except Vehicle.DoesNotExist:
        return Response({'error': 'Vehicle not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check for conflicting bookings
    conflicting_bookings = Booking.objects.filter(
        vehicle=vehicle,
        status__in=['confirmed', 'active'],
        start_date__lte=end_date,
        end_date__gte=start_date
    ).exists()
    
    is_available = not conflicting_bookings and vehicle.is_available
    
    return Response({
        'vehicle_id': vehicle_id,
        'start_date': start_date,
        'end_date': end_date,
        'is_available': is_available,
        'vehicle_status': vehicle.status
    })


# ==================== ADMIN VEHICLE MANAGEMENT ====================

class AdminVehicleListView(generics.ListCreateAPIView):
    """Admin view to list and create vehicles."""
    queryset = Vehicle.objects.all()
    serializer_class = VehicleCreateUpdateSerializer
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'brand', 'fuel_type', 'transmission', 'status']
    search_fields = ['name', 'model', 'brand__name']
    ordering_fields = ['created_at', 'daily_rate', 'name']
    ordering = ['-created_at']


class AdminVehicleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin view to retrieve, update, or delete a specific vehicle."""
    queryset = Vehicle.objects.all()
    serializer_class = VehicleCreateUpdateSerializer
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]


class AdminVehicleCategoryListView(generics.ListCreateAPIView):
    """Admin view to manage vehicle categories."""
    queryset = VehicleCategory.objects.all()
    serializer_class = VehicleCategorySerializer
    permission_classes = [IsAdminUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class AdminVehicleCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin view to manage a specific vehicle category."""
    queryset = VehicleCategory.objects.all()
    serializer_class = VehicleCategorySerializer
    permission_classes = [IsAdminUser]


class AdminVehicleBrandListView(generics.ListCreateAPIView):
    """Admin view to manage vehicle brands."""
    queryset = VehicleBrand.objects.all()
    serializer_class = VehicleBrandSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'country']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class AdminVehicleBrandDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin view to manage a specific vehicle brand."""
    queryset = VehicleBrand.objects.all()
    serializer_class = VehicleBrandSerializer
    permission_classes = [IsAdminUser]


@api_view(['GET'])
@permission_classes([IsAdminUser])
def vehicle_analytics(request):
    """Get comprehensive vehicle analytics for admin dashboard."""
    # Vehicle statistics
    total_vehicles = Vehicle.objects.count()
    available_vehicles = Vehicle.objects.filter(status='available').count()
    rented_vehicles = Vehicle.objects.filter(status='rented').count()
    
    # Category distribution
    category_stats = VehicleCategory.objects.annotate(
        vehicle_count=Count('vehicles')
    ).values('name', 'vehicle_count')
    
    # Brand distribution
    brand_stats = VehicleBrand.objects.annotate(
        vehicle_count=Count('vehicles')
    ).values('name', 'vehicle_count')
    
    # Popular vehicles (most booked)
    popular_vehicles = Vehicle.objects.annotate(
        booking_count=Count('bookings')
    ).order_by('-booking_count')[:10]
    
    # Revenue by vehicle
    revenue_by_vehicle = Vehicle.objects.annotate(
        total_revenue=Avg('bookings__total_amount')
    ).filter(total_revenue__isnull=False).order_by('-total_revenue')[:10]
    
    # Fuel type distribution
    fuel_stats = Vehicle.objects.values('fuel_type').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Transmission distribution
    transmission_stats = Vehicle.objects.values('transmission').annotate(
        count=Count('id')
    ).order_by('-count')
    
    return Response({
        'overview': {
            'total_vehicles': total_vehicles,
            'available_vehicles': available_vehicles,
            'rented_vehicles': rented_vehicles,
        },
        'category_distribution': list(category_stats),
        'brand_distribution': list(brand_stats),
        'fuel_type_distribution': list(fuel_stats),
        'transmission_distribution': list(transmission_stats),
        'popular_vehicles': [
            {
                'id': vehicle.id,
                'name': vehicle.name,
                'brand': vehicle.brand.name,
                'booking_count': vehicle.booking_count
            }
            for vehicle in popular_vehicles
        ],
        'top_revenue_vehicles': [
            {
                'id': vehicle.id,
                'name': vehicle.name,
                'brand': vehicle.brand.name,
                'avg_revenue': float(vehicle.total_revenue or 0)
            }
            for vehicle in revenue_by_vehicle
        ]
    })


@api_view(['POST'])
@permission_classes([IsAdminUser])
def bulk_vehicle_operations(request):
    """Perform bulk operations on vehicles (activate, deactivate, delete)."""
    operation = request.data.get('operation')
    vehicle_ids = request.data.get('vehicle_ids', [])
    
    if not operation or not vehicle_ids:
        return Response(
            {'error': 'Operation and vehicle_ids are required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    vehicles = Vehicle.objects.filter(id__in=vehicle_ids)
    
    if operation == 'activate':
        vehicles.update(status='available')
        message = f'{vehicles.count()} vehicles activated'
    elif operation == 'deactivate':
        vehicles.update(status='unavailable')
        message = f'{vehicles.count()} vehicles deactivated'
    elif operation == 'delete':
        count = vehicles.count()
        vehicles.delete()
        message = f'{count} vehicles deleted'
    else:
        return Response(
            {'error': 'Invalid operation'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    return Response({'message': message})
