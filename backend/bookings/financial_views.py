from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.db.models import Q, Count, Sum, Avg
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Booking, Payment
from vehicles.models import Vehicle, VehicleCategory, VehicleBrand


# ==================== FINANCIAL REPORTING & ANALYTICS ====================

@api_view(['GET'])
@permission_classes([IsAdminUser])
def financial_overview(request):
    """Get comprehensive financial overview for admin dashboard."""
    # Date range filters
    days = int(request.GET.get('days', 30))
    start_date = datetime.now() - timedelta(days=days)
    
    # Revenue analytics
    total_revenue = Booking.objects.filter(payment_status='paid').aggregate(
        total=Sum('total_amount')
    )['total'] or 0
    
    period_revenue = Booking.objects.filter(
        payment_status='paid',
        created_at__gte=start_date
    ).aggregate(total=Sum('total_amount'))['total'] or 0
    
    # Tax revenue
    total_tax = Booking.objects.filter(payment_status='paid').aggregate(
        total=Sum('tax_amount')
    )['total'] or 0
    
    period_tax = Booking.objects.filter(
        payment_status='paid',
        created_at__gte=start_date
    ).aggregate(total=Sum('tax_amount'))['total'] or 0
    
    # Average metrics
    avg_booking_value = Booking.objects.filter(
        payment_status='paid'
    ).aggregate(avg=Avg('total_amount'))['avg'] or 0
    
    avg_daily_revenue = period_revenue / days if days > 0 else 0
    
    # Payment status breakdown
    payment_breakdown = Booking.objects.values('payment_status').annotate(
        count=Count('id'),
        total_amount=Sum('total_amount')
    ).order_by('-total_amount')
    
    # Revenue by vehicle category
    revenue_by_category = VehicleCategory.objects.annotate(
        total_revenue=Sum('vehicles__bookings__total_amount'),
        booking_count=Count('vehicles__bookings')
    ).filter(total_revenue__isnull=False).order_by('-total_revenue')
    
    # Revenue by vehicle brand
    revenue_by_brand = VehicleBrand.objects.annotate(
        total_revenue=Sum('vehicles__bookings__total_amount'),
        booking_count=Count('vehicles__bookings')
    ).filter(total_revenue__isnull=False).order_by('-total_revenue')
    
    # Monthly revenue trends
    monthly_trends = []
    for i in range(12):  # Last 12 months
        month_start = datetime.now().replace(day=1) - timedelta(days=30*i)
        month_end = month_start + timedelta(days=30)
        
        month_revenue = Booking.objects.filter(
            payment_status='paid',
            created_at__gte=month_start,
            created_at__lt=month_end
        ).aggregate(total=Sum('total_amount'))['total'] or 0
        
        monthly_trends.append({
            'month': month_start.strftime('%Y-%m'),
            'revenue': float(month_revenue)
        })
    
    monthly_trends.reverse()
    
    return Response({
        'overview': {
            'total_revenue': float(total_revenue),
            'period_revenue': float(period_revenue),
            'total_tax': float(total_tax),
            'period_tax': float(period_tax),
            'avg_booking_value': float(avg_booking_value),
            'avg_daily_revenue': float(avg_daily_revenue),
        },
        'payment_breakdown': list(payment_breakdown),
        'revenue_by_category': [
            {
                'category': cat.name,
                'total_revenue': float(cat.total_revenue or 0),
                'booking_count': cat.booking_count
            }
            for cat in revenue_by_category
        ],
        'revenue_by_brand': [
            {
                'brand': brand.name,
                'total_revenue': float(brand.total_revenue or 0),
                'booking_count': brand.booking_count
            }
            for brand in revenue_by_brand
        ],
        'monthly_trends': monthly_trends
    })


@api_view(['GET'])
@permission_classes([IsAdminUser])
def revenue_analytics(request):
    """Get detailed revenue analytics with various breakdowns."""
    # Date range filters
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    group_by = request.GET.get('group_by', 'day')  # day, week, month
    
    # Build base queryset
    bookings = Booking.objects.filter(payment_status='paid')
    
    if start_date:
        bookings = bookings.filter(created_at__date__gte=start_date)
    if end_date:
        bookings = bookings.filter(created_at__date__lte=end_date)
    
    # Revenue trends based on group_by
    trends = []
    
    if group_by == 'day':
        # Daily trends for last 30 days
        for i in range(30):
            date = datetime.now() - timedelta(days=i)
            daily_revenue = bookings.filter(
                created_at__date=date.date()
            ).aggregate(total=Sum('total_amount'))['total'] or 0
            
            trends.append({
                'date': date.date().isoformat(),
                'revenue': float(daily_revenue)
            })
        trends.reverse()
    
    elif group_by == 'week':
        # Weekly trends for last 12 weeks
        for i in range(12):
            week_start = datetime.now() - timedelta(weeks=i+1)
            week_end = week_start + timedelta(weeks=1)
            
            weekly_revenue = bookings.filter(
                created_at__gte=week_start,
                created_at__lt=week_end
            ).aggregate(total=Sum('total_amount'))['total'] or 0
            
            trends.append({
                'week': week_start.strftime('%Y-W%U'),
                'revenue': float(weekly_revenue)
            })
        trends.reverse()
    
    elif group_by == 'month':
        # Monthly trends for last 12 months
        for i in range(12):
            month_start = datetime.now().replace(day=1) - timedelta(days=30*i)
            month_end = month_start + timedelta(days=30)
            
            monthly_revenue = bookings.filter(
                created_at__gte=month_start,
                created_at__lt=month_end
            ).aggregate(total=Sum('total_amount'))['total'] or 0
            
            trends.append({
                'month': month_start.strftime('%Y-%m'),
                'revenue': float(monthly_revenue)
            })
        trends.reverse()
    
    # Top performing vehicles
    top_vehicles = Vehicle.objects.annotate(
        total_revenue=Sum('bookings__total_amount'),
        booking_count=Count('bookings')
    ).filter(
        total_revenue__isnull=False,
        bookings__payment_status='paid'
    ).order_by('-total_revenue')[:10]
    
    # Revenue by time of day
    hourly_revenue = []
    for hour in range(24):
        hour_revenue = bookings.filter(
            created_at__hour=hour
        ).aggregate(total=Sum('total_amount'))['total'] or 0
        
        hourly_revenue.append({
            'hour': hour,
            'revenue': float(hour_revenue)
        })
    
    # Revenue by day of week
    daily_revenue = []
    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    for i, day in enumerate(days):
        day_revenue = bookings.filter(
            created_at__week_day=i+2  # Django week_day: Sunday=1, Monday=2, etc.
        ).aggregate(total=Sum('total_amount'))['total'] or 0
        
        daily_revenue.append({
            'day': day,
            'revenue': float(day_revenue)
        })
    
    return Response({
        'trends': trends,
        'top_vehicles': [
            {
                'id': vehicle.id,
                'name': vehicle.name,
                'brand': vehicle.brand.name,
                'total_revenue': float(vehicle.total_revenue or 0),
                'booking_count': vehicle.booking_count
            }
            for vehicle in top_vehicles
        ],
        'hourly_revenue': hourly_revenue,
        'daily_revenue': daily_revenue
    })


@api_view(['GET'])
@permission_classes([IsAdminUser])
def profit_loss_statement(request):
    """Generate profit and loss statement."""
    # Date range filters
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    
    # Build base queryset
    bookings = Booking.objects.filter(payment_status='paid')
    
    if start_date:
        bookings = bookings.filter(created_at__date__gte=start_date)
    if end_date:
        bookings = bookings.filter(created_at__date__lte=end_date)
    
    # Revenue calculations
    total_revenue = bookings.aggregate(total=Sum('total_amount'))['total'] or 0
    total_tax = bookings.aggregate(total=Sum('tax_amount'))['total'] or 0
    net_revenue = total_revenue - total_tax
    
    # Cost calculations (these would need to be implemented based on business model)
    # For now, we'll use estimated costs
    estimated_vehicle_costs = net_revenue * 0.3  # 30% of revenue for vehicle costs
    estimated_operational_costs = net_revenue * 0.2  # 20% for operational costs
    estimated_marketing_costs = net_revenue * 0.1  # 10% for marketing
    
    total_costs = estimated_vehicle_costs + estimated_operational_costs + estimated_marketing_costs
    gross_profit = net_revenue - total_costs
    
    # Booking statistics
    total_bookings = bookings.count()
    avg_booking_value = bookings.aggregate(avg=Avg('total_amount'))['avg'] or 0
    
    return Response({
        'revenue': {
            'total_revenue': float(total_revenue),
            'tax_collected': float(total_tax),
            'net_revenue': float(net_revenue)
        },
        'costs': {
            'vehicle_costs': float(estimated_vehicle_costs),
            'operational_costs': float(estimated_operational_costs),
            'marketing_costs': float(estimated_marketing_costs),
            'total_costs': float(total_costs)
        },
        'profit': {
            'gross_profit': float(gross_profit),
            'profit_margin': float((gross_profit / net_revenue * 100) if net_revenue > 0 else 0)
        },
        'metrics': {
            'total_bookings': total_bookings,
            'avg_booking_value': float(avg_booking_value)
        }
    })


@api_view(['GET'])
@permission_classes([IsAdminUser])
def financial_export(request):
    """Export financial data to CSV format."""
    import csv
    from django.http import HttpResponse
    
    # Get filter parameters
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    export_type = request.GET.get('type', 'bookings')  # bookings, payments, summary
    
    if export_type == 'bookings':
        # Export booking financial data
        bookings = Booking.objects.select_related('user', 'vehicle', 'vehicle__brand')
        
        if start_date:
            bookings = bookings.filter(created_at__date__gte=start_date)
        if end_date:
            bookings = bookings.filter(created_at__date__lte=end_date)
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="financial_bookings_export.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'Booking ID', 'Customer', 'Vehicle', 'Brand', 'Start Date', 'End Date',
            'Daily Rate', 'Total Days', 'Subtotal', 'Tax Amount', 'Total Amount',
            'Payment Status', 'Created At'
        ])
        
        for booking in bookings:
            writer.writerow([
                booking.id,
                booking.user.username,
                booking.vehicle.name,
                booking.vehicle.brand.name,
                booking.start_date,
                booking.end_date,
                booking.daily_rate,
                booking.total_days,
                booking.subtotal,
                booking.tax_amount,
                booking.total_amount,
                booking.payment_status,
                booking.created_at
            ])
    
    elif export_type == 'summary':
        # Export financial summary
        bookings = Booking.objects.filter(payment_status='paid')
        
        if start_date:
            bookings = bookings.filter(created_at__date__gte=start_date)
        if end_date:
            bookings = bookings.filter(created_at__date__lte=end_date)
        
        total_revenue = bookings.aggregate(total=Sum('total_amount'))['total'] or 0
        total_tax = bookings.aggregate(total=Sum('tax_amount'))['total'] or 0
        total_bookings = bookings.count()
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="financial_summary_export.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Metric', 'Value'])
        writer.writerow(['Total Revenue', total_revenue])
        writer.writerow(['Total Tax', total_tax])
        writer.writerow(['Net Revenue', total_revenue - total_tax])
        writer.writerow(['Total Bookings', total_bookings])
        writer.writerow(['Average Booking Value', total_revenue / total_bookings if total_bookings > 0 else 0])
    
    return response
