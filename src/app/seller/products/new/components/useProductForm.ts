import { useState, useCallback } from 'react';

export interface ProductFormData {
  name: string;
  description: string;
  categoryId: string;
  subcategoryId: string;
  brand: string;
  originalPrice: string;
  finalPrice: string;
  discountPercent: string;
  emiPrice: string;
  inStockQuantity: string;
  freeShipping: boolean;
  shippingCost: string;
  estimatedDays: string;
  material: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
  weight: string;
  colorOptions: string;
  size: string;
  tags: string;
  bulletPoints: string[];
  highlights: string;
  warranty: string;
  returnPolicy: string;
  isPublished: boolean;
}

const initialFormData: ProductFormData = {
  name: '',
  description: '',
  categoryId: '',
  subcategoryId: '',
  brand: '',
  originalPrice: '',
  finalPrice: '',
  discountPercent: '',
  emiPrice: '',
  inStockQuantity: '0',
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
  isPublished: false,
};

export function useProductForm(isEditMode: boolean) {
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);

  const handleBulletPointChange = useCallback((index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      bulletPoints: prev.bulletPoints.map((point, i) => i === index ? value : point)
    }));
  }, []);

  const clearDraft = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('productFormDraft');
    }
  }, []);

  const clearForm = useCallback(() => {
    setFormData(initialFormData);
    clearDraft();
  }, [clearDraft]);

  return {
    formData,
    setFormData,
    handleBulletPointChange,
    clearDraft,
    clearForm
  };
}