'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from '@/components/NavigationLoader';
import { useQuery } from '@tanstack/react-query';
import { useCreateProduct, useUpdateProduct, useSellerProduct } from '@/hooks/seller/useSellerProducts';

const Loader = ({ text = 'Loading...', fullScreen = false }) => {
  const containerClasses = fullScreen
    ? 'flex items-center justify-center min-h-screen'
    : 'flex items-center justify-center min-h-[60vh]';

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div className="animate-spin rounded-full border-b-2 h-12 w-12 border-blue-600 mx-auto"></div>
        {text && <p className="mt-4 text-gray-600">{text}</p>}
      </div>
    </div>
  );
};

import { AlertCircle, RefreshCw } from 'lucide-react';
import { ProductFormHeader } from './components/ProductFormHeader';
import { ProductFormSections } from './components/ProductFormSections';
import { ConfirmationModals } from './components/ConfirmationModals';
import { useProductForm } from './components/useProductForm';
import { categoryService } from '@/services/seller/categoryService';
import { useImageUpload } from './components/useImageUpload';

export default function NewProductPage() {
  const router = useNavigate();

  // React Query hooks
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();

  // Categories data
  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['seller-categories'],
    queryFn: categoryService.getCategories
  });

  const { data: subcategoriesData, isLoading: subcategoriesLoading, error: subcategoriesError } = useQuery({
    queryKey: ['seller-subcategories'],
    queryFn: categoryService.getSubcategories
  });

  // Check if we're in edit mode
  const [productId, setProductId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Product data for edit mode
  const { data: productData, isLoading: productLoading, error: productError } = useSellerProduct(productId || '', !!productId);

  // Form hooks
  const { formData, setFormData, handleBulletPointChange, clearDraft, clearForm } = useProductForm(isEditMode);
  const {
    mainImage,
    galleryImages,
    isUploadingMain,
    isUploadingGallery,
    handleMainImageUpload,
    handleRemoveMainImage,
    handleGalleryImageUpload,
    handleRemoveGalleryImage,
    clearImageDraft,
    clearImages,
    initializeImages,
  } = useImageUpload(isEditMode);

  // Modal states
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [productDataToSave, setProductDataToSave] = useState<any>(null);

  // Track if we've already cleared the form to prevent infinite loops
  const hasCleared = useRef(false);

  // Initialize edit mode
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
      setProductId(id);
      setIsEditMode(true);
      hasCleared.current = true; // Don't clear in edit mode
    } else {
      // Starting a new product - clear any existing draft only once
      if (!hasCleared.current) {
        clearForm();
        clearImages();
        hasCleared.current = true;
      }
    }
  }, [clearForm, clearImages]);

  // Load product data for editing
  useEffect(() => {
    if (productData && isEditMode) {
      const product = productData;

      setFormData({
        name: product.name || '',
        description: product.description || '',
        categoryId: product.categoryId || '',
        subcategoryId: product.subCategoryId || '',
        brand: '',
        originalPrice: product.originalPrice?.toString() || '',
        finalPrice: product.finalPrice?.toString() || '',
        discountPercent: product.discountPercent?.toString() || '',
        emiPrice: '',
        inStockQuantity: product.inStockQuantity?.toString() || '0',
        freeShipping: true,
        shippingCost: '',
        estimatedDays: '',
        material: '',
        dimensions: {
          length: '',
          width: '',
          height: '',
        },
        weight: '',
        colorOptions: '',
        size: '',
        tags: '',
        bulletPoints: ['', '', ''],
        highlights: '',
        warranty: '',
        returnPolicy: '',
        isPublished: product.isPublished ?? false,
      });

      const mainImageUrl = product.mainImage?.url;
      const galleryImageUrls = product.galleryImages?.map((img: any) => img.url).filter(Boolean);

      if (mainImageUrl || (galleryImageUrls && galleryImageUrls.length > 0)) {
        initializeImages(mainImageUrl, galleryImageUrls);
      }
    }
  }, [productData, isEditMode, setFormData, initializeImages]);

  // Check for unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    return (
      formData.name.trim() !== '' ||
      formData.description.trim() !== '' ||
      formData.categoryId !== '' ||
      mainImage !== '' ||
      galleryImages.length > 0
    );
  }, [formData, mainImage, galleryImages]);

  // Form validation
  const isFormValid = useMemo(() => {
    const hasRequiredFields =
      formData.name.trim() !== '' &&
      formData.description.trim() !== '' &&
      formData.categoryId !== '' &&
      formData.subcategoryId !== '' &&
      formData.originalPrice !== '' &&
      formData.finalPrice !== '' &&
      formData.inStockQuantity !== '' &&
      mainImage !== '' &&
      galleryImages.length >= 2;

    const originalPrice = parseFloat(formData.originalPrice);
    const finalPrice = parseFloat(formData.finalPrice);
    const inStock = parseInt(formData.inStockQuantity);

    const hasValidPrices =
      !isNaN(originalPrice) && originalPrice > 0 &&
      !isNaN(finalPrice) && finalPrice > 0 &&
      finalPrice <= originalPrice &&
      !isNaN(inStock) && inStock >= 0;

    return hasRequiredFields && hasValidPrices;
  }, [formData, mainImage, galleryImages]);

  // Prevent accidental navigation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        return (e.returnValue = '');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Handlers
  const handleBack = () => {
    if (hasUnsavedChanges) {
      setShowExitConfirm(true);
    } else {
      router.back();
    }
  };

  const handleConfirmExit = () => {
    clearDraft();
    clearImageDraft();
    router.back();
  };

  const handleSubmit = () => {
    const productData = {
      name: formData.name,
      description: formData.description,
      categoryId: formData.categoryId,
      subCategoryId: formData.subcategoryId,
      originalPrice: parseFloat(formData.originalPrice),
      finalPrice: parseFloat(formData.finalPrice),
      inStockQuantity: parseInt(formData.inStockQuantity),
      discountPercent: formData.discountPercent ? parseInt(formData.discountPercent) : undefined,
      mainImage: { url: mainImage, alt: formData.name },
      galleryImages: galleryImages.map((img: any) => ({ url: img.url, alt: formData.name })),
      isPublished: formData.isPublished,
    };

    setProductDataToSave(productData);
    setShowSaveConfirm(true);
  };

  const handleConfirmSave = async () => {
    if (!productDataToSave) return;

    setShowSaveConfirm(false);

    if (isEditMode && productId) {
      await updateProductMutation.mutateAsync({ productId, data: productDataToSave });
    } else {
      await createProductMutation.mutateAsync(productDataToSave);
    }

    clearDraft();
    clearImageDraft();
    router.push('/seller/products');
  };

  // Loading states
  const isLoading = categoriesLoading || subcategoriesLoading || productLoading;
  const isUpdating = createProductMutation.isPending || updateProductMutation.isPending;

  // Error handling
  const error = categoriesError || subcategoriesError || productError;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Data</h3>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : 'Unable to load required data. Please try again.'}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
            <button
              onClick={() => router.push('/seller/products')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <Loader />;
  }

  // Extract categories and subcategories with proper handling of different response formats
  const categories = Array.isArray(categoriesData)
    ? categoriesData
    : (categoriesData as any)?.data?.categories || (categoriesData as any)?.data || [];

  const subcategories = Array.isArray(subcategoriesData)
    ? subcategoriesData
    : (subcategoriesData as any)?.data?.subcategories || (subcategoriesData as any)?.data || [];

  return (
    <div className="max-w-7xl mx-auto px-4 relative">
      <ConfirmationModals
        showSaveConfirm={showSaveConfirm}
        showExitConfirm={showExitConfirm}
        productDataToSave={productDataToSave}
        isUpdating={isUpdating}
        onConfirmSave={handleConfirmSave}
        onCancelSave={() => {
          setShowSaveConfirm(false);
          setProductDataToSave(null);
        }}
        onConfirmExit={handleConfirmExit}
        onCancelExit={() => setShowExitConfirm(false)}
      />

      <ProductFormHeader
        isEditMode={isEditMode}
        isUpdating={isUpdating}
        isFormValid={isFormValid}
        hasUnsavedChanges={hasUnsavedChanges}
        onBack={handleBack}
        onSubmit={handleSubmit}
      />

      <ProductFormSections
        formData={formData}
        setFormData={setFormData}
        categories={categories}
        subcategories={subcategories}
        mainImage={mainImage}
        galleryImages={galleryImages}
        isUploadingMain={isUploadingMain}
        isUploadingGallery={isUploadingGallery}
        onMainImageUpload={handleMainImageUpload}
        onRemoveMainImage={handleRemoveMainImage}
        onGalleryImageUpload={handleGalleryImageUpload}
        onRemoveGalleryImage={handleRemoveGalleryImage}
        onBulletPointChange={handleBulletPointChange}
      />
    </div>
  );
}