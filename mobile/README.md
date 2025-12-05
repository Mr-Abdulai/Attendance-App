# Mobile App (Student)

React Native mobile application for students to mark attendance.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Update API URL in `src/services/api.ts`:
   ```typescript
   const API_BASE_URL = 'http://YOUR_IP:5000/api';
   ```
   For physical devices, use your computer's IP address instead of localhost.

3. Start Expo:
   ```bash
   npm start
   ```

4. Scan QR code with Expo Go app or press:
   - `a` for Android emulator
   - `i` for iOS simulator

## Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web (limited functionality)

## Features

- Student authentication (login/register)
- QR code scanning
- Location verification
- Attendance history
- Modern UI with React Native Paper
- Real-time feedback

## Permissions

The app requires:
- Camera access (for QR scanning)
- Location access (for verification)

## Tech Stack

- React Native
- Expo
- TypeScript
- React Native Paper
- React Navigation
- Expo Camera
- Expo Location

## Building for Production

```bash
# Android
expo build:android

# iOS
expo build:ios
```

