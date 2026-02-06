// components/auth/OTPInput.tsx

'use client';

import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';

interface OTPInputProps {
  loading: boolean;
  error: string | null;
  code: string;
  email: string;
  onCodeChange: (code: string) => void;
  onResend: () => void;
}

const smoothEasing: [number, number, number, number] = [0.4, 0, 0.2, 1];
const easeOut: [number, number, number, number] = [0.0, 0.0, 0.2, 1];
const stepVariants = {
    enter: { x: '20%', opacity: 0 },
    center: {
        x: 0,
        opacity: 1,
        transition: {
            x: { duration: 0.4, ease: smoothEasing },
            opacity: { duration: 0.3, ease: easeOut },
        },
    },
    exit: {
        x: '-20%',
        opacity: 0,
        transition: { duration: 0.3, ease: smoothEasing },
    },
};

export default function OTPInput({
    loading,
    error,
    code,
    email,
    onCodeChange,
    onResend,
}: OTPInputProps) {
    return (
        <motion.div
            className="space-y-4"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
        >
            <div className="text-center space-y-2">
                <motion.div
                    className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full mb-4"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, ease: smoothEasing }}
                >
                    <Mail className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900">Check your email</h3>
                <p className="text-sm text-gray-600">
                    We sent a 6-digit code to <span className="font-semibold">{email}</span>
                </p>
            </div>

            <div
                className="flex justify-center gap-3"
                onPaste={(e) => {
                    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                    if (pasted.length === 6) {
                        onCodeChange(pasted);
                    }
                    e.preventDefault();
                }}
            >
                {Array(6)
                    .fill('')
                    .map((_, i) => (
                        <motion.input
                            key={i}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            className="w-12 h-12 text-center text-lg font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors bg-white disabled:opacity-50 disabled:bg-gray-50 text-gray-900"
                            value={code[i] || ''}
                            disabled={loading}
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.2, delay: i * 0.1, ease: smoothEasing }}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                if (!val) return;

                                const newCode = code.split('');
                                newCode[i] = val[0];
                                onCodeChange(newCode.join(''));

                                const next = e.target.nextSibling as HTMLInputElement;
                                if (val && next?.focus) next.focus();
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Backspace') {
                                    const newCode = code.split('');
                                    newCode[i] = '';
                                    onCodeChange(newCode.join(''));

                                    if (i > 0 && !code[i]) {
                                        const prev = e.currentTarget.previousSibling as HTMLInputElement;
                                        if (prev?.focus) prev.focus();
                                    }
                                }
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#3b82f6';
                                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#d1d5db';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                    ))}
            </div>

            <p className="text-xs text-gray-500 text-center">Code expires in 5 minutes</p>

            {error && (
                <motion.div
                    className="text-sm text-red-600 text-center bg-red-50 border border-red-200 p-3 rounded-lg"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.15, ease: smoothEasing }}
                >
                    {error}
                </motion.div>
            )}

            <div className="text-center">
                <button
                    type="button"
                    disabled={loading}
                    onClick={onResend}
                    className="text-sm text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                    {loading ? 'Sending...' : "Didn't receive the code? Resend"}
                </button>
            </div>
        </motion.div>
    );
}