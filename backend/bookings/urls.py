from django.urls import path
from . import views, financial_views, reporting_views

urlpatterns = [
    # Customer endpoints
    path('', views.BookingCreateView.as_view(), name='booking-create'),
    path('my-bookings/', views.UserBookingListView.as_view(), name='user-bookings'),
    path('<int:pk>/', views.BookingDetailView.as_view(), name='booking-detail'),
    path('<int:booking_id>/cancel/', views.cancel_booking, name='booking-cancel'),
    path('<int:booking_id>/summary/', views.booking_summary, name='booking-summary'),
    path('<int:booking_id>/payment/', views.create_payment, name='create-payment'),
    path('statistics/', views.booking_statistics, name='booking-statistics'),
    
    # Admin booking management
    path('admin/all/', views.AdminBookingListView.as_view(), name='admin-bookings'),
    path('admin/<int:pk>/', views.AdminBookingDetailView.as_view(), name='admin-booking-detail'),
    path('admin/analytics/', views.admin_booking_analytics, name='admin-booking-analytics'),
    path('admin/bulk-operations/', views.admin_bulk_booking_operations, name='admin-bulk-booking-operations'),
    
    # Financial reporting
    path('admin/financial/overview/', financial_views.financial_overview, name='financial-overview'),
    path('admin/financial/revenue-analytics/', financial_views.revenue_analytics, name='revenue-analytics'),
    path('admin/financial/profit-loss/', financial_views.profit_loss_statement, name='profit-loss-statement'),
    path('admin/financial/export/', financial_views.financial_export, name='financial-export'),
    
    # Comprehensive reporting
    path('admin/reports/business-intelligence/', reporting_views.business_intelligence_dashboard, name='business-intelligence'),
    path('admin/reports/operational-metrics/', reporting_views.operational_metrics, name='operational-metrics'),
    path('admin/reports/predictive-analytics/', reporting_views.predictive_analytics, name='predictive-analytics'),
    path('admin/reports/custom-builder/', reporting_views.custom_report_builder, name='custom-report-builder'),
]
