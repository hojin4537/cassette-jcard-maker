import React from 'react';
import type { FontSettings } from '../types/editor';
import './FontSelector.css';

interface FontSelectorProps {
  value: FontSettings;
  onChange: (font: FontSettings) => void;
}

const FONT_FAMILIES = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Impact', label: 'Impact' },
  { value: 'Comic Sans MS', label: 'Comic Sans MS' },
];

const FONT_WEIGHTS = [
  { value: '300', label: 'Light' },
  { value: '400', label: 'Normal' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semi Bold' },
  { value: '700', label: 'Bold' },
];

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64];

export const FontSelector: React.FC<FontSelectorProps> = ({ value, onChange }) => {
  const handleFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...value, family: e.target.value });
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...value, size: parseInt(e.target.value, 10) });
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...value, weight: e.target.value as FontSettings['weight'] });
  };

  return (
    <div className="font-selector">
      <div className="font-selector-group">
        <label className="font-selector-label">폰트</label>
        <select
          className="font-selector-select"
          value={value.family}
          onChange={handleFamilyChange}
        >
          {FONT_FAMILIES.map((font) => (
            <option key={font.value} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>
      </div>

      <div className="font-selector-group">
        <label className="font-selector-label">크기</label>
        <select
          className="font-selector-select"
          value={value.size}
          onChange={handleSizeChange}
        >
          {FONT_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}px
            </option>
          ))}
        </select>
      </div>

      <div className="font-selector-group">
        <label className="font-selector-label">굵기</label>
        <select
          className="font-selector-select"
          value={value.weight}
          onChange={handleWeightChange}
        >
          {FONT_WEIGHTS.map((weight) => (
            <option key={weight.value} value={weight.value}>
              {weight.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

