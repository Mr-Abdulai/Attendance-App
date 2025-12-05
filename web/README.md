# Web App (Lecturer Portal)

React web application for lecturers to manage attendance sessions.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:5173`

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Features

- Lecturer authentication
- Create attendance sessions
- QR code generation and display
- Real-time attendance tracking
- Session management
- Export attendance data (CSV)
- Modern UI with Material-UI

## Tech Stack

- React 18
- TypeScript
- Vite
- Material-UI
- Socket.io Client
- React Router

