#!/bin/bash

# Vehicle Rental Application Setup Script

echo "🚗 Setting up Vehicle Rental Application..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ and try again."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ and try again."
    exit 1
fi

echo "✅ Python and Node.js are installed"

# Backend Setup
echo "🔧 Setting up Django backend..."

cd backend

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
echo "📥 Installing Python dependencies..."
pip install -r ../requirements.txt

# Run migrations
echo "🗄️ Running database migrations..."
python manage.py makemigrations
python manage.py migrate

# Create superuser
echo "👤 Creating superuser account..."
echo "Please create an admin account:"
python manage.py createsuperuser

echo "✅ Backend setup complete!"

# Frontend Setup
echo "🔧 Setting up React frontend..."

cd ../frontend

# Install Node.js dependencies
echo "📥 Installing Node.js dependencies..."
npm install

echo "✅ Frontend setup complete!"

# Create environment file
echo "📝 Creating environment configuration..."
cd ../backend
cat > .env << EOL
SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
EOL

echo "✅ Environment file created!"

# Final instructions
echo ""
echo "🎉 Setup complete! Here's how to run the application:"
echo ""
echo "Backend (Terminal 1):"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  python manage.py runserver"
echo ""
echo "Frontend (Terminal 2):"
echo "  cd frontend"
echo "  npm start"
echo ""
echo "🌐 Access the application:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:8000/api/"
echo "  Admin Panel: http://localhost:8000/admin/"
echo ""
echo "📚 Check README.md for detailed documentation"
echo ""
echo "Happy coding! 🚀"
