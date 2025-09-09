from django.contrib import admin
from .models import Vehicle, VehicleCategory, VehicleBrand, VehicleImage


class VehicleImageInline(admin.TabularInline):
    model = VehicleImage
    extra = 1


@admin.register(VehicleCategory)
class VehicleCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'icon']
    search_fields = ['name']


@admin.register(VehicleBrand)
class VehicleBrandAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ['name', 'brand', 'category', 'daily_rate', 'status', 'location', 'created_at']
    list_filter = ['brand', 'category', 'fuel_type', 'transmission', 'status']
    search_fields = ['name', 'brand__name', 'registration_number', 'location']
    ordering = ['-created_at']
    inlines = [VehicleImageInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'brand', 'category', 'model_year', 'registration_number')
        }),
        ('Specifications', {
            'fields': ('fuel_type', 'transmission', 'engine_capacity', 'seating_capacity', 'mileage')
        }),
        ('Rental Information', {
            'fields': ('daily_rate', 'weekly_rate', 'monthly_rate')
        }),
        ('Location & Status', {
            'fields': ('location', 'status')
        }),
        ('Additional Information', {
            'fields': ('description', 'features', 'insurance_valid_until', 'main_image')
        }),
    )


@admin.register(VehicleImage)
class VehicleImageAdmin(admin.ModelAdmin):
    list_display = ['vehicle', 'caption', 'is_primary', 'created_at']
    list_filter = ['is_primary', 'created_at']
    search_fields = ['vehicle__name', 'caption']
