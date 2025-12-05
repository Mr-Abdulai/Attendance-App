# Installation Guide

## Important Note: Local Installation (No Global Packages)

**This project uses Node.js, not Python.** Node.js automatically installs packages locally in `node_modules` folders (similar to Python's venv). You don't need to worry about global installations - everything is contained within the project.

## Quick Setup

### Option 1: Automated Setup Script (Recommended)

**Windows:**
```powershell
.\setup.ps1
```

**Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

### Option 2: Using npm Scripts

From the root directory:
```bash
npm run setup
```

This installs all dependencies for backend, web, and mobile apps.

### Option 3: Manual Installation

Install dependencies for each project:

```bash
# Backend
cd backend
npm install
cd ..

# Web App
cd web
npm install
cd ..

# Mobile App
cd mobile
npm install
cd ..
```

## How Node.js Local Installation Works

Unlike Python where you need to create a venv, Node.js **automatically installs packages locally**:

- Each project has its own `node_modules` folder
- Dependencies are installed in `./node_modules` (not globally)
- `package.json` files (similar to `requirements.txt`) track all dependencies
- `.npmrc` files ensure consistent installation behavior

## Verification

After installation, you should see `node_modules` folders in:
- `backend/node_modules/`
- `web/node_modules/`
- `mobile/node_modules/`

These folders contain all dependencies and are **not installed globally** on your system.

## Next Steps

1. **Set up PostgreSQL database**
2. **Configure environment variables** (see SETUP.md)
3. **Run database migrations**: `cd backend && npm run prisma:migrate`
4. **Start development servers** (see README.md)

## Troubleshooting

### "npm command not found"
- Install Node.js from https://nodejs.org/
- Restart your terminal after installation

### Permission errors (Linux/Mac)
- Don't use `sudo` - npm installs locally by default
- If you see permission errors, check your npm configuration: `npm config get prefix`

### Port already in use
- Backend uses port 5000
- Web app uses port 5173
- Change ports in respective `.env` files if needed

## Package Management

### Adding new dependencies

**Backend:**
```bash
cd backend
npm install package-name
```

**Web:**
```bash
cd web
npm install package-name
```

**Mobile:**
```bash
cd mobile
npm install package-name
```

### Updating dependencies

```bash
# In each project directory
npm update
```

### Removing dependencies

```bash
# In each project directory
npm uninstall package-name
```

## Why No Global Installation?

- ✅ Each project has isolated dependencies
- ✅ Different projects can use different versions
- ✅ No conflicts between projects
- ✅ Easy to share (just commit `package.json` and `package-lock.json`)
- ✅ Reproducible builds

This is the standard Node.js approach and works similarly to Python's virtual environments!

