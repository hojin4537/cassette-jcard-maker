import React, { useState } from 'react';
import './TrackListInput.css';

interface TrackListInputProps {
  label?: string;
  tracks: string[];
  onChange: (tracks: string[]) => void;
}

export const TrackListInput: React.FC<TrackListInputProps> = ({
  label = '수록곡 리스트',
  tracks,
  onChange,
}) => {
  const [newTrack, setNewTrack] = useState('');

  const handleAddTrack = () => {
    if (newTrack.trim()) {
      onChange([...tracks, newTrack.trim()]);
      setNewTrack('');
    }
  };

  const handleRemoveTrack = (index: number) => {
    onChange(tracks.filter((_, i) => i !== index));
  };

  const handleTrackChange = (index: number, value: string) => {
    const newTracks = [...tracks];
    newTracks[index] = value;
    onChange(newTracks);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddTrack();
    }
  };

  return (
    <div className="track-list-input">
      <label className="track-list-label">{label}</label>
      
      <div className="track-list-items">
        {tracks.map((track, index) => (
          <div key={index} className="track-list-item">
            <span className="track-list-number">{index + 1}.</span>
            <input
              type="text"
              className="track-list-input-field"
              value={track}
              onChange={(e) => handleTrackChange(index, e.target.value)}
              placeholder="곡 제목을 입력하세요"
            />
            <button
              type="button"
              className="track-list-remove"
              onClick={() => handleRemoveTrack(index)}
            >
              삭제
            </button>
          </div>
        ))}
      </div>

      <div className="track-list-add">
        <input
          type="text"
          className="track-list-add-input"
          value={newTrack}
          onChange={(e) => setNewTrack(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="새 곡 제목을 입력하고 Enter를 누르세요"
        />
        <button
          type="button"
          className="track-list-add-button"
          onClick={handleAddTrack}
        >
          추가
        </button>
      </div>
    </div>
  );
};

