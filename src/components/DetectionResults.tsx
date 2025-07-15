import React from 'react';
import { Target, TrendingUp, Clock } from 'lucide-react';
import type { Detection } from '../types/index';

interface DetectionResultsProps {
  detections: Detection[];
  isDetecting: boolean;
}

export const DetectionResults: React.FC<DetectionResultsProps> = ({
  detections,
  isDetecting
}) => {
  const uniqueObjects = Array.from(new Set(detections.map(d => d.class)));
  const averageConfidence = detections.length > 0
    ? detections.reduce((sum, d) => sum + d.score, 0) / detections.length
    : 0;

  const getObjectCounts = () => {
    const counts: Record<string, number> = {};
    detections.forEach(detection => {
      counts[detection.class] = (counts[detection.class] || 0) + 1;
    });
    return counts;
  };

  const objectCounts = getObjectCounts();

  return (
    <div className="space-y-4">
      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <Target className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{detections.length}</div>
          <div className="text-sm text-gray-400">Objects</div>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">
            {Math.round(averageConfidence * 100)}%
          </div>
          <div className="text-sm text-gray-400">Avg Confidence</div>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-lg text-center">
          <Clock className="w-6 h-6 text-purple-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{uniqueObjects.length}</div>
          <div className="text-sm text-gray-400">Types</div>
        </div>
      </div>

      {/* Detection Status */}
      <div className="flex items-center gap-2 p-3 bg-gray-800 rounded-lg">
        <div className={`w-3 h-3 rounded-full ${isDetecting ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
        <span className="text-white font-medium">
          {isDetecting ? 'Detecting...' : 'Detection stopped'}
        </span>
      </div>

      {/* Detected Objects List */}
      {detections.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-3">Detected Objects</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {Object.entries(objectCounts)
              .sort(([, a], [, b]) => b - a)
              .map(([className, count]) => {
                const highestConfidence = Math.max(
                  ...detections
                    .filter(d => d.class === className)
                    .map(d => d.score)
                );
                
                return (
                  <div
                    key={className}
                    className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-white capitalize">
                        {className}
                      </div>
                      <div className="text-sm text-gray-400">
                        Best: {Math.round(highestConfidence * 100)}% confidence
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-400">
                        {count}
                      </div>
                      <div className="text-xs text-gray-400">
                        {count === 1 ? 'object' : 'objects'}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};