from django.urls import path
from . import views

urlpatterns = [
    # Public endpoints
    path('', views.VehicleListView.as_view(), name='vehicle-list'),
    path('search/', views.vehicle_search, name='vehicle-search'),
    path('<int:pk>/', views.VehicleDetailView.as_view(), name='vehicle-detail'),
    path('<int:vehicle_id>/availability/', views.vehicle_availability, name='vehicle-availability'),
    path('categories/', views.VehicleCategoryListView.as_view(), name='vehicle-categories'),
    path('brands/', views.VehicleBrandListView.as_view(), name='vehicle-brands'),
    
    # Admin endpoints
    path('admin/', views.AdminVehicleListView.as_view(), name='admin-vehicle-list'),
    path('admin/<int:pk>/', views.AdminVehicleDetailView.as_view(), name='admin-vehicle-detail'),
    path('admin/categories/', views.AdminVehicleCategoryListView.as_view(), name='admin-vehicle-categories'),
    path('admin/categories/<int:pk>/', views.AdminVehicleCategoryDetailView.as_view(), name='admin-vehicle-category-detail'),
    path('admin/brands/', views.AdminVehicleBrandListView.as_view(), name='admin-vehicle-brands'),
    path('admin/brands/<int:pk>/', views.AdminVehicleBrandDetailView.as_view(), name='admin-vehicle-brand-detail'),
    path('admin/analytics/', views.vehicle_analytics, name='admin-vehicle-analytics'),
    path('admin/bulk-operations/', views.bulk_vehicle_operations, name='admin-bulk-vehicle-operations'),
]
