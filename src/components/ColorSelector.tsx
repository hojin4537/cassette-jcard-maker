import React from 'react';
import './ColorSelector.css';

interface ColorSelectorProps {
  value: string;
  onChange: (color: string) => void;
  recommendedColor?: string;
  label?: string;
}

const PRESET_COLORS = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
  '#FFC0CB', '#A52A2A', '#808080', '#000080', '#008000',
];

export const ColorSelector: React.FC<ColorSelectorProps> = ({
  value,
  onChange,
  recommendedColor,
  label = '색상',
}) => {
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handlePresetClick = (color: string) => {
    onChange(color);
  };

  return (
    <div className="color-selector">
      <label className="color-selector-label">{label}</label>
      
      <div className="color-selector-main">
        <div className="color-selector-input-wrapper">
          <input
            type="color"
            className="color-selector-input"
            value={value}
            onChange={handleColorChange}
          />
          <input
            type="text"
            className="color-selector-text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#000000"
          />
        </div>

        {recommendedColor && (
          <button
            type="button"
            className="color-selector-recommended"
            onClick={() => onChange(recommendedColor)}
            title="추천 색상 사용"
          >
            추천 색상
            <span
              className="color-selector-preview"
              style={{ backgroundColor: recommendedColor }}
            />
          </button>
        )}
      </div>

      <div className="color-selector-presets">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            className={`color-selector-preset ${value === color ? 'active' : ''}`}
            style={{ backgroundColor: color }}
            onClick={() => handlePresetClick(color)}
            title={color}
          />
        ))}
      </div>
    </div>
  );
};

