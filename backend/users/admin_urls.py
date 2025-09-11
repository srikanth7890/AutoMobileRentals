from django.urls import path
from . import admin_views

urlpatterns = [
    # Customer management
    path('admin/customers/', admin_views.AdminCustomerListView.as_view(), name='admin-customer-list'),
    path('admin/customers/create/', admin_views.AdminCustomerCreateView.as_view(), name='admin-customer-create'),
    path('admin/customers/<int:pk>/', admin_views.AdminCustomerDetailView.as_view(), name='admin-customer-detail'),
    path('admin/customers/analytics/', admin_views.customer_analytics, name='admin-customer-analytics'),
    path('admin/customers/<int:customer_id>/analytics/', admin_views.customer_detail_analytics, name='admin-customer-detail-analytics'),
    path('admin/customers/bulk-operations/', admin_views.admin_bulk_customer_operations, name='admin-bulk-customer-operations'),
    path('admin/customers/export/', admin_views.customer_export, name='admin-customer-export'),
]
