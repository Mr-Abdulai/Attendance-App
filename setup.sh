#!/bin/bash
# Bash setup script for Linux/Mac
# This script installs all dependencies locally (not globally)

echo "🚀 Setting up Mobile Attendance System..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo "✅ npm version: $(npm -v)"
echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Backend installation failed"
    cd ..
    exit 1
fi
echo "✅ Backend dependencies installed"
cd ..

# Install web dependencies
echo "📦 Installing web app dependencies..."
cd web
npm install
if [ $? -ne 0 ]; then
    echo "❌ Web app installation failed"
    cd ..
    exit 1
fi
echo "✅ Web app dependencies installed"
cd ..

# Install mobile dependencies
echo "📦 Installing mobile app dependencies..."
cd mobile
npm install
if [ $? -ne 0 ]; then
    echo "❌ Mobile app installation failed"
    cd ..
    exit 1
fi
echo "✅ Mobile app dependencies installed"
cd ..

echo ""
echo "✅ All dependencies installed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Set up your database (PostgreSQL)"
echo "2. Configure environment variables in backend/.env"
echo "3. Run database migrations: cd backend && npm run prisma:migrate"
echo "4. Start the backend: npm run dev:backend"
echo "5. Start the web app: npm run dev:web"
echo "6. Start the mobile app: npm run dev:mobile"
echo ""
echo "See README.md for detailed setup instructions."

