import React, { useState } from 'react';
import type { EditorState } from '../types/editor';
import { TextInput } from './TextInput';
import { ImageUpload } from './ImageUpload';
import { CanvasPreview } from './CanvasPreview';
import { generateAutoLayout } from '../utils/autoLayout';
import { downloadCanvas, createHighResCanvas, renderText, renderImage } from '../utils/canvasExporter';
import { loadImage } from '../utils/imageProcessor';
import './JCardEditor.css';

interface JCardEditorProps {
  onBack?: () => void;
}

export const JCardEditor: React.FC<JCardEditorProps> = ({ onBack }) => {
  const [texts, setTexts] = useState<string[]>(['']);
  const [images, setImages] = useState<File[]>([]);
  const [editorState, setEditorState] = useState<EditorState | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleTextChange = (index: number, value: string) => {
    const newTexts = [...texts];
    newTexts[index] = value;
    setTexts(newTexts);
  };

  const addTextInput = () => {
    setTexts([...texts, '']);
  };

  const removeTextInput = (index: number) => {
    if (texts.length > 1) {
      setTexts(texts.filter((_, i) => i !== index));
    }
  };

  const handleImageSelect = (files: File[]) => {
    setImages(files);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const filteredTexts = texts.filter((t) => t.trim().length > 0);
      const result = await generateAutoLayout({
        texts: filteredTexts,
        images,
        type: 'jcard',
      });

      setEditorState({
        type: 'jcard',
        texts: result.texts,
        images: result.images,
        colorScheme: result.colorScheme,
        selectedElementId: null,
      });
    } catch (error) {
      console.error('Failed to generate layout:', error);
      alert('레이아웃 생성에 실패했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (format: 'png' | 'jpg' = 'png') => {
    if (!editorState) return;

    const canvas = createHighResCanvas('jcard');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 배경 그리기
    ctx.fillStyle = editorState.colorScheme.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 이미지 렌더링
    for (const imgElement of editorState.images) {
      const img = await loadImage(imgElement.src);
      await renderImage(ctx, img, imgElement, 1);
    }

    // 텍스트 렌더링
    editorState.texts.forEach((text) => {
      renderText(ctx, text, 1);
    });

    downloadCanvas(canvas, `jcard-${Date.now()}`, format);
  };

  return (
    <div className="jcard-editor">
      <div className="editor-header">
        <button className="back-button" onClick={onBack}>
          ← 처음으로
        </button>
        <h1 className="editor-title">J카드 에디터</h1>
        {editorState && (
          <div className="download-buttons">
            <button className="download-button" onClick={() => handleDownload('png')}>
              PNG 다운로드
            </button>
            <button className="download-button" onClick={() => handleDownload('jpg')}>
              JPG 다운로드
            </button>
          </div>
        )}
      </div>

      <div className="editor-content">
        <div className="editor-sidebar">
          <div className="input-section">
            <h2 className="section-title">텍스트 입력</h2>
            {texts.map((text, index) => (
              <div key={index} className="text-input-wrapper">
                <TextInput
                  label={`텍스트 ${index + 1}`}
                  value={text}
                  onChange={(value) => handleTextChange(index, value)}
                  placeholder="텍스트를 입력하세요..."
                />
                {texts.length > 1 && (
                  <button
                    className="remove-button"
                    onClick={() => removeTextInput(index)}
                  >
                    삭제
                  </button>
                )}
              </div>
            ))}
            <button className="add-button" onClick={addTextInput}>
              + 텍스트 추가
            </button>
          </div>

          <div className="input-section">
            <h2 className="section-title">이미지 업로드</h2>
            <ImageUpload onImageSelect={handleImageSelect} maxFiles={3} />
            {images.length > 0 && (
              <div className="image-preview-list">
                {images.map((img, index) => (
                  <div key={index} className="image-preview-item">
                    <img
                      src={URL.createObjectURL(img)}
                      alt={`Preview ${index + 1}`}
                      className="image-preview"
                    />
                    <span className="image-name">{img.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            className="generate-button"
            onClick={handleGenerate}
            disabled={isGenerating || (texts.every((t) => !t.trim()) && images.length === 0)}
          >
            {isGenerating ? '생성 중...' : '자동 생성'}
          </button>
        </div>

        <div className="editor-preview">
          {editorState ? (
            <CanvasPreview
              type="jcard"
              texts={editorState.texts}
              images={editorState.images}
              colorScheme={editorState.colorScheme}
            />
          ) : (
            <div className="preview-placeholder">
              <p>텍스트와 이미지를 입력한 후 "자동 생성" 버튼을 클릭하세요</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

