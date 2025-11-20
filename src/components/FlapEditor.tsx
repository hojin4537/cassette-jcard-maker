import React, { useEffect, useState } from 'react';
import type { FlapData, CassetteCoverData, SpineData } from '../types/editor';
import { TextInput } from './TextInput';
import { TrackListInput } from './TrackListInput';
import './FlapEditor.css';

interface FlapEditorProps {
  data: FlapData;
  coverData: CassetteCoverData;
  spineData: SpineData;
  coverAlbumName: string;
  onChange: (data: FlapData) => void;
  onBack: () => void;
  onNext: () => void;
}

export const FlapEditor: React.FC<FlapEditorProps> = ({
  data,
  coverData: _coverData,
  spineData: _spineData,
  coverAlbumName,
  onChange,
  onBack,
  onNext,
}) => {
  const sideATracks = data.sideA ?? [];
  const sideBTracks = data.sideB ?? [];
  const [zoom, setZoom] = useState(1.0);

  useEffect(() => {
    // Cover에서 앨범 이름 가져오기
    if (data.albumName !== coverAlbumName) {
      onChange({
        ...data,
        albumName: coverAlbumName,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coverAlbumName]);

  const handleSideTracksChange = (side: 'sideA' | 'sideB', tracks: string[]) => {
    onChange({ ...data, [side]: tracks } as FlapData);
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

  return (
    <div className="flap-editor">
      <div className="editor-sidebar">
        <div className="editor-header">
          <h2 className="editor-title">Step 3: Flap</h2>
          <p className="editor-subtitle">수록곡 리스트를 입력하세요</p>
        </div>

        <div className="editor-sidebar-inner">
          <div className="input-section">
            <h3 className="section-title">앨범 이름</h3>
            <TextInput
              label="앨범 이름"
              value={data.albumName}
              onChange={() => { }} // 읽기 전용
              placeholder="앨범 이름 (자동 입력)"
            />
            <p className="info-text">앨범 이름은 Cassette Cover에서 자동으로 가져옵니다</p>
          </div>

          <div className="input-section">
            <TrackListInput
              label="SIDE A 수록곡"
              tracks={sideATracks}
              onChange={(tracks) => handleSideTracksChange('sideA', tracks)}
            />
          </div>
          <div className="input-section">
            <TrackListInput
              label="SIDE B 수록곡"
              tracks={sideBTracks}
              onChange={(tracks) => handleSideTracksChange('sideB', tracks)}
            />
          </div>

          <button className="back-button-sidebar" onClick={onBack}>
            ← 이전 단계 (Spine)
          </button>
          <button className="next-button" onClick={onNext}>
            완료 및 미리보기 →
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
          <div className="flap-preview-container">
            <div className="flap-preview">
              <div
                className="flap-preview-box"
                style={{
                  transform: `scale(${zoom})`,
                }}
              >
                <div className="flap-preview-content">
                  {data.albumName && (
                    <div className="flap-preview-album">{data.albumName}</div>
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
          </div>
        </div>
      </div>
    </div>
  );
};

