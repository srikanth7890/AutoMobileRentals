from django.contrib import admin
from .models import Booking, BookingStatusHistory, Payment


class BookingStatusHistoryInline(admin.TabularInline):
    model = BookingStatusHistory
    extra = 0
    readonly_fields = ['created_at']


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'vehicle', 'start_date', 'end_date', 'total_amount', 'status', 'payment_status', 'created_at']
    list_filter = ['status', 'payment_status', 'start_date', 'created_at']
    search_fields = ['user__email', 'vehicle__name', 'vehicle__registration_number']
    ordering = ['-created_at']
    inlines = [BookingStatusHistoryInline]
    
    fieldsets = (
        ('Booking Information', {
            'fields': ('user', 'vehicle', 'start_date', 'end_date', 'pickup_time', 'return_time')
        }),
        ('Pricing', {
            'fields': ('daily_rate', 'total_days', 'subtotal', 'tax_amount', 'total_amount')
        }),
        ('Status', {
            'fields': ('status', 'payment_status')
        }),
        ('Location & Notes', {
            'fields': ('pickup_location', 'return_location', 'special_requests', 'notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'confirmed_at', 'cancelled_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at', 'confirmed_at', 'cancelled_at', 'total_days', 'subtotal', 'tax_amount', 'total_amount']


@admin.register(BookingStatusHistory)
class BookingStatusHistoryAdmin(admin.ModelAdmin):
    list_display = ['booking', 'old_status', 'new_status', 'changed_by', 'created_at']
    list_filter = ['new_status', 'created_at']
    search_fields = ['booking__user__email', 'booking__vehicle__name']
    ordering = ['-created_at']


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['booking', 'amount', 'payment_method', 'payment_status', 'payment_date', 'created_at']
    list_filter = ['payment_method', 'payment_status', 'payment_date', 'created_at']
    search_fields = ['booking__user__email', 'transaction_id']
    ordering = ['-created_at']
