#!/bin/bash

echo "🚀 Setting up CivicPulse - Full Stack Civic Engagement Platform"
echo "=============================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the CivicPulse root directory"
    exit 1
fi

echo "📦 Installing frontend dependencies..."
npm install

echo "🐍 Setting up Python backend..."
cd backend

# Check if Python 3.8+ is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3.8+ is required but not installed"
    echo "Please install Python 3.8+ and try again"
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "../backend/.clearvenv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "📝 Please edit backend/.env with your configuration"
fi

cd ..

echo "✅ Setup complete!"
echo ""
echo "🚀 To start the application:"
echo "1. Start the backend:"
echo "   cd backend && source venv/bin/activate && python run.py"
echo ""
echo "2. In a new terminal, start the frontend:"
echo "   npm run dev"
echo ""
echo "📱 The frontend will be available at: http://localhost:5173"
echo "🔧 The backend API will be available at: http://localhost:8000"
echo "📚 API documentation will be available at: http://localhost:8000/docs"
echo ""
echo "💡 Note: The app includes fallback mock data, so it will work even if the backend is not running!"
echo ""
echo "🔧 Next steps:"
echo "1. Configure your database in backend/.env"
echo "2. Run database migrations (when implemented)"
echo "3. Start building your civic engagement platform!"
