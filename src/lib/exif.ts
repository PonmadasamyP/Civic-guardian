import exifr from 'exifr';
import { calculateHaversineDistance } from './geo';

export interface ExifExtractionResult {
  hasGps: boolean;
  latitude?: number;
  longitude?: number;
  cameraModel?: string;
  timestamp?: string;
  errorMessage?: string;
}

export interface GeotagVerificationResult {
  isVerified: boolean;
  photoLat: number;
  photoLng: number;
  userLat?: number;
  userLng?: number;
  distanceMeters: number;
  statusBadge: 'verified' | 'unverified' | 'rejected';
  message: string;
}

/**
 * Extracts GPS and camera EXIF metadata from an uploaded image File using exifr
 */
export async function extractExifGps(file: File): Promise<ExifExtractionResult> {
  try {
    // 1. Try extracting GPS tags using exifr.gps()
    const gpsData = await exifr.gps(file);

    if (!gpsData || typeof gpsData.latitude !== 'number' || typeof gpsData.longitude !== 'number') {
      return {
        hasGps: false,
        errorMessage:
          'Geotag verification failed: No GPS metadata was found in the image EXIF tags. To report an issue, photos must contain GPS coordinates to prevent fraudulent reports.',
      };
    }

    // 2. Also try fetching camera model and timestamp for additional authenticity
    let cameraModel = 'Smartphone Camera';
    let timestamp = new Date().toISOString();
    try {
      const extraTags = await exifr.parse(file, ['Make', 'Model', 'DateTimeOriginal']);
      if (extraTags) {
        if (extraTags.Make || extraTags.Model) {
          cameraModel = `${extraTags.Make || ''} ${extraTags.Model || ''}`.trim();
        }
        if (extraTags.DateTimeOriginal) {
          timestamp = new Date(extraTags.DateTimeOriginal).toISOString();
        }
      }
    } catch {
      // Non-critical if extra tags are missing
    }

    return {
      hasGps: true,
      latitude: Number(gpsData.latitude.toFixed(6)),
      longitude: Number(gpsData.longitude.toFixed(6)),
      cameraModel,
      timestamp,
    };
  } catch (err: any) {
    return {
      hasGps: false,
      errorMessage: err?.message || 'Failed to read image EXIF data. Please upload a valid JPEG/PNG image.',
    };
  }
}

/**
 * Compares photo EXIF GPS with user's live browser location
 * Max allowed distance for 'Verified' badge: 100 meters
 */
export function verifyGeotagMatch(
  photoLat: number,
  photoLng: number,
  userLat: number,
  userLng: number
): GeotagVerificationResult {
  const distance = calculateHaversineDistance(photoLat, photoLng, userLat, userLng);

  if (distance <= 100) {
    return {
      isVerified: true,
      photoLat,
      photoLng,
      userLat,
      userLng,
      distanceMeters: distance,
      statusBadge: 'verified',
      message: `Verified location: Photo location matches your current GPS position within ${Math.round(distance)} meters (limit: 100m).`,
    };
  } else {
    return {
      isVerified: false,
      photoLat,
      photoLng,
      userLat,
      userLng,
      distanceMeters: distance,
      statusBadge: 'unverified',
      message: `Unverified location: Photo GPS is ${Math.round(distance)}m away from your current position (exceeds 100m threshold). This report will be flagged as unverified.`,
    };
  }
}

/**
 * Verifies resolution proof: "after" photo must be within 50 meters of the original problem location
 */
export function verifyResolutionDistance(
  originalLat: number,
  originalLng: number,
  proofLat: number,
  proofLng: number
): { isValid: boolean; distanceMeters: number; message: string } {
  const distance = calculateHaversineDistance(originalLat, originalLng, proofLat, proofLng);

  if (distance <= 50) {
    return {
      isValid: true,
      distanceMeters: distance,
      message: `Resolution proof verified! Photo taken at the exact issue spot (${Math.round(distance)}m away, limit 50m).`,
    };
  } else {
    return {
      isValid: false,
      distanceMeters: distance,
      message: `Resolution rejected: Resolution photo was taken ${Math.round(distance)}m away from the reported civic problem. You must be within 50m of the original spot.`,
    };
  }
}
