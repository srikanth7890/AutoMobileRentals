from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.db.models import Q, Count, Sum, Avg
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Booking, Payment
from vehicles.models import Vehicle, VehicleCategory, VehicleBrand
from users.models import User


# ==================== COMPREHENSIVE REPORTING SYSTEM ====================

@api_view(['GET'])
@permission_classes([IsAdminUser])
def business_intelligence_dashboard(request):
    """Comprehensive business intelligence dashboard with all key metrics."""
    # Date range filters
    days = int(request.GET.get('days', 30))
    start_date = datetime.now() - timedelta(days=days)
    
    # ========== BOOKING METRICS ==========
    total_bookings = Booking.objects.count()
    period_bookings = Booking.objects.filter(created_at__gte=start_date).count()
    
    booking_status_distribution = Booking.objects.values('status').annotate(
        count=Count('id')
    ).order_by('-count')
    
    # ========== REVENUE METRICS ==========
    total_revenue = Booking.objects.filter(payment_status='paid').aggregate(
        total=Sum('total_amount')
    )['total'] or 0
    
    period_revenue = Booking.objects.filter(
        payment_status='paid',
        created_at__gte=start_date
    ).aggregate(total=Sum('total_amount'))['total'] or 0
    
    # ========== CUSTOMER METRICS ==========
    total_customers = User.objects.filter(role='customer').count()
    active_customers = User.objects.filter(
        role='customer',
        bookings__created_at__gte=start_date
    ).distinct().count()
    
    # ========== VEHICLE METRICS ==========
    total_vehicles = Vehicle.objects.count()
    available_vehicles = Vehicle.objects.filter(status='available').count()
    utilization_rate = ((total_vehicles - available_vehicles) / total_vehicles * 100) if total_vehicles > 0 else 0
    
    # ========== PERFORMANCE METRICS ==========
    avg_booking_value = Booking.objects.filter(
        payment_status='paid'
    ).aggregate(avg=Avg('total_amount'))['avg'] or 0
    
    avg_booking_duration = Booking.objects.aggregate(
        avg=Avg('total_days')
    )['avg'] or 0
    
    # ========== TRENDS ==========
    # Daily booking trends
    daily_trends = []
    for i in range(days):
        date = datetime.now() - timedelta(days=i)
        count = Booking.objects.filter(created_at__date=date.date()).count()
        revenue = Booking.objects.filter(
            created_at__date=date.date(),
            payment_status='paid'
        ).aggregate(total=Sum('total_amount'))['total'] or 0
        
        daily_trends.append({
            'date': date.date().isoformat(),
            'bookings': count,
            'revenue': float(revenue)
        })
    daily_trends.reverse()
    
    # ========== TOP PERFORMERS ==========
    # Top vehicles by bookings
    top_vehicles_by_bookings = Vehicle.objects.annotate(
        booking_count=Count('bookings')
    ).order_by('-booking_count')[:5]
    
    # Top vehicles by revenue
    top_vehicles_by_revenue = Vehicle.objects.annotate(
        total_revenue=Sum('bookings__total_amount')
    ).filter(total_revenue__isnull=False).order_by('-total_revenue')[:5]
    
    # Top customers
    top_customers = User.objects.filter(role='customer').annotate(
        booking_count=Count('bookings'),
        total_spent=Sum('bookings__total_amount')
    ).filter(booking_count__gt=0).order_by('-total_spent')[:5]
    
    # ========== CATEGORY ANALYSIS ==========
    category_performance = VehicleCategory.objects.annotate(
        vehicle_count=Count('vehicles'),
        booking_count=Count('vehicles__bookings'),
        total_revenue=Sum('vehicles__bookings__total_amount')
    ).filter(booking_count__gt=0).order_by('-total_revenue')
    
    # ========== BRAND ANALYSIS ==========
    brand_performance = VehicleBrand.objects.annotate(
        vehicle_count=Count('vehicles'),
        booking_count=Count('vehicles__bookings'),
        total_revenue=Sum('vehicles__bookings__total_amount')
    ).filter(booking_count__gt=0).order_by('-total_revenue')
    
    return Response({
        'overview': {
            'total_bookings': total_bookings,
            'period_bookings': period_bookings,
            'total_revenue': float(total_revenue),
            'period_revenue': float(period_revenue),
            'total_customers': total_customers,
            'active_customers': active_customers,
            'total_vehicles': total_vehicles,
            'available_vehicles': available_vehicles,
            'utilization_rate': float(utilization_rate),
            'avg_booking_value': float(avg_booking_value),
            'avg_booking_duration': float(avg_booking_duration)
        },
        'booking_status_distribution': list(booking_status_distribution),
        'daily_trends': daily_trends,
        'top_vehicles_by_bookings': [
            {
                'id': vehicle.id,
                'name': vehicle.name,
                'brand': vehicle.brand.name,
                'booking_count': vehicle.booking_count
            }
            for vehicle in top_vehicles_by_bookings
        ],
        'top_vehicles_by_revenue': [
            {
                'id': vehicle.id,
                'name': vehicle.name,
                'brand': vehicle.brand.name,
                'total_revenue': float(vehicle.total_revenue or 0)
            }
            for vehicle in top_vehicles_by_revenue
        ],
        'top_customers': [
            {
                'id': customer.id,
                'username': customer.username,
                'email': customer.email,
                'booking_count': customer.booking_count,
                'total_spent': float(customer.total_spent or 0)
            }
            for customer in top_customers
        ],
        'category_performance': [
            {
                'category': cat.name,
                'vehicle_count': cat.vehicle_count,
                'booking_count': cat.booking_count,
                'total_revenue': float(cat.total_revenue or 0)
            }
            for cat in category_performance
        ],
        'brand_performance': [
            {
                'brand': brand.name,
                'vehicle_count': brand.vehicle_count,
                'booking_count': brand.booking_count,
                'total_revenue': float(brand.total_revenue or 0)
            }
            for brand in brand_performance
        ]
    })


@api_view(['GET'])
@permission_classes([IsAdminUser])
def operational_metrics(request):
    """Get operational metrics and KPIs."""
    # Date range filters
    days = int(request.GET.get('days', 30))
    start_date = datetime.now() - timedelta(days=days)
    
    # ========== BOOKING EFFICIENCY ==========
    total_bookings = Booking.objects.count()
    confirmed_bookings = Booking.objects.filter(status='confirmed').count()
    completed_bookings = Booking.objects.filter(status='completed').count()
    cancelled_bookings = Booking.objects.filter(status='cancelled').count()
    
    confirmation_rate = (confirmed_bookings / total_bookings * 100) if total_bookings > 0 else 0
    completion_rate = (completed_bookings / total_bookings * 100) if total_bookings > 0 else 0
    cancellation_rate = (cancelled_bookings / total_bookings * 100) if total_bookings > 0 else 0
    
    # ========== PAYMENT METRICS ==========
    paid_bookings = Booking.objects.filter(payment_status='paid').count()
    pending_payments = Booking.objects.filter(payment_status='pending').count()
    failed_payments = Booking.objects.filter(payment_status='failed').count()
    
    payment_success_rate = (paid_bookings / total_bookings * 100) if total_bookings > 0 else 0
    
    # ========== VEHICLE UTILIZATION ==========
    total_vehicles = Vehicle.objects.count()
    available_vehicles = Vehicle.objects.filter(status='available').count()
    rented_vehicles = total_vehicles - available_vehicles
    
    vehicle_utilization = (rented_vehicles / total_vehicles * 100) if total_vehicles > 0 else 0
    
    # ========== CUSTOMER SATISFACTION METRICS ==========
    # Repeat customer rate
    repeat_customers = User.objects.filter(
        role='customer'
    ).annotate(
        booking_count=Count('bookings')
    ).filter(booking_count__gt=1).count()
    
    total_customers = User.objects.filter(role='customer').count()
    repeat_customer_rate = (repeat_customers / total_customers * 100) if total_customers > 0 else 0
    
    # ========== REVENUE EFFICIENCY ==========
    total_revenue = Booking.objects.filter(payment_status='paid').aggregate(
        total=Sum('total_amount')
    )['total'] or 0
    
    revenue_per_vehicle = total_revenue / total_vehicles if total_vehicles > 0 else 0
    revenue_per_booking = total_revenue / total_bookings if total_bookings > 0 else 0
    
    # ========== TIME-BASED METRICS ==========
    # Average booking lead time (time from booking to start date)
    bookings_with_lead_time = Booking.objects.filter(
        start_date__isnull=False
    ).extra(
        select={'lead_days': 'julianday(start_date) - julianday(created_at)'}
    ).values_list('lead_days', flat=True)
    
    avg_lead_time = sum(bookings_with_lead_time) / len(bookings_with_lead_time) if bookings_with_lead_time else 0
    
    # ========== SEASONAL ANALYSIS ==========
    monthly_booking_trends = []
    for i in range(12):
        month_start = datetime.now().replace(day=1) - timedelta(days=30*i)
        month_end = month_start + timedelta(days=30)
        
        month_bookings = Booking.objects.filter(
            created_at__gte=month_start,
            created_at__lt=month_end
        ).count()
        
        month_revenue = Booking.objects.filter(
            created_at__gte=month_start,
            created_at__lt=month_end,
            payment_status='paid'
        ).aggregate(total=Sum('total_amount'))['total'] or 0
        
        monthly_booking_trends.append({
            'month': month_start.strftime('%Y-%m'),
            'bookings': month_bookings,
            'revenue': float(month_revenue)
        })
    
    monthly_booking_trends.reverse()
    
    return Response({
        'booking_efficiency': {
            'total_bookings': total_bookings,
            'confirmation_rate': float(confirmation_rate),
            'completion_rate': float(completion_rate),
            'cancellation_rate': float(cancellation_rate)
        },
        'payment_metrics': {
            'payment_success_rate': float(payment_success_rate),
            'paid_bookings': paid_bookings,
            'pending_payments': pending_payments,
            'failed_payments': failed_payments
        },
        'vehicle_utilization': {
            'total_vehicles': total_vehicles,
            'available_vehicles': available_vehicles,
            'rented_vehicles': rented_vehicles,
            'utilization_rate': float(vehicle_utilization)
        },
        'customer_metrics': {
            'total_customers': total_customers,
            'repeat_customers': repeat_customers,
            'repeat_customer_rate': float(repeat_customer_rate)
        },
        'revenue_efficiency': {
            'total_revenue': float(total_revenue),
            'revenue_per_vehicle': float(revenue_per_vehicle),
            'revenue_per_booking': float(revenue_per_booking)
        },
        'time_metrics': {
            'avg_lead_time_days': float(avg_lead_time)
        },
        'monthly_trends': monthly_booking_trends
    })


@api_view(['GET'])
@permission_classes([IsAdminUser])
def predictive_analytics(request):
    """Get predictive analytics and forecasting."""
    # ========== BOOKING FORECASTING ==========
    # Analyze booking patterns for next 30 days
    historical_bookings = Booking.objects.filter(
        created_at__gte=datetime.now() - timedelta(days=90)
    )
    
    # Daily booking averages
    daily_booking_data = historical_bookings.extra(
        select={'day': 'date(created_at)'}
    ).values('day').annotate(
        count=Count('id')
    ).values_list('count', flat=True)
    
    daily_avg = sum(daily_booking_data) / len(daily_booking_data) if daily_booking_data else 0
    
    # Weekly patterns
    weekly_patterns = []
    for i in range(7):
        day_bookings = historical_bookings.extra(
            where=['extract(dow from created_at) = %s'],
            params=[i]
        ).count()
        weekly_patterns.append({
            'day_of_week': i,
            'avg_bookings': day_bookings / 13  # 13 weeks of data
        })
    
    # ========== REVENUE FORECASTING ==========
    historical_revenue = Booking.objects.filter(
        payment_status='paid',
        created_at__gte=datetime.now() - timedelta(days=90)
    )
    
    daily_revenue_data = historical_revenue.extra(
        select={'day': 'date(created_at)'}
    ).values('day').annotate(
        revenue=Sum('total_amount')
    ).values_list('revenue', flat=True)
    
    daily_revenue_avg = sum(daily_revenue_data) / len(daily_revenue_data) if daily_revenue_data else 0
    
    # ========== VEHICLE DEMAND FORECASTING ==========
    # Most popular vehicles
    popular_vehicles = Vehicle.objects.annotate(
        booking_count=Count('bookings')
    ).order_by('-booking_count')[:10]
    
    # Category demand
    category_demand = VehicleCategory.objects.annotate(
        booking_count=Count('vehicles__bookings')
    ).order_by('-booking_count')
    
    # ========== CUSTOMER GROWTH PROJECTION ==========
    # New customer registration trends
    customer_growth = []
    for i in range(12):
        month_start = datetime.now().replace(day=1) - timedelta(days=30*i)
        month_end = month_start + timedelta(days=30)
        
        new_customers = User.objects.filter(
            role='customer',
            created_at__gte=month_start,
            created_at__lt=month_end
        ).count()
        
        customer_growth.append({
            'month': month_start.strftime('%Y-%m'),
            'new_customers': new_customers
        })
    
    customer_growth.reverse()
    
    # ========== SEASONAL TRENDS ==========
    seasonal_analysis = []
    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    for i, month in enumerate(months):
        month_bookings = Booking.objects.filter(
            created_at__month=i+1
        ).count()
        
        seasonal_analysis.append({
            'month': month,
            'booking_count': month_bookings
        })
    
    return Response({
        'booking_forecast': {
            'daily_avg_bookings': float(daily_avg),
            'weekly_patterns': weekly_patterns,
            'next_30_days_forecast': float(daily_avg * 30)
        },
        'revenue_forecast': {
            'daily_avg_revenue': float(daily_revenue_avg),
            'next_30_days_revenue_forecast': float(daily_revenue_avg * 30)
        },
        'demand_forecast': {
            'popular_vehicles': [
                {
                    'id': vehicle.id,
                    'name': vehicle.name,
                    'brand': vehicle.brand.name,
                    'booking_count': vehicle.booking_count
                }
                for vehicle in popular_vehicles
            ],
            'category_demand': [
                {
                    'category': cat.name,
                    'booking_count': cat.booking_count
                }
                for cat in category_demand
            ]
        },
        'customer_growth': customer_growth,
        'seasonal_analysis': seasonal_analysis
    })


@api_view(['GET'])
@permission_classes([IsAdminUser])
def custom_report_builder(request):
    """Build custom reports based on parameters."""
    # Get report parameters
    report_type = request.GET.get('type', 'summary')
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    group_by = request.GET.get('group_by', 'day')
    filters = request.GET.get('filters', '{}')
    
    # Build base queryset
    bookings = Booking.objects.all()
    
    if start_date:
        bookings = bookings.filter(created_at__date__gte=start_date)
    if end_date:
        bookings = bookings.filter(created_at__date__lte=end_date)
    
    # Apply additional filters
    import json
    try:
        filter_dict = json.loads(filters)
        if 'status' in filter_dict:
            bookings = bookings.filter(status__in=filter_dict['status'])
        if 'payment_status' in filter_dict:
            bookings = bookings.filter(payment_status__in=filter_dict['payment_status'])
        if 'vehicle_category' in filter_dict:
            bookings = bookings.filter(vehicle__category__id__in=filter_dict['vehicle_category'])
    except:
        pass
    
    # Generate report based on type
    if report_type == 'summary':
        report_data = {
            'total_bookings': bookings.count(),
            'total_revenue': float(bookings.filter(payment_status='paid').aggregate(
                total=Sum('total_amount')
            )['total'] or 0),
            'avg_booking_value': float(bookings.filter(payment_status='paid').aggregate(
                avg=Avg('total_amount')
            )['avg'] or 0)
        }
    
    elif report_type == 'detailed':
        report_data = []
        for booking in bookings.select_related('user', 'vehicle', 'vehicle__brand'):
            report_data.append({
                'id': booking.id,
                'customer': booking.user.username,
                'vehicle': booking.vehicle.name,
                'brand': booking.vehicle.brand.name,
                'start_date': booking.start_date,
                'end_date': booking.end_date,
                'total_amount': float(booking.total_amount),
                'status': booking.status,
                'payment_status': booking.payment_status,
                'created_at': booking.created_at
            })
    
    elif report_type == 'trends':
        # Group by specified period
        trends = []
        if group_by == 'day':
            for i in range(30):
                date = datetime.now() - timedelta(days=i)
                count = bookings.filter(created_at__date=date.date()).count()
                revenue = bookings.filter(
                    created_at__date=date.date(),
                    payment_status='paid'
                ).aggregate(total=Sum('total_amount'))['total'] or 0
                
                trends.append({
                    'date': date.date().isoformat(),
                    'bookings': count,
                    'revenue': float(revenue)
                })
            trends.reverse()
        
        report_data = trends
    
    return Response({
        'report_type': report_type,
        'parameters': {
            'start_date': start_date,
            'end_date': end_date,
            'group_by': group_by,
            'filters': filters
        },
        'data': report_data
    })
