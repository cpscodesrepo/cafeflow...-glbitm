/**
 * Utility functions for CafeFlow Token Timing and Expiry calculations.
 * Always operates in the 'Asia/Kolkata' timezone with a strict 60-minute production rule.
 */

export const TOKEN_EXPIRY_MINUTES = 60; // Production rule: 60 minutes after token creation

export type DisplayTokenStatus = 'WAITING' | 'SERVING' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';

/**
 * Calculates expiry Date object 60 minutes after createdAt
 */
export function calculateExpiryTime(createdAt: string | Date, minutes: number = TOKEN_EXPIRY_MINUTES): Date {
  const createdDate = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
  return new Date(createdDate.getTime() + minutes * 60 * 1000);
}

/**
 * Formats a Date/ISO string to HH:MM:SS AM/PM IST in Asia/Kolkata
 */
export function formatISTTime(dateInput: string | Date): string {
  if (!dateInput) return '--:--:--';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '--:--:--';

  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(date);
}

/**
 * Formats a Date/ISO string to Day, DD Mon YYYY in Asia/Kolkata
 */
export function formatISTDate(dateInput: string | Date): string {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Calculates remaining seconds until 60-minute expiry.
 * Returns 0 if already expired.
 */
export function getRemainingSeconds(createdAt: string | Date, minutes: number = TOKEN_EXPIRY_MINUTES): number {
  const expiryDate = calculateExpiryTime(createdAt, minutes);
  const now = new Date();
  const diffMs = expiryDate.getTime() - now.getTime();
  return Math.max(0, Math.floor(diffMs / 1000));
}

/**
 * Formats remaining seconds into HH:MM:SS format
 */
export function formatCountdown(totalSeconds: number): string {
  if (totalSeconds <= 0) {
    return '00:00:00';
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Checks if token has passed the 60-minute window
 */
export function isTokenExpired(createdAt: string | Date, minutes: number = TOKEN_EXPIRY_MINUTES): boolean {
  return getRemainingSeconds(createdAt, minutes) <= 0;
}

/**
 * Maps system status & time to the 5 requested status badges:
 * WAITING, SERVING, COMPLETED, EXPIRED, CANCELLED
 */
export function resolveDisplayStatus(
  systemStatus: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled',
  createdAt: string | Date,
  minutes: number = TOKEN_EXPIRY_MINUTES
): DisplayTokenStatus {
  if (systemStatus === 'cancelled') return 'CANCELLED';
  if (systemStatus === 'completed') return 'COMPLETED';

  // If countdown reached zero, mark EXPIRED
  if (isTokenExpired(createdAt, minutes)) {
    return 'EXPIRED';
  }

  if (systemStatus === 'ready' || systemStatus === 'preparing') {
    return 'SERVING';
  }

  return 'WAITING';
}
