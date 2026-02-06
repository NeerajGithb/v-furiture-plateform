import { useState, useCallback } from 'react';
import { useUpload } from '@/hooks/useUpload';

export function useImageUpload(isEditMode: boolean) {
  const [mainImage, setMainImage] = useState<string>('');
  const [galleryImages, setGalleryImages] = useState<Array<{ url: string; alt?: string }>>([]);
  
  const { uploadFile, isUploading: isUploadingMain } = useUpload();
  const { uploadFile: uploadGalleryFile, isUploading: isUploadingGallery } = useUpload();

  const handleMainImageUpload = useCallback(async (file: File) => {
    try {
      const result = await uploadFile(file);
      if (result?.url) {
        setMainImage(result.url);
      }
    } catch (error) {
      console.error('Failed to upload main image:', error);
    }
  }, [uploadFile]);

  const handleRemoveMainImage = useCallback(() => {
    setMainImage('');
  }, []);

  const handleGalleryImageUpload = useCallback(async (file: File) => {
    try {
      const result = await uploadGalleryFile(file);
      if (result?.url) {
        setGalleryImages(prev => [...prev, { url: result.url, alt: '' }]);
      }
    } catch (error) {
      console.error('Failed to upload gallery image:', error);
    }
  }, [uploadGalleryFile]);

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