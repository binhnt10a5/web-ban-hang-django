import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { productsApi } from '../services/api';
import { toast } from 'sonner';

interface ImageUploadProps {
  value?: string;
  onChange: (imageUrl: string) => void;
  label?: string;
}

export function ImageUpload({ value, onChange, label = 'Ảnh sản phẩm' }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | undefined>(value);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('File phải là ảnh (jpg, png)');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Dung lượng ảnh tối đa 2MB');
      return;
    }

    setUploading(true);

    try {
      const result = await productsApi.uploadImage(file);
      
      if (result.success && result.data) {
        setPreview(result.data);
        onChange(result.data);
        toast.success('Tải ảnh lên thành công');
      } else {
        toast.error(result.error || 'Lỗi khi tải ảnh lên');
      }
    } catch (error) {
      toast.error('Lỗi khi tải ảnh lên');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(undefined);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">{label}</label>
      
      <div className="flex items-center gap-4">
        {/* Preview */}
        {preview ? (
          <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-800 border border-gray-700">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 rounded-full text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="w-32 h-32 rounded-lg bg-gray-800 border-2 border-dashed border-gray-700 flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-gray-600" />
          </div>
        )}

        {/* Upload Button */}
        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            onChange={handleFileSelect}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 
              ${uploading ? 'bg-gray-700 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-700 cursor-pointer'}
              text-white transition`}
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'Đang tải lên...' : 'Chọn ảnh'}
          </label>
          <p className="mt-2 text-sm text-gray-500">
            Chỉ chấp nhận JPG, PNG. Tối đa 2MB.
          </p>
        </div>
      </div>
    </div>
  );
}
