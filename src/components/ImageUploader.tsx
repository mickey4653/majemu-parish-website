'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import imageCompression from 'browser-image-compression';

interface ImageUploaderProps {
  onImageSelect: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

export default function ImageUploader({ onImageSelect, maxFiles = 5, maxSizeMB = 1 }: ImageUploaderProps) {
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [currentCrop, setCurrentCrop] = useState<Crop>();
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(-1);
  const [isCropping, setIsCropping] = useState(false);

  // Handle image compression
  const compressImage = async (file: File) => {
    const options = {
      maxSizeMB: maxSizeMB,
      maxWidthOrHeight: 1920,
      useWebWorker: true
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error('Error compressing image:', error);
      return file;
    }
  };

  // Handle file drop
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Check if adding new files would exceed the limit
    if (images.length + acceptedFiles.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} images`);
      return;
    }

    const processedFiles = await Promise.all(
      acceptedFiles.map(async (file) => {
        const compressed = await compressImage(file);
        return {
          file: compressed,
          preview: URL.createObjectURL(compressed)
        };
      })
    );

    setImages(prev => [...prev, ...processedFiles]);
    onImageSelect(processedFiles.map(pf => pf.file));
  }, [images, maxFiles, maxSizeMB, onImageSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: true
  });

  // Handle image removal
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    if (currentImageIndex === index) {
      setCurrentImageIndex(-1);
      setIsCropping(false);
    }
  };

  // Handle crop complete
  const handleCropComplete = async (crop: Crop) => {
    if (!crop || !images[currentImageIndex]) return;

    const image = images[currentImageIndex];
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.src = image.preview;

    await new Promise((resolve) => {
      img.onload = () => {
        const scaleX = img.naturalWidth / img.width;
        const scaleY = img.naturalHeight / img.height;
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.drawImage(
            img,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width,
            crop.height
          );
        }

        canvas.toBlob((blob) => {
          if (blob) {
            const croppedFile = new File([blob], image.file.name, {
              type: image.file.type,
            });

            setImages(prev => prev.map((img, i) => 
              i === currentImageIndex 
                ? { file: croppedFile, preview: URL.createObjectURL(blob) }
                : img
            ));

            onImageSelect(images.map((img, i) => 
              i === currentImageIndex ? croppedFile : img.file
            ));
          }
          resolve(null);
        }, image.file.type);
      };
    });

    setIsCropping(false);
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary-main bg-primary-main/5' : 'border-gray-300 hover:border-primary-main'}`}
      >
        <input {...getInputProps()} />
        <p className="text-gray-600">
          {isDragActive
            ? 'Drop the images here...'
            : 'Drag and drop images here, or click to select files'}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Supports: JPG, PNG, GIF, WebP (max {maxSizeMB}MB per file, up to {maxFiles} files)
        </p>
      </div>

      {/* Image Previews */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative group">
            <img
              src={image.preview}
              alt={`Preview ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
              <button
                onClick={() => {
                  setCurrentImageIndex(index);
                  setIsCropping(true);
                }}
                className="p-2 bg-white rounded-full hover:bg-gray-100"
                title="Crop image"
              >
                ✂️
              </button>
              <button
                onClick={() => removeImage(index)}
                className="p-2 bg-white rounded-full hover:bg-gray-100"
                title="Remove image"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Cropping Modal */}
      {isCropping && currentImageIndex !== -1 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-4 max-w-2xl w-full">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Crop Image</h3>
            </div>
            <ReactCrop
              crop={currentCrop}
              onChange={c => setCurrentCrop(c)}
              onComplete={handleCropComplete}
            >
              <img src={images[currentImageIndex].preview} alt="Crop preview" />
            </ReactCrop>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => {
                  setIsCropping(false);
                  setCurrentImageIndex(-1);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCropComplete(currentCrop!)}
                className="px-4 py-2 bg-primary-main text-white rounded-lg hover:bg-primary-dark"
              >
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 