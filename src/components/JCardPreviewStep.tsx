import React, { useEffect, useState, useRef } from 'react';
import type { JCardData } from '../types/editor';
import domtoimage from 'dom-to-image-more';
import './JCardWizard.css';
// Import editor styles for consistency
import './CassetteCoverEditor.css';
import './SpineEditor.css';
import './FlapEditor.css';

interface JCardPreviewStepProps {
  data: JCardData;
  onBack: () => void;
  onComplete: () => void;
}

export const JCardPreviewStep: React.FC<JCardPreviewStepProps> = ({
  data,
  onBack,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1.0);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data.cover.image) {
      const url = URL.createObjectURL(data.cover.image);
      setImagePreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [data.cover.image]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 2.0));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleZoomReset = () => {
    setZoom(1.0);
  };

  const handleDownload = async (format: 'png' | 'jpg' = 'png') => {
    if (!previewRef.current) return;

    try {
      // Convert blob URL to base64 for proper capture
      const imgElement = previewRef.current.querySelector('.cover-preview-img') as HTMLImageElement;
      let originalSrc = '';

      if (imgElement && imagePreview) {
        originalSrc = imgElement.src;

        // Fetch the blob and convert to base64
        const response = await fetch(imagePreview);
        const blob = await response.blob();
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });

        imgElement.src = base64;
        // Wait for image to load
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Capture the HTML element as image
      const dataUrl = await domtoimage.toPng(previewRef.current, {
        quality: 1,
        width: previewRef.current.scrollWidth,
        height: previewRef.current.scrollHeight,
        style: {
          transform: 'none', // Remove zoom transform for capture
        },
      });

      // Restore original src
      if (imgElement && originalSrc) {
        imgElement.src = originalSrc;
      }

      // Download the image
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `jcard-${Date.now()}.${format === 'jpg' ? 'jpg' : 'png'}`;
      link.click();
    } catch (error) {
      console.error('Failed to generate image:', error);
      alert('이미지 생성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const sideATracks = data.flap.sideA ?? [];
  const sideBTracks = data.flap.sideB ?? [];

  return (
    <div className="wizard-preview-step">
      <div className="wizard-preview-panel">
        <div className="wizard-preview-header">
          <h2>완성본 미리보기</h2>
          <p>Flap까지 입력한 내용을 바탕으로 Cover / Spine / Flap을 한 번에 확인하세요.</p>
        </div>
        <div className="wizard-preview-canvas-container">
          <div className="zoom-controls">
            <button className="zoom-button" onClick={handleZoomOut} disabled={zoom <= 0.5}>
              −
            </button>
            <span className="zoom-level">{Math.round(zoom * 100)}%</span>
            <button className="zoom-button" onClick={handleZoomIn} disabled={zoom >= 2.0}>
              +
            </button>
            <button className="zoom-reset-button" onClick={handleZoomReset}>
              리셋
            </button>
          </div>
          <div className="wizard-preview-canvas-wrapper">
            <div className="wizard-preview-html-content">
              <div
                ref={previewRef}
                className="jcard-full-preview-html"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top center'
                }}
              >
                {/* Flap Section */}
                <div className="preview-section flap-section">
                  <div className="flap-preview-box">
                    <div className="flap-preview-content">
                      {data.flap.albumName && (
                        <div className="flap-preview-album">{data.flap.albumName}</div>
                      )}
                      <div className="flap-preview-sides">
                        <div className="flap-preview-side-block">
                          <div className="flap-preview-side-label">SIDE A</div>
                          <div className="flap-preview-side-tracks">
                            {sideATracks.length > 0 ? (
                              sideATracks.map((track, index) => (
                                <React.Fragment key={index}>
                                  <div className="flap-preview-track">{track.trim()}</div>
                                  {index < sideATracks.length - 1 && (
                                    <span className="flap-preview-track-separator">•</span>
                                  )}
                                </React.Fragment>
                              ))
                            ) : (
                              <div className="flap-preview-track">곡을 추가하세요</div>
                            )}
                          </div>
                        </div>
                        <div className="flap-preview-side-block">
                          <div className="flap-preview-side-label">SIDE B</div>
                          <div className="flap-preview-side-tracks">
                            {sideBTracks.length > 0 ? (
                              sideBTracks.map((track, index) => (
                                <React.Fragment key={index}>
                                  <div className="flap-preview-track">{track.trim()}</div>
                                  {index < sideBTracks.length - 1 && (
                                    <span className="flap-preview-track-separator">•</span>
                                  )}
                                </React.Fragment>
                              ))
                            ) : (
                              <div className="flap-preview-track">곡을 추가하세요</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Spine Section */}
                <div className="preview-section spine-section">
                  <div className="spine-preview-box" style={{ backgroundColor: data.spine.backgroundColor }}>
                    <div
                      className="spine-preview-text"
                      style={{
                        color: data.spine.textColor,
                        fontFamily: data.spine.font.family,
                        fontSize: `${data.spine.font.size}px`,
                        fontWeight: data.spine.font.weight,
                      }}
                    >
                      {data.spine.artistName && data.spine.albumName
                        ? `${data.spine.artistName} - ${data.spine.albumName}`
                        : data.spine.artistName || data.spine.albumName || '가수 이름 - 앨범 이름'}
                    </div>
                  </div>
                </div>

                {/* Cover Section */}
                <div className="preview-section cover-section">
                  {imagePreview ? (
                    <div className="cover-preview-image-wrapper">
                      <img
                        src={imagePreview}
                        alt="Cover"
                        className="cover-preview-img"
                        crossOrigin="anonymous"
                      />
                      <div
                        className="cover-preview-text"
                        style={{
                          fontFamily: data.cover.font.family,
                          fontSize: `${data.cover.font.size}px`,
                          fontWeight: data.cover.font.weight,
                          color: data.cover.textColor,
                        }}
                      >
                        {data.cover.albumName || '앨범 이름'}
                      </div>
                    </div>
                  ) : (
                    <div className="preview-placeholder">
                      <p>이미지가 없습니다</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <p className="wizard-preview-hint">* 아래 버튼을 클릭하여 이미지로 다운로드하세요.</p>
      </div>
      <div className="wizard-preview-actions">
        <button className="back-button" onClick={onBack}>
          ← Flap 수정
        </button>
        <button className="download-button" onClick={() => handleDownload('png')}>
          PNG 다운로드
        </button>
        <button className="download-button" onClick={() => handleDownload('jpg')}>
          JPG 다운로드
        </button>
      </div>
    </div>
  );
};
