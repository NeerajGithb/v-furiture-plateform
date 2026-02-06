export type ProductApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNPUBLISHED';

export interface ProductImage {
    url: string;
    alt: string;
    publicId?: string;
}

export interface ProductDimensions {
    length: number;
    width: number;
    height: number;
}

export interface ProductReviews {
    average: number;
    count: number;
    breakdown?: {
        5: number;
        4: number;
        3: number;
        2: number;
        1: number;
    };
}

export interface ProductShippingInfo {
    freeShipping?: boolean;
    estimatedDays?: number;
    shippingCost?: number;
}

export interface ProductVariant {
    color?: string;
    size?: string;
    sku?: string;
    price?: number;
    inStock?: number;
}

export interface ProductFAQ {
    question: string;
    answer: string;
}

export interface ProductAttributes {
    seater?: number;
    color?: string;
    material?: string;
    style?: string;
    room?: string;
}

export interface ProductSeller {
    _id: string;
    businessName: string;
    email: string;
    phone?: string;
}

export interface ProductCategory {
    _id: string;
    name: string;
}

export interface ProductSubCategory {
    _id: string;
    name: string;
}

export interface AdminUser {
    _id: string;
    email: string;
    role: string;
}

// Base product interface with all fields from the model
export interface Product {
    _id: string;
    name: string;
    description?: string;
    categoryId?: ProductCategory;
    subCategoryId?: ProductSubCategory;
    itemId?: string;
    sku?: string;
    sellerId?: ProductSeller;
    
    originalPrice: number;
    finalPrice: number;
    emiPrice?: number;
    discountPercent?: number;
    inStockQuantity: number;
    
    colorOptions?: string[];
    size?: string[];
    material?: string;
    tags?: string[];
    
    mainImage?: ProductImage;
    galleryImages?: ProductImage[];
    
    badge?: string;
    dimensions?: ProductDimensions;
    weight?: number;
    
    isPublished: boolean;
    isActive?: boolean;
    ratings?: number;
    
    reviews?: ProductReviews;
    
    isFeatured?: boolean;
    isNewArrival?: boolean;
    isBestSeller?: boolean;
    
    shippingInfo?: ProductShippingInfo;
    
    variants?: ProductVariant[];
    
    slug?: string;
    metaTitle?: string;
    metaDescription?: string;
    
    keywords?: string[];
    bulletPoints?: string[];
    highlights?: string[];
    faq?: ProductFAQ[];
    
    totalSold?: number;
    viewCount?: number;
    wishlistCount?: number;
    
    brand?: string;
    warranty?: string;
    returnPolicy?: string;
    
    categorySlug?: string;
    subcategorySlug?: string;
    searchKeywords?: string[];
    
    attributes?: ProductAttributes;
    
    status: ProductApprovalStatus;
    rejectionReason?: string;
    approvedBy?: AdminUser | string;
    approvedAt?: string;
    
    createdAt: string;
    updatedAt: string;
}

// For admin product list (might have less populated data)
export interface AdminProduct extends Product {
    // All fields from Product
}

// For product creation/update
export interface ProductFormData {
    name: string;
    description?: string;
    categoryId?: string;
    subCategoryId?: string;
    itemId?: string;
    sku?: string;
    
    originalPrice: number;
    finalPrice: number;
    emiPrice?: number;
    discountPercent?: number;
    inStockQuantity: number;
    
    colorOptions?: string[];
    size?: string[];
    material?: string;
    tags?: string[];
    
    mainImage?: ProductImage;
    galleryImages?: ProductImage[];
    
    badge?: string;
    dimensions?: ProductDimensions;
    weight?: number;
    
    brand?: string;
    warranty?: string;
    returnPolicy?: string;
    
    bulletPoints?: string[];
    highlights?: string[];
    faq?: ProductFAQ[];
    
    shippingInfo?: ProductShippingInfo;
    variants?: ProductVariant[];
    attributes?: ProductAttributes;
}
