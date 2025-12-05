# Simple Setup Guide - For Beginners

Don't worry! This guide will walk you through everything step by step. Even if you've never coded before, you can do this.

---

## What You Need First

Before we start, you need to install these two things on your computer:

### 1. Node.js (This lets you run the project)
- Go to: https://nodejs.org/
- Click the big green button that says "LTS" (it's the recommended version)
- Download and install it (just click Next, Next, Next)
- **How to check if it worked:** Open a new terminal/command prompt and type: `node -v`
- If you see a version number (like v18.17.0), you're good!

### 2. PostgreSQL (This is the database - where we store data)
- Go to: https://www.postgresql.org/download/
- Download the version for Windows
- Install it (remember the password you set - you'll need it later!)
- **How to check if it worked:** You should see "pgAdmin" in your Start menu

---

## Step 1: Install All the Code Packages

This is like downloading all the tools the project needs to work.

### Easy Way (Recommended):

1. Open PowerShell or Command Prompt in this folder
2. Type this and press Enter:
   ```powershell
   npm run setup
   ```
3. Wait for it to finish (it might take 2-5 minutes)
4. When you see "✅ All dependencies installed", you're done!

**That's it!** All the code packages are now installed locally in this project folder.

---

## Step 2: Set Up the Database

The database is like a filing cabinet where we store all the attendance information.

### Create the Database:

1. Open **pgAdmin** (search for it in your Start menu)
2. Enter the password you set when installing PostgreSQL
3. Right-click on "Databases" → "Create" → "Database"
4. Name it: `attendance_db`
5. Click "Save"

Done! Your database is ready.

---

## Step 3: Tell the Backend Where the Database Is

We need to create a file that tells the backend how to connect to your database.

1. Go to the `backend` folder
2. Look for a file called `.env.example`
3. Copy it and rename the copy to `.env` (remove the `.example` part)
4. Open the `.env` file with Notepad
5. Find this line:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/attendance_db"
   ```
6. Replace it with your actual database info:
   - Replace `user` with `postgres` (or your PostgreSQL username)
   - Replace `password` with the password you set when installing PostgreSQL
   - Keep everything else the same
   
   Example:
   ```
   DATABASE_URL="postgresql://postgres:myPassword123@localhost:5432/attendance_db"
   ```

7. Also change these lines (use any random long strings):
   ```
   JWT_SECRET=make-up-any-long-random-string-here-12345
   JWT_REFRESH_SECRET=another-different-random-string-here-67890
   QR_CODE_SECRET=yet-another-random-string-here-abcde
   ```

8. Save the file

---

## Step 4: Set Up the Database Tables

This creates the tables in your database (like creating folders in a filing cabinet).

1. Open PowerShell/Command Prompt in the `backend` folder
2. Type these commands one by one (press Enter after each):

   ```bash
   npm run prisma:generate
   ```
   Wait for it to finish, then:
   
   ```bash
   npm run prisma:migrate
   ```
   When it asks "Enter a name for the new migration:", just type: `init` and press Enter

3. You should see "Migration applied successfully" - you're done!

---

## Step 5: Set Up the Web App

1. Go to the `web` folder
2. Look for `.env.example` file
3. Copy it and rename to `.env`
4. Open it with Notepad
5. Make sure it says:
   ```
   VITE_API_BASE_URL=http://localhost:5000/api
   ```
6. Save the file

---

## Step 6: Update Mobile App Settings

1. Go to the `mobile` folder
2. Open `src/services/api.ts` with any text editor
3. Find this line (around line 3):
   ```typescript
   const API_BASE_URL = 'http://localhost:5000/api';
   ```
4. If you're testing on a phone, change `localhost` to your computer's IP address
   - To find your IP: Open Command Prompt and type `ipconfig`, look for "IPv4 Address"
   - Example: `http://192.168.1.100:5000/api`
5. Save the file

---

## Step 7: Start Everything!

Now let's run all three parts of the system. You'll need **3 separate terminal windows**.

### Terminal 1 - Start the Backend (The Server):

1. Open PowerShell/Command Prompt
2. Go to the `backend` folder:
   ```bash
   cd backend
   ```
3. Start the server:
   ```bash
   npm run dev
   ```
4. Wait until you see: `🚀 Server running on port 5000`
5. **Leave this window open!**

### Terminal 2 - Start the Web App (For Lecturers):

1. Open a **NEW** PowerShell/Command Prompt window
2. Go to the `web` folder:
   ```bash
   cd web
   ```
3. Start the web app:
   ```bash
   npm run dev
   ```
4. Wait until you see something like: `Local: http://localhost:5173`
5. **Leave this window open!**

### Terminal 3 - Start the Mobile App (For Students):

1. Open a **NEW** PowerShell/Command Prompt window
2. Go to the `mobile` folder:
   ```bash
   cd mobile
   ```
3. Start the mobile app:
   ```bash
   npm start
   ```
4. A webpage will open with a QR code
5. **Leave this window open!**

---

## Step 8: Create Your First Account

### Create a Lecturer Account:

1. Open your web browser
2. Go to: http://localhost:5173
3. You'll see a login page
4. Since you don't have an account yet, we need to create one using the API

**Option A - Using a tool like Postman (Easier):**
- Download Postman from https://www.postman.com/downloads/
- Create a new POST request to: `http://localhost:5000/api/auth/register`
- In the Body tab, select "raw" and "JSON"
- Paste this:
  ```json
  {
    "email": "lecturer@test.com",
    "password": "password123",
    "name": "Dr. Test Lecturer",
    "role": "LECTURER"
  }
  ```
- Click Send
- You should see a success message

**Option B - Using Command Prompt:**
- Open a new terminal
- Type this (all on one line):
  ```bash
   curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d "{\"email\":\"lecturer@test.com\",\"password\":\"password123\",\"name\":\"Dr. Test Lecturer\",\"role\":\"LECTURER\"}"
  ```

### Create a Student Account:

You can do this directly in the mobile app:
1. Open the Expo Go app on your phone
2. Scan the QR code from Terminal 3
3. The app will open
4. Click "Don't have an account? Register"
5. Fill in your details
6. Make sure role is "STUDENT"
7. Click Register

---

## Step 9: Test It Out!

### As a Lecturer:

1. Go to http://localhost:5173 in your browser
2. Login with: `lecturer@test.com` / `password123`
3. Click "Create Session"
4. Enter a session name (like "CS101 - Test Class")
5. Click "Create Session"
6. Allow location access when asked
7. A QR code will appear - this is what students scan!

### As a Student:

1. Open the mobile app on your phone
2. Login with your student account
3. Tap the floating button that says "Scan QR Code"
4. Allow camera and location permissions
5. Point your camera at the QR code on the lecturer's screen
6. Your attendance should be marked!

---

## Troubleshooting

### "npm command not found"
- You didn't install Node.js properly
- Go back to the beginning and install Node.js

### "Cannot connect to database"
- Check your `.env` file in the `backend` folder
- Make sure the password is correct
- Make sure PostgreSQL is running (check in pgAdmin)

### "Port 5000 already in use"
- Something else is using that port
- Close other programs or change the PORT in backend/.env

### Mobile app can't connect
- Make sure you changed `localhost` to your computer's IP address
- Make sure your phone and computer are on the same WiFi network
- Make sure the backend is running (Terminal 1)

### "Module not found" errors
- You didn't run `npm run setup` properly
- Go to each folder (backend, web, mobile) and run `npm install` in each

---

## Quick Reference - Starting the Project

Every time you want to work on this project:

1. **Start Backend:** Open terminal → `cd backend` → `npm run dev`
2. **Start Web:** Open NEW terminal → `cd web` → `npm run dev`
3. **Start Mobile:** Open NEW terminal → `cd mobile` → `npm start`

**Remember:** Keep all 3 terminals open while working!

---

## Need Help?

- Check the main README.md for more details
- Make sure all 3 terminals are running
- Check that PostgreSQL is running
- Verify your `.env` files are set up correctly

You've got this! 🚀
