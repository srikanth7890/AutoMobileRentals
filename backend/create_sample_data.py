#!/usr/bin/env python
"""
Script to create sample data for the Vehicle Rental Application
Run this script after setting up the database to populate it with sample data.
"""

import os
import sys
import django
from datetime import date, timedelta

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rental_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from vehicles.models import VehicleCategory, VehicleBrand, Vehicle
from bookings.models import Booking

User = get_user_model()

def create_sample_data():
    print("Creating sample data...")
    
    # Create vehicle categories
    categories = [
        {'name': 'Sedan', 'description': 'Comfortable 4-door cars perfect for city driving', 'icon': 'car'},
        {'name': 'SUV', 'description': 'Spacious vehicles ideal for families and long trips', 'icon': 'truck'},
        {'name': 'Hatchback', 'description': 'Compact and fuel-efficient city cars', 'icon': 'car'},
        {'name': 'Luxury', 'description': 'Premium vehicles with advanced features', 'icon': 'crown'},
        {'name': 'Electric', 'description': 'Environmentally friendly electric vehicles', 'icon': 'battery'},
    ]
    
    created_categories = {}
    for cat_data in categories:
        category, created = VehicleCategory.objects.get_or_create(
            name=cat_data['name'],
            defaults=cat_data
        )
        created_categories[cat_data['name']] = category
        if created:
            print(f"Created category: {category.name}")
    
    # Create vehicle brands
    brands = [
        {'name': 'Toyota'},
        {'name': 'Honda'},
        {'name': 'BMW'},
        {'name': 'Mercedes-Benz'},
        {'name': 'Audi'},
        {'name': 'Ford'},
        {'name': 'Nissan'},
        {'name': 'Hyundai'},
        {'name': 'Tesla'},
        {'name': 'Volkswagen'},
    ]
    
    created_brands = {}
    for brand_data in brands:
        brand, created = VehicleBrand.objects.get_or_create(
            name=brand_data['name'],
            defaults=brand_data
        )
        created_brands[brand_data['name']] = brand
        if created:
            print(f"Created brand: {brand.name}")
    
    # Create sample vehicles
    vehicles_data = [
        {
            'name': 'Camry',
            'brand': 'Toyota',
            'category': 'Sedan',
            'model_year': 2023,
            'fuel_type': 'petrol',
            'transmission': 'automatic',
            'engine_capacity': '2.5L',
            'seating_capacity': 5,
            'mileage': '15 kmpl',
            'daily_rate': 45.00,
            'weekly_rate': 280.00,
            'monthly_rate': 1000.00,
            'location': 'Downtown Office',
            'description': 'Comfortable and reliable sedan perfect for city driving and business trips.',
            'features': ['Air Conditioning', 'Bluetooth', 'Backup Camera', 'Cruise Control'],
            'registration_number': 'ABC123'
        },
        {
            'name': 'Civic',
            'brand': 'Honda',
            'category': 'Sedan',
            'model_year': 2023,
            'fuel_type': 'petrol',
            'transmission': 'manual',
            'engine_capacity': '1.8L',
            'seating_capacity': 5,
            'mileage': '18 kmpl',
            'daily_rate': 40.00,
            'weekly_rate': 250.00,
            'monthly_rate': 900.00,
            'location': 'Airport Terminal',
            'description': 'Fuel-efficient and sporty sedan with excellent handling.',
            'features': ['Air Conditioning', 'Bluetooth', 'USB Ports', 'Lane Assist'],
            'registration_number': 'DEF456'
        },
        {
            'name': 'X5',
            'brand': 'BMW',
            'category': 'SUV',
            'model_year': 2023,
            'fuel_type': 'petrol',
            'transmission': 'automatic',
            'engine_capacity': '3.0L',
            'seating_capacity': 7,
            'mileage': '12 kmpl',
            'daily_rate': 120.00,
            'weekly_rate': 750.00,
            'monthly_rate': 2800.00,
            'location': 'Luxury Hub',
            'description': 'Premium SUV with advanced technology and luxurious interior.',
            'features': ['Leather Seats', 'Navigation', 'Sunroof', 'Premium Audio', '4WD'],
            'registration_number': 'GHI789'
        },
        {
            'name': 'Model 3',
            'brand': 'Tesla',
            'category': 'Electric',
            'model_year': 2023,
            'fuel_type': 'electric',
            'transmission': 'automatic',
            'engine_capacity': 'Electric',
            'seating_capacity': 5,
            'mileage': '500 km range',
            'daily_rate': 80.00,
            'weekly_rate': 500.00,
            'monthly_rate': 1800.00,
            'location': 'Eco Station',
            'description': 'Fully electric sedan with autopilot and over-the-air updates.',
            'features': ['Autopilot', 'Supercharging', 'Premium Interior', 'Mobile App Control'],
            'registration_number': 'JKL012'
        },
        {
            'name': 'Focus',
            'brand': 'Ford',
            'category': 'Hatchback',
            'model_year': 2022,
            'fuel_type': 'petrol',
            'transmission': 'manual',
            'engine_capacity': '1.6L',
            'seating_capacity': 5,
            'mileage': '16 kmpl',
            'daily_rate': 35.00,
            'weekly_rate': 220.00,
            'monthly_rate': 800.00,
            'location': 'City Center',
            'description': 'Compact and agile hatchback perfect for urban driving.',
            'features': ['Air Conditioning', 'Bluetooth', 'Parking Sensors', 'Eco Mode'],
            'registration_number': 'MNO345'
        },
        {
            'name': 'A4',
            'brand': 'Audi',
            'category': 'Luxury',
            'model_year': 2023,
            'fuel_type': 'petrol',
            'transmission': 'automatic',
            'engine_capacity': '2.0L',
            'seating_capacity': 5,
            'mileage': '14 kmpl',
            'daily_rate': 100.00,
            'weekly_rate': 650.00,
            'monthly_rate': 2400.00,
            'location': 'Premium Plaza',
            'description': 'Luxury sedan with cutting-edge technology and premium materials.',
            'features': ['Virtual Cockpit', 'B&O Audio', 'Quattro AWD', 'Adaptive Cruise'],
            'registration_number': 'PQR678'
        },
        {
            'name': 'CR-V',
            'brand': 'Honda',
            'category': 'SUV',
            'model_year': 2023,
            'fuel_type': 'petrol',
            'transmission': 'automatic',
            'engine_capacity': '1.5L Turbo',
            'seating_capacity': 7,
            'mileage': '13 kmpl',
            'daily_rate': 65.00,
            'weekly_rate': 400.00,
            'monthly_rate': 1500.00,
            'location': 'Family Center',
            'description': 'Spacious and reliable SUV perfect for family trips.',
            'features': ['Honda Sensing', 'Apple CarPlay', 'Heated Seats', 'Power Tailgate'],
            'registration_number': 'STU901'
        },
        {
            'name': 'Elantra',
            'brand': 'Hyundai',
            'category': 'Sedan',
            'model_year': 2023,
            'fuel_type': 'petrol',
            'transmission': 'automatic',
            'engine_capacity': '2.0L',
            'seating_capacity': 5,
            'mileage': '17 kmpl',
            'daily_rate': 42.00,
            'weekly_rate': 260.00,
            'monthly_rate': 950.00,
            'location': 'Business District',
            'description': 'Modern sedan with advanced safety features and comfortable ride.',
            'features': ['SmartSense', 'Wireless Charging', '10.25" Display', 'Blind Spot Monitor'],
            'registration_number': 'VWX234'
        }
    ]
    
    created_vehicles = []
    for vehicle_data in vehicles_data:
        vehicle, created = Vehicle.objects.get_or_create(
            registration_number=vehicle_data['registration_number'],
            defaults={
                'name': vehicle_data['name'],
                'brand': created_brands[vehicle_data['brand']],
                'category': created_categories[vehicle_data['category']],
                'model_year': vehicle_data['model_year'],
                'fuel_type': vehicle_data['fuel_type'],
                'transmission': vehicle_data['transmission'],
                'engine_capacity': vehicle_data['engine_capacity'],
                'seating_capacity': vehicle_data['seating_capacity'],
                'mileage': vehicle_data['mileage'],
                'daily_rate': vehicle_data['daily_rate'],
                'weekly_rate': vehicle_data['weekly_rate'],
                'monthly_rate': vehicle_data['monthly_rate'],
                'location': vehicle_data['location'],
                'description': vehicle_data['description'],
                'features': vehicle_data['features'],
                'status': 'available'
            }
        )
        created_vehicles.append(vehicle)
        if created:
            print(f"Created vehicle: {vehicle.name}")
    
    # Create sample users
    users_data = [
        {
            'username': 'john_doe',
            'email': 'john@example.com',
            'first_name': 'John',
            'last_name': 'Doe',
            'phone_number': '+1234567890',
            'address': '123 Main St, City, State 12345',
            'date_of_birth': date(1990, 5, 15),
            'driving_license': 'DL123456789',
            'role': 'customer'
        },
        {
            'username': 'jane_smith',
            'email': 'jane@example.com',
            'first_name': 'Jane',
            'last_name': 'Smith',
            'phone_number': '+1234567891',
            'address': '456 Oak Ave, City, State 12345',
            'date_of_birth': date(1985, 8, 22),
            'driving_license': 'DL987654321',
            'role': 'customer'
        },
        {
            'username': 'admin_user',
            'email': 'admin@vehiclerental.com',
            'first_name': 'Admin',
            'last_name': 'User',
            'phone_number': '+1234567892',
            'address': '789 Admin Blvd, City, State 12345',
            'role': 'admin'
        }
    ]
    
    created_users = []
    for user_data in users_data:
        user, created = User.objects.get_or_create(
            email=user_data['email'],
            defaults={
                'username': user_data['username'],
                'first_name': user_data['first_name'],
                'last_name': user_data['last_name'],
                'phone_number': user_data.get('phone_number', ''),
                'address': user_data.get('address', ''),
                'date_of_birth': user_data.get('date_of_birth'),
                'driving_license': user_data.get('driving_license', ''),
                'role': user_data['role'],
                'is_active': True
            }
        )
        if created:
            user.set_password('password123')  # Default password for demo
            user.save()
            print(f"Created user: {user.email}")
        created_users.append(user)
    
    # Create sample bookings
    if created_users and created_vehicles:
        sample_bookings = [
            {
                'user': created_users[0],  # john_doe
                'vehicle': created_vehicles[0],  # Camry
                'start_date': date.today() + timedelta(days=7),
                'end_date': date.today() + timedelta(days=10),
                'pickup_time': '10:00',
                'return_time': '18:00',
                'pickup_location': 'Downtown Office',
                'return_location': 'Downtown Office',
                'status': 'confirmed',
                'payment_status': 'paid',
                'daily_rate': created_vehicles[0].daily_rate
            },
            {
                'user': created_users[1],  # jane_smith
                'vehicle': created_vehicles[2],  # BMW X5
                'start_date': date.today() + timedelta(days=14),
                'end_date': date.today() + timedelta(days=21),
                'pickup_time': '09:00',
                'return_time': '17:00',
                'pickup_location': 'Luxury Hub',
                'return_location': 'Luxury Hub',
                'status': 'pending',
                'payment_status': 'pending',
                'daily_rate': created_vehicles[2].daily_rate
            }
        ]
        
        for booking_data in sample_bookings:
            booking, created = Booking.objects.get_or_create(
                user=booking_data['user'],
                vehicle=booking_data['vehicle'],
                start_date=booking_data['start_date'],
                defaults=booking_data
            )
            if created:
                print(f"Created booking: {booking.user.email} - {booking.vehicle.name}")
    
    print("\n✅ Sample data creation completed!")
    print("\nSample users created:")
    print("Customer: john@example.com (password: password123)")
    print("Customer: jane@example.com (password: password123)")
    print("Admin: admin@vehiclerental.com (password: password123)")
    print("\nYou can now login with these credentials to test the application.")

if __name__ == '__main__':
    create_sample_data()
