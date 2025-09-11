from rest_framework import generics, status, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.db.models import Q, Count, Sum, Avg
from django.contrib.auth import get_user_model
from .models import User
from .serializers import UserProfileSerializer, UserUpdateSerializer, AdminCustomerCreateSerializer
from bookings.models import Booking


# ==================== ADMIN CUSTOMER MANAGEMENT ====================

class AdminCustomerListView(generics.ListAPIView):
    """Admin view to list all customers with filtering and search."""
    queryset = User.objects.filter(role='customer')
    serializer_class = UserProfileSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['username', 'email', 'first_name', 'last_name', 'phone_number']
    ordering_fields = ['created_at', 'username', 'email']
    ordering = ['-created_at']


class AdminCustomerCreateView(generics.CreateAPIView):
    """Admin view to create new customers."""
    queryset = User.objects.filter(role='customer')
    serializer_class = AdminCustomerCreateSerializer
    permission_classes = [IsAdminUser]
    
    def create(self, request, *args, **kwargs):
        # Ensure the user is created as a customer
        data = request.data.copy()
        data['role'] = 'customer'
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserProfileSerializer(user).data, status=status.HTTP_201_CREATED)


class AdminCustomerDetailView(generics.RetrieveUpdateAPIView):
    """Admin view to retrieve and update customer details."""
    queryset = User.objects.filter(role='customer')
    serializer_class = UserUpdateSerializer
    permission_classes = [IsAdminUser]


@api_view(['GET'])
@permission_classes([IsAdminUser])
def customer_analytics(request):
    """Get comprehensive customer analytics for admin."""
    from datetime import datetime, timedelta
    
    # Date range filters
    days = int(request.GET.get('days', 30))
    start_date = datetime.now() - timedelta(days=days)
    
    # Basic customer statistics
    total_customers = User.objects.filter(role='customer').count()
    new_customers = User.objects.filter(
        role='customer',
        created_at__gte=start_date
    ).count()
    
    # Active customers (with bookings in date range)
    active_customers = User.objects.filter(
        role='customer',
        bookings__created_at__gte=start_date
    ).distinct().count()
    
    # Customer registration trends
    registration_trends = []
    for i in range(days):
        date = datetime.now() - timedelta(days=i)
        count = User.objects.filter(
            role='customer',
            created_at__date=date.date()
        ).count()
        registration_trends.append({
            'date': date.date().isoformat(),
            'count': count
        })
    
    # Top customers by bookings
    top_customers_by_bookings = User.objects.filter(
        role='customer'
    ).annotate(
        booking_count=Count('bookings'),
        total_spent=Sum('bookings__total_amount')
    ).filter(booking_count__gt=0).order_by('-booking_count')[:10]
    
    # Top customers by revenue
    top_customers_by_revenue = User.objects.filter(
        role='customer'
    ).annotate(
        total_spent=Sum('bookings__total_amount')
    ).filter(total_spent__isnull=False).order_by('-total_spent')[:10]
    
    # Customer segments
    customer_segments = {
        'new_customers': User.objects.filter(
            role='customer',
            bookings__isnull=True
        ).count(),
        'repeat_customers': User.objects.filter(
            role='customer'
        ).annotate(
            booking_count=Count('bookings')
        ).filter(booking_count__gt=1).count(),
        'vip_customers': User.objects.filter(
            role='customer'
        ).annotate(
            total_spent=Sum('bookings__total_amount')
        ).filter(total_spent__gte=1000).count(),
    }
    
    # Average customer metrics
    avg_bookings_per_customer = User.objects.filter(
        role='customer'
    ).annotate(
        booking_count=Count('bookings')
    ).aggregate(avg=Avg('booking_count'))['avg'] or 0
    
    avg_spent_per_customer = User.objects.filter(
        role='customer'
    ).annotate(
        total_spent=Sum('bookings__total_amount')
    ).filter(total_spent__isnull=False).aggregate(avg=Avg('total_spent'))['avg'] or 0
    
    return Response({
        'overview': {
            'total_customers': total_customers,
            'new_customers': new_customers,
            'active_customers': active_customers,
            'avg_bookings_per_customer': float(avg_bookings_per_customer),
            'avg_spent_per_customer': float(avg_spent_per_customer),
        },
        'registration_trends': registration_trends,
        'customer_segments': customer_segments,
        'top_customers_by_bookings': [
            {
                'id': customer.id,
                'username': customer.username,
                'email': customer.email,
                'booking_count': customer.booking_count,
                'total_spent': float(customer.total_spent or 0)
            }
            for customer in top_customers_by_bookings
        ],
        'top_customers_by_revenue': [
            {
                'id': customer.id,
                'username': customer.username,
                'email': customer.email,
                'total_spent': float(customer.total_spent or 0)
            }
            for customer in top_customers_by_revenue
        ]
    })


@api_view(['GET'])
@permission_classes([IsAdminUser])
def customer_detail_analytics(request, customer_id):
    """Get detailed analytics for a specific customer."""
    try:
        customer = User.objects.get(id=customer_id, role='customer')
    except User.DoesNotExist:
        return Response(
            {'error': 'Customer not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Customer booking statistics
    bookings = Booking.objects.filter(user=customer)
    total_bookings = bookings.count()
    completed_bookings = bookings.filter(status='completed').count()
    active_bookings = bookings.filter(status='active').count()
    cancelled_bookings = bookings.filter(status='cancelled').count()
    
    # Revenue statistics
    total_spent = bookings.filter(payment_status='paid').aggregate(
        total=Sum('total_amount')
    )['total'] or 0
    
    avg_booking_value = bookings.filter(payment_status='paid').aggregate(
        avg=Avg('total_amount')
    )['avg'] or 0
    
    # Recent bookings
    recent_bookings = bookings.order_by('-created_at')[:5]
    
    # Favorite vehicle categories
    favorite_categories = bookings.values(
        'vehicle__category__name'
    ).annotate(
        count=Count('id')
    ).order_by('-count')[:5]
    
    # Booking patterns
    booking_patterns = {
        'most_common_duration': bookings.values('total_days').annotate(
            count=Count('id')
        ).order_by('-count').first(),
        'most_common_pickup_location': bookings.values('pickup_location').annotate(
            count=Count('id')
        ).order_by('-count').first(),
    }
    
    return Response({
        'customer': UserProfileSerializer(customer).data,
        'booking_stats': {
            'total_bookings': total_bookings,
            'completed_bookings': completed_bookings,
            'active_bookings': active_bookings,
            'cancelled_bookings': cancelled_bookings,
            'total_spent': float(total_spent),
            'avg_booking_value': float(avg_booking_value),
        },
        'recent_bookings': [
            {
                'id': booking.id,
                'vehicle': booking.vehicle.name,
                'start_date': booking.start_date,
                'end_date': booking.end_date,
                'status': booking.status,
                'total_amount': float(booking.total_amount)
            }
            for booking in recent_bookings
        ],
        'favorite_categories': list(favorite_categories),
        'booking_patterns': booking_patterns
    })


@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_bulk_customer_operations(request):
    """Perform bulk operations on customers."""
    operation = request.data.get('operation')
    customer_ids = request.data.get('customer_ids', [])
    
    if not operation or not customer_ids:
        return Response(
            {'error': 'Operation and customer_ids are required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    customers = User.objects.filter(id__in=customer_ids, role='customer')
    
    if operation == 'activate':
        customers.update(is_active=True)
        message = f'{customers.count()} customers activated'
    elif operation == 'deactivate':
        customers.update(is_active=False)
        message = f'{customers.count()} customers deactivated'
    elif operation == 'delete':
        count = customers.count()
        customers.delete()
        message = f'{count} customers deleted'
    else:
        return Response(
            {'error': 'Invalid operation'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    return Response({'message': message})


@api_view(['GET'])
@permission_classes([IsAdminUser])
def customer_export(request):
    """Export customer data to CSV format."""
    import csv
    from django.http import HttpResponse
    
    # Get filter parameters
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    has_bookings = request.GET.get('has_bookings')
    
    # Build queryset
    customers = User.objects.filter(role='customer').annotate(
        booking_count=Count('bookings'),
        total_spent=Sum('bookings__total_amount')
    )
    
    if start_date:
        customers = customers.filter(created_at__date__gte=start_date)
    if end_date:
        customers = customers.filter(created_at__date__lte=end_date)
    if has_bookings == 'true':
        customers = customers.filter(booking_count__gt=0)
    elif has_bookings == 'false':
        customers = customers.filter(booking_count=0)
    
    # Create CSV response
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="customers_export.csv"'
    
    writer = csv.writer(response)
    writer.writerow([
        'ID', 'Username', 'Email', 'First Name', 'Last Name', 'Phone Number',
        'Address', 'Date of Birth', 'Driving License', 'Booking Count',
        'Total Spent', 'Created At', 'Is Active'
    ])
    
    for customer in customers:
        writer.writerow([
            customer.id,
            customer.username,
            customer.email,
            customer.first_name,
            customer.last_name,
            customer.phone_number,
            customer.address,
            customer.date_of_birth,
            customer.driving_license,
            customer.booking_count,
            customer.total_spent or 0,
            customer.created_at,
            customer.is_active
        ])
    
    return response
