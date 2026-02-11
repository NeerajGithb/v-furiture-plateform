'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from '@/components/NavigationLoader';
import { useCreateProduct, useUpdateProduct, useSellerProduct, useSellerCategories, useSellerSubcategories } from '@/hooks/seller/useSellerProducts';
import { LoaderGuard } from '@/components/ui/LoaderGuard';
import { useConfirm } from '@/contexts/ConfirmContext';
import { ProductFormHeader } from './components/ProductFormHeader';
import { ProductFormSections } from './components/ProductFormSections';
import { useProductForm } from './components/useProductForm';
import { useImageUpload } from './components/useImageUpload';
import { toast } from 'react-hot-toast';
import { CreateProductSchema, UpdateProductSchema } from '@/lib/domain/seller/products/SellerProductsSchemas';
import { z } from 'zod';

export default function NewProductPage() {
  const router = useNavigate();
  const { confirm } = useConfirm();

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();

  const { data: categoriesData, isPending: categoriesPending, error: categoriesError } = useSellerCategories();
  const { data: subcategoriesData, isPending: subcategoriesPending, error: subcategoriesError } = useSellerSubcategories();

  const [productId, setProductId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const { data: productData, isPending: productPending, error: productError } = useSellerProduct(productId || '');

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

  const hasCleared = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) {
      setProductId(id);
      setIsEditMode(true);
      hasCleared.current = true;
    } else {
      if (!hasCleared.current) {
        clearForm();
        clearImages();
        hasCleared.current = true;
      }
    }
  }, [clearForm, clearImages]);

  useEffect(() => {
    if (productData && isEditMode) {
      const product = productData;

      const categoryId = typeof product.categoryId === 'string' 
        ? product.categoryId 
        : (product.categoryId as unknown as { _id: string })?._id || '';
      
      const subcategoryId = typeof product.subCategoryId === 'string'
        ? product.subCategoryId
        : (product.subCategoryId as unknown as { _id: string })?._id || '';

      setFormData({
        name: product.name || '',
        description: product.description || '',
        categoryId,
        subcategoryId,
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
      const galleryImageUrls = product.galleryImages?.map(img => img.url).filter(Boolean);

      if (mainImageUrl || (galleryImageUrls && galleryImageUrls.length > 0)) {
        initializeImages(mainImageUrl, galleryImageUrls);
      }
    }
  }, [productData, isEditMode, setFormData, initializeImages]);

  const hasUnsavedChanges = useMemo(() => {
    return (
      formData.name.trim() !== '' ||
      formData.description.trim() !== '' ||
      formData.categoryId !== '' ||
      mainImage !== '' ||
      galleryImages.length > 0
    );
  }, [formData, mainImage, galleryImages]);

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

  const handleBack = () => {
    if (hasUnsavedChanges) {
      confirm({
        title: 'Unsaved Changes',
        message: 'You have unsaved changes. Are you sure you want to leave? Your changes will be lost.',
        type: 'delete',
        confirmText: 'Leave Without Saving',
        cancelText: 'Stay',
        onConfirm: () => {
          clearDraft();
          clearImageDraft();
          router.back();
        }
      });
    } else {
      router.back();
    }
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
      mainImage: { url: mainImage, publicId: '' },
      galleryImages: galleryImages.map(img => ({ url: img.url, publicId: '' })),
      isPublished: formData.isPublished,
    };

    try {
      if (isEditMode) {
        UpdateProductSchema.parse(productData);
      } else {
        CreateProductSchema.parse(productData);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.issues[0];
        toast.error(`${firstError.path.join('.')}: ${firstError.message}`);
        return;
      }
      toast.error('Validation failed');
      return;
    }

    confirm({
      title: 'Confirm Save',
      message: `Are you sure you want to save this product?${productData.isPublished ? ' It will be published and visible to customers.' : ''}`,
      type: 'confirm',
      confirmText: 'Save Product',
      cancelText: 'Cancel',
      onConfirm: async () => {
        if (isEditMode && productId) {
          await updateProductMutation.mutateAsync({ productId, data: productData });
        } else {
          await createProductMutation.mutateAsync(productData);
        }
        clearDraft();
        clearImageDraft();
        router.push('/seller/products');
      }
    });
  };

  const isPending = categoriesPending || subcategoriesPending || productPending;
  const isUpdating = createProductMutation.isPending || updateProductMutation.isPending;

  const error = categoriesError || subcategoriesError || productError;

  const categories = categoriesData || [];
  const subcategories = subcategoriesData || [];

  return (
    <LoaderGuard 
      isLoading={isPending} 
      error={error}
    >
      {() => (
        <div className="max-w-7xl mx-auto px-4 relative">
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
      )}
    </LoaderGuard>
  );
}