import crypto from "crypto";

/**
 * Generates a cryptographically secure 6-digit OTP with a random salt.
 * Returns both the plain OTP (to send to user) and the salt (to store alongside the hash).
 */
export function generateOtp(): { otp: string; salt: string } {
  const salt = crypto.randomBytes(16).toString("hex");
  const otp = crypto.randomInt(100000, 999999).toString();
  return { otp, salt };
}

/**
 * Hashes an OTP with its salt using SHA-256.
 * Store this hash + salt in the DB; never store the plain OTP.
 */
export function hashOtp(otp: string, salt: string): string {
  return crypto.createHmac("sha256", salt).update(otp).digest("hex");
}

/**
 * Verifies a plain OTP against a stored hash + salt.
 */
export function verifyOtp(otp: string, salt: string, storedHash: string): boolean {
  const hash = hashOtp(otp, salt);
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(storedHash));
}
