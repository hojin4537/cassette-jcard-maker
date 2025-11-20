export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface DominantColor {
  color: RGB;
  percentage: number;
}

/**
 * 이미지에서 주요 색상을 추출합니다 (Canvas ImageData 분석)
 */
export async function extractDominantColor(image: HTMLImageElement, sampleSize: number = 100): Promise<RGB> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // 샘플링하여 색상 추출
  const step = Math.floor(data.length / (sampleSize * 4));
  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;

  for (let i = 0; i < data.length; i += step * 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    count++;
  }

  return {
    r: Math.round(r / count),
    g: Math.round(g / count),
    b: Math.round(b / count),
  };
}

/**
 * RGB를 HEX 문자열로 변환
 */
export function rgbToHex(rgb: RGB): string {
  return `#${[rgb.r, rgb.g, rgb.b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('')}`;
}

/**
 * HEX를 RGB로 변환
 */
export function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : { r: 0, g: 0, b: 0 };
}

/**
 * 색상의 밝기를 계산합니다 (0-255)
 */
export function getBrightness(rgb: RGB): number {
  return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
}

/**
 * 배경색에 맞는 텍스트 색상을 자동 생성 (대비 보장)
 */
export function getContrastTextColor(backgroundColor: RGB): string {
  const brightness = getBrightness(backgroundColor);
  return brightness > 128 ? '#000000' : '#FFFFFF';
}

/**
 * 색상의 보색을 계산합니다
 */
export function getComplementaryColor(rgb: RGB): RGB {
  return {
    r: 255 - rgb.r,
    g: 255 - rgb.g,
    b: 255 - rgb.b,
  };
}

/**
 * 유사한 색상을 생성합니다 (밝기 조정)
 */
export function adjustBrightness(rgb: RGB, factor: number): RGB {
  return {
    r: Math.max(0, Math.min(255, Math.round(rgb.r * factor))),
    g: Math.max(0, Math.min(255, Math.round(rgb.g * factor))),
    b: Math.max(0, Math.min(255, Math.round(rgb.b * factor))),
  };
}

/**
 * 이미지를 로드합니다
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * 이미지를 지정된 크기로 리사이즈합니다 (비율 유지)
 */
export function resizeImage(
  image: HTMLImageElement,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const ratio = Math.min(maxWidth / image.width, maxHeight / image.height);
  return {
    width: image.width * ratio,
    height: image.height * ratio,
  };
}

/**
 * 이미지에 블러 효과를 적용합니다 (최적화된 박스 블러)
 */
export function applyBlur(
  imageData: ImageData,
  radius: number = 10
): ImageData {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  const result = new ImageData(width, height);
  const resultData = result.data;

  // 성능 최적화: 샘플링 간격 조정
  const sampleStep = Math.max(1, Math.floor(radius / 3));
  
  // 간단한 박스 블러 알고리즘 (최적화)
  for (let y = 0; y < height; y += sampleStep) {
    for (let x = 0; x < width; x += sampleStep) {
      let r = 0, g = 0, b = 0, a = 0;
      let count = 0;

      for (let dy = -radius; dy <= radius; dy += sampleStep) {
        for (let dx = -radius; dx <= radius; dx += sampleStep) {
          const nx = x + dx;
          const ny = y + dy;

          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const idx = (ny * width + nx) * 4;
            r += data[idx];
            g += data[idx + 1];
            b += data[idx + 2];
            a += data[idx + 3];
            count++;
          }
        }
      }

      // 샘플링된 픽셀과 주변 픽셀에 동일한 값 적용
      for (let dy = 0; dy < sampleStep && y + dy < height; dy++) {
        for (let dx = 0; dx < sampleStep && x + dx < width; dx++) {
          const idx = ((y + dy) * width + (x + dx)) * 4;
          resultData[idx] = r / count;
          resultData[idx + 1] = g / count;
          resultData[idx + 2] = b / count;
          resultData[idx + 3] = a / count;
        }
      }
    }
  }

  return result;
}

/**
 * 이미지의 특정 영역을 추출하고 블러 처리합니다
 */
export async function extractAndBlurImage(
  image: HTMLImageElement,
  sourceX: number,
  sourceY: number,
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
  blurRadius: number = 20
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  // 원본 이미지에서 영역 추출
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) throw new Error('Canvas context not available');

  tempCanvas.width = sourceWidth;
  tempCanvas.height = sourceHeight;
  tempCtx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, sourceWidth, sourceHeight);

  // 블러 처리
  const imageData = tempCtx.getImageData(0, 0, sourceWidth, sourceHeight);
  const blurredData = applyBlur(imageData, blurRadius);
  tempCtx.putImageData(blurredData, 0, 0);

  // 타겟 크기로 리사이즈
  ctx.drawImage(tempCanvas, 0, 0, targetWidth, targetHeight);

  return canvas;
}

