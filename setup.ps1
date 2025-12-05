# PowerShell setup script for Windows
# This script installs all dependencies locally (not globally)

Write-Host "🚀 Setting up Mobile Attendance System..." -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    Write-Host "Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Node.js version: $(node -v)" -ForegroundColor Green
Write-Host "✅ npm version: $(npm -v)" -ForegroundColor Green
Write-Host ""

# Install backend dependencies
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend installation failed" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "✅ Backend dependencies installed" -ForegroundColor Green
Set-Location ..

# Install web dependencies
Write-Host "📦 Installing web app dependencies..." -ForegroundColor Yellow
Set-Location web
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Web app installation failed" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "✅ Web app dependencies installed" -ForegroundColor Green
Set-Location ..

# Install mobile dependencies
Write-Host "📦 Installing mobile app dependencies..." -ForegroundColor Yellow
Set-Location mobile
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Mobile app installation failed" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "✅ Mobile app dependencies installed" -ForegroundColor Green
Set-Location ..

Write-Host ""
Write-Host "✅ All dependencies installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Set up your database (PostgreSQL)" -ForegroundColor White
Write-Host "2. Configure environment variables in backend/.env" -ForegroundColor White
Write-Host "3. Run database migrations: cd backend && npm run prisma:migrate" -ForegroundColor White
Write-Host "4. Start the backend: npm run dev:backend" -ForegroundColor White
Write-Host "5. Start the web app: npm run dev:web" -ForegroundColor White
Write-Host "6. Start the mobile app: npm run dev:mobile" -ForegroundColor White
Write-Host ""
Write-Host "See README.md for detailed setup instructions." -ForegroundColor Yellow

