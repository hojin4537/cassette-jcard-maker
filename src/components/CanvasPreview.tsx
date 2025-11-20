import React, { useRef, useEffect, useState } from 'react';
import type { EditorType, TextElement, ImageElement, ColorScheme } from '../types/editor';
import { JCARD_DIMENSIONS, LABEL_DIMENSIONS, cmToPixels, getDisplayScale } from '../utils/dimensions';
import { renderText, renderImage } from '../utils/canvasExporter';
import { loadImage } from '../utils/imageProcessor';
import './CanvasPreview.css';

interface CanvasPreviewProps {
  type: EditorType;
  texts: TextElement[];
  images: ImageElement[];
  colorScheme: ColorScheme;
  width?: number;
  height?: number;
}

export const CanvasPreview: React.FC<CanvasPreviewProps> = ({
  type,
  texts,
  images,
  colorScheme,
  width = 600,
  height = 600,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageCache, setImageCache] = useState<Map<string, HTMLImageElement>>(new Map());

  const dimensions = type === 'jcard' ? JCARD_DIMENSIONS : LABEL_DIMENSIONS;
  const designWidth = cmToPixels(dimensions.width, dimensions.dpi);
  const designHeight = cmToPixels(dimensions.height, dimensions.dpi);
  const scale = getDisplayScale(width, height, designWidth, designHeight);
  const displayWidth = designWidth * scale;
  const displayHeight = designHeight * scale;

  // 이미지 로드
  useEffect(() => {
    const loadImages = async () => {
      const newCache = new Map<string, HTMLImageElement>();
      for (const imgElement of images) {
        if (!imageCache.has(imgElement.src)) {
          try {
            const img = await loadImage(imgElement.src);
            newCache.set(imgElement.src, img);
          } catch (error) {
            console.error('Failed to load image:', imgElement.src, error);
          }
        }
      }
      if (newCache.size > 0) {
        setImageCache((prev) => new Map([...prev, ...newCache]));
      }
    };
    loadImages();
  }, [images, imageCache]);

  // Canvas 렌더링
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = async () => {
      // Canvas 크기 설정
      canvas.width = displayWidth;
      canvas.height = displayHeight;

      // 배경 그리기
      ctx.fillStyle = colorScheme.background;
      ctx.fillRect(0, 0, displayWidth, displayHeight);

      // 패널 구분선 그리기 (개발용)
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.lineWidth = 1;

      if (type === 'jcard') {
        const backCoverWidth = cmToPixels(JCARD_DIMENSIONS.panels.front.backCover.width, JCARD_DIMENSIONS.dpi) * scale;
        const spineWidth = cmToPixels(JCARD_DIMENSIONS.panels.front.spine.width, JCARD_DIMENSIONS.dpi) * scale;
        ctx.beginPath();
        ctx.moveTo(backCoverWidth, 0);
        ctx.lineTo(backCoverWidth, displayHeight);
        ctx.moveTo(backCoverWidth + spineWidth, 0);
        ctx.lineTo(backCoverWidth + spineWidth, displayHeight);
        ctx.stroke();
      } else {
        const flapWidth = cmToPixels(LABEL_DIMENSIONS.panels.flap.width, LABEL_DIMENSIONS.dpi) * scale;
        const spineWidth = cmToPixels(LABEL_DIMENSIONS.panels.spine.width, LABEL_DIMENSIONS.dpi) * scale;
        const mainImageWidth = cmToPixels(LABEL_DIMENSIONS.panels.mainImage.width, LABEL_DIMENSIONS.dpi) * scale;
        ctx.beginPath();
        ctx.moveTo(flapWidth, 0);
        ctx.lineTo(flapWidth, displayHeight);
        ctx.moveTo(flapWidth + spineWidth, 0);
        ctx.lineTo(flapWidth + spineWidth, displayHeight);
        ctx.moveTo(flapWidth + spineWidth + mainImageWidth, 0);
        ctx.lineTo(flapWidth + spineWidth + mainImageWidth, displayHeight);
        ctx.stroke();
      }

      // 이미지 렌더링
      for (const imgElement of images) {
        const img = imageCache.get(imgElement.src);
        if (img) {
          await renderImage(ctx, img, imgElement, scale);
        }
      }

      // 텍스트 렌더링
      texts.forEach((text) => {
        renderText(ctx, text, scale);
      });
    };

    render();
  }, [type, texts, images, colorScheme, displayWidth, displayHeight, scale, imageCache]);

  return (
    <div className="canvas-preview-container">
      <canvas
        ref={canvasRef}
        className="canvas-preview"
        style={{ width: displayWidth, height: displayHeight }}
      />
    </div>
  );
};

