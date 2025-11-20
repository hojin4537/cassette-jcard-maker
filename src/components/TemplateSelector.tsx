import React from 'react';
import type { Template } from '../types/editor';
import './TemplateSelector.css';

interface TemplateSelectorProps {
  onSelectTemplate: (template: Template) => void;
}

const templates: Template[] = [
  {
    id: 'jcard-1',
    name: 'J카드 기본',
    type: 'jcard',
    preview: '🎵',
  },
];

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelectTemplate }) => {
  return (
    <div className="template-selector">
      <div className="selector-header">
        <h1 className="selector-title">카세트 테이프 에디터</h1>
        <p className="selector-subtitle">J카드를 만들어보세요</p>
      </div>

      <div className="templates-grid">
        {templates.map((template) => (
          <div
            key={template.id}
            className="template-card"
            onClick={() => onSelectTemplate(template)}
          >
            <div className="template-preview">{template.preview}</div>
            <h3 className="template-name">{template.name}</h3>
            <p className="template-type">{template.type === 'jcard' ? 'J카드' : '라벨 스티커'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

