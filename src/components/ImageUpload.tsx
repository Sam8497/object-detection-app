import React, { useRef, useState } from 'react';
import { Upload, X, 
  // Image as ImageIcon 
} from 'lucide-react';

interface ImageUploadProps {
  onImageSelected: (image: HTMLImageElement) => void;
  onClear: () => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelected,
  onClear
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageSrc = e.target?.result as string;
      setSelectedImage(imageSrc);
      
      // Create image element for detection
      const img = new Image();
      img.onload = () => {
        onImageSelected(img);
      };
      img.src = imageSrc;
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClear = () => {
    setSelectedImage(null);
    onClear();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      {!selectedImage ? (
        <div
          className={`relative w-full aspect-video border-2 border-dashed rounded-lg transition-colors duration-200 ${
            isDragging
              ? 'border-blue-400 bg-blue-50 bg-opacity-10'
              : 'border-gray-600 hover:border-gray-500'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-6">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Upload Image</h3>
              <p className="text-gray-400 mb-4">
                Drag and drop an image here, or click to select
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              >
                Choose File
              </button>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="relative w-full aspect-video bg-gray-800 rounded-lg overflow-hidden">
          <img
            src={selectedImage}
            alt="Selected for detection"
            className="w-full h-full object-contain"
          />
          
          <button
            onClick={handleClear}
            className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors duration-200"
            title="Clear image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};