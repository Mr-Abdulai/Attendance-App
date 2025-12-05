# Fix Prisma Client Generation
# This script generates Prisma client without triggering bcrypt rebuild

Write-Host "Generating Prisma Client..." -ForegroundColor Yellow

# Install missing dependencies first
npm install abbrev are-we-there-yet --save

# Generate Prisma client directly
npx --yes prisma@5.7.1 generate

Write-Host "Done! Prisma client should be generated now." -ForegroundColor Green

