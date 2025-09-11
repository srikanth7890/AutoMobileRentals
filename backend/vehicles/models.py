from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class VehicleCategory(models.Model):
    """Vehicle categories like Car, Bike, SUV, etc."""
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)  # For frontend icons
    
    def __str__(self):
        return self.name


class VehicleBrand(models.Model):
    """Vehicle brands like Toyota, Honda, BMW, etc."""
    name = models.CharField(max_length=50, unique=True)
    logo = models.ImageField(upload_to='brand_logos/', blank=True, null=True)
    
    def __str__(self):
        return self.name


class Vehicle(models.Model):
    """Main vehicle model."""
    
    FUEL_TYPE_CHOICES = [
        ('petrol', 'Petrol'),
        ('diesel', 'Diesel'),
        ('electric', 'Electric'),
        ('hybrid', 'Hybrid'),
        ('cng', 'CNG'),
    ]
    
    TRANSMISSION_CHOICES = [
        ('manual', 'Manual'),
        ('automatic', 'Automatic'),
    ]
    
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('rented', 'Rented'),
        ('maintenance', 'Under Maintenance'),
        ('unavailable', 'Unavailable'),
    ]
    
    # Basic Information
    name = models.CharField(max_length=100)
    brand = models.ForeignKey(VehicleBrand, on_delete=models.CASCADE, related_name='vehicles')
    category = models.ForeignKey(VehicleCategory, on_delete=models.CASCADE, related_name='vehicles')
    model_year = models.PositiveIntegerField(validators=[MinValueValidator(1900), MaxValueValidator(2024)])
    
    # Specifications
    fuel_type = models.CharField(max_length=20, choices=FUEL_TYPE_CHOICES)
    transmission = models.CharField(max_length=20, choices=TRANSMISSION_CHOICES)
    engine_capacity = models.CharField(max_length=20, blank=True)  # e.g., "1.5L", "150cc"
    seating_capacity = models.PositiveIntegerField(
        default=4,
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        help_text="Seating capacity must be between 1 and 10"
    )
    mileage = models.CharField(max_length=20, blank=True)  # e.g., "15 kmpl"
    
    # Rental Information
    daily_rate = models.DecimalField(max_digits=10, decimal_places=2)
    weekly_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    monthly_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Location and Status
    location = models.CharField(max_length=200)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    
    # Additional Information
    description = models.TextField(blank=True)
    features = models.JSONField(default=list, blank=True)  # e.g., ["AC", "GPS", "Bluetooth"]
    insurance_valid_until = models.DateField(null=True, blank=True)
    registration_number = models.CharField(max_length=20, unique=True)
    
    # Images
    main_image = models.ImageField(upload_to='vehicles/', blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.brand.name} {self.name} ({self.registration_number})"
    
    @property
    def is_available(self):
        return self.status == 'available'


class VehicleImage(models.Model):
    """Additional images for vehicles."""
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='vehicles/gallery/')
    caption = models.CharField(max_length=100, blank=True)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.vehicle.name} - {self.caption or 'Image'}"
