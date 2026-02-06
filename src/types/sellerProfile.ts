import { ApiResponse } from './common';

// Seller Profile Status Types
export type SellerProfileStatus = 'pending' | 'active' | 'suspended' | 'inactive';

// Document Types
export type DocumentType = 'gstCertificate' | 'panCard' | 'businessLicense' | 'addressProof';

// Seller Profile Types
export interface SellerProfile {
  id: string;
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  status: SellerProfileStatus;
  verified: boolean;
  commission: number;
  createdAt: string;
  updatedAt?: string;
  totalProducts: number;
  totalSales: number;
  rating: number;
  gstNumber?: string;
  businessType?: string;
  documents?: SellerDocument[];
}

export interface SellerDocument {
  id: string;
  type: DocumentType;
  fileName: string;
  fileUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

// Profile Stats Types
export interface SellerProfileStats {
  profile: {
    completionPercentage: number;
    verificationStatus: string;
    documentsUploaded: number;
    documentsRequired: number;
  };
  performance: {
    totalOrders: number;
    completedOrders: number;
    averageRating: number;
    responseTime: number;
  };
  metrics: {
    profileViews: number;
    productViews: number;
    conversionRate: number;
    customerSatisfaction: number;
  };
}

// Update Data Types
export interface ProfileUpdateData {
  businessName?: string;
  contactPerson?: string;
  phone?: string;
  address?: string;
  gstNumber?: string;
  businessType?: string;
}

export interface UpdateProfileRequest {
  businessName?: string;
  contactPerson?: string;
  phone?: string;
  address?: string;
  gstNumber?: string;
  businessType?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileStats {
  profile: {
    completionPercentage: number;
    verificationStatus: string;
    documentsUploaded: number;
    documentsRequired: number;
  };
  performance: {
    totalOrders: number;
    completedOrders: number;
    averageRating: number;
    responseTime: number;
  };
  metrics: {
    profileViews: number;
    productViews: number;
    conversionRate: number;
    customerSatisfaction: number;
  };
}

export interface DocumentUploadData {
  type: DocumentType;
  file: File;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// API Response Types
export interface SellerProfileResponse extends ApiResponse {
  data: {
    seller: SellerProfile;
  };
}

export interface SellerProfileStatsResponse extends ApiResponse {
  data: {
    stats: SellerProfileStats;
  };
}

export interface DocumentUploadResponse extends ApiResponse {
  data: {
    document: SellerDocument;
  };
}

// UI State Types
export interface SellerProfileUIState {
  isEditModalOpen: boolean;
  isPasswordModalOpen: boolean;
  isDocumentModalOpen: boolean;
  selectedTab: 'profile' | 'security' | 'settings' | 'documents';
  selectedDocument: SellerDocument | null;
  
  // UI Actions
  setEditModalOpen: (open: boolean) => void;
  setPasswordModalOpen: (open: boolean) => void;
  setDocumentModalOpen: (open: boolean) => void;
  setSelectedTab: (tab: 'profile' | 'security' | 'settings' | 'documents') => void;
  setSelectedDocument: (document: SellerDocument | null) => void;
  reset: () => void;
}

// Component Props Types
export interface ProfileOverviewProps {
  profile?: SellerProfile;
  stats?: SellerProfileStats;
  isLoading?: boolean;
}

export interface BusinessInformationProps {
  profile?: SellerProfile;
  updateProfile: {
    mutate: (data: ProfileUpdateData) => void;
    isPending: boolean;
  };
}

export interface SecuritySettingsProps {
  changePassword: {
    mutate: (data: PasswordChangeData) => void;
    isPending: boolean;
  };
}

export interface VerificationStatusProps {
  profile?: SellerProfile;
  requestVerification: {
    mutate: () => void;
    isPending: boolean;
  };
}

export interface DocumentManagementProps {
  profile?: SellerProfile;
  uploadDocument: {
    mutate: (data: DocumentUploadData) => void;
    isPending: boolean;
  };
  deleteDocument: {
    mutate: (documentType: string) => void;
    isPending: boolean;
  };
}

// Form Validation Types
export interface ProfileFormErrors {
  businessName?: string;
  contactPerson?: string;
  phone?: string;
  address?: string;
  gstNumber?: string;
}

export interface PasswordFormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

// Service Parameters
export interface ProfileServiceParams {
  includeStats?: boolean;
  includeDocuments?: boolean;
}