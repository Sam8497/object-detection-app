import React from 'react';
import type { Detection } from '../types/index';

interface DetectionOverlayProps {
  detections: Detection[];
  containerWidth: number;
  containerHeight: number;
  videoWidth: number;
  videoHeight: number;
}

export const DetectionOverlay: React.FC<DetectionOverlayProps> = ({
  detections,
  containerWidth,
  containerHeight,
  videoWidth,
  videoHeight
}) => {
  // Calculate scale factors
  const scaleX = containerWidth / videoWidth;
  const scaleY = containerHeight / videoHeight;

  const getConfidenceColor = (score: number): string => {
    if (score >= 0.8) return 'border-green-400 text-green-400';
    if (score >= 0.6) return 'border-yellow-400 text-yellow-400';
    return 'border-red-400 text-red-400';
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {detections.map((detection, index) => {
        const [x, y, width, height] = detection.bbox;
        
        // Scale coordinates to container size
        const scaledX = x * scaleX;
        const scaledY = y * scaleY;
        const scaledWidth = width * scaleX;
        const scaledHeight = height * scaleY;

        const confidenceClass = getConfidenceColor(detection.score);

        return (
          <div
            key={`${detection.class}-${index}-${detection.score}`}
            className={`absolute border-2 ${confidenceClass} bg-black bg-opacity-20 backdrop-blur-sm`}
            style={{
              left: scaledX,
              top: scaledY,
              width: scaledWidth,
              height: scaledHeight,
            }}
          >
            {/* Label */}
            <div className={`absolute -top-8 left-0 px-2 py-1 text-xs font-semibold ${confidenceClass} bg-gray-900 bg-opacity-80 rounded whitespace-nowrap`}>
              {detection.class} ({Math.round(detection.score * 100)}%)
            </div>
            
            {/* Corner indicators */}
            <div className={`absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 ${confidenceClass}`} />
            <div className={`absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 ${confidenceClass}`} />
            <div className={`absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 ${confidenceClass}`} />
            <div className={`absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 ${confidenceClass}`} />
          </div>
        );
      })}
    </div>
  );
};