# Mobile Attendance System

A simple attendance management system for universities. Lecturers create sessions with QR codes, and students scan them with their phones to mark attendance.

**New to coding?** Start with [SETUP.md](SETUP.md) - it has step-by-step instructions for beginners!

## Features

### Mobile App (Student)
- ✅ User authentication (login/register)
- ✅ QR code scanning for attendance
- ✅ Location verification (10-meter range)
- ✅ Attendance history dashboard
- ✅ Modern, user-friendly UI with real-time feedback
- ✅ Camera and location permission handling

### Web App (Lecturer)
- ✅ Secure lecturer authentication
- ✅ Create attendance sessions with QR code generation
- ✅ Real-time attendance tracking via WebSocket
- ✅ Session management (auto-end after 5 minutes)
- ✅ View past sessions and attendance records
- ✅ Export attendance data as CSV
- ✅ Clean, modern UI with Material-UI

### Backend API
- ✅ RESTful API with Express.js and TypeScript
- ✅ JWT authentication with refresh tokens
- ✅ PostgreSQL database with Prisma ORM
- ✅ Real-time updates via Socket.io
- ✅ Location verification using Haversine formula
- ✅ Secure QR code generation with encryption
- ✅ Rate limiting and input validation
- ✅ Comprehensive error handling

## Technology Stack

- **Backend:** Node.js, Express, TypeScript, PostgreSQL, Prisma, Socket.io
- **Web App:** React, TypeScript, Vite, Material-UI, Socket.io Client
- **Mobile App:** React Native, Expo, TypeScript, React Native Paper

## What You Need

1. **Node.js** (v18+) - [Download here](https://nodejs.org/) - Install the LTS version
2. **PostgreSQL** (v14+) - [Download here](https://www.postgresql.org/download/) - This is the database
3. **A code editor** (optional) - VS Code is recommended

**That's it!** Everything else installs automatically when you run `npm run setup`.

## Quick Start

**Never coded before?** Read [SETUP.md](SETUP.md) first - it's written for complete beginners!

**Familiar with coding?** Follow the steps below.

### Installation

**Install all dependencies:**
```bash
npm run setup
```

This installs everything you need. All packages are installed locally (not globally).

### 2. Configure Backend

1. Go to `backend` folder
2. Copy `.env.example` to `.env`
3. Edit `.env` with your database password and create random secret keys
4. Run:
   ```bash
   cd backend
   npm run prisma:generate
   npm run prisma:migrate
   ```

### 3. Configure Web App

1. Go to `web` folder  
2. Copy `.env.example` to `.env`
3. It should already have the correct API URL

### 4. Configure Mobile App

1. Open `mobile/src/services/api.ts`
2. If testing on a real phone, change `localhost` to your computer's IP address

### 5. Start Everything

You need **3 terminal windows**:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Web App:**
```bash
cd web
npm run dev
```

**Terminal 3 - Mobile App:**
```bash
cd mobile
npm start
```

**Keep all 3 running!**

- Backend: http://localhost:5000
- Web App: http://localhost:5173  
- Mobile: Scan QR code with Expo Go app

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/attendance_db
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
QR_CODE_SECRET=your-qr-code-encryption-secret
```

### Web (.env)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## How to Use

### For Lecturers (Web App):

1. Go to http://localhost:5173
2. Login (create account first - see SETUP.md)
3. Click "Create Session"
4. Enter session name and allow location
5. QR code appears - show it to students
6. Watch students mark attendance in real-time
7. Session ends automatically after 5 minutes
8. Export attendance as CSV when done

### For Students (Mobile App):

1. Open app on your phone (via Expo Go)
2. Login or register
3. Tap "Scan QR Code" button
4. Allow camera and location permissions  
5. Point camera at lecturer's QR code
6. Attendance marked! (must be within 10 meters)
7. View your attendance history anytime

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/profile` - Get current user profile

### Sessions (Lecturer)
- `POST /api/sessions` - Create new session
- `POST /api/sessions/:id/end` - End session
- `GET /api/sessions/lecturer` - Get lecturer's sessions
- `GET /api/sessions/:id` - Get session details

### Attendance (Student)
- `POST /api/attendance/mark` - Mark attendance
- `GET /api/attendance/history` - Get attendance history

## Security Features

- ✅ JWT tokens with refresh token rotation
- ✅ Password hashing with bcrypt
- ✅ Rate limiting to prevent brute force attacks
- ✅ Input validation with Zod schemas
- ✅ CORS configuration
- ✅ SQL injection prevention (Prisma ORM)
- ✅ Secure QR code generation with HMAC
- ✅ Server-side location verification
- ✅ Session expiry and cleanup

## Project Structure

```
Mobile-Attendance/
├── backend/           # Node.js API server
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── socket/
│   └── prisma/
├── web/              # React web app
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── services/
│       └── hooks/
└── mobile/           # React Native app
    └── src/
        ├── screens/
        ├── services/
        └── navigation/
```

## Development

### Running in Development Mode

1. Start PostgreSQL database
2. Start backend: `cd backend && npm run dev`
3. Start web app: `cd web && npm run dev`
4. Start mobile app: `cd mobile && npm start`

### Building for Production

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Web App:**
```bash
cd web
npm run build
# Serve the dist/ folder with a web server
```

**Mobile App:**
```bash
cd mobile
# Build for Android
expo build:android

# Build for iOS
expo build:ios
```

## Common Problems

**"npm command not found"**
- Install Node.js from nodejs.org

**"Cannot connect to database"**  
- Check PostgreSQL is running
- Verify password in backend/.env is correct

**"Port already in use"**
- Close other programs using port 5000 or 5173
- Or change PORT in backend/.env

**Mobile app can't connect**
- Change localhost to your computer's IP in mobile/src/services/api.ts
- Make sure phone and computer are on same WiFi
- Make sure backend is running

**Need more help?** Check [SETUP.md](SETUP.md) for detailed beginner-friendly instructions!

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on GitHub.

