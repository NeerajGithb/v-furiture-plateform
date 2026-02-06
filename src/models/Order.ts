// models/Order.ts - Alternative compatible version
import mongoose, { Schema, Document, PopulatedDoc } from 'mongoose';

export interface IOrderItem {
  productId: PopulatedDoc<Document<mongoose.Types.ObjectId> & { name: string; mainImage: string; price: number; sellerId: mongoose.Types.ObjectId }>;
  sellerId: mongoose.Types.ObjectId; // Add sellerId to order items for marketplace calculations
  name: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  totalPrice: number; // Add totalPrice for easier calculations (price * quantity)
  selectedVariant?: {
    color?: string;
    size?: string;
    sku?: string;
  };
  productImage?: string;
}

export interface IShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface IOrder extends Document {
  userId: Schema.Types.ObjectId;
  orderNumber: string;
  items: IOrderItem[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  discount: number;
  totalAmount: number;
  shippingAddress: IShippingAddress;
  paymentMethod: 'card' | 'upi' | 'netbanking' | 'cod' | 'wallet';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  trackingNumber?: string;
  expectedDeliveryDate?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  refundAmount?: number;
  refundedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  confirmedAt?: Date;
  shippedAt?: Date;
  canCancel(): boolean;
  cancel(reason?: string): Promise<IOrder>;
  markAsDelivered(): Promise<IOrder>;
}

const OrderItemSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  sellerId: {
    type: Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  selectedVariant: {
    color: { type: String, trim: true },
    size: { type: String, trim: true },
    sku: { type: String, trim: true }
  },
  productImage: {
    type: String,
    trim: true
  }
}, { _id: false }); // Disable _id for subdocuments

// Clean up selectedVariant if empty
OrderItemSchema.pre('save', function(next) {
  if (this.selectedVariant && 
      typeof this.selectedVariant === 'object' &&
      !this.selectedVariant.color && 
      !this.selectedVariant.size && 
      !this.selectedVariant.sku) {
    this.selectedVariant = undefined;
  }
  next();
});

const ShippingAddressSchema = new Schema({
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  addressLine1: { type: String, required: true, trim: true },
  addressLine2: { type: String, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  postalCode: { type: String, required: true, trim: true },
  country: { type: String, required: true, default: 'India' }
}, { _id: false }); // Disable _id for subdocuments

const OrderSchema = new Schema<IOrder>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  items: {
    type: [OrderItemSchema],
    required: true,
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  shippingCost: {
    type: Number,
    default: 0,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  shippingAddress: {
    type: ShippingAddressSchema,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'netbanking', 'cod', 'wallet'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  trackingNumber: {
    type: String,
    trim: true
  },
  expectedDeliveryDate: Date,
  deliveredAt: Date,
  confirmedAt: Date,
  shippedAt: Date,
  cancelledAt: Date,
  cancellationReason: {
    type: String,
    trim: true
  },
  refundAmount: {
    type: Number,
    min: 0
  },
  refundedAt: Date,
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Indexes for performance  
OrderSchema.index({ userId: 1 });
OrderSchema.index({ orderStatus: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ 'items.sellerId': 1, paymentStatus: 1, orderStatus: 1 }); // For seller earnings queries
OrderSchema.index({ 'items.sellerId': 1, createdAt: -1 }); // For seller order history

// Generate order number pre-save hook (data generation only)
OrderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.orderNumber = `ORD-${timestamp}${random}`;
  }
  next();
});

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
