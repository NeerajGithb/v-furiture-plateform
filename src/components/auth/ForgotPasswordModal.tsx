'use client';

import { useState, useRef } from 'react';
import { X, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useSendResetCode, useVerifyResetCode, useResetPassword } from '@/hooks/useAuth';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userType: 'seller' | 'admin';
}

export default function ForgotPasswordModal({ isOpen, onClose, userType }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const sendResetCode = useSendResetCode();
  const verifyResetCode = useVerifyResetCode();
  const resetPassword = useResetPassword();

  const isLoading = sendResetCode.isPending || verifyResetCode.isPending || resetPassword.isPending;
  const error = sendResetCode.error || verifyResetCode.error || resetPassword.error;

  const handleClose = () => {
    setStep(1);
    setEmail('');
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    onClose();
  };

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    sendResetCode.mutate({ email, userType }, { onSuccess: () => setStep(2) });
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    verifyResetCode.mutate({ email, code, userType }, { onSuccess: () => setStep(3) });
  };

  const passwordChecks = {
    minLength: newPassword.length >= 8,
    hasUppercase: /[A-Z]/.test(newPassword),
    hasNumber: /\d/.test(newPassword),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword),
  };
  const passwordValid = Object.values(passwordChecks).every(Boolean);

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordValid || newPassword !== confirmPassword) return;
    resetPassword.mutate({ email, newPassword, userType }, { onSuccess: () => handleClose() });
  };

  const handleResendCode = () => {
    setCode('');
    sendResetCode.mutate({ email, userType });
  };

  const focusAt = (i: number) =>
    inputsRef.current[Math.min(Math.max(i, 0), 5)]?.focus();

  const handleChange = (i: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    if (!digit) return;
    const next = Array(6).fill('');
    for (let j = 0; j < code.length && j < 6; j++) next[j] = code[j] || '';
    next[i] = digit;
    setCode(next.join(''));
    if (i < 5) focusAt(i + 1);
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = Array(6).fill('');
      for (let j = 0; j < code.length && j < 6; j++) next[j] = code[j] || '';
      if (next[i]) {
        next[i] = '';
        setCode(next.join('').trimEnd());
      } else if (i > 0) {
        next[i - 1] = '';
        setCode(next.join('').trimEnd());
        focusAt(i - 1);
      }
    } else if (e.key === 'ArrowLeft') {
      focusAt(i - 1);
    } else if (e.key === 'ArrowRight') {
      focusAt(i + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = Array(6).fill('');
    pasted.split('').forEach((d, idx) => { next[idx] = d; });
    setCode(next.join('').trimEnd());
    focusAt(Math.min(pasted.length, 5));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none">
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Reset Password</h2>
          <p className="text-sm text-gray-500 mt-1">
            {step === 1 && 'Enter your email to receive a reset code'}
            {step === 2 && 'Enter the 6-digit code sent to your email'}
            {step === 3 && 'Create a new password'}
          </p>
        </div>

        <div className="flex items-center justify-center mb-6">
          {[1, 2, 3].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= stepNum ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {stepNum}
              </div>
              {stepNum < 3 && <div className={`w-12 h-0.5 mx-2 ${step > stepNum ? 'bg-gray-900' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
                placeholder="seller@example.com" required disabled={isLoading}
              />
            </div>
            {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error.message}</div>}
            <button type="submit" disabled={isLoading}
              className="w-full bg-gray-900 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-75 disabled:cursor-not-allowed transition-colors">
              {isLoading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-center">Verification Code</label>
              <div className="flex justify-center gap-2">
                {Array(6).fill('').map((_, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputsRef.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className="w-10 h-10 text-center text-lg font-medium border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
                    value={code[i] || ''}
                    disabled={isLoading}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                  />
                ))}
              </div>
            </div>
            {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error.message}</div>}
            <button type="submit" disabled={isLoading || !/^\d{6}$/.test(code)}
              className="w-full bg-gray-900 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-75 disabled:cursor-not-allowed transition-colors">
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </button>
            <button type="button" onClick={handleResendCode} disabled={isLoading}
              className="w-full text-sm text-gray-500 hover:text-gray-900 disabled:opacity-50 transition-colors">
              Didn't receive the code? Resend
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'} value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
                  placeholder="Enter new password" required disabled={isLoading}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {newPassword.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {[
                    { key: 'minLength' as const, label: 'At least 8 characters' },
                    { key: 'hasUppercase' as const, label: 'One uppercase letter' },
                    { key: 'hasNumber' as const, label: 'One number' },
                    { key: 'hasSpecial' as const, label: 'One special character' },
                  ].map(({ key, label }) => (
                    <li key={key} className={`flex items-center gap-1.5 text-xs ${passwordChecks[key] ? 'text-green-600' : 'text-red-500'}`}>
                      <span>{passwordChecks[key] ? '✓' : '✗'}</span>{label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'} value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
                placeholder="Confirm new password" required disabled={isLoading}
              />
              {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
              )}
            </div>
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error.message}</div>
            )}
            <button type="submit" disabled={isLoading || !passwordValid || newPassword !== confirmPassword}
              className="w-full bg-gray-900 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-75 disabled:cursor-not-allowed transition-colors">
              {isLoading ? 'Updating...' : 'Reset Password'}
            </button>
          </form>
        )}

        {step > 1 && (
          <button onClick={() => setStep((prev) => (prev - 1) as 1 | 2 | 3)} disabled={isLoading}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mt-4 mx-auto disabled:opacity-75 transition-colors">
            <ArrowLeft className="w-4 h-4" />Back
          </button>
        )}
      </div>
    </div>
  );
}