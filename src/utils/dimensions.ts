// J카드 치수 (cm 단위)
export const JCARD_DIMENSIONS = {
  width: 10.4, // cm
  height: 10.4, // cm
  panels: {
    front: {
      backCover: { width: 2.3, height: 10.4 },
      spine: { width: 1.5, height: 10.4 },
      frontCover: { width: 6.6, height: 10.4 },
    },
    back: {
      insideMainPanel: { width: 6.6, height: 10.4 },
      insideSpine: { width: 1.5, height: 10.4 },
      insideBackPanel: { width: 2.3, height: 10.4 },
    },
  },
  bleed: 0.5, // cm (5mm)
  dpi: 300, // 출력 해상도
};

// 라벨 스티커 치수 (cm 단위)
export const LABEL_DIMENSIONS = {
  width: 15.5, // 1.5 + 1.3 + 6.4 + 6.3
  height: 10.2, // cm
  panels: {
    flap: { width: 1.5, height: 10.2 },
    spine: { width: 1.3, height: 10.2 },
    mainImage: { width: 6.4, height: 10.2 },
    panel1: { width: 6.3, height: 10.2 },
  },
  dpi: 300, // 출력 해상도
};

// cm를 픽셀로 변환 (300 DPI 기준)
export function cmToPixels(cm: number, dpi: number = 300): number {
  const inches = cm / 2.54;
  return Math.round(inches * dpi);
}

// 픽셀을 cm로 변환
export function pixelsToCm(pixels: number, dpi: number = 300): number {
  const inches = pixels / dpi;
  return inches * 2.54;
}

// 화면 표시용 스케일 팩터 계산
export function getDisplayScale(containerWidth: number, containerHeight: number, designWidth: number, designHeight: number): number {
  const scaleX = containerWidth / designWidth;
  const scaleY = containerHeight / designHeight;
  return Math.min(scaleX, scaleY, 1); // 최대 1:1 크기
}

