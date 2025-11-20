import type { JCardData } from '../types/editor';
import { JCARD_DIMENSIONS, cmToPixels } from './dimensions';
import { loadImage } from './imageProcessor';

/**
 * Cassette Cover를 Canvas에 렌더링 (Bleed 포함)
 */
export async function renderCover(
  ctx: CanvasRenderingContext2D,
  data: JCardData['cover'],
  scale: number = 1
): Promise<void> {
  const panelWidth = cmToPixels(JCARD_DIMENSIONS.panels.front.frontCover.width, JCARD_DIMENSIONS.dpi) * scale;
  const panelHeight = cmToPixels(JCARD_DIMENSIONS.panels.front.frontCover.height, JCARD_DIMENSIONS.dpi) * scale;
  const bleed = cmToPixels(JCARD_DIMENSIONS.bleed, JCARD_DIMENSIONS.dpi) * scale;

  // Bleed 포함 전체 크기
  const width = panelWidth + (bleed * 2);
  const height = panelHeight + (bleed * 2);

  // 배경을 검은색으로 설정 (이미지가 없을 경우)
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  // 이미지 렌더링 (cover-fit: 잘리더라도 꽉 차게, bleed까지 확장)
  if (data.image) {
    const imageUrl = URL.createObjectURL(data.image);
    try {
      const img = await loadImage(imageUrl);

      // 이미지 비율 계산 (bleed 포함 전체 영역)
      const imgAspect = img.width / img.height;
      const canvasAspect = width / height;

      let drawWidth = width;
      let drawHeight = height;
      let drawX = 0;
      let drawY = 0;

      if (imgAspect > canvasAspect) {
        // 이미지가 더 넓음 - 높이에 맞춤
        drawHeight = height;
        drawWidth = height * imgAspect;
        drawX = (width - drawWidth) / 2;
      } else {
        // 이미지가 더 높음 - 너비에 맞춤
        drawWidth = width;
        drawHeight = width / imgAspect;
        drawY = (height - drawHeight) / 2;
      }

      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      URL.revokeObjectURL(imageUrl);
    } catch (error) {
      console.error('Failed to load image:', error);
    }
  }

  // 앨범 이름 텍스트 렌더링 (중앙 하단, 패널 경계 내에만)
  if (data.albumName) {
    ctx.save();
    ctx.font = `${data.font.weight} ${data.font.size * scale}px ${data.font.family}`;
    ctx.fillStyle = data.textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';

    // 텍스트 그림자 효과
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;

    // 텍스트는 패널 경계 내에만 배치 (bleed 제외)
    const textX = width / 2; // 중앙
    const textY = height - bleed - (30 * scale); // 하단에서 bleed + padding
    ctx.fillText(data.albumName, textX, textY);
    ctx.restore();
  }
}

/**
 * Spine을 Canvas에 렌더링 (Bleed 포함)
 */
export async function renderSpine(
  ctx: CanvasRenderingContext2D,
  data: JCardData['spine'],
  scale: number = 1
): Promise<void> {
  const panelWidth = cmToPixels(JCARD_DIMENSIONS.panels.front.spine.width, JCARD_DIMENSIONS.dpi) * scale;
  const panelHeight = cmToPixels(JCARD_DIMENSIONS.panels.front.spine.height, JCARD_DIMENSIONS.dpi) * scale;
  const bleed = cmToPixels(JCARD_DIMENSIONS.bleed, JCARD_DIMENSIONS.dpi) * scale;

  // Bleed 포함 전체 크기
  const width = panelWidth + (bleed * 2);
  const height = panelHeight + (bleed * 2);

  // 단색 배경 사용 (Cover에서 추출한 색상)
  ctx.fillStyle = data.backgroundColor;
  ctx.fillRect(0, 0, width, height);

  // 텍스트 렌더링 (세로 방향, 한 줄, 센터 정렬, 패널 경계 내에만)
  if (data.artistName || data.albumName) {
    ctx.save();
    // 패널 중앙 기준으로 회전 (bleed 제외)
    ctx.translate(panelWidth / 2 + bleed, panelHeight / 2 + bleed);
    ctx.rotate(Math.PI / 2);
    ctx.translate(-panelHeight / 2, -panelWidth / 2);

    const fontSize = data.font.size * scale;
    ctx.font = `${data.font.weight} ${fontSize}px ${data.font.family}`;
    ctx.fillStyle = data.textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const text = data.artistName && data.albumName
      ? `${data.artistName} - ${data.albumName}`
      : data.artistName || data.albumName || '';

    ctx.fillText(text, panelHeight / 2, panelWidth / 2);
    ctx.restore();
  }
}

/**
 * Flap을 Canvas에 렌더링 (Bleed 포함)
 */
export function renderFlap(
  ctx: CanvasRenderingContext2D,
  data: JCardData['flap'],
  scale: number = 1
): void {
  const panelWidth = cmToPixels(JCARD_DIMENSIONS.panels.front.backCover.width, JCARD_DIMENSIONS.dpi) * scale;
  const panelHeight = cmToPixels(JCARD_DIMENSIONS.panels.front.backCover.height, JCARD_DIMENSIONS.dpi) * scale;
  const bleed = cmToPixels(JCARD_DIMENSIONS.bleed, JCARD_DIMENSIONS.dpi) * scale;

  // Bleed 포함 전체 크기
  const width = panelWidth + (bleed * 2);
  const height = panelHeight + (bleed * 2);

  // 배경색 (흰색 또는 연한 회색)
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  const padding = 20 * scale;

  // 앨범 이름 (우상단, 가로 방향, 패널 경계 내에만)
  if (data.albumName) {
    ctx.save();
    const fontSize = 14 * scale;
    ctx.font = `700 ${fontSize}px Arial`;
    ctx.fillStyle = '#333333';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    // 패널 경계 내에만 배치
    ctx.fillText(data.albumName, panelWidth + bleed - padding, bleed + padding);
    ctx.restore();
  }

  // 수록곡 리스트는 renderFullJCard에서 처리
  // 개별 Flap 렌더링에서는 sideA/sideB를 사용하지 않음 (레거시 호환)
}

/**
 * Flap 패널을 개별 캔버스에 렌더링 (Bleed 포함, 수록곡 포함)
 */
async function renderFlapPanel(
  data: JCardData['flap'],
  scale: number = 1
): Promise<HTMLCanvasElement> {
  const panelWidth = cmToPixels(JCARD_DIMENSIONS.panels.front.backCover.width, JCARD_DIMENSIONS.dpi) * scale;
  const panelHeight = cmToPixels(JCARD_DIMENSIONS.panels.front.backCover.height, JCARD_DIMENSIONS.dpi) * scale;
  const bleed = cmToPixels(JCARD_DIMENSIONS.bleed, JCARD_DIMENSIONS.dpi) * scale;

  const width = panelWidth + (bleed * 2);
  const height = panelHeight + (bleed * 2);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  // 배경색
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  const contentStartX = bleed;
  const contentStartY = bleed;
  const contentWidth = panelWidth;
  const contentHeight = panelHeight;

  // Flap은 세로 패널이므로, 텍스트를 위에서 아래로 배치 (회전하여 세로로 표시)
  const labelFontSize = 22 * scale;
  const trackFontSize = 20 * scale; // CSS matches 20px
  const albumFontSize = 24 * scale;
  const sectionGap = 30 * scale;
  const itemGap = 12 * scale;

  // First, calculate total content height to center it
  let totalContentHeight = 0;

  // Album name height
  if (data.albumName) {
    ctx.save();
    ctx.font = `700 ${albumFontSize}px Arial`;
    const textWidth = ctx.measureText(data.albumName).width;
    ctx.restore();
    totalContentHeight += textWidth + sectionGap;
  }

  // SIDE A height
  const sideAString = data.sideA && data.sideA.length > 0
    ? data.sideA.map((track) => track.trim()).filter(Boolean).join(' • ')
    : '곡을 추가하세요';
  ctx.save();
  ctx.font = `700 ${labelFontSize}px Arial`;
  const labelAWidth = ctx.measureText('SIDE A').width;
  ctx.font = `${trackFontSize}px Arial`;
  const trackAWidth = ctx.measureText(sideAString).width;
  ctx.restore();
  totalContentHeight += labelAWidth + itemGap + trackAWidth + sectionGap;

  // SIDE B height
  const sideBString = data.sideB && data.sideB.length > 0
    ? data.sideB.map((track) => track.trim()).filter(Boolean).join(' • ')
    : '곡을 추가하세요';
  ctx.save();
  ctx.font = `700 ${labelFontSize}px Arial`;
  const labelBWidth = ctx.measureText('SIDE B').width;
  ctx.font = `${trackFontSize}px Arial`;
  const trackBWidth = ctx.measureText(sideBString).width;
  ctx.restore();
  totalContentHeight += labelBWidth + itemGap + trackBWidth;

  // Center the content vertically
  const startY = contentStartY + (contentHeight - totalContentHeight) / 2;
  let currentY = startY;
  const centerX = contentStartX + contentWidth / 2;

  // 앨범 이름 (상단)
  if (data.albumName) {
    ctx.save();
    ctx.font = `700 ${albumFontSize}px Arial`;
    const textWidth = ctx.measureText(data.albumName).width;

    ctx.translate(centerX, currentY);
    ctx.rotate(Math.PI / 2);
    ctx.textAlign = 'left';     // Start from currentY
    ctx.textBaseline = 'middle'; // Center horizontally in the strip
    ctx.fillStyle = '#333333';
    ctx.fillText(data.albumName, 0, 0);
    ctx.restore();

    currentY += textWidth + sectionGap;
  }

  // SIDE A, SIDE B 렌더링
  const drawSide = (label: string, tracks: string[]) => {
    // SIDE 라벨
    ctx.save();
    ctx.font = `700 ${labelFontSize}px Arial`;
    const labelWidth = ctx.measureText(label).width;

    ctx.translate(centerX, currentY);
    ctx.rotate(Math.PI / 2);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#333333';
    ctx.fillText(label, 0, 0);
    ctx.restore();

    currentY += labelWidth + itemGap;

    // 곡들
    const trackString = tracks && tracks.length > 0
      ? tracks.map((track) => track.trim()).filter(Boolean).join(' • ')
      : '곡을 추가하세요';

    ctx.save();
    ctx.font = `${trackFontSize}px Arial`;
    const trackWidth = ctx.measureText(trackString).width;

    ctx.translate(centerX, currentY);
    ctx.rotate(Math.PI / 2);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#555555';
    ctx.fillText(trackString, 0, 0);
    ctx.restore();

    currentY += trackWidth + sectionGap;
  };

  drawSide('SIDE A', data.sideA || []);
  drawSide('SIDE B', data.sideB || []);

  return canvas;
}

/**
 * 캔버스를 이미지로 변환하여 반환
 */
function canvasToImage(canvas: HTMLCanvasElement): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = canvas.toDataURL('image/png');
  });
}

/**
 * 전체 J카드를 하나의 Canvas에 합성 (Bleed 포함, 패널 간 간격 없이)
 * 각 패널을 개별 캔버스로 렌더링 -> PNG 이미지로 변환 -> 이미지를 합성
 */
export async function renderFullJCard(
  ctx: CanvasRenderingContext2D,
  data: JCardData,
  scale: number = 1
): Promise<void> {
  // 치수 계산
  const dpi = JCARD_DIMENSIONS.dpi;
  const bleedCm = JCARD_DIMENSIONS.bleed;
  const bleedPx = cmToPixels(bleedCm, dpi) * scale;

  const flapBodyW = cmToPixels(JCARD_DIMENSIONS.panels.front.backCover.width, dpi) * scale;
  const spineBodyW = cmToPixels(JCARD_DIMENSIONS.panels.front.spine.width, dpi) * scale;
  const coverBodyW = cmToPixels(JCARD_DIMENSIONS.panels.front.frontCover.width, dpi) * scale;
  const bodyH = cmToPixels(JCARD_DIMENSIONS.panels.front.frontCover.height, dpi) * scale;

  // 전체 캔버스 크기
  const totalW = bleedPx + flapBodyW + spineBodyW + coverBodyW + bleedPx;
  const totalH = bleedPx + bodyH + bleedPx;

  // 전체 배경 초기화
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, totalW, totalH);

  // ==========================================
  // 1. Flap 패널을 개별 캔버스로 렌더링 -> PNG 이미지로 변환
  // ==========================================
  const flapCanvas = await renderFlapPanel(data.flap, scale);
  const flapImage = await canvasToImage(flapCanvas);
  ctx.drawImage(flapImage, 0, 0);

  // ==========================================
  // 2. Spine 패널을 개별 캔버스로 렌더링 -> PNG 이미지로 변환
  // ==========================================
  const spineCanvas = document.createElement('canvas');
  const spinePanelWidth = spineBodyW;
  const spinePanelHeight = bodyH;
  const spineWidth = spinePanelWidth + (bleedPx * 2);
  const spineHeight = spinePanelHeight + (bleedPx * 2);

  spineCanvas.width = spineWidth;
  spineCanvas.height = spineHeight;
  const spineCtx = spineCanvas.getContext('2d');
  if (spineCtx) {
    await renderSpine(spineCtx, data.spine, scale);
  }

  const spineImage = await canvasToImage(spineCanvas);
  const spineStartX = bleedPx + flapBodyW;
  ctx.drawImage(spineImage, spineStartX, 0);

  // ==========================================
  // 3. Cover 패널을 개별 캔버스로 렌더링 -> PNG 이미지로 변환
  // ==========================================
  const coverCanvas = document.createElement('canvas');
  const coverPanelWidth = coverBodyW;
  const coverPanelHeight = bodyH;
  const coverWidth = coverPanelWidth + bleedPx; // 우측만 bleed
  const coverHeight = coverPanelHeight + (bleedPx * 2);

  coverCanvas.width = coverWidth;
  coverCanvas.height = coverHeight;
  const coverCtx = coverCanvas.getContext('2d');
  if (coverCtx) {
    await renderCover(coverCtx, data.cover, scale);
  }

  const coverImage = await canvasToImage(coverCanvas);
  const coverStartX = bleedPx + flapBodyW + spineBodyW;
  ctx.drawImage(coverImage, coverStartX, 0);
}

