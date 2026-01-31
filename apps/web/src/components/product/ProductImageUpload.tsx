"use client";
import { useState, useRef, useCallback } from "react";
import { Upload, Image as ImageIcon, Trash2, Move, Loader2 } from "lucide-react";
import { toast } from "@/components/common/Toast";
import { apiPost, apiDelete } from "@/utils/api";
import { authHeader } from "@/utils/auth";

interface ProductImageUploadProps {
  productId: string;
  currentImages: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

interface UploadingImage {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export default function ProductImageUpload({
  productId,
  currentImages,
  onImagesChange,
  maxImages = 10
}: ProductImageUploadProps) {
  const [uploadingImages, setUploadingImages] = useState<UploadingImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File, uploadId: string) => {
    try {
      const formData = new FormData();
      formData.append('images', file);

      const result = await apiPost<{ status: string; data: { images: { url: string }[] }; message?: string }>(
        `/api/v1/product-images/upload/${productId}`,
        formData
      );

      if (result.status === 'success' && result.data.images?.length > 0) {
        // Update uploading state
        setUploadingImages(prev =>
          prev.map(img =>
            img.id === uploadId
              ? { ...img, status: 'success', progress: 100 }
              : img
          )
        );

        // Add new images to product
        const newImageUrls = result.data.images.map((img: { url: string }) => img.url);
        onImagesChange([...currentImages, ...newImageUrls]);

        toast(`Image uploaded successfully`, 'success');

        // Remove from uploading state after delay
        setTimeout(() => {
          setUploadingImages(prev => prev.filter(img => img.id !== uploadId));
        }, 2000);
      }
    } catch (error: any) {
      console.error('Upload error:', error);

      const errorMessage = error.message || 'Upload failed';

      setUploadingImages(prev =>
        prev.map(img =>
          img.id === uploadId
            ? { ...img, status: 'error', error: errorMessage }
            : img
        )
      );

      toast(errorMessage, 'error');
    }
  };

  const handleFileSelect = useCallback((files: FileList) => {
    const imageFiles = Array.from(files).filter(file =>
      file.type.startsWith('image/')
    );

    if (imageFiles.length === 0) {
      toast('Please select valid image files', 'error');
      return;
    }

    if (currentImages.length + imageFiles.length > maxImages) {
      toast(`Maximum ${maxImages} images allowed`, 'error');
      return;
    }

    // Create uploading state for each file
    const newUploadingImages: UploadingImage[] = imageFiles.map((file, index) => ({
      id: `upload-${Date.now()}-${index}`,
      file,
      progress: 0,
      status: 'uploading'
    }));

    setUploadingImages(prev => [...prev, ...newUploadingImages]);

    // Upload each file
    imageFiles.forEach((file, index) => {
      uploadImage(file, newUploadingImages[index].id);
    });
  }, [currentImages.length, maxImages, uploadImage]);

  const deleteImage = async (imageUrl: string) => {
    try {
      await apiDelete(`/api/v1/product-images/delete`, {
        body: JSON.stringify({
          productId,
          imageUrl,
        })
      });

      // Remove image from current images
      const updatedImages = currentImages.filter(img => img !== imageUrl);
      onImagesChange(updatedImages);

      toast('Image deleted successfully', 'success');
    } catch (error: any) {
      console.error('Delete error:', error);
      const errorMessage = error.message || 'Failed to delete image';
      toast(errorMessage, 'error');
    }
  };

  const reorderImages = async (fromIndex: number, toIndex: number) => {
    try {
      const newImages = [...currentImages];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);

      await apiPost(`/api/v1/product-images/reorder`, {
        productId,
        imageUrls: newImages,
      });

      onImagesChange(newImages);
      toast('Image order updated', 'success');
    } catch (error: any) {
      console.error('Reorder error:', error);
      const errorMessage = error.message || 'Failed to reorder images';
      toast(errorMessage, 'error');
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const remainingSlots = maxImages - currentImages.length - uploadingImages.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Product Images</h3>
        <span className="text-sm text-neutral-500">
          {currentImages.length + uploadingImages.length} / {maxImages}
        </span>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragging
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
          : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-600'
          }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
        />

        <div className="space-y-2">
          <Upload className="mx-auto h-12 w-12 text-neutral-400" />
          <div>
            <p className="text-sm font-medium">
              {isDragging ? 'Drop images here' : 'Drag & drop images here'}
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              or{' '}
              <button
                type="button"
                onClick={openFileDialog}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline"
              >
                browse files
              </button>
            </p>
          </div>
          <p className="text-xs text-neutral-400">
            PNG, JPG, WebP, GIF up to 10MB each
          </p>
        </div>

        {remainingSlots > 0 && (
          <button
            type="button"
            onClick={openFileDialog}
            className="mt-4 px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 dark:bg-neutral-100 dark:text-black dark:hover:bg-neutral-200 transition-colors"
          >
            Select Images
          </button>
        )}
      </div>

      {/* Uploading Images */}
      {uploadingImages.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploading...</h4>
          {uploadingImages.map((img) => (
            <div key={img.id} className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
              <ImageIcon className="h-8 w-8 text-neutral-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{img.file.name}</p>
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 mt-1">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${img.progress}%` }}
                  />
                </div>
              </div>
              {img.status === 'uploading' && (
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              )}
              {img.status === 'success' && (
                <div className="h-4 w-4 rounded-full bg-green-500" />
              )}
              {img.status === 'error' && (
                <div className="text-red-500 text-xs max-w-32 truncate" title={img.error}>
                  {img.error}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Current Images */}
      {currentImages.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Current Images</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {currentImages.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <img
                  src={imageUrl}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-neutral-200 dark:border-neutral-700"
                />

                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => deleteImage(imageUrl)}
                      className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                      title="Delete image"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => reorderImages(index, index - 1)}
                        className="p-2 bg-neutral-600 text-white rounded-full hover:bg-neutral-700 transition-colors"
                        title="Move left"
                      >
                        <Move className="h-4 w-4" />
                      </button>
                    )}
                    {index < currentImages.length - 1 && (
                      <button
                        type="button"
                        onClick={() => reorderImages(index, index + 1)}
                        className="p-2 bg-neutral-600 text-white rounded-full hover:bg-neutral-700 transition-colors"
                        title="Move right"
                      >
                        <Move className="h-4 w-4 rotate-180" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Image number */}
                <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded-full">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-neutral-500 space-y-1">
        <p>• First image will be the main product image</p>
        <p>• Drag images to reorder them</p>
        <p>• Images are automatically optimized and served via CDN</p>
      </div>
    </div>
  );
}