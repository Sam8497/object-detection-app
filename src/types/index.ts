export interface Detection {
  bbox: [number, number, number, number]; // [x, y, width, height]
  class: string;
  score: number;
}

export interface DetectionResult {
  detections: Detection[];
  timestamp: number;
}

export interface WebcamConstraints {
  width: number;
  height: number;
  facingMode?: 'user' | 'environment';
}

export interface DetectionSettings {
  isActive: boolean;
  threshold: number;
  maxDetections: number;
}

export type DetectionMode = 'webcam' | 'image';

export interface AppState {
  mode: DetectionMode;
  isModelLoading: boolean;
  isWebcamLoading: boolean;
  error: string | null;
  detectionSettings: DetectionSettings;
}