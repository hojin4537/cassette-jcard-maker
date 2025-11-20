import React, { useRef, useState } from 'react';
import type { DragEvent } from 'react';
import './ImageUpload.css';

interface ImageUploadProps {
  onImageSelect: (files: File[]) => void;
  maxFiles?: number;
  accept?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelect,
  maxFiles = 5,
  accept = 'image/*',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files).slice(0, maxFiles);
    onImageSelect(fileArray);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  return (
    <div
      className={`image-upload ${isDragging ? 'image-upload-dragging' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple
        onChange={handleFileInputChange}
        className="image-upload-input"
      />
      <div className="image-upload-content">
        <svg
          className="image-upload-icon"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p className="image-upload-text">
          {isDragging ? '이미지를 여기에 놓으세요' : '이미지를 드래그하거나 클릭하여 업로드'}
        </p>
        <p className="image-upload-hint">최대 {maxFiles}개 파일</p>
      </div>
    </div>
  );
};

