# Location & Distance Testing Guide

## Understanding the Location Issue

### Why You're Getting "Too Far" Errors

**The Problem:**
- **Laptops use WiFi/IP-based location** → Accuracy: 50-500+ meters
- **Phones use real GPS** → Accuracy: 5-10 meters
- Your phone knows exactly where you are, but your laptop thinks it's somewhere else!

### Current Configuration

**Development Mode (Current):**
- Maximum allowed distance: **1000 meters** (1 km)
- This should allow scanning even with laptop's poor GPS

**Production Mode (Future):**
- Maximum allowed distance: **10 meters**
- Use this when both lecturer and students have real GPS devices

## How to Test

### 1. Check Your Backend Environment

Make sure your backend `.env` file has:
```env
NODE_ENV=development
```

This enables the 1000-meter tolerance.

### 2. Create a Session & Check Logs

When you create a session in the web app, open the browser console (F12) and look for:
```
📍 Lecturer location obtained: {
  latitude: 12.345678,
  longitude: 98.765432,
  accuracy: 500,  ← This shows how accurate the location is (in meters)
  timestamp: "2025-12-04T23:30:00.000Z"
}
```

**Note:** If accuracy is > 100 meters, your laptop's location is very approximate!

### 3. Scan QR Code & Check Logs

When the mobile app scans, check the backend terminal logs:
```
Location verification: {
  student: { latitude: 12.345123, longitude: 98.765987 },
  lecturer: { latitude: 12.345678, longitude: 98.765432 },
  maxDistance: 1000
}
Distance calculated: 156.45 meters | Valid: true
```

This tells you the actual distance between the two locations.

## Adjusting the Distance Threshold

### Option 1: Change Development Distance

Edit `backend/src/controllers/attendanceController.ts` line 84:
```typescript
const maxDistance = process.env.NODE_ENV === 'development' ? 1000 : 10;
//                                                              ↑
//                                                    Change this number
```

### Option 2: Add Environment Variable

**1. Add to `backend/.env`:**
```env
MAX_ATTENDANCE_DISTANCE=2000
```

**2. Update `backend/src/config/env.ts`:**
```typescript
const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().default('*'),
  QR_CODE_SECRET: z.string().min(1),
  MAX_ATTENDANCE_DISTANCE: z.string().default('10'), // Add this line
});
```

**3. Update `attendanceController.ts`:**
```typescript
const maxDistance = parseInt(process.env.MAX_ATTENDANCE_DISTANCE || '10');
```

## Troubleshooting

### Still Getting "Too Far" Error?

1. **Check backend is in development mode:**
   ```bash
   # In backend terminal, you should see:
   📱 Environment: development
   ```

2. **Restart the backend server:**
   ```bash
   cd backend
   npm run dev
   ```

3. **Check the distance in logs:**
   - If distance > 1000 meters, you need to increase the threshold
   - If distance < 1000 meters but still fails, check for typos in the code

### Browser Not Asking for Location Permission?

**Clear permission cache:**
1. Chrome: Click the padlock icon in address bar → Site settings → Location → Reset
2. Try in incognito/private mode
3. Use a different browser

**Force permission request:**
- The permission should now be requested every time due to `maximumAge: 0`
- Check browser console for error messages

## For Production Deployment

When deploying to production with real GPS devices (both phones):

1. Set backend `.env`:
   ```env
   NODE_ENV=production
   ```

2. The system will automatically use 10-meter tolerance

3. Test thoroughly in the actual classroom environment

## Distance Reference

- **10 meters**: Same room/classroom (production setting)
- **50 meters**: Same building
- **100 meters**: Same campus area
- **500 meters**: Nearby buildings
- **1000 meters**: Same neighborhood (current development setting)
