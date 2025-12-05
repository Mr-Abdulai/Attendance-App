# How to Start the Backend

## Quick Start

1. Open a terminal/command prompt
2. Navigate to the backend folder:
   ```powershell
   cd backend
   ```
3. Start the server:
   ```powershell
   npm run dev
   ```
4. You should see:
   ```
   🚀 Server running on port 5000
   📱 Environment: development
   ```

## Keep This Terminal Open!

- The backend must stay running for the web and mobile apps to work
- Don't close this terminal window
- If you see errors, check:
  - Is PostgreSQL running?
  - Is the database `attendance_db` created?
  - Is the `.env` file configured correctly?

## Verify It's Running

Open your browser and go to: http://localhost:5000/health

You should see: `{"status":"ok","timestamp":"..."}`


