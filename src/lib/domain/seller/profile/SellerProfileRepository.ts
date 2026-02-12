import Seller, { ISeller } from "@/models/Seller";
import Product from "@/models/Product";
import Order from "@/models/Order";
import Review from "@/models/Review";
import { hashPassword, verifyPassword } from "@/lib/middleware/authUtils";
import mongoose from 'mongoose';
import { 
  SellerNotFoundError, 
  ProfileFetchError, 
  ProfileUpdateError,
  PasswordChangeError,
  InvalidPasswordError,
  DocumentUploadError,
  VerificationRequestError,
  AlreadyVerifiedError,
  VerificationPendingError,
  ProfileStatsError
} from "./SellerProfileErrors";

export interface SellerProfile {
  id: string;
  businessName: string;
  contactPerson: string;
  email: string;
  phone?: string;
  address?: string;
  status: string;
  verified: boolean;
  commission: number;
  createdAt: Date;
  totalProducts: number;
  totalSales: number;
  rating: number;
}

export interface UpdateProfileData {
  businessName?: string;
  contactPerson?: string;
  phone?: string;
  address?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface DocumentUploadData {
  type: string;
  url: string;
  publicId: string;
}

export interface DocumentInfo {
  url: string;
  publicId: string;
  uploadedAt: Date;
}

export interface VerificationStatus {
  status: string;
  requestedAt: Date;
}

export interface ProfileStats {
  profile: {
    businessName: string;
    email: string;
    phone: string;
    status: string;
    verified: boolean;
    joinedAt: Date;
  };
  performance: {
    totalProducts: number;
    activeProducts: number;
    totalOrders: number;
    completedOrders: number;
    totalRevenue: number;
    monthlyRevenue: number;
    averageRating: number;
    totalReviews: number;
    monthlyOrders: number;
  };
  metrics: {
    conversionRate: number;
    averageOrderValue: number;
    productPerformance: number;
  };
}

export class SellerProfileRepository {
  async findById(sellerId: string): Promise<SellerProfile> {
    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      throw new SellerNotFoundError(sellerId);
    }

    const sellerData = await Seller.findById(sellerId)
      .select('businessName contactPerson email phone address status verified commission createdAt')
      .lean() as ISeller | null;

    if (!sellerData) {
      throw new SellerNotFoundError(sellerId);
    }

    // Get additional stats that the ProfileOverview component expects
    const sellerProducts = await Product.find({ sellerId }).select('_id').lean();
    const productIds = sellerProducts.map(p => p._id);

    let totalProducts = sellerProducts.length;
    let totalSales = 0;
    let rating = 0;

    if (productIds.length > 0) {
      // Get total sales (completed orders)
      totalSales = await Order.countDocuments({
        'items.productId': { $in: productIds },
        paymentStatus: 'paid',
        orderStatus: 'delivered'
      });

      // Get average rating from reviews
      const reviewStats = await Review.aggregate([
        { $match: { productId: { $in: productIds }, status: 'approved' } },
        { $group: { _id: null, averageRating: { $avg: '$rating' } } }
      ]);
      rating = reviewStats[0]?.averageRating || 0;
    }

    return {
      id: sellerData._id.toString(),
      businessName: sellerData.businessName,
      contactPerson: sellerData.contactPerson,
      email: sellerData.email,
      phone: sellerData.phone,
      address: sellerData.address,
      status: sellerData.status,
      verified: sellerData.verified,
      commission: sellerData.commission,
      createdAt: sellerData.createdAt,
      // Additional fields that ProfileOverview expects
      totalProducts,
      totalSales,
      rating: Math.round(rating * 10) / 10, // Round to 1 decimal
    };
  }

  async update(sellerId: string, data: UpdateProfileData): Promise<SellerProfile> {
    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      throw new SellerNotFoundError(sellerId);
    }

    const sellerDoc = await Seller.findById(sellerId);
    if (!sellerDoc) {
      throw new SellerNotFoundError(sellerId);
    }

    // Update profile fields
    if (data.businessName !== undefined) sellerDoc.businessName = data.businessName;
    if (data.contactPerson !== undefined) sellerDoc.contactPerson = data.contactPerson;
    if (data.phone !== undefined) sellerDoc.phone = data.phone;
    if (data.address !== undefined) sellerDoc.address = data.address;

    await sellerDoc.save();

    // Return updated profile with stats
    return await this.findById(sellerId);
  }

  async changePassword(sellerId: string, data: ChangePasswordData): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      throw new SellerNotFoundError(sellerId);
    }

    // Get seller with password field
    const sellerDoc = await Seller.findById(sellerId).select('+password');
    if (!sellerDoc) {
      throw new SellerNotFoundError(sellerId);
    }

    // Verify current password
    const isPasswordValid = await verifyPassword(data.currentPassword, sellerDoc.password);
    if (!isPasswordValid) {
      throw new InvalidPasswordError();
    }

    // Hash new password
    const hashedPassword = await hashPassword(data.newPassword);
    sellerDoc.password = hashedPassword;
    await sellerDoc.save();

    return true;
  }

  async uploadDocument(sellerId: string, data: DocumentUploadData): Promise<DocumentInfo> {
    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      throw new SellerNotFoundError(sellerId);
    }

    const sellerDoc = await Seller.findById(sellerId);
    if (!sellerDoc) {
      throw new SellerNotFoundError(sellerId);
    }

    // Initialize documents object if it doesn't exist
    if (!(sellerDoc as any).documents) {
      (sellerDoc as any).documents = {};
    }

    // Update the document
    const documentInfo = {
      url: data.url,
      publicId: data.publicId,
      uploadedAt: new Date(),
    };

    (sellerDoc as any).documents[data.type] = documentInfo;
    await sellerDoc.save();

    return documentInfo;
  }

  async deleteDocument(sellerId: string, documentType: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      throw new SellerNotFoundError(sellerId);
    }

    const sellerDoc = await Seller.findById(sellerId);
    if (!sellerDoc) {
      throw new SellerNotFoundError(sellerId);
    }

    // Remove the document from the documents object
    if ((sellerDoc as any).documents && (sellerDoc as any).documents[documentType]) {
      delete (sellerDoc as any).documents[documentType];
      await sellerDoc.save();
    }

    return true;
  }

  async requestVerification(sellerId: string): Promise<VerificationStatus> {
    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      throw new SellerNotFoundError(sellerId);
    }

    const sellerDoc = await Seller.findById(sellerId);
    if (!sellerDoc) {
      throw new SellerNotFoundError(sellerId);
    }

    // Check if already verified
    if (sellerDoc.verified) {
      throw new AlreadyVerifiedError();
    }

    // Check if verification is already pending
    if ((sellerDoc as any).verificationStatus === 'pending') {
      throw new VerificationPendingError();
    }

    // Update verification status
    (sellerDoc as any).verificationStatus = 'pending';
    const requestedAt = new Date();
    (sellerDoc as any).verificationRequestedAt = requestedAt;
    await sellerDoc.save();

    return {
      status: 'pending',
      requestedAt,
    };
  }

  async getProfileStats(sellerId: string): Promise<ProfileStats> {
    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      throw new SellerNotFoundError(sellerId);
    }

    // Get seller data
    const sellerData = await Seller.findById(sellerId).lean() as ISeller | null;
    if (!sellerData) {
      throw new SellerNotFoundError(sellerId);
    }

    // Get product stats
    const totalProducts = await Product.countDocuments({ sellerId });
    const activeProducts = await Product.countDocuments({ 
      sellerId, 
      status: 'APPROVED',
      isPublished: true
    });

    // Get order stats - Orders contain items with sellerId, not direct sellerId
    const sellerProducts = await Product.find({ sellerId }).select('_id').lean();
    const productIds = sellerProducts.map(p => p._id);

    let totalOrders = 0;
    let completedOrders = 0;
    let totalRevenue = 0;
    let monthlyOrders = 0;
    let monthlyRevenue = 0;

    if (productIds.length > 0) {
      // Get order stats using product IDs
      totalOrders = await Order.countDocuments({ 
        'items.productId': { $in: productIds },
        paymentStatus: 'paid',
        orderStatus: 'delivered'
      });
      
      completedOrders = await Order.countDocuments({ 
        'items.productId': { $in: productIds },
        paymentStatus: 'paid',
        orderStatus: 'delivered'
      });

      // Get revenue stats using aggregation for seller-specific amounts
      const revenueResult = await Order.aggregate([
        { $match: { 'items.productId': { $in: productIds }, paymentStatus: 'paid', orderStatus: 'delivered' } },
        { $unwind: '$items' },
        { $match: { 'items.productId': { $in: productIds } } },
        { $group: { _id: null, totalRevenue: { $sum: '$items.totalPrice' } } }
      ]);
      totalRevenue = revenueResult[0]?.totalRevenue || 0;

      // Calculate this month's stats
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      monthlyOrders = await Order.countDocuments({
        'items.productId': { $in: productIds },
        paymentStatus: 'paid',
        orderStatus: 'delivered',
        createdAt: { $gte: startOfMonth }
      });

      const monthlyRevenueResult = await Order.aggregate([
        { 
          $match: { 
            'items.productId': { $in: productIds },
            paymentStatus: 'paid',
            orderStatus: 'delivered',
            createdAt: { $gte: startOfMonth }
          } 
        },
        { $unwind: '$items' },
        { $match: { 'items.productId': { $in: productIds } } },
        { $group: { _id: null, monthlyRevenue: { $sum: '$items.totalPrice' } } }
      ]);
      monthlyRevenue = monthlyRevenueResult[0]?.monthlyRevenue || 0;
    }

    // Get review stats - Reviews are linked to products, not sellers directly
    let averageRating = 0;
    let totalReviews = 0;

    if (productIds.length > 0) {
      const reviewStats = await Review.aggregate([
        { $match: { productId: { $in: productIds }, status: 'approved' } },
        { 
          $group: { 
            _id: null, 
            averageRating: { $avg: '$rating' },
            totalReviews: { $sum: 1 }
          } 
        }
      ]);
      averageRating = reviewStats[0]?.averageRating || 0;
      totalReviews = reviewStats[0]?.totalReviews || 0;
    }

    return {
      profile: {
        businessName: sellerData.businessName || '',
        email: sellerData.email || '',
        phone: sellerData.phone || '',
        status: sellerData.status || 'pending',
        verified: sellerData.verified || false,
        joinedAt: sellerData.createdAt || new Date(),
      },
      performance: {
        totalProducts,
        activeProducts,
        totalOrders,
        completedOrders,
        totalRevenue,
        monthlyRevenue,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
        monthlyOrders,
      },
      metrics: {
        conversionRate: totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0,
        averageOrderValue: completedOrders > 0 ? Math.round(totalRevenue / completedOrders) : 0,
        productPerformance: activeProducts > 0 ? Math.round((totalOrders / activeProducts) * 100) / 100 : 0,
      }
    };
  }
}

export const sellerProfileRepository = new SellerProfileRepository();