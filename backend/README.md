# Backend API

Node.js/Express backend for the Mobile Attendance System.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/attendance_db?schema=public"
   JWT_SECRET=your-super-secret-jwt-key
   JWT_REFRESH_SECRET=your-super-secret-refresh-key
   PORT=5000
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:5173,http://localhost:3000
   QR_CODE_SECRET=your-qr-code-encryption-secret
   ```

3. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```

4. Run migrations:
   ```bash
   npm run prisma:migrate
   ```

5. Start development server:
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/profile` - Get current user profile

### Sessions (Lecturer only)
- `POST /api/sessions` - Create new session
- `POST /api/sessions/:id/end` - End session
- `GET /api/sessions/lecturer` - Get lecturer's sessions
- `GET /api/sessions/:id` - Get session details

### Attendance (Student only)
- `POST /api/attendance/mark` - Mark attendance
- `GET /api/attendance/history` - Get attendance history

## WebSocket Events

### Client → Server
- `join-session` - Join a session room (lecturer)
- `leave-session` - Leave a session room (lecturer)

### Server → Client
- `attendance-update` - New attendance marked (lecturer)

## Security

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting (100 requests per 15 minutes)
- Input validation with Zod
- CORS protection
- SQL injection prevention (Prisma)

