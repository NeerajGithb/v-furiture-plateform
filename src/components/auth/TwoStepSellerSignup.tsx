'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Building2, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  Shield,
  Store,
  UserCheck,
  FileText
} from 'lucide-react';
import { 
  useSellerSignupStep1, 
  useVerifySignupOtp, 
  useSellerSignupStep2, 
  useResendSignupOtp 
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

export default function TwoStepSellerSignup() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<SignupStep>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const [step1Data, setStep1Data] = useState<Step1Data>({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [step2Data, setStep2Data] = useState<Step2Data>({
    businessName: '',
    contactPerson: '',
    phone: '',
    address: '',
    businessType: '',
    gstNumber: '',
  });

  // Hooks
  const signupStep1 = useSellerSignupStep1();
  const verifyOtp = useVerifySignupOtp();
  const signupStep2 = useSellerSignupStep2();
  const resendOtp = useResendSignupOtp();

  const isLoading = signupStep1.isPending || verifyOtp.isPending || 
                   signupStep2.isPending || resendOtp.isPending;
  const error = signupStep1.error || verifyOtp.error || signupStep2.error || resendOtp.error;

  // Step 1: Email and Password
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();

    if (step1Data.password !== step1Data.confirmPassword) {
      return;
    }

    if (step1Data.password.length < 6) {
      return;
    }

    signupStep1.mutate({
      email: step1Data.email,
      password: step1Data.password,
    }, {
      onSuccess: () => {
        setCurrentStep('otp');
        startResendCooldown();
      }
    });
  };

  // OTP Verification
  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    verifyOtp.mutate({
      email: step1Data.email,
      otp: otpCode,
    }, {
      onSuccess: () => {
        setCurrentStep('business');
        setOtpCode('');
      }
    });
  };

  // Step 2: Business Information
  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();

    signupStep2.mutate({
      email: step1Data.email,
      password: step1Data.password,
      businessName: step2Data.businessName,
      contactPerson: step2Data.contactPerson,
      phone: step2Data.phone,
      address: step2Data.address,
      businessType: step2Data.businessType,
      gstNumber: step2Data.gstNumber,
    }, {
      onSuccess: () => {
        setCurrentStep('success');
      }
    });
  };

  // Resend OTP
  const handleResendOtp = () => {
    if (resendCooldown > 0) return;
    
    setOtpCode('');
    resendOtp.mutate({ email: step1Data.email }, {
      onSuccess: () => {
        startResendCooldown();
      }
    });
  };

  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const steps = [
    { id: 'email', title: 'Account Setup', icon: Mail, completed: ['otp', 'business', 'success'].includes(currentStep) },
    { id: 'otp', title: 'Email Verification', icon: Shield, completed: ['business', 'success'].includes(currentStep) },
    { id: 'business', title: 'Business Info', icon: Building2, completed: currentStep === 'success' },
    { id: 'success', title: 'Complete', icon: CheckCircle, completed: currentStep === 'success' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Join as Seller</h1>
              <p className="text-gray-600 mt-1">Start selling on VFurniture</p>
            </div>

            <AnimatePresence mode="wait">
              {/* Step 1: Email & Password */}
              {currentStep === 'email' && (
                <motion.div
                  key="email"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <form onSubmit={handleStep1Submit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={step1Data.email}
                          onChange={(e) => setStep1Data({ ...step1Data, email: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={step1Data.password}
                          onChange={(e) => setStep1Data({ ...step1Data, password: e.target.value })}
                          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Min. 6 characters"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={step1Data.confirmPassword}
                          onChange={(e) => setStep1Data({ ...step1Data, confirmPassword: e.target.value })}
                          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="Confirm password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {(error || (step1Data.password.length > 0 && step1Data.password.length < 6) || (step1Data.confirmPassword.length > 0 && step1Data.password !== step1Data.confirmPassword)) && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">
                          {error?.message || 
                           (step1Data.password.length > 0 && step1Data.password.length < 6 && 'Password must be at least 6 characters') ||
                           (step1Data.confirmPassword.length > 0 && step1Data.password !== step1Data.confirmPassword && 'Passwords do not match')}
                        </p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading || step1Data.password.length < 6 || step1Data.password !== step1Data.confirmPassword}
                      className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isLoading ? 'Sending Code...' : (
                        <>
                          Send Verification Code
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}

              {/* Step 2: OTP Verification */}
              {currentStep === 'otp' && (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Verify Your Email</h3>
                    <p className="text-sm text-gray-600">
                      We sent a 6-digit code to <span className="font-medium">{step1Data.email}</span>
                    </p>
                  </div>

                  <form onSubmit={handleOtpSubmit} className="space-y-4">
                    <div
                      className="flex justify-center gap-2"
                      onPaste={(e) => {
                        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                        if (pasted.length === 6) {
                          setOtpCode(pasted);
                        }
                        e.preventDefault();
                      }}
                    >
                      {Array(6).fill('').map((_, i) => (
                        <input
                          key={i}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          className="w-10 h-12 text-center text-lg font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors disabled:opacity-50"
                          value={otpCode[i] || ''}
                          disabled={isLoading}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            if (!val) return;

                            const newCode = otpCode.split('');
                            newCode[i] = val[0];
                            setOtpCode(newCode.join(''));

                            const next = e.target.nextSibling as HTMLInputElement;
                            if (val && next?.focus) next.focus();
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Backspace') {
                              const newCode = otpCode.split('');
                              newCode[i] = '';
                              setOtpCode(newCode.join(''));

                              if (i > 0 && !otpCode[i]) {
                                const prev = e.currentTarget.previousSibling as HTMLInputElement;
                                if (prev?.focus) prev.focus();
                              }
                            }
                          }}
                        />
                      ))}
                    </div>

                    <p className="text-xs text-gray-500 text-center">Code expires in 5 minutes</p>

                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                    )}

                    <div className="space-y-3">
                      <button
                        type="submit"
                        disabled={isLoading || otpCode.length !== 6}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isLoading ? 'Verifying...' : (
                          <>
                            Verify Code
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>

                      <div className="flex items-center justify-between text-sm">
                        <button
                          type="button"
                          onClick={() => setCurrentStep('email')}
                          className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          Change Email
                        </button>

                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={resendCooldown > 0 || isLoading}
                          className="text-blue-600 hover:text-blue-700 disabled:text-gray-400"
                        >
                          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                        </button>
                      </div>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Step 3: Business Information */}
              {currentStep === 'business' && (
                <motion.div
                  key="business"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Business Information</h3>
                    <p className="text-sm text-gray-600">Tell us about your business</p>
                  </div>

                  <form onSubmit={handleStep2Submit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                        <input
                          type="text"
                          value={step2Data.businessName}
                          onChange={(e) => setStep2Data({ ...step2Data, businessName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                          placeholder="Your business name"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                        <input
                          type="text"
                          value={step2Data.contactPerson}
                          onChange={(e) => setStep2Data({ ...step2Data, contactPerson: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                          placeholder="Your full name"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                          type="tel"
                          value={step2Data.phone}
                          onChange={(e) => setStep2Data({ ...step2Data, phone: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                          placeholder="+1 234 567 8900"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                        <select
                          value={step2Data.businessType}
                          onChange={(e) => setStep2Data({ ...step2Data, businessType: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                          required
                        >
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Business Address</label>
                      <textarea
                        value={step2Data.address}
                        onChange={(e) => setStep2Data({ ...step2Data, address: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                        placeholder="Your business address"
                        rows={2}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">GST Number (Optional)</label>
                      <input
                        type="text"
                        value={step2Data.gstNumber}
                        onChange={(e) => setStep2Data({ ...step2Data, gstNumber: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                        placeholder="GST registration number"
                      />
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setCurrentStep('otp')}
                        className="flex-1 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-1 text-sm"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                      </button>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-2 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 text-sm"
                      >
                        {isLoading ? 'Creating Account...' : 'Complete Registration'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Step 4: Success */}
              {currentStep === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-4"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Registration Complete!</h3>
                    <p className="text-sm text-gray-600">
                      Your seller account is pending admin approval.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h4 className="font-medium text-blue-900 mb-1 text-sm">What's Next?</h4>
                    <ul className="text-xs text-blue-800 space-y-1 text-left">
                      <li>• Admin review (1-2 business days)</li>
                      <li>• Email notification once approved</li>
                      <li>• Start adding products after approval</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => router.push('/login/seller')}
                      className="w-full py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-lg transition-all text-sm"
                    >
                      Go to Login
                    </button>

                    <button
                      onClick={() => router.push('/')}
                      className="w-full py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      Back to Home
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => router.push('/login/seller')}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  Login here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Information Panel */}
      <div className="w-96 bg-gradient-to-br from-green-600 to-emerald-700 p-8 flex flex-col justify-center text-white">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h2 className="text-3xl font-bold mb-2">Start Selling Today</h2>
            <p className="text-green-100">Join thousands of sellers on VFurniture</p>
          </div>

          {/* Steps Progress */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Registration Steps</h3>
            <div className="space-y-3">
              {steps.map((step) => {
                const Icon = step.icon;
                const isActive = step.id === currentStep;
                const isCompleted = step.completed;
                
                return (
                  <div key={step.id} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      isCompleted 
                        ? 'bg-white text-green-600' 
                        : isActive 
                          ? 'bg-green-500 text-white' 
                          : 'bg-green-800 text-green-300'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className={`font-medium ${isActive ? 'text-white' : 'text-green-100'}`}>
                        {step.title}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Why Sell With Us?</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Store className="w-5 h-5 text-green-300 mt-0.5" />
                <div>
                  <p className="font-medium">Easy Setup</p>
                  <p className="text-sm text-green-100">Quick registration and product listing</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <UserCheck className="w-5 h-5 text-green-300 mt-0.5" />
                <div>
                  <p className="font-medium">Trusted Platform</p>
                  <p className="text-sm text-green-100">Secure payments and buyer protection</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-green-300 mt-0.5" />
                <div>
                  <p className="font-medium">Analytics & Reports</p>
                  <p className="text-sm text-green-100">Track sales and manage inventory</p>
                </div>
              </div>
            </div>
          </div>

          {/* Support */}
          <div className="bg-green-800 bg-opacity-50 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Need Help?</h4>
            <p className="text-sm text-green-100 mb-3">
              Our support team is here to help you get started.
            </p>
            <button className="text-sm text-white underline hover:no-underline">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}