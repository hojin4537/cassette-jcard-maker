import { cmToPixels, JCARD_DIMENSIONS, LABEL_DIMENSIONS } from './dimensions';
import type { EditorType, TextElement, ImageElement } from '../types/editor';

/**
 * Canvas를 PNG/JPG로 변환하여 다운로드
 */
export function downloadCanvas(
  canvas: HTMLCanvasElement,
  filename: string,
  format: 'png' | 'jpg' = 'png',
  quality: number = 0.92
): void {
  const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
  const dataUrl = canvas.toDataURL(mimeType, quality);
  
  const link = document.createElement('a');
  link.download = `${filename}.${format}`;
  link.href = dataUrl;
  link.click();
}

/**
 * 고해상도 Canvas를 생성합니다 (300 DPI 기준, J카드는 bleed 포함)
 */
export function createHighResCanvas(
  type: EditorType,
  scale: number = 1
): HTMLCanvasElement {
  let width: number;
  let height: number;
  
  if (type === 'jcard') {
    // J카드는 bleed 포함 크기 계산
    const totalPanelWidth = JCARD_DIMENSIONS.panels.front.backCover.width + 
                            JCARD_DIMENSIONS.panels.front.spine.width + 
                            JCARD_DIMENSIONS.panels.front.frontCover.width;
    const totalWidth = totalPanelWidth + (JCARD_DIMENSIONS.bleed * 2);
    const totalHeight = JCARD_DIMENSIONS.height + (JCARD_DIMENSIONS.bleed * 2);
    width = cmToPixels(totalWidth, JCARD_DIMENSIONS.dpi) * scale;
    height = cmToPixels(totalHeight, JCARD_DIMENSIONS.dpi) * scale;
  } else {
    const dimensions = LABEL_DIMENSIONS;
    width = cmToPixels(dimensions.width, dimensions.dpi) * scale;
    height = cmToPixels(dimensions.height, dimensions.dpi) * scale;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

/**
 * Canvas에 텍스트를 렌더링합니다
 */
export function renderText(
  ctx: CanvasRenderingContext2D,
  text: TextElement,
  scale: number = 1
): void {
  ctx.save();
  ctx.font = `${text.fontWeight} ${text.fontSize * scale}px sans-serif`;
  ctx.fillStyle = text.color;
  ctx.textBaseline = 'top';
  
  // 텍스트 줄바꿈 처리
  const words = text.content.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > text.width * scale && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }

  // 텍스트 그리기
  lines.forEach((line, index) => {
    ctx.fillText(line, text.x * scale, (text.y + index * text.fontSize * 1.2) * scale);
  });

  ctx.restore();
}

/**
 * Canvas에 이미지를 렌더링합니다
 */
export function renderImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  imageElement: ImageElement,
  scale: number = 1
): Promise<void> {
  return new Promise((resolve) => {
    if (image.complete) {
      ctx.drawImage(
        image,
        imageElement.x * scale,
        imageElement.y * scale,
        imageElement.width * scale,
        imageElement.height * scale
      );
      resolve();
    } else {
      image.onload = () => {
        ctx.drawImage(
          image,
          imageElement.x * scale,
          imageElement.y * scale,
          imageElement.width * scale,
          imageElement.height * scale
        );
        resolve();
      };
    }
  });
}

