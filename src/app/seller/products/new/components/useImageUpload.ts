import { useState, useCallback } from 'react';
import { useUploadFile } from '@/hooks/useUpload';

export function useImageUpload(isEditMode: boolean) {
  const [mainImage, setMainImage] = useState<string>('');
  const [galleryImages, setGalleryImages] = useState<Array<{ url: string; alt?: string }>>([]);
  
  const mainUpload = useUploadFile();
  const galleryUpload = useUploadFile();
  const isUploadingMain = mainUpload.isPending;
  const isUploadingGallery = galleryUpload.isPending;

  const handleMainImageUpload = useCallback(async (file: File) => {
    mainUpload.mutate({ file, folder: 'products' }, {
      onSuccess: (result) => {
        if (result?.url) {
          setMainImage(result.url);
        }
      }
    });
  }, [mainUpload]);

  const handleRemoveMainImage = useCallback(() => {
    setMainImage('');
  }, []);

  const handleGalleryImageUpload = useCallback(async (file: File) => {
    galleryUpload.mutate({ file, folder: 'products' }, {
      onSuccess: (result) => {
        if (result?.url) {
          setGalleryImages(prev => [...prev, { url: result.url, alt: '' }]);
        }
      }
    });
  }, [galleryUpload]);

  const handleRemoveGalleryImage = useCallback((index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearImageDraft = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('productImagesDraft');
    }
  }, []);

  const clearImages = useCallback(() => {
    setMainImage('');
    setGalleryImages([]);
    clearImageDraft();
  }, [clearImageDraft]);

  const initializeImages = useCallback((mainImageUrl?: string, galleryImageUrls?: string[]) => {
    if (mainImageUrl) {
      setMainImage(mainImageUrl);
    }
    if (galleryImageUrls && galleryImageUrls.length > 0) {
      setGalleryImages(galleryImageUrls.map(url => ({ url, alt: '' })));
    }
  }, []);

  return {
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
  };
}