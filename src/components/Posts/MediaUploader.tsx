import React, { useState, useRef } from 'react';
import { Upload, X, Image, Video, AlertCircle } from 'lucide-react';

interface MediaFile {
  file: File;
  preview: string;
  type: 'image' | 'video';
}

interface MediaUploaderProps {
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  accept?: string;
  error?: string;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  onFilesChange,
  maxFiles = 10,
  accept = "image/*,video/*",
  error
}) => {
  const [selectedFiles, setSelectedFiles] = useState<MediaFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = (files: File[]): string[] => {
    const errors: string[] = [];
    const maxImageSize = 10 * 1024 * 1024; // 10MB
    const maxVideoSize = 100 * 1024 * 1024; // 100MB
    
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'];
    const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes];

    if (files.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} files allowed`);
    }

    files.forEach((file, index) => {
      if (!allowedTypes.includes(file.type)) {
        errors.push(`File ${index + 1}: Invalid file type. Allowed: images and videos only`);
      }

      if (allowedImageTypes.includes(file.type) && file.size > maxImageSize) {
        errors.push(`File ${index + 1}: Image too large (max 10MB)`);
      }

      if (allowedVideoTypes.includes(file.type) && file.size > maxVideoSize) {
        errors.push(`File ${index + 1}: Video too large (max 100MB)`);
      }
    });

    return errors;
  };

  const processFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validationErrors = validateFiles(fileArray);
    
    if (validationErrors.length > 0) {
      console.error('File validation errors:', validationErrors);
      return;
    }

    const mediaFiles: MediaFile[] = [];
    
    fileArray.forEach((file) => {
      const preview = URL.createObjectURL(file);
      const type = file.type.startsWith('image/') ? 'image' : 'video';
      
      mediaFiles.push({
        file,
        preview,
        type
      });
    });

    setSelectedFiles(mediaFiles);
    onFilesChange(fileArray);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    
    // Revoke the URL to free up memory
    URL.revokeObjectURL(selectedFiles[index].preview);
    
    setSelectedFiles(newFiles);
    onFilesChange(newFiles.map(f => f.file));
  };

  const clearAllFiles = () => {
    // Revoke all URLs to free up memory
    selectedFiles.forEach(file => URL.revokeObjectURL(file.preview));
    
    setSelectedFiles([]);
    onFilesChange([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Add Media (Optional)
      </label>
      
      {/* File Input */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Upload Area */}
      {selectedFiles.length === 0 ? (
        <div
          onClick={openFileDialog}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : error
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
        >
          <div className="text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Upload Photos or Videos
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Drag and drop files here, or click to browse
            </p>
            <div className="flex justify-center space-x-6 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Image className="w-4 h-4" />
                <span>Images: JPG, PNG, GIF, WebP (max 10MB)</span>
              </div>
              <div className="flex items-center space-x-1">
                <Video className="w-4 h-4" />
                <span>Videos: MP4, WebM, MOV (max 100MB)</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Maximum {maxFiles} files
            </p>
          </div>
        </div>
      ) : (
        <div>
          {/* Selected Files Preview */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            {selectedFiles.map((mediaFile, index) => (
              <div key={index} className="relative group">
                <div className="relative overflow-hidden rounded-lg border border-gray-200">
                  {mediaFile.type === 'image' ? (
                    <img
                      src={mediaFile.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover"
                    />
                  ) : (
                    <video
                      src={mediaFile.preview}
                      className="w-full h-32 object-cover"
                      preload="metadata"
                    />
                  )}
                  
                  {/* File type indicator */}
                  <div className="absolute top-2 left-2">
                    <span className="bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
                      {mediaFile.type === 'image' ? (
                        <Image className="w-3 h-3" />
                      ) : (
                        <Video className="w-3 h-3" />
                      )}
                    </span>
                  </div>
                  
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                
                {/* File name */}
                <p className="text-xs text-gray-600 mt-1 truncate">
                  {mediaFile.file.name}
                </p>
                <p className="text-xs text-gray-400">
                  {(mediaFile.file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
            </p>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={openFileDialog}
                className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Add More
              </button>
              <button
                type="button"
                onClick={clearAllFiles}
                className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-2 flex items-center space-x-1 text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
};
