import React, { useEffect, useState } from 'react';
import type { SpineData } from '../types/editor';
import { TextInput } from './TextInput';
import { FontSelector } from './FontSelector';
import { ColorSelector } from './ColorSelector';
import { getContrastTextColor, hexToRgb } from '../utils/imageProcessor';
import './SpineEditor.css';

interface SpineEditorProps {
  data: SpineData;
  coverDominantColor?: string;
  coverAlbumName: string;
  onChange: (data: SpineData) => void;
  onBack: () => void;
  onNext: () => void;
}

export const SpineEditor: React.FC<SpineEditorProps> = ({
  data,
  coverDominantColor,
  coverAlbumName,
  onChange,
  onBack,
  onNext,
}) => {
  const [zoom, setZoom] = useState(1.0);

  useEffect(() => {
    // Cover에서 앨범 이름과 배경 색상 가져오기
    const backgroundColor = coverDominantColor || '#808080';
    const rgb = hexToRgb(backgroundColor);
    const recommendedTextColor = getContrastTextColor(rgb);

    onChange({
      ...data,
      albumName: coverAlbumName,
      backgroundColor,
      textColor: data.textColor || recommendedTextColor,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coverDominantColor, coverAlbumName]);

  const handleArtistNameChange = (value: string) => {
    onChange({ ...data, artistName: value });
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3.0));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleZoomReset = () => {
    setZoom(1.0);
  };

  const canProceed = data.artistName.trim().length > 0;

  return (
    <div className="spine-editor">
      <div className="editor-sidebar">
        <div className="editor-header">
          <h2 className="editor-title">Step 2: Spine</h2>
          <p className="editor-subtitle">가수 이름을 입력하세요 (앨범 이름은 자동으로 입력됩니다)</p>
        </div>

        <div className="editor-sidebar-inner">
          <div className="input-section">
            <h3 className="section-title">가수 이름</h3>
            <TextInput
              label="가수 이름"
              value={data.artistName}
              onChange={handleArtistNameChange}
              placeholder="가수 이름을 입력하세요"
            />
          </div>

          <div className="input-section">
            <h3 className="section-title">앨범 이름</h3>
            <TextInput
              label="앨범 이름"
              value={data.albumName}
              onChange={() => { }} // 읽기 전용
              placeholder="앨범 이름 (자동 입력)"
              multiline={false}
            />
            <p className="info-text">앨범 이름은 Cassette Cover에서 자동으로 가져옵니다</p>
          </div>

          <div className="input-section">
            <h3 className="section-title">배경 색상</h3>
            <div className="color-preview" style={{ backgroundColor: data.backgroundColor }}>
              <div className="color-info">
                <p>Cassette Cover 이미지에서 추출한 색상</p>
                <p className="color-code">{data.backgroundColor}</p>
              </div>
            </div>
          </div>

          <div className="input-section">
            <h3 className="section-title">폰트 설정</h3>
            <FontSelector value={data.font} onChange={(font) => onChange({ ...data, font })} />
          </div>

          <div className="input-section">
            <h3 className="section-title">텍스트 색상</h3>
            <ColorSelector
              label="텍스트 색상"
              value={data.textColor}
              onChange={(color) => onChange({ ...data, textColor: color })}
              recommendedColor={getContrastTextColor(hexToRgb(data.backgroundColor))}
            />
          </div>

          <button className="back-button-sidebar" onClick={onBack}>
            ← 이전 단계 (Cover)
          </button>
          <button className="next-button" onClick={onNext} disabled={!canProceed}>
            다음 단계 (Flap) →
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
          <div className="spine-preview-container">
            <div className="spine-preview">
              <div
                className="spine-preview-box"
                style={{
                  backgroundColor: data.backgroundColor,
                  transform: `scale(${zoom})`,
                }}
              >
                <div
                  className="spine-preview-text"
                  style={{
                    color: data.textColor,
                    fontFamily: data.font.family,
                    fontSize: `${data.font.size}px`,
                    fontWeight: data.font.weight,
                  }}
                >
                  {data.artistName && data.albumName
                    ? `${data.artistName} - ${data.albumName}`
                    : data.artistName || data.albumName || '가수 이름 - 앨범 이름'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

