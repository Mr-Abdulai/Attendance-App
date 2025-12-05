# How to Run the Mobile App - Simple Guide

## The Easiest Way: Use Your Phone with Expo Go

### Step 1: Install Expo Go on Your Phone

**Android:**
- Open Google Play Store
- Search for "Expo Go"
- Install it

**iPhone:**
- Open App Store  
- Search for "Expo Go"
- Install it

### Step 2: Make Sure Your Phone and Computer Are on the Same WiFi

- Your phone and computer must be connected to the same WiFi network
- This is important! They need to be able to talk to each other

### Step 3: Start the Mobile App

1. Open a terminal in the `mobile` folder
2. Run: `npm start`
3. A QR code will appear in the terminal

### Step 4: Scan the QR Code

1. Open Expo Go app on your phone
2. Tap "Scan QR code"
3. Point your camera at the QR code in the terminal
4. The app will load on your phone!

### Step 5: Make Sure Backend is Running

Before using the app, make sure:
- Backend is running (`npm run dev` in the `backend` folder)
- Backend is accessible from your phone (check the IP address in `mobile/src/services/api.ts`)

---

## Alternative: Use Android Emulator (More Complex)

If you want to use an emulator instead:

1. Install Android Studio: https://developer.android.com/studio
2. Create an Android Virtual Device (AVD)
3. Start the emulator
4. Run: `npm start` then press `a` for Android

**Note:** This is more complicated and requires more setup. Using your phone is much easier!

---

## Troubleshooting

**"Can't connect to backend"**
- Make sure backend is running
- Check that IP address in `mobile/src/services/api.ts` matches your computer's IP
- Make sure phone and computer are on same WiFi

**"Expo Go can't find the app"**
- Make sure `npm start` is running in the mobile folder
- Try restarting Expo Go app
- Make sure you scanned the correct QR code

**"No Android device found"**
- This is normal if you're not using an emulator
- Just use Expo Go on your phone instead (much easier!)

