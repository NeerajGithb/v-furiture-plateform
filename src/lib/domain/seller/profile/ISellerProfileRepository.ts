import { 
  UpdateProfileData, 
  ChangePasswordData, 
  DocumentUploadData 
} from "./SellerProfileRepository";

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

export interface SellerStats {
  totalProducts: number;
  publishedProducts: number;
  totalOrders: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
}

export interface ISellerProfileRepository {
  // Profile queries
  getProfile(sellerId: string): Promise<SellerProfile>;
  getStats(sellerId: string): Promise<SellerStats>;
  
  // Profile management
  updateProfile(sellerId: string, data: UpdateProfileData): Promise<SellerProfile>;
  changePassword(sellerId: string, data: ChangePasswordData): Promise<void>;
  
  // Document management
  uploadDocument(sellerId: string, data: DocumentUploadData): Promise<void>;
  deleteDocument(sellerId: string, documentType: string): Promise<void>;
  
  // Verification
  requestVerification(sellerId: string): Promise<void>;
}