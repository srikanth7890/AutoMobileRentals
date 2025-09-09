import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-dark-800 border-t border-dark-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Car className="h-8 w-8 text-primary-500" />
              <span className="text-xl font-bold text-white">VehicleRental</span>
            </div>
            <p className="text-dark-300 mb-4 max-w-md">
              Your trusted partner for vehicle rentals. We offer a wide range of vehicles 
              from economy cars to luxury vehicles, all at competitive prices.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-dark-300">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2 text-dark-300">
                <Mail className="h-4 w-4" />
                <span>info@vehiclerental.com</span>
              </div>
              <div className="flex items-center space-x-2 text-dark-300">
                <MapPin className="h-4 w-4" />
                <span>123 Main St, City, State 12345</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/vehicles" className="text-dark-300 hover:text-white transition-colors">
                  Browse Vehicles
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-dark-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-dark-300 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-dark-300 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-dark-300 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <span className="text-dark-300">Car Rental</span>
              </li>
              <li>
                <span className="text-dark-300">Bike Rental</span>
              </li>
              <li>
                <span className="text-dark-300">SUV Rental</span>
              </li>
              <li>
                <span className="text-dark-300">Luxury Vehicles</span>
              </li>
              <li>
                <span className="text-dark-300">Long-term Rental</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-dark-300 text-sm">
              © 2024 VehicleRental. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-dark-300 hover:text-white transition-colors">
                Facebook
              </a>
              <a href="#" className="text-dark-300 hover:text-white transition-colors">
                Twitter
              </a>
              <a href="#" className="text-dark-300 hover:text-white transition-colors">
                Instagram
              </a>
              <a href="#" className="text-dark-300 hover:text-white transition-colors">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
