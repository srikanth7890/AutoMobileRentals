from django.db import models
from django.core.validators import MinValueValidator
from django.utils import timezone
from decimal import Decimal
from users.models import User
from vehicles.models import Vehicle


class Booking(models.Model):
    """Vehicle booking model."""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    # Basic Information
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='bookings')
    
    # Booking Dates
    start_date = models.DateField()
    end_date = models.DateField()
    pickup_time = models.TimeField(null=True, blank=True)
    return_time = models.TimeField(null=True, blank=True)
    
    # Pricing
    daily_rate = models.DecimalField(max_digits=10, decimal_places=2)
    total_days = models.PositiveIntegerField()
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    
    # Additional Information
    pickup_location = models.CharField(max_length=200, blank=True)
    return_location = models.CharField(max_length=200, blank=True)
    special_requests = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.vehicle.name} ({self.start_date} to {self.end_date})"
    
    def save(self, *args, **kwargs):
        # Calculate total days and amount
        if self.start_date and self.end_date and self.daily_rate:
            self.total_days = (self.end_date - self.start_date).days + 1
            self.subtotal = self.daily_rate * self.total_days
            # Add 10% tax (can be made configurable)
            self.tax_amount = self.subtotal * Decimal('0.10')
            self.total_amount = self.subtotal + self.tax_amount
        
        super().save(*args, **kwargs)
    
    @property
    def is_active(self):
        today = timezone.now().date()
        return (self.status == 'active' and 
                self.start_date <= today <= self.end_date)
    
    @property
    def is_upcoming(self):
        today = timezone.now().date()
        return (self.status == 'confirmed' and 
                self.start_date > today)
    
    @property
    def is_past(self):
        today = timezone.now().date()
        return (self.status == 'completed' or 
                (self.status in ['confirmed', 'active'] and self.end_date < today))


class BookingStatusHistory(models.Model):
    """Track booking status changes."""
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='status_history')
    old_status = models.CharField(max_length=20, blank=True)
    new_status = models.CharField(max_length=20)
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.booking} - {self.old_status} to {self.new_status}"


class Payment(models.Model):
    """Payment information for bookings."""
    
    PAYMENT_METHOD_CHOICES = [
        ('credit_card', 'Credit Card'),
        ('debit_card', 'Debit Card'),
        ('net_banking', 'Net Banking'),
        ('upi', 'UPI'),
        ('wallet', 'Wallet'),
        ('cash', 'Cash'),
    ]
    
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='payment')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    transaction_id = models.CharField(max_length=100, blank=True)
    payment_gateway = models.CharField(max_length=50, blank=True)
    payment_status = models.CharField(max_length=20, choices=Booking.PAYMENT_STATUS_CHOICES, default='pending')
    payment_date = models.DateTimeField(null=True, blank=True)
    failure_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Payment for {self.booking} - {self.amount}"
