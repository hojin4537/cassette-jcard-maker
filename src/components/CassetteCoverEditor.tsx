import React, { useState, useEffect } from 'react';
import type { CassetteCoverData, FontSettings } from '../types/editor';
import { ImageUpload } from './ImageUpload';
import { TextInput } from './TextInput';
import { FontSelector } from './FontSelector';
import { ColorSelector } from './ColorSelector';
import { extractDominantColor, rgbToHex, getContrastTextColor } from '../utils/imageProcessor';
import { loadImage } from '../utils/imageProcessor';
import './CassetteCoverEditor.css';

interface CassetteCoverEditorProps {
  data: CassetteCoverData;
  onChange: (data: CassetteCoverData) => void;
  onNext: () => void;
}

export const CassetteCoverEditor: React.FC<CassetteCoverEditorProps> = ({
  data,
  onChange,
  onNext,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [recommendedColor, setRecommendedColor] = useState<string>('#FFFFFF');
  const [zoom, setZoom] = useState(1.0);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3.0));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleZoomReset = () => {
    setZoom(1.0);
  };

  useEffect(() => {
    if (data.image) {
      const url = URL.createObjectURL(data.image);
      setImagePreview(url);

      // 이미지에서 색상 추출
      loadImage(url)
        .then((img) => extractDominantColor(img))
        .then((rgb) => {
          const hex = rgbToHex(rgb);
          const contrastColor = getContrastTextColor(rgb);
          setRecommendedColor(contrastColor);
          onChange({
            ...data,
            dominantColor: hex,
            textColor: data.textColor || contrastColor,
          });
        })
        .catch(console.error);

      return () => URL.revokeObjectURL(url);
    } else {
      setImagePreview(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.image]);

  const handleImageSelect = (files: File[]) => {
    if (files.length > 0) {
      onChange({ ...data, image: files[0] });
    }
  };

  const handleAlbumNameChange = (value: string) => {
    onChange({ ...data, albumName: value });
  };

  const handleFontChange = (font: FontSettings) => {
    onChange({ ...data, font });
  };

  const handleColorChange = (color: string) => {
    onChange({ ...data, textColor: color });
  };

  const canProceed = data.image && data.albumName.trim().length > 0;

  return (
    <div className="cassette-cover-editor">
      <div className="editor-sidebar">
        <div className="editor-header">
          <h2 className="editor-title">Step 1: Cassette Cover</h2>
          <p className="editor-subtitle">메인 이미지와 앨범 이름을 입력하세요</p>
        </div>

        <div className="editor-sidebar-inner">
          <div className="input-section">
            <h3 className="section-title">메인 이미지</h3>
            <ImageUpload onImageSelect={handleImageSelect} maxFiles={1} />
            {imagePreview && (
              <div className="image-preview-container">
                <img src={imagePreview} alt="Preview" className="image-preview" />
              </div>
            )}
          </div>

          <div className="input-section">
            <h3 className="section-title">앨범 이름</h3>
            <TextInput
              label="앨범 이름"
              value={data.albumName}
              onChange={handleAlbumNameChange}
              placeholder="앨범 이름을 입력하세요"
            />
          </div>

          <div className="input-section">
            <h3 className="section-title">폰트 설정</h3>
            <FontSelector value={data.font} onChange={handleFontChange} />
          </div>

          <div className="input-section">
            <h3 className="section-title">텍스트 색상</h3>
            <ColorSelector
              label="텍스트 색상"
              value={data.textColor}
              onChange={handleColorChange}
              recommendedColor={recommendedColor}
            />
          </div>

          <button
            className="next-button"
            onClick={onNext}
            disabled={!canProceed}
          >
            다음 단계 (Spine) →
          </button>
        </div>
      </div>

      <div className="editor-content">
        <div className="editor-preview">
          <div className="zoom-controls">
            <button className="zoom-button" onClick={handleZoomOut} disabled={zoom <= 0.5}>
              −
            </button>
            <span className="zoom-level">{Math.round(zoom * 100)}%</span>
            <button className="zoom-button" onClick={handleZoomIn} disabled={zoom >= 3.0}>
              +
            </button>
            <button className="zoom-reset-button" onClick={handleZoomReset}>
              리셋
            </button>
          </div>
          {imagePreview ? (
            <div className="cover-preview">
              <div
                className="cover-preview-image"
                style={{
                  backgroundImage: `url(${imagePreview})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  transform: `scale(${zoom})`,
                }}
              >
                <div
                  className="cover-preview-text"
                  style={{
                    fontFamily: data.font.family,
                    fontSize: `${data.font.size}px`,
                    fontWeight: data.font.weight,
                    color: data.textColor,
                  }}
                >
                  {data.albumName || '앨범 이름'}
                </div>
              </div>
            </div>
          ) : (
            <div className="preview-placeholder">
              <p>이미지를 업로드하면 미리보기가 표시됩니다</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

