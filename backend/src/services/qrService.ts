import crypto from 'crypto';
import QRCode from 'qrcode';
import env from '../config/env';

/**
 * Generate a secure QR code token for a session
 */
export function generateQRToken(sessionId: string): string {
  const timestamp = Date.now();
  const data = `${sessionId}:${timestamp}`;
  const hmac = crypto.createHmac('sha256', env.QR_CODE_SECRET);
  hmac.update(data);
  const signature = hmac.digest('hex');
  return `${data}:${signature}`;
}

/**
 * Validate and decode QR code token
 */
export function validateQRToken(token: string): { sessionId: string; timestamp: number } | null {
  try {
    const parts = token.split(':');
    if (parts.length !== 3) return null;

    const [sessionId, timestampStr, signature] = parts;
    const timestamp = parseInt(timestampStr, 10);

    if (isNaN(timestamp)) return null;

    // Verify signature
    const data = `${sessionId}:${timestamp}`;
    const hmac = crypto.createHmac('sha256', env.QR_CODE_SECRET);
    hmac.update(data);
    const expectedSignature = hmac.digest('hex');

    if (signature !== expectedSignature) return null;

    // Check if token is not too old (max 10 minutes)
    const maxAge = 10 * 60 * 1000; // 10 minutes
    if (Date.now() - timestamp > maxAge) return null;

    return { sessionId, timestamp };
  } catch (error) {
    return null;
  }
}

/**
 * Generate QR code image as data URL
 */
export async function generateQRCodeImage(data: string): Promise<string> {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 400,
      margin: 2,
    });
    return qrCodeDataURL;
  } catch (error) {
    throw new Error('Failed to generate QR code image');
  }
}

