'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, X, Loader2, Image as ImageIcon, Link as LinkIcon, Plus } from 'lucide-react';

interface ProductImageUploaderProps {
  image: string;
  gallery?: string[];
  onImageChange: (url: string) => void;
  onGalleryChange?: (urls: string[]) => void;
}

export const ProductImageUploader: React.FC<ProductImageUploaderProps> = ({
  image,
  gallery = [],
  onImageChange,
  onGalleryChange,
}) => {
  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [urlMode, setUrlMode] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mainInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File): Promise<string> => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Only JPEG, PNG, WebP, SVG, and GIF images are allowed.');
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image size must be less than 5MB.');
    }

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (!res.ok || !data.success || !data.url) {
      throw new Error(data.error || 'Failed to upload image to Supabase storage.');
    }

    return data.url;
  };

  const handleMainFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMain(true);
    setError(null);
    try {
      const url = await uploadFile(file);
      onImageChange(url);
    } catch (err: any) {
      setError(err.message || 'Main image upload failed.');
    } finally {
      setUploadingMain(false);
      if (mainInputRef.current) mainInputRef.current.value = '';
    }
  };

  const handleGalleryFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingGallery(true);
    setError(null);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadFile(files[i]);
        newUrls.push(url);
      }
      if (onGalleryChange) {
        onGalleryChange([...gallery, ...newUrls]);
      }
    } catch (err: any) {
      setError(err.message || 'Gallery image upload failed.');
    } finally {
      setUploadingGallery(false);
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const handleManualUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUrl.trim()) return;
    onImageChange(manualUrl.trim());
    setManualUrl('');
    setUrlMode(false);
  };

  const removeGalleryImage = (idxToRemove: number) => {
    if (!onGalleryChange) return;
    onGalleryChange(gallery.filter((_, idx) => idx !== idxToRemove));
  };

  return (
    <div className="space-y-4">
      {/* Error alert */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-rose-500 hover:text-rose-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Image Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-[#102A50] flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-[#0866E8]" />
            <span>Primary Product Image *</span>
          </label>
          <button
            type="button"
            onClick={() => setUrlMode(!urlMode)}
            className="text-[11px] font-bold text-[#0866E8] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <LinkIcon className="w-3 h-3" />
            <span>{urlMode ? 'Upload from Device' : 'Paste Image URL'}</span>
          </button>
        </div>

        {urlMode ? (
          <div className="flex items-center gap-2">
            <input
              type="url"
              placeholder="https://example.com/images/product.jpg"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-[#DCEBFA] bg-white focus:outline-none focus:ring-2 focus:ring-[#0866E8]/30 focus:border-[#0866E8]"
            />
            <button
              type="button"
              onClick={handleManualUrlSubmit}
              className="px-3.5 py-2 text-xs font-bold text-white bg-[#0866E8] rounded-xl hover:bg-[#0645B5] transition-colors"
            >
              Set
            </button>
          </div>
        ) : (
          <div className="flex items-start gap-4">
            {/* Preview Box */}
            <div className="relative w-28 h-28 rounded-2xl border-2 border-dashed border-[#DCEBFA] bg-[#F7FBFF] overflow-hidden flex items-center justify-center shrink-0 group">
              {uploadingMain ? (
                <div className="flex flex-col items-center justify-center text-xs text-[#0866E8]">
                  <Loader2 className="w-6 h-6 animate-spin mb-1" />
                  <span className="text-[10px] font-bold">Uploading...</span>
                </div>
              ) : image ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt="Product preview"
                    className="w-full h-full object-contain p-1.5"
                  />
                  <button
                    type="button"
                    onClick={() => onImageChange('')}
                    title="Remove image"
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <div className="text-center p-2 text-[#647A98]">
                  <UploadCloud className="w-6 h-6 mx-auto mb-1 text-[#0866E8]/60" />
                  <span className="text-[10px] font-semibold block">No image</span>
                </div>
              )}
            </div>

            {/* Upload Button & Guidance */}
            <div className="flex-1">
              <input
                ref={mainInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                onChange={handleMainFileSelect}
                className="hidden"
                id="main-image-input"
              />
              <button
                type="button"
                disabled={uploadingMain}
                onClick={() => mainInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-white border border-[#DCEBFA] hover:bg-[#EDF6FF] text-[#102A50] hover:text-[#0866E8] text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-2"
              >
                <UploadCloud className="w-4 h-4 text-[#0866E8]" />
                <span>{image ? 'Replace Main Image' : 'Select Image from Computer'}</span>
              </button>
              <p className="text-[11px] text-[#647A98] mt-2 leading-relaxed">
                Stored securely in the Supabase <code className="font-mono text-[#0866E8]">bluebell</code> storage bucket. High-resolution WebP, PNG, or JPG recommended (Max 5MB).
              </p>
              {image && (
                <p className="text-[10px] font-mono text-[#647A98] mt-1 truncate max-w-md">
                  URL: {image}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Gallery Section */}
      {onGalleryChange && (
        <div className="pt-3 border-t border-[#EDF2F7]">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-[#102A50]">
              Additional Gallery Images ({gallery.length})
            </label>
            <input
              ref={galleryInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleGalleryFileSelect}
              className="hidden"
              id="gallery-image-input"
            />
            <button
              type="button"
              disabled={uploadingGallery}
              onClick={() => galleryInputRef.current?.click()}
              className="text-[11px] font-bold text-[#0866E8] hover:underline flex items-center gap-1 cursor-pointer"
            >
              {uploadingGallery ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3 h-3" />
                  <span>Add Gallery Photos</span>
                </>
              )}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {gallery.map((url, idx) => (
              <div
                key={idx}
                className="relative w-16 h-16 rounded-xl border border-[#DCEBFA] bg-white overflow-hidden group shadow-xs"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(idx)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  title="Remove from gallery"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {gallery.length === 0 && (
              <p className="text-[11px] text-[#647A98] italic">
                Optional: Upload extra angles or color variant photos for product detail page.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
