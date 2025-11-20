import type { EditorType, TextElement, ImageElement, AutoLayoutResult, ColorScheme } from '../types/editor';
import { JCARD_DIMENSIONS, LABEL_DIMENSIONS, cmToPixels } from './dimensions';
import {
  extractDominantColor,
  rgbToHex,
  getContrastTextColor,
  adjustBrightness,
  getComplementaryColor,
  loadImage,
  resizeImage,
} from './imageProcessor';
import type { RGB } from './imageProcessor';

interface LayoutInput {
  texts: string[];
  images: File[];
  type: EditorType;
}

/**
 * 텍스트 길이에 따라 폰트 크기를 결정합니다
 */
function getFontSize(textLength: number, panelWidth: number): number {
  if (textLength <= 10) return Math.min(24, panelWidth * 0.15);
  if (textLength <= 20) return Math.min(18, panelWidth * 0.12);
  if (textLength <= 30) return Math.min(14, panelWidth * 0.1);
  return Math.min(12, panelWidth * 0.08);
}

/**
 * 이미지에서 색상 스킴을 생성합니다
 */
async function generateColorScheme(dominantColor: RGB): Promise<ColorScheme> {
  const background = adjustBrightness(dominantColor, 0.9);
  const text = getContrastTextColor(background);
  const accent = getComplementaryColor(dominantColor);

  return {
    background: rgbToHex(background),
    text: text,
    accent: rgbToHex(accent),
  };
}

/**
 * J카드 자동 레이아웃 생성
 */
async function createJCardLayout(input: LayoutInput): Promise<AutoLayoutResult> {
  const dimensions = JCARD_DIMENSIONS;
  const texts: TextElement[] = [];
  const images: ImageElement[] = [];

  // 이미지 처리
  let dominantColor: RGB = { r: 200, g: 200, b: 200 }; // 기본 색상
  if (input.images.length > 0) {
    const firstImage = input.images[0];
    const imageUrl = URL.createObjectURL(firstImage);
    const img = await loadImage(imageUrl);
    dominantColor = await extractDominantColor(img);

    // 메인 이미지를 FRONT COVER에 배치
    const frontCover = dimensions.panels.front.frontCover;
    const frontCoverWidth = cmToPixels(frontCover.width, dimensions.dpi);
    const frontCoverHeight = cmToPixels(frontCover.height, dimensions.dpi);
    const resized = resizeImage(img, frontCoverWidth, frontCoverHeight);

    const backCoverWidth = cmToPixels(dimensions.panels.front.backCover.width, dimensions.dpi);
    const spineWidth = cmToPixels(dimensions.panels.front.spine.width, dimensions.dpi);
    const x = backCoverWidth + spineWidth;

    images.push({
      id: `img-${Date.now()}`,
      src: imageUrl,
      x,
      y: 0,
      width: resized.width,
      height: resized.height,
      panel: 'frontCover',
      originalWidth: img.width,
      originalHeight: img.height,
    });
  }

  // 색상 스킴 생성
  const colorScheme = await generateColorScheme(dominantColor);

  // 텍스트 배치
  if (input.texts.length > 0) {
    const title = input.texts[0];
    const frontCover = dimensions.panels.front.frontCover;
    const frontCoverWidth = cmToPixels(frontCover.width, dimensions.dpi);
    const fontSize = getFontSize(title.length, frontCoverWidth);

    const backCoverWidth = cmToPixels(dimensions.panels.front.backCover.width, dimensions.dpi);
    const spineWidth = cmToPixels(dimensions.panels.front.spine.width, dimensions.dpi);
    const padding = cmToPixels(0.5, dimensions.dpi); // 0.5cm 패딩
    const x = backCoverWidth + spineWidth + padding;

    texts.push({
      id: `text-${Date.now()}`,
      content: title,
      fontSize,
      fontWeight: 'bold',
      color: colorScheme.text,
      x,
      y: padding,
      width: frontCoverWidth - padding * 2,
      height: fontSize * 3,
      panel: 'frontCover',
    });

    // 추가 텍스트를 BACK COVER에 배치
    if (input.texts.length > 1) {
      const backCover = dimensions.panels.front.backCover;
      const backCoverWidth = cmToPixels(backCover.width, dimensions.dpi);

      input.texts.slice(1).forEach((text, index) => {
        const textFontSize = getFontSize(text.length, backCoverWidth);
        texts.push({
          id: `text-${Date.now()}-${index}`,
          content: text,
          fontSize: textFontSize,
          fontWeight: 'normal',
          color: colorScheme.text,
          x: padding,
          y: padding + index * (textFontSize * 1.5 + padding),
          width: backCoverWidth - padding * 2,
          height: textFontSize * 2,
          panel: 'backCover',
        });
      });
    }
  }

  return { texts, images, colorScheme };
}

/**
 * 라벨 스티커 자동 레이아웃 생성
 */
async function createLabelLayout(input: LayoutInput): Promise<AutoLayoutResult> {
  const dimensions = LABEL_DIMENSIONS;
  const texts: TextElement[] = [];
  const images: ImageElement[] = [];

  // 이미지 처리
  let dominantColor: RGB = { r: 200, g: 200, b: 200 };
  if (input.images.length > 0) {
    const firstImage = input.images[0];
    const imageUrl = URL.createObjectURL(firstImage);
    const img = await loadImage(imageUrl);
    dominantColor = await extractDominantColor(img);

    // 메인 이미지를 메인 이미지 패널에 배치
    const mainImagePanel = dimensions.panels.mainImage;
    const panelWidth = cmToPixels(mainImagePanel.width, dimensions.dpi);
    const panelHeight = cmToPixels(mainImagePanel.height, dimensions.dpi);
    const resized = resizeImage(img, panelWidth, panelHeight);

    const flapWidth = cmToPixels(dimensions.panels.flap.width, dimensions.dpi);
    const spineWidth = cmToPixels(dimensions.panels.spine.width, dimensions.dpi);
    const x = flapWidth + spineWidth;

    images.push({
      id: `img-${Date.now()}`,
      src: imageUrl,
      x,
      y: 0,
      width: resized.width,
      height: resized.height,
      panel: 'mainImage',
      originalWidth: img.width,
      originalHeight: img.height,
    });
  }

  // 색상 스킴 생성
  const colorScheme = await generateColorScheme(dominantColor);

  // 텍스트 배치
  if (input.texts.length > 0) {
    const title = input.texts[0];
    const mainImagePanel = dimensions.panels.mainImage;
    const panelWidth = cmToPixels(mainImagePanel.width, dimensions.dpi);
    const fontSize = getFontSize(title.length, panelWidth);

    const flapWidth = cmToPixels(dimensions.panels.flap.width, dimensions.dpi);
    const spineWidth = cmToPixels(dimensions.panels.spine.width, dimensions.dpi);
    const padding = cmToPixels(0.5, dimensions.dpi); // 0.5cm 패딩
    const x = flapWidth + spineWidth + padding;

    texts.push({
      id: `text-${Date.now()}`,
      content: title,
      fontSize,
      fontWeight: 'bold',
      color: colorScheme.text,
      x,
      y: padding,
      width: panelWidth - padding * 2,
      height: fontSize * 3,
      panel: 'mainImage',
    });

    // 추가 텍스트를 패널1에 배치
    if (input.texts.length > 1) {
      const panel1 = dimensions.panels.panel1;
      const panel1Width = cmToPixels(panel1.width, dimensions.dpi);

      const flapWidth = cmToPixels(dimensions.panels.flap.width, dimensions.dpi);
      const spineWidth = cmToPixels(dimensions.panels.spine.width, dimensions.dpi);
      const mainImageWidth = cmToPixels(dimensions.panels.mainImage.width, dimensions.dpi);
      const x = flapWidth + spineWidth + mainImageWidth + padding;

      input.texts.slice(1).forEach((text, index) => {
        const textFontSize = getFontSize(text.length, panel1Width);
        texts.push({
          id: `text-${Date.now()}-${index}`,
          content: text,
          fontSize: textFontSize,
          fontWeight: 'normal',
          color: colorScheme.text,
          x,
          y: padding + index * (textFontSize * 1.5 + padding),
          width: panel1Width - padding * 2,
          height: textFontSize * 2,
          panel: 'panel1',
        });
      });
    }
  }

  return { texts, images, colorScheme };
}

/**
 * 자동 레이아웃 생성 메인 함수
 */
export async function generateAutoLayout(input: LayoutInput): Promise<AutoLayoutResult> {
  if (input.type === 'jcard') {
    return createJCardLayout(input);
  } else {
    return createLabelLayout(input);
  }
}

