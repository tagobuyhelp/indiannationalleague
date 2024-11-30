import React, { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';

interface PhotoUploadProps {
  value: string;
  onChange: (base64: string) => void;
  error?: string;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ value, onChange, error }) => {
  const [preview, setPreview] = useState<string>(value);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const processImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Calculate dimensions
        let width = img.width;
        let height = img.height;

        // Scale down if larger than 800x800
        if (width > 800 || height > 800) {
          const scale = Math.min(800 / width, 800 / height);
          width *= scale;
          height *= scale;
        }

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw image with white background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to base64 with reduced quality
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        setPreview(base64);
        onChange(base64);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        processImage(file);
      } else {
        alert('Please select an image file');
      }
    }
  };

  const handleRemovePhoto = () => {
    setPreview('');
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Photo</label>
      
      <div className="relative">
        {preview ? (
          <div className="relative inline-block">
            <img
              src={preview}
              alt="Preview"
              className="h-48 w-48 object-cover rounded-lg border border-gray-300"
            />
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="absolute -top-2 -right-2 p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="h-48 w-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400"
          >
            <Upload className="w-8 h-8 text-gray-400" />
            <span className="mt-2 text-sm text-gray-500">Upload Photo</span>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
      
      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default PhotoUpload;