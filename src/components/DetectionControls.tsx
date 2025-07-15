import React from 'react';
import { Play, Pause, Camera, Image, Settings } from 'lucide-react';
import type { DetectionMode, DetectionSettings } from '../types/index';

interface DetectionControlsProps {
  mode: DetectionMode;
  onModeChange: (mode: DetectionMode) => void;
  isDetecting: boolean;
  onToggleDetection: () => void;
  settings: DetectionSettings;
  onSettingsChange: (settings: DetectionSettings) => void;
  modelLoaded: boolean;
}

export const DetectionControls: React.FC<DetectionControlsProps> = ({
  mode,
  onModeChange,
  isDetecting,
  onToggleDetection,
  settings,
  onSettingsChange,
  modelLoaded
}) => {
  return (
    <div className="space-y-4">
      {/* Mode Selection */}
      <div className="flex gap-2">
        <button
          onClick={() => onModeChange('webcam')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
            mode === 'webcam'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <Camera className="w-4 h-4" />
          Webcam
        </button>
        <button
          onClick={() => onModeChange('image')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
            mode === 'image'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <Image className="w-4 h-4" />
          Image
        </button>
      </div>

      {/* Detection Toggle (only for webcam mode) */}
      {mode === 'webcam' && (
        <button
          onClick={onToggleDetection}
          disabled={!modelLoaded}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors duration-200 ${
            !modelLoaded
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : isDetecting
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isDetecting ? (
            <>
              <Pause className="w-5 h-5" />
              Stop Detection
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Start Detection
            </>
          )}
        </button>
      )}

      {/* Settings */}
      <div className="p-4 bg-gray-800 rounded-lg space-y-4">
        <div className="flex items-center gap-2 text-white font-semibold">
          <Settings className="w-4 h-4" />
          Detection Settings
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Confidence Threshold: {Math.round(settings.threshold * 100)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={settings.threshold}
              onChange={(e) =>
                onSettingsChange({
                  ...settings,
                  threshold: parseFloat(e.target.value)
                })
              }
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Max Detections: {settings.maxDetections}
            </label>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={settings.maxDetections}
              onChange={(e) =>
                onSettingsChange({
                  ...settings,
                  maxDetections: parseInt(e.target.value)
                })
              }
              className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>
      </div>
    </div>
  );
};