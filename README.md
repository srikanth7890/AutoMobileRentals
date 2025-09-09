# Automobile Rental System

A full-stack web application for managing automobile rentals with admin panel, customer booking system, and payment processing.

## 🚀 Features

### Customer Features
- **Vehicle Browsing**: Browse available vehicles with detailed information
- **Advanced Search**: Filter vehicles by brand, category, price range, and availability
- **Booking System**: Create bookings with date selection and special requests
- **Payment Processing**: Secure payment integration with multiple payment methods
- **Booking Management**: View, edit, and cancel bookings
- **User Authentication**: Secure registration and login system

### Admin Features
- **Dashboard**: Comprehensive analytics and metrics
- **Vehicle Management**: Add, edit, delete, and manage vehicle inventory
- **Customer Management**: View and manage customer accounts
- **Booking Management**: Monitor and manage all bookings
- **Financial Reports**: Revenue tracking and financial analytics
- **Business Intelligence**: Operational metrics and insights

## 🛠️ Tech Stack

### Backend
- **Django 4.2+**: Python web framework
- **Django REST Framework**: API development
- **PostgreSQL**: Database (configurable)
- **Django CORS Headers**: Cross-origin resource sharing
- **Django Filter**: Advanced filtering capabilities

### Frontend
- **React 18**: Modern UI library
- **React Router DOM**: Client-side routing
- **React Query**: Data fetching and caching
- **React Hook Form**: Form handling
- **Axios**: HTTP client
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **React DatePicker**: Date selection component

## 📋 Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn
- PostgreSQL (optional, SQLite by default)

## 🚀 Installation

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "Automobile rentals"
   ```

2. **Create and activate virtual environment**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run migrations**
   ```bash
   python manage.py migrate
   ```

5. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

6. **Start the development server**
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin

## 📁 Project Structure

```
Automobile rentals/
├── backend/                 # Django backend
│   ├── bookings/           # Booking management app
│   ├── vehicles/           # Vehicle management app
│   ├── users/              # User management app
│   ├── rental_backend/     # Main Django settings
│   └── manage.py
├── frontend/               # React frontend
│   ├── public/            # Static files
│   ├── src/               # Source code
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── package.json
└── README.md
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
SECRET_KEY=your-secret-key
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
ALLOWED_HOSTS=localhost,127.0.0.1
```

### Database Configuration

The project uses SQLite by default. To use PostgreSQL:

1. Install PostgreSQL
2. Update `DATABASES` in `backend/rental_backend/settings.py`
3. Run migrations

## 🧪 Testing

### Backend Tests
```bash
cd backend
python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/profile/` - User profile

### Vehicles
- `GET /api/vehicles/` - List all vehicles
- `GET /api/vehicles/{id}/` - Get vehicle details
- `GET /api/vehicles/{id}/availability/` - Check availability

### Bookings
- `POST /api/bookings/` - Create booking
- `GET /api/bookings/` - List user bookings
- `GET /api/bookings/{id}/` - Get booking details
- `GET /api/bookings/{id}/summary/` - Get booking summary
- `POST /api/bookings/{id}/cancel/` - Cancel booking

### Admin
- `GET /api/vehicles/admin/` - Admin vehicle management
- `GET /api/customers/admin/` - Admin customer management
- `GET /api/bookings/admin/` - Admin booking management

## 🎨 UI/UX Features

- **Dark Theme**: Modern dark theme throughout the application
- **Responsive Design**: Mobile-first responsive design
- **Loading States**: Proper loading indicators and spinners
- **Error Handling**: Comprehensive error handling and user feedback
- **Form Validation**: Client-side and server-side validation
- **Accessibility**: WCAG compliant components

## 🔒 Security Features

- **Authentication**: Token-based authentication
- **Authorization**: Role-based access control
- **CORS**: Properly configured CORS headers
- **Input Validation**: Comprehensive input validation
- **SQL Injection Protection**: Django ORM protection
- **XSS Protection**: Built-in Django protection

## 🚀 Deployment

### Backend Deployment
1. Set `DEBUG=False` in settings
2. Configure production database
3. Set up static file serving
4. Configure web server (Nginx/Apache)
5. Set up WSGI server (Gunicorn/uWSGI)

### Frontend Deployment
1. Build the production bundle
   ```bash
   npm run build
   ```
2. Serve static files through web server
3. Configure API endpoints for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository.

## 🔄 Recent Updates

- ✅ Fixed admin panel view/edit/delete functionality
- ✅ Resolved Django ORM field errors
- ✅ Enhanced booking creation with proper validation
- ✅ Fixed navigation issues in booking flow
- ✅ Improved error handling and user feedback
- ✅ Added comprehensive date validation
- ✅ Enhanced payment processing flow