export type EditorType = 'jcard' | 'label';

export interface TextElement {
  id: string;
  content: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
  panel: string;
}

export interface ImageElement {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  panel: string;
  originalWidth: number;
  originalHeight: number;
}

export interface ColorScheme {
  background: string;
  text: string;
  accent: string;
}

export interface EditorState {
  type: EditorType;
  texts: TextElement[];
  images: ImageElement[];
  colorScheme: ColorScheme;
  selectedElementId: string | null;
}

export interface AutoLayoutResult {
  texts: TextElement[];
  images: ImageElement[];
  colorScheme: ColorScheme;
}

export interface Template {
  id: string;
  name: string;
  type: EditorType;
  preview: string;
}

// J카드 3단계 에디터 타입 정의
export interface FontSettings {
  family: string;
  size: number;
  weight: 'normal' | 'bold' | '300' | '400' | '500' | '600' | '700';
}

export interface CassetteCoverData {
  image: File | null;
  albumName: string;
  font: FontSettings;
  textColor: string;
  dominantColor?: string; // 이미지에서 추출한 주요 색상
}

export interface SpineData {
  artistName: string;
  albumName: string;
  backgroundColor: string; // Cassette Cover에서 추출한 색상
  font: FontSettings;
  textColor: string; // 배경색 대비를 고려한 텍스트 색상
}

export interface FlapData {
  albumName: string;
  sideA: string[];
  sideB: string[];
}

export interface JCardData {
  cover: CassetteCoverData;
  spine: SpineData;
  flap: FlapData;
}

export type JCardStep = 'cover' | 'spine' | 'flap' | 'preview';

