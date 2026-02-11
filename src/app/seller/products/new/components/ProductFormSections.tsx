import { Upload, X, Plus, Image as ImageIcon } from 'lucide-react';
import { ProductFormData } from './useProductForm';

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface SubCategory {
  _id: string;
  name: string;
  slug: string;
  categoryId: string | Category;
}

interface ProductFormSectionsProps {
  formData: ProductFormData;
  setFormData: (data: ProductFormData | ((prev: ProductFormData) => ProductFormData)) => void;
  categories: Category[];
  subcategories: SubCategory[];
  mainImage: string;
  galleryImages: Array<{ url: string; alt?: string }>;
  isUploadingMain: boolean;
  isUploadingGallery: boolean;
  onMainImageUpload: (file: File) => void;
  onRemoveMainImage: () => void;
  onGalleryImageUpload: (file: File) => void;
  onRemoveGalleryImage: (index: number) => void;
  onBulletPointChange: (index: number, value: string) => void;
}

export function ProductFormSections({
  formData,
  setFormData,
  categories,
  subcategories,
  mainImage,
  galleryImages,
  isUploadingMain,
  isUploadingGallery,
  onMainImageUpload,
  onRemoveMainImage,
  onGalleryImageUpload,
  onRemoveGalleryImage,
  onBulletPointChange
}: ProductFormSectionsProps) {
  const filteredSubcategories = subcategories.filter(sub => 
    typeof sub.categoryId === 'string' 
      ? sub.categoryId === formData.categoryId 
      : sub.categoryId._id === formData.categoryId
  );

  const handleFileUpload = (file: File, type: 'main' | 'gallery') => {
    if (type === 'main') {
      onMainImageUpload(file);
    } else {
      onGalleryImageUpload(file);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Enter product name"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Describe your product"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value, subcategoryId: '' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            >
              <option key="empty-category" value="">Select Category</option>
              {categories.filter(cat => cat._id).map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subcategory *
            </label>
            <select
              value={formData.subcategoryId}
              onChange={(e) => setFormData(prev => ({ ...prev, subcategoryId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              disabled={!formData.categoryId}
            >
              <option key="empty-subcategory" value="">Select Subcategory</option>
              {filteredSubcategories.filter(sub => sub._id).map((subcategory) => (
                <option key={subcategory._id} value={subcategory._id}>
                  {subcategory.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h2>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Main Image *
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            {mainImage ? (
              <div className="relative">
                <img
                  src={mainImage}
                  alt="Main product"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  onClick={onRemoveMainImage}
                  className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="text-center">
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-gray-900 hover:text-gray-700">
                    <span>Upload main image</span>
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'main');
                      }}
                      disabled={isUploadingMain}
                    />
                  </label>
                </div>
                {isUploadingMain && (
                  <div className="mt-2 text-sm text-gray-500">Uploading...</div>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gallery Images * (At least 2 images)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {galleryImages.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image.url}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  onClick={() => onRemoveGalleryImage(index)}
                  className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            
            {galleryImages.length < 6 && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex items-center justify-center">
                <label className="cursor-pointer text-center">
                  <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm text-gray-600">Add Image</span>
                  <input
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'gallery');
                    }}
                    disabled={isUploadingGallery}
                  />
                </label>
              </div>
            )}
          </div>
          {isUploadingGallery && (
            <div className="mt-2 text-sm text-gray-500">Uploading gallery image...</div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Inventory</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Original Price *
            </label>
            <input
              type="number"
              value={formData.originalPrice}
              onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Final Price *
            </label>
            <input
              type="number"
              value={formData.finalPrice}
              onChange={(e) => setFormData(prev => ({ ...prev, finalPrice: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Quantity *
            </label>
            <input
              type="number"
              value={formData.inStockQuantity}
              onChange={(e) => setFormData(prev => ({ ...prev, inStockQuantity: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="0"
              min="0"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Publishing</h2>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPublished"
            checked={formData.isPublished}
            onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
            className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
          />
          <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-900">
            Publish this product immediately
          </label>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          If unchecked, the product will be saved as a draft
        </p>
      </div>
    </div>
  );
}