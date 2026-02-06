// models/Payment.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  orderId: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  paymentId: string; // Razorpay/Stripe payment ID
  amount: number;
  currency: string;
  method: 'card' | 'upi' | 'netbanking' | 'cod' | 'wallet';
  status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded';
  gateway: 'razorpay' | 'stripe' | 'paytm' | 'phonepe' | 'googlepay' | 'mock' | 'cod';
  gatewayTransactionId?: string;
  gatewayResponse?: any;
  refundId?: string;
  refundAmount?: number;
  refundedAt?: Date;
  failureReason?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>({
  orderId: {
    type: Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  paymentId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR']
  },
  method: {
    type: String,
    enum: ['card', 'upi', 'netbanking', 'cod', 'wallet'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  gateway: {
    type: String,
    enum: ['razorpay', 'stripe', 'paytm', 'phonepe', 'googlepay', 'mock', 'cod'],
    required: true
  },
  gatewayTransactionId: {
    type: String,
    trim: true
  },
  gatewayResponse: {
    type: Schema.Types.Mixed
  },
  refundId: {
    type: String,
    trim: true
  },
  refundAmount: {
    type: Number,
    min: 0
  },
  refundedAt: Date,
  failureReason: {
    type: String,
    trim: true
  },
  metadata: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes
PaymentSchema.index({ orderId: 1 });
PaymentSchema.index({ userId: 1 });
PaymentSchema.index({ paymentId: 1 }, { unique: true });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ createdAt: -1 });

export default mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
