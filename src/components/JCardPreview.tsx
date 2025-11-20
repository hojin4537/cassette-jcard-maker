import React, { useEffect, useState } from 'react';
import type { JCardData } from '../types/editor';
import { renderFullJCard } from '../utils/jcardGenerator';
import { downloadCanvas, createHighResCanvas } from '../utils/canvasExporter';
import './JCardPreview.css';
// Import editor styles for consistency
import './CassetteCoverEditor.css';
import './SpineEditor.css';
import './FlapEditor.css';

interface JCardPreviewProps {
  data: JCardData;
  onBack: () => void;
}

export const JCardPreview: React.FC<JCardPreviewProps> = ({ data, onBack }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (data.cover.image) {
      const url = URL.createObjectURL(data.cover.image);
      setImagePreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [data.cover.image]);

  const handleDownload = async (format: 'png' | 'jpg' = 'png') => {
    const canvas = createHighResCanvas('jcard');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    await renderFullJCard(ctx, data, 1);
    downloadCanvas(canvas, `jcard-${Date.now()}`, format);
  };

  const sideATracks = data.flap.sideA ?? [];
  const sideBTracks = data.flap.sideB ?? [];

  return (
    <div className="jcard-preview">
      <div className="preview-header">
        <button className="back-button" onClick={onBack}>
          ← 수정하기
        </button>
        <h2 className="preview-title">J카드 미리보기</h2>
        <div className="download-buttons">
          <button className="download-button" onClick={() => handleDownload('png')}>
            PNG 다운로드
          </button>
          <button className="download-button" onClick={() => handleDownload('jpg')}>
            JPG 다운로드
          </button>
        </div>
      </div>

      <div className="preview-content">
        <div className="jcard-full-preview">
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
              <div className="cover-preview-image" style={{
                backgroundImage: `url(${imagePreview})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}>
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
  );
};

