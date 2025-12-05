import { calculateDistance, isWithinRange } from '../utils/distance';

export interface Location {
  latitude: number;
  longitude: number;
}

/**
 * Verify if student location is within allowed range of lecturer location
 */
export function verifyLocation(
  studentLocation: Location,
  lecturerLocation: Location,
  maxDistance: number = 10
): { isValid: boolean; distance: number } {
  const distance = calculateDistance(
    lecturerLocation.latitude,
    lecturerLocation.longitude,
    studentLocation.latitude,
    studentLocation.longitude
  );

  return {
    isValid: isWithinRange(distance, maxDistance),
    distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
  };
}

