// 🔐 INDUSTRY STANDARD OTP SERVICE - SECURE IMPLEMENTATION
import { sendEmail, getVerificationOTPEmailHTML } from '@/lib/emailService';
import { Redis } from "@upstash/redis";
import bcrypt from 'bcryptjs';

// 🏆 REDIS CLIENT - The gold standard for OTP storage
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// 🔒 SECURITY CONSTANTS
const OTP_TTL_SECONDS = 300; // 5 minutes (industry standard)
const MAX_ATTEMPTS = 5; // Brute force protection
const RATE_LIMIT_TTL = 3600; // 1 hour rate limit
const MAX_OTP_REQUESTS_PER_HOUR = 3; // Prevent spam

interface SecureOTPRecord {
  hashedOtp: string;
  email: string;
  attempts: number;
  verified: boolean;
  createdAt: number;
}

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// 🎯 STEP 1: Generate OTP (backend only, never exposed)
export function generateOTP(): string {
  // 6-digit OTP - industry standard
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 🔑 STEP 2: Hash and store OTP securely in Redis
export async function storeOTP(email: string, otp: string): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();
  
  // 🔐 HASH THE OTP - Never store plain text!
  const hashedOtp = await bcrypt.hash(otp, 10);
  
  const record: SecureOTPRecord = {
    hashedOtp,
    email: normalizedEmail,
    attempts: 0,
    verified: false,
    createdAt: Date.now(),
  };
  
  // 🏆 REDIS STORAGE with auto-expiry (TTL)
  const key = `otp:${normalizedEmail}`;
  await redis.set(key, record, { ex: OTP_TTL_SECONDS });
  
  console.log(`🔐 OTP stored securely for ${normalizedEmail} (expires in ${OTP_TTL_SECONDS}s)`);
}

// 🚨 STEP 3: Rate limiting protection
export async function checkRateLimit(email: string): Promise<{ allowed: boolean; remaining: number }> {
  const normalizedEmail = email.toLowerCase().trim();
  const rateLimitKey = `rate_limit:otp:${normalizedEmail}`;
  
  const record = await redis.get<RateLimitRecord>(rateLimitKey);
  const now = Date.now();
  
  if (!record) {
    // First request
    await redis.set(rateLimitKey, { count: 1, resetAt: now + RATE_LIMIT_TTL * 1000 }, { ex: RATE_LIMIT_TTL });
    return { allowed: true, remaining: MAX_OTP_REQUESTS_PER_HOUR - 1 };
  }
  
  if (now > record.resetAt) {
    // Reset window
    await redis.set(rateLimitKey, { count: 1, resetAt: now + RATE_LIMIT_TTL * 1000 }, { ex: RATE_LIMIT_TTL });
    return { allowed: true, remaining: MAX_OTP_REQUESTS_PER_HOUR - 1 };
  }
  
  if (record.count >= MAX_OTP_REQUESTS_PER_HOUR) {
    return { allowed: false, remaining: 0 };
  }
  
  // Increment count
  record.count++;
  await redis.set(rateLimitKey, record, { ex: RATE_LIMIT_TTL });
  
  return { allowed: true, remaining: MAX_OTP_REQUESTS_PER_HOUR - record.count };
}

// 🔍 STEP 4: Secure OTP verification with brute force protection
export async function verifyOTP(email: string, inputOtp: string): Promise<{ 
  success: boolean; 
  error?: string; 
  attemptsRemaining?: number 
}> {
  const normalizedEmail = email.toLowerCase().trim();
  const key = `otp:${normalizedEmail}`;
  
  const record = await redis.get<SecureOTPRecord>(key);
  
  if (!record) {
    return { success: false, error: 'Invalid or expired verification code' };
  }
  
  // 🚨 Check attempt limit (brute force protection)
  if (record.attempts >= MAX_ATTEMPTS) {
    await redis.del(key); // Delete OTP after max attempts
    return { success: false, error: 'Too many failed attempts. Please request a new code.' };
  }
  
  // Increment attempt count
  record.attempts++;
  await redis.set(key, record, { ex: OTP_TTL_SECONDS });
  
  // 🔐 SECURE COMPARISON using bcrypt
  const isValid = await bcrypt.compare(inputOtp, record.hashedOtp);
  
  if (!isValid) {
    const remaining = MAX_ATTEMPTS - record.attempts;
    return { 
      success: false, 
      error: `Invalid verification code. ${remaining} attempts remaining.`,
      attemptsRemaining: remaining
    };
  }
  
  // ✅ SUCCESS: Mark as verified
  record.verified = true;
  record.attempts = 0; // Reset attempts on success
  await redis.set(key, record, { ex: OTP_TTL_SECONDS });
  
  console.log(`✅ OTP verified successfully for ${normalizedEmail}`);
  return { success: true };
}

// 🔍 Check if email is verified
export async function isEmailVerified(email: string): Promise<boolean> {
  const normalizedEmail = email.toLowerCase().trim();
  const key = `otp:${normalizedEmail}`;
  
  const record = await redis.get<SecureOTPRecord>(key);
  return record ? record.verified : false;
}

// 🗑️ STEP 5: Immediate cleanup after use (one-time use)
export async function clearOTPRecord(email: string): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();
  const key = `otp:${normalizedEmail}`;
  
  await redis.del(key);
  console.log(`🗑️ OTP record deleted for ${normalizedEmail}`);
}

// 📧 STEP 6: Send OTP securely (never log or expose OTP)
export async function sendOTPEmail(email: string, otp: string, userName: string = 'User'): Promise<boolean> {
  try {
    // 🚨 RATE LIMITING CHECK
    const rateCheck = await checkRateLimit(email);
    if (!rateCheck.allowed) {
      console.error(`🚫 Rate limit exceeded for ${email}`);
      return false;
    }
    
    // 🔐 Store the hashed OTP in Redis
    await storeOTP(email, otp);
    
    // 🎨 Use centralized email template from emailService
    const html = getVerificationOTPEmailHTML(otp, userName);
    
    const emailSent = await sendEmail({
      to: email,
      subject: '🔐 Verify Your Email - VFurniture Seller Registration',
      html,
      text: `Hi ${userName},\n\nYour verification code is: ${otp}\n\nThis code expires in 5 minutes.\n\nIf you didn't request this, please ignore this email.`,
    });
    
    if (emailSent) {
      console.log(`📧 OTP sent successfully to ${email} (${rateCheck.remaining} requests remaining)`);
    }
    
    return emailSent;
  } catch (error) {
    console.error('❌ Failed to send OTP email:', error);
    return false;
  }
}