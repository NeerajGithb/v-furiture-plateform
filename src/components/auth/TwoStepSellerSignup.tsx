'use client';

import React, { useState, useRef } from 'react';
import { useNavigate } from '@/components/NavigationLoader';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Lock, Eye, EyeOff, Building2, ArrowRight, ArrowLeft,
  CheckCircle, Shield, Store, User, Phone, MapPin
} from 'lucide-react';
import {
  useSellerSignupStep1, useVerifySignupOtp,
  useSellerSignupStep2, useResendSignupOtp
} from '@/hooks/useAuth';

interface Step1Data {
  email: string;
  password: string;
  confirmPassword: string;
}

interface Step2Data {
  businessName: string;
  contactPerson: string;
  phone: string;
  address: string;
  businessType: string;
  gstNumber: string;
}

type SignupStep = 'email' | 'otp' | 'business' | 'success';

function getPasswordChecks(password: string) {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
}

const passwordRules = [
  { key: 'minLength' as const, label: 'At least 8 characters' },
  { key: 'hasUppercase' as const, label: 'One uppercase letter' },
  { key: 'hasNumber' as const, label: 'One number' },
  { key: 'hasSpecial' as const, label: 'One special character' },
];

const stepConfig = [
  { id: 'email', title: 'Account Setup', icon: Mail },
  { id: 'otp', title: 'Email Verification', icon: Shield },
  { id: 'business', title: 'Business Info', icon: Building2 },
  { id: 'success', title: 'Complete', icon: CheckCircle },
];

export default function TwoStepSellerSignup() {
  const router = useNavigate();
  const [currentStep, setCurrentStep] = useState<SignupStep>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const [step1Data, setStep1Data] = useState<Step1Data>({ email: '', password: '', confirmPassword: '' });
  const [step2Data, setStep2Data] = useState<Step2Data>({
    businessName: '', contactPerson: '', phone: '', address: '', businessType: '', gstNumber: '',
  });

  const signupStep1 = useSellerSignupStep1();
  const verifyOtp = useVerifySignupOtp();
  const signupStep2 = useSellerSignupStep2();
  const resendOtp = useResendSignupOtp();

  const isLoading = signupStep1.isPending || verifyOtp.isPending || signupStep2.isPending || resendOtp.isPending;
  const error = signupStep1.error || verifyOtp.error || signupStep2.error || resendOtp.error;

  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // OTP input helpers
  const focusOtpAt = (i: number) => otpInputsRef.current[Math.min(Math.max(i, 0), 5)]?.focus();

  const handleOtpChange = (i: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    if (!digit) return;
    const next = otpCode.padEnd(6, ' ').split('');
    next[i] = digit;
    setOtpCode(next.join('').trimEnd());
    if (i < 5) focusOtpAt(i + 1);
  };

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = otpCode.padEnd(6, ' ').split('');
      if (next[i]?.trim()) {
        next[i] = ' ';
        setOtpCode(next.join('').trimEnd());
      } else if (i > 0) {
        next[i - 1] = ' ';
        setOtpCode(next.join('').trimEnd());
        focusOtpAt(i - 1);
      }
    } else if (e.key === 'ArrowLeft') focusOtpAt(i - 1);
    else if (e.key === 'ArrowRight') focusOtpAt(i + 1);
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    setOtpCode(pasted);
    focusOtpAt(Math.min(pasted.length, 5));
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const checks = getPasswordChecks(step1Data.password);
    if (!Object.values(checks).every(Boolean)) return;
    if (step1Data.password !== step1Data.confirmPassword) return;
    signupStep1.mutate({ email: step1Data.email, password: step1Data.password }, {
      onSuccess: () => { setCurrentStep('otp'); startResendCooldown(); }
    });
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyOtp.mutate({ email: step1Data.email, otp: otpCode }, {
      onSuccess: () => { setCurrentStep('business'); setOtpCode(''); }
    });
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    signupStep2.mutate({ email: step1Data.email, ...step2Data }, {
      onSuccess: () => setCurrentStep('success')
    });
  };

  const handleResendOtp = () => {
    if (resendCooldown > 0 || isLoading) return;
    setOtpCode('');
    resendOtp.mutate({ email: step1Data.email }, { onSuccess: () => startResendCooldown() });
  };

  const passwordChecks = getPasswordChecks(step1Data.password);
  const passwordValid = Object.values(passwordChecks).every(Boolean);
  const passwordsMatch = step1Data.password === step1Data.confirmPassword;

  const inputClass = "w-full px-4 py-3 text-sm border border-slate-300 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all";
  const iconInputClass = "w-full pl-10 pr-4 py-3 text-sm border border-slate-300 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
      {/* Form Panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8 border border-slate-200">
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-slate-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Store className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Join as Seller</h1>
              <p className="text-sm text-slate-500 mt-1">Start selling on VFurniture</p>
            </div>

            <AnimatePresence mode="wait">
              {/* Step 1: Email + Password */}
              {currentStep === 'email' && (
                <motion.div key="email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <form onSubmit={handleStep1Submit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="email" value={step1Data.email}
                          onChange={(e) => setStep1Data({ ...step1Data, email: e.target.value })}
                          className={iconInputClass} placeholder="your@email.com" required />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type={showPassword ? 'text' : 'password'} value={step1Data.password}
                          onChange={(e) => setStep1Data({ ...step1Data, password: e.target.value })}
                          className="w-full pl-10 pr-10 py-3 text-sm border border-slate-300 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all"
                          placeholder="Min. 8 characters" required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {step1Data.password.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {passwordRules.map(({ key, label }) => (
                            <li key={key} className={`flex items-center gap-1.5 text-xs ${passwordChecks[key] ? 'text-green-600' : 'text-red-500'}`}>
                              <span>{passwordChecks[key] ? '✓' : '✗'}</span>{label}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type={showConfirmPassword ? 'text' : 'password'} value={step1Data.confirmPassword}
                          onChange={(e) => setStep1Data({ ...step1Data, confirmPassword: e.target.value })}
                          className="w-full pl-10 pr-10 py-3 text-sm border border-slate-300 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all"
                          placeholder="Confirm your password" required />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {step1Data.confirmPassword.length > 0 && !passwordsMatch && (
                        <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
                      )}
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{(error as Error).message}</p>
                      </div>
                    )}

                    <button type="submit" disabled={isLoading || !passwordValid || !passwordsMatch || !step1Data.email}
                      className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      {isLoading ? 'Sending Code...' : <><span>Send Verification Code</span><ArrowRight className="w-4 h-4" /></>}
                    </button>
                  </form>
                </motion.div>
              )}

              {/* Step 2: OTP Verification */}
              {currentStep === 'otp' && (
                <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Mail className="w-6 h-6 text-slate-600" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900">Check your email</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      We sent a 6-digit code to <span className="font-medium text-slate-700">{step1Data.email}</span>
                    </p>
                  </div>

                  <form onSubmit={handleOtpSubmit} className="space-y-4">
                    <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                      {Array(6).fill('').map((_, i) => (
                        <input key={i}
                          ref={(el) => { otpInputsRef.current[i] = el; }}
                          type="text" inputMode="numeric" maxLength={1}
                          className="w-11 h-12 text-center text-lg font-bold border-2 border-slate-300 rounded-lg focus:border-slate-900 focus:outline-none transition-colors disabled:opacity-50 bg-white text-slate-900"
                          value={otpCode[i] || ''}
                          disabled={isLoading}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        />
                      ))}
                    </div>

                    <p className="text-xs text-slate-400 text-center">Code expires in 5 minutes</p>

                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{(error as Error).message}</p>
                      </div>
                    )}

                    <button type="submit" disabled={isLoading || otpCode.replace(/\s/g, '').length !== 6}
                      className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      {isLoading ? 'Verifying...' : <><span>Verify Code</span><ArrowRight className="w-4 h-4" /></>}
                    </button>

                    <div className="flex items-center justify-between text-sm">
                      <button type="button" onClick={() => setCurrentStep('email')}
                        className="text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors">
                        <ArrowLeft className="w-4 h-4" />Change Email
                      </button>
                      <button type="button" onClick={handleResendOtp}
                        disabled={resendCooldown > 0 || isLoading}
                        className="text-slate-600 hover:text-slate-900 disabled:text-slate-400 transition-colors font-medium">
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Step 3: Business Info */}
              {currentStep === 'business' && (
                <motion.div key="business" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="text-center mb-5">
                    <h3 className="text-base font-semibold text-slate-900">Business Information</h3>
                    <p className="text-sm text-slate-500">Tell us about your business</p>
                  </div>

                  <form onSubmit={handleStep2Submit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Business Name *</label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input type="text" value={step2Data.businessName}
                            onChange={(e) => setStep2Data({ ...step2Data, businessName: e.target.value })}
                            className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all"
                            placeholder="Business name" required />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Contact Person *</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input type="text" value={step2Data.contactPerson}
                            onChange={(e) => setStep2Data({ ...step2Data, contactPerson: e.target.value })}
                            className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all"
                            placeholder="Full name" required />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Phone *</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input type="tel" value={step2Data.phone}
                            onChange={(e) => setStep2Data({ ...step2Data, phone: e.target.value })}
                            className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all"
                            placeholder="+91 98765 43210" required />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Business Type *</label>
                        <select value={step2Data.businessType}
                          onChange={(e) => setStep2Data({ ...step2Data, businessType: e.target.value })}
                          className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all"
                          required>
                          <option value="">Select type</option>
                          <option value="manufacturer">Manufacturer</option>
                          <option value="wholesaler">Wholesaler</option>
                          <option value="retailer">Retailer</option>
                          <option value="distributor">Distributor</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Business Address *</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <textarea value={step2Data.address}
                          onChange={(e) => setStep2Data({ ...step2Data, address: e.target.value })}
                          className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all resize-none"
                          placeholder="Full business address" rows={2} required />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">GST Number <span className="font-normal text-slate-400">(Optional)</span></label>
                      <input type="text" value={step2Data.gstNumber}
                        onChange={(e) => setStep2Data({ ...step2Data, gstNumber: e.target.value })}
                        className={inputClass} placeholder="GST registration number" />
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{(error as Error).message}</p>
                      </div>
                    )}

                    <div className="flex gap-3 pt-1">
                      <button type="button" onClick={() => setCurrentStep('otp')}
                        className="flex-1 py-2.5 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-1">
                        <ArrowLeft className="w-4 h-4" />Back
                      </button>
                      <button type="submit" disabled={isLoading}
                        className="flex-[2] py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        {isLoading ? 'Creating Account...' : 'Complete Registration'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Step 4: Success */}
              {currentStep === 'success' && (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-5">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">Registration Complete</h3>
                    <p className="text-sm text-slate-500">Your seller account is pending admin approval.</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-left">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">What happens next?</h4>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• Admin review within 1-2 business days</li>
                      <li>• Email notification once approved</li>
                      <li>• Start adding products after approval</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <button onClick={() => router.push('/login/seller')}
                      className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg transition-all">
                      Go to Login
                    </button>
                    <button onClick={() => router.push('/')}
                      className="w-full py-2.5 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors">
                      Back to Home
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {currentStep !== 'success' && (
              <p className="mt-6 text-center text-sm text-slate-500">
                Already have an account?{' '}
                <button onClick={() => router.push('/login/seller')} className="text-slate-900 font-semibold hover:underline">
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="hidden lg:flex w-80 bg-slate-900 p-8 flex-col justify-center text-white">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-2">Start Selling Today</h2>
            <p className="text-slate-400 text-sm">Join thousands of sellers on VFurniture</p>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Registration Steps</p>
            {stepConfig.map((step) => {
              const Icon = step.icon;
              const stepOrder = ['email', 'otp', 'business', 'success'];
              const currentIdx = stepOrder.indexOf(currentStep);
              const stepIdx = stepOrder.indexOf(step.id);
              const isCompleted = stepIdx < currentIdx;
              const isActive = step.id === currentStep;
              return (
                <div key={step.id} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${isCompleted ? 'bg-green-500' : isActive ? 'bg-white' : 'bg-slate-700'}`}>
                    {isCompleted
                      ? <CheckCircle className="w-4 h-4 text-white" />
                      : <Icon className={`w-4 h-4 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                    }
                  </div>
                  <span className={`text-sm font-medium ${isActive ? 'text-white' : isCompleted ? 'text-green-400' : 'text-slate-500'}`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
