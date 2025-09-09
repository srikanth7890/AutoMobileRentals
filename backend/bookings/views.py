from rest_framework import generics, status, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Q, Sum
from .models import Booking, BookingStatusHistory, Payment
from .serializers import (
    BookingCreateSerializer, 
    BookingListSerializer, 
    BookingDetailSerializer,
    BookingUpdateSerializer,
    BookingSummarySerializer,
    PaymentSerializer
)
from vehicles.models import Vehicle


class BookingCreateView(generics.CreateAPIView):
    """Create a new booking."""
    serializer_class = BookingCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        vehicle = serializer.validated_data['vehicle']
        start_date = serializer.validated_data['start_date']
        end_date = serializer.validated_data['end_date']
        
        # Check vehicle availability
        conflicting_bookings = Booking.objects.filter(
            vehicle=vehicle,
            status__in=['confirmed', 'active'],
            start_date__lte=end_date,
            end_date__gte=start_date
        ).exists()
        
        if conflicting_bookings:
            raise serializers.ValidationError("Vehicle is not available for the selected dates")
        
        if not vehicle.is_available:
            raise serializers.ValidationError("Vehicle is currently not available")
        
        # Set daily rate from vehicle
        serializer.save(
            user=self.request.user,
            daily_rate=vehicle.daily_rate
        )
        
        # Create status history entry
        booking = serializer.instance
        BookingStatusHistory.objects.create(
            booking=booking,
            new_status='pending',
            changed_by=self.request.user,
            reason='Booking created'
        )


class UserBookingListView(generics.ListAPIView):
    """List bookings for the authenticated user."""
    serializer_class = BookingListSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = Booking.objects.filter(user=user).select_related('vehicle__brand', 'vehicle__category').prefetch_related('payment')
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(start_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(end_date__lte=end_date)
        
        return queryset


class BookingDetailView(generics.RetrieveAPIView):
    """Get detailed information about a specific booking."""
    serializer_class = BookingDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return Booking.objects.select_related('user', 'vehicle__brand', 'vehicle__category').prefetch_related('payment', 'status_history')
        return Booking.objects.filter(user=user).select_related('vehicle__brand', 'vehicle__category').prefetch_related('payment', 'status_history')


class BookingUpdateView(generics.UpdateAPIView):
    """Update booking status (admin only)."""
    serializer_class = BookingUpdateSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    
    def get_queryset(self):
        return Booking.objects.all()
    
    def perform_update(self, serializer):
        old_status = self.get_object().status
        new_status = serializer.validated_data.get('status')
        
        booking = serializer.save()
        
        # Create status history entry
        BookingStatusHistory.objects.create(
            booking=booking,
            old_status=old_status,
            new_status=new_status,
            changed_by=self.request.user,
            reason=serializer.validated_data.get('notes', 'Status updated')
        )
        
        # Update vehicle status if booking is confirmed or active
        if new_status == 'confirmed':
            booking.vehicle.status = 'rented'
            booking.vehicle.save()
            booking.confirmed_at = timezone.now()
            booking.save()
        elif new_status == 'completed':
            booking.vehicle.status = 'available'
            booking.vehicle.save()


class AdminBookingListView(generics.ListAPIView):
    """List all bookings for admin."""
    serializer_class = BookingListSerializer
    permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]
    
    def get_queryset(self):
        queryset = Booking.objects.select_related('user', 'vehicle__brand', 'vehicle__category').prefetch_related('payment')
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by user
        user_id = self.request.query_params.get('user_id')
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # Filter by vehicle
        vehicle_id = self.request.query_params.get('vehicle_id')
        if vehicle_id:
            queryset = queryset.filter(vehicle_id=vehicle_id)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(start_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(end_date__lte=end_date)
        
        return queryset


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def cancel_booking(request, booking_id):
    """Cancel a booking."""
    try:
        booking = Booking.objects.get(id=booking_id, user=request.user)
    except Booking.DoesNotExist:
        return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if booking.status in ['completed', 'cancelled']:
        return Response({'error': 'Cannot cancel this booking'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if booking can be cancelled (e.g., not after start date)
    if booking.start_date < timezone.now().date():
        return Response({'error': 'Cannot cancel booking after start date'}, 
                       status=status.HTTP_400_BAD_REQUEST)
    
    old_status = booking.status
    booking.status = 'cancelled'
    booking.cancelled_at = timezone.now()
    booking.save()
    
    # Create status history entry
    BookingStatusHistory.objects.create(
        booking=booking,
        old_status=old_status,
        new_status='cancelled',
        changed_by=request.user,
        reason='Cancelled by user'
    )
    
    # Make vehicle available again
    booking.vehicle.status = 'available'
    booking.vehicle.save()
    
    return Response({'message': 'Booking cancelled successfully'})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def booking_summary(request, booking_id):
    """Get booking summary for checkout."""
    try:
        booking = Booking.objects.get(id=booking_id, user=request.user)
    except Booking.DoesNotExist:
        return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = BookingSummarySerializer(booking, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def booking_statistics(request):
    """Get booking statistics for dashboard."""
    user = request.user
    
    if user.is_admin:
        # Admin statistics
        from django.db.models import Count, Avg, Q
        from datetime import datetime, timedelta
        from vehicles.models import Vehicle
        
        # Basic counts
        total_bookings = Booking.objects.count()
        pending_bookings = Booking.objects.filter(status='pending').count()
        active_bookings = Booking.objects.filter(status='active').count()
        completed_bookings = Booking.objects.filter(status='completed').count()
        cancelled_bookings = Booking.objects.filter(status='cancelled').count()
        
        # Revenue analytics
        total_revenue = Booking.objects.filter(payment_status='paid').aggregate(
            total=Sum('total_amount')
        )['total'] or 0
        
        monthly_revenue = Booking.objects.filter(
            payment_status='paid',
            created_at__gte=datetime.now().replace(day=1)
        ).aggregate(total=Sum('total_amount'))['total'] or 0
        
        # Vehicle analytics
        total_vehicles = Vehicle.objects.count()
        available_vehicles = Vehicle.objects.filter(status='available').count()
        rented_vehicles = Vehicle.objects.filter(status='rented').count()
        
        # Popular vehicles
        popular_vehicles = Vehicle.objects.annotate(
            booking_count=Count('bookings')
        ).order_by('-booking_count')[:5]
        
        # Recent bookings (last 7 days)
        recent_bookings = Booking.objects.filter(
            created_at__gte=datetime.now() - timedelta(days=7)
        ).count()
        
        # Average booking value
        avg_booking_value = Booking.objects.filter(
            payment_status='paid'
        ).aggregate(avg=Avg('total_amount'))['avg'] or 0
        
        # Customer analytics
        from users.models import User
        total_customers = User.objects.filter(role='customer').count()
        active_customers = User.objects.filter(
            role='customer',
            bookings__status__in=['active', 'confirmed']
        ).distinct().count()
        
        return Response({
            'overview': {
                'total_bookings': total_bookings,
                'pending_bookings': pending_bookings,
                'active_bookings': active_bookings,
                'completed_bookings': completed_bookings,
                'cancelled_bookings': cancelled_bookings,
                'recent_bookings': recent_bookings,
            },
            'revenue': {
                'total_revenue': float(total_revenue),
                'monthly_revenue': float(monthly_revenue),
                'avg_booking_value': float(avg_booking_value),
            },
            'vehicles': {
                'total_vehicles': total_vehicles,
                'available_vehicles': available_vehicles,
                'rented_vehicles': rented_vehicles,
            },
            'customers': {
                'total_customers': total_customers,
                'active_customers': active_customers,
            },
            'popular_vehicles': [
                {
                    'id': vehicle.id,
                    'name': vehicle.name,
                    'brand': vehicle.brand.name,
                    'booking_count': vehicle.booking_count
                }
                for vehicle in popular_vehicles
            ]
        })
    else:
        # User statistics
        user_bookings = Booking.objects.filter(user=user)
        total_bookings = user_bookings.count()
        active_bookings = user_bookings.filter(status='active').count()
        upcoming_bookings = user_bookings.filter(status='confirmed').count()
        completed_bookings = user_bookings.filter(status='completed').count()
        
        return Response({
            'total_bookings': total_bookings,
            'active_bookings': active_bookings,
            'upcoming_bookings': upcoming_bookings,
            'completed_bookings': completed_bookings,
        })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_payment(request, booking_id):
    """Create payment for a booking."""
    try:
        booking = Booking.objects.get(id=booking_id, user=request.user)
    except Booking.DoesNotExist:
        return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if booking.payment_status == 'paid':
        return Response({'error': 'Payment already completed'}, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = PaymentSerializer(data=request.data)
    if serializer.is_valid():
        payment = serializer.save(booking=booking, amount=booking.total_amount)
        
        # Update booking payment status
        booking.payment_status = 'paid'
        booking.status = 'confirmed'
        booking.save()
        
        # Create status history entry
        BookingStatusHistory.objects.create(
            booking=booking,
            old_status='pending',
            new_status='confirmed',
            changed_by=request.user,
            reason='Payment completed'
        )
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ==================== ADMIN BOOKING MANAGEMENT ====================

class AdminBookingListView(generics.ListAPIView):
    """Admin view to list all bookings with advanced filtering."""
    queryset = Booking.objects.all()
    serializer_class = BookingListSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'payment_status', 'vehicle__category', 'vehicle__brand']
    search_fields = ['user__username', 'user__email', 'vehicle__name', 'vehicle__model']
    ordering_fields = ['created_at', 'start_date', 'total_amount']
    ordering = ['-created_at']


class AdminBookingDetailView(generics.RetrieveUpdateAPIView):
    """Admin view to retrieve and update booking details."""
    queryset = Booking.objects.all()
    serializer_class = BookingUpdateSerializer
    permission_classes = [IsAdminUser]
    
    def perform_update(self, serializer):
        booking = self.get_object()
        old_status = booking.status
        
        # Update booking
        serializer.save()
        
        # Create status history if status changed
        if old_status != booking.status:
            BookingStatusHistory.objects.create(
                booking=booking,
                old_status=old_status,
                new_status=booking.status,
                changed_by=self.request.user,
                reason=f'Status changed by admin: {serializer.validated_data.get("notes", "")}'
            )


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_booking_analytics(request):
    """Get comprehensive booking analytics for admin."""
    from datetime import datetime, timedelta
    from django.db.models import Count, Sum, Avg
    
    # Date range filters
    days = int(request.GET.get('days', 30))
    start_date = datetime.now() - timedelta(days=days)
    
    # Basic statistics
    total_bookings = Booking.objects.count()
    recent_bookings = Booking.objects.filter(created_at__gte=start_date).count()
    
    # Status distribution
    status_stats = Booking.objects.values('status').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Payment status distribution
    payment_stats = Booking.objects.values('payment_status').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # Revenue analytics
    total_revenue = Booking.objects.filter(payment_status='paid').aggregate(
        total=Sum('total_amount')
    )['total'] or 0
    
    recent_revenue = Booking.objects.filter(
        payment_status='paid',
        created_at__gte=start_date
    ).aggregate(total=Sum('total_amount'))['total'] or 0
    
    # Average booking value
    avg_booking_value = Booking.objects.filter(
        payment_status='paid'
    ).aggregate(avg=Avg('total_amount'))['avg'] or 0
    
    # Daily booking trends (last 30 days)
    daily_trends = []
    for i in range(days):
        date = datetime.now() - timedelta(days=i)
        count = Booking.objects.filter(
            created_at__date=date.date()
        ).count()
        daily_trends.append({
            'date': date.date().isoformat(),
            'count': count
        })
    
    # Top customers by bookings
    top_customers = Booking.objects.values(
        'user__username', 'user__email'
    ).annotate(
        booking_count=Count('id'),
        total_spent=Sum('total_amount')
    ).order_by('-booking_count')[:10]
    
    # Vehicle performance
    vehicle_performance = Booking.objects.values(
        'vehicle__name', 'vehicle__brand__name'
    ).annotate(
        booking_count=Count('id'),
        total_revenue=Sum('total_amount')
    ).order_by('-booking_count')[:10]
    
    return Response({
        'overview': {
            'total_bookings': total_bookings,
            'recent_bookings': recent_bookings,
            'total_revenue': float(total_revenue),
            'recent_revenue': float(recent_revenue),
            'avg_booking_value': float(avg_booking_value),
        },
        'status_distribution': list(status_stats),
        'payment_distribution': list(payment_stats),
        'daily_trends': daily_trends,
        'top_customers': list(top_customers),
        'vehicle_performance': list(vehicle_performance),
    })


@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_bulk_booking_operations(request):
    """Perform bulk operations on bookings."""
    operation = request.data.get('operation')
    booking_ids = request.data.get('booking_ids', [])
    reason = request.data.get('reason', '')
    
    if not operation or not booking_ids:
        return Response(
            {'error': 'Operation and booking_ids are required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    bookings = Booking.objects.filter(id__in=booking_ids)
    updated_count = 0
    
    for booking in bookings:
        old_status = booking.status
        
        if operation == 'confirm':
            if booking.status == 'pending':
                booking.status = 'confirmed'
                booking.confirmed_at = timezone.now()
                updated_count += 1
        elif operation == 'cancel':
            if booking.status in ['pending', 'confirmed']:
                booking.status = 'cancelled'
                booking.cancelled_at = timezone.now()
                updated_count += 1
        elif operation == 'complete':
            if booking.status == 'active':
                booking.status = 'completed'
                updated_count += 1
        
        if old_status != booking.status:
            booking.save()
            BookingStatusHistory.objects.create(
                booking=booking,
                old_status=old_status,
                new_status=booking.status,
                changed_by=request.user,
                reason=f'Bulk operation by admin: {reason}'
            )
    
    return Response({
        'message': f'{updated_count} bookings updated successfully',
        'updated_count': updated_count
    })
