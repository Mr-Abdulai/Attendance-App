import { verifyLocation } from './locationService';
// We need to either mock calculateDistance or import it from utils if we want to test it directly.
// Given verifyLocation uses it, let's just test verifyLocation mostly, or import from utils.
import { calculateDistance } from '../utils/distance';

describe('Location Service', () => {
    // Coordinates for Reference (Approximate)
    const CENTER = { latitude: 5.6037, longitude: -0.1870 }; // Accra Mall area (example)

    describe('calculateDistance', () => {
        it('should return 0 for identical coordinates', () => {
            const distance = calculateDistance(CENTER.latitude, CENTER.longitude, CENTER.latitude, CENTER.longitude);
            expect(distance).toBe(0);
        });

        it('should calculate accurate distance between two points', () => {
            // Point B: ~100 meters away
            // 0.0009 degrees lat is roughly 100m
            const POINT_B = { latitude: 5.6046, longitude: -0.1870 };

            const distance = calculateDistance(CENTER.latitude, CENTER.longitude, POINT_B.latitude, POINT_B.longitude);
            // Allow slight variance due to formula precision
            expect(distance).toBeGreaterThan(99);
            expect(distance).toBeLessThan(101);
        });
    });

    describe('verifyLocation', () => {
        it('should return valid=true when within range', () => {
            // 50 meters away
            const NEARBY = { latitude: 5.60415, longitude: -0.1870 };
            const MAX_DISTANCE = 100;

            const result = verifyLocation(NEARBY, CENTER, MAX_DISTANCE);

            expect(result.isValid).toBe(true);
            expect(result.distance).toBeLessThan(MAX_DISTANCE);
        });

        it('should return valid=false when out of range', () => {
            // 200 meters away
            const FAR_AWAY = { latitude: 5.6055, longitude: -0.1870 };
            const MAX_DISTANCE = 100;

            const result = verifyLocation(FAR_AWAY, CENTER, MAX_DISTANCE);

            expect(result.isValid).toBe(false);
            expect(result.distance).toBeGreaterThan(MAX_DISTANCE);
        });
    });
});
