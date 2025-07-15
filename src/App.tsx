import React, { useState, useRef, useCallback } from 'react';
import { Brain, AlertCircle, Loader } from 'lucide-react';
import { WebcamFeed } from './components/WebcamFeed';
import { DetectionOverlay } from './components/DetectionOverlay';
import { ImageUpload } from './components/ImageUpload';
import { DetectionControls } from './components/DetectionControls';
import { DetectionResults } from './components/DetectionResults';
import { useObjectDetection } from './hooks/useObjectDetection';
import type { DetectionMode, DetectionSettings, AppState } from './types/index';

function App() {
  const [appState, setAppState] = useState<AppState>({
    mode: 'webcam',
    isModelLoading: true,
    isWebcamLoading: false,
    error: null,
    detectionSettings: {
      isActive: false,
      threshold: 0.5,
      maxDetections: 10
    }
  });

  const [containerDimensions, setContainerDimensions] = useState({
    width: 640,
    height: 480
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    model,
    isLoading: isModelLoading,
    error: modelError,
    detections,
    isDetecting,
    startDetection,
    stopDetection,
    detectInImage,
    // setError
  } = useObjectDetection();

  // Update app state when model loading changes
  React.useEffect(() => {
    setAppState(prev => ({
      ...prev,
      isModelLoading,
      error: modelError
    }));
  }, [isModelLoading, modelError]);

  // Handle video ready
  const handleVideoReady = useCallback((video: HTMLVideoElement) => {
    videoRef.current = video;
    
    // Update container dimensions
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setContainerDimensions({
        width: rect.width,
        height: rect.height
      });
    }
  }, []);

  // Handle webcam error
  const handleWebcamError = useCallback((error: string) => {
    setAppState(prev => ({ ...prev, error }));
  }, []);

  // Handle mode change
  const handleModeChange = useCallback((mode: DetectionMode) => {
    // Stop detection when switching modes
    if (isDetecting) {
      stopDetection();
    }
    
    setAppState(prev => ({
      ...prev,
      mode,
      error: null,
      detectionSettings: {
        ...prev.detectionSettings,
        isActive: mode === 'webcam'
      }
    }));
  }, [isDetecting, stopDetection]);

  // Handle detection toggle
  const handleToggleDetection = useCallback(() => {
    if (!videoRef.current || !model) return;

    if (isDetecting) {
      stopDetection();
    } else {
      startDetection(videoRef.current, appState.detectionSettings);
    }
  }, [isDetecting, model, startDetection, stopDetection, appState.detectionSettings]);

  // Handle settings change
  const handleSettingsChange = useCallback((settings: DetectionSettings) => {
    setAppState(prev => ({ ...prev, detectionSettings: settings }));
  }, []);

  // Handle image selection
  const handleImageSelected = useCallback((image: HTMLImageElement) => {
    imageRef.current = image;
    
    // Update container dimensions for image
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setContainerDimensions({
        width: rect.width,
        height: rect.height
      });
    }
    
    // Automatically detect objects in the image
    if (model) {
      detectInImage(image, appState.detectionSettings);
    }
  }, [model, detectInImage, appState.detectionSettings]);

  // Handle image clear
  const handleImageClear = useCallback(() => {
    imageRef.current = null;
    // Clear detections when image is cleared
    if (model) {
      detectInImage(new Image(), appState.detectionSettings);
    }
  }, [model, detectInImage, appState.detectionSettings]);

  // Update container dimensions on resize
  React.useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerDimensions({
          width: rect.width,
          height: rect.height
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold">Object Detection App</h1>
              <p className="text-gray-400 text-sm">Real-time AI-powered object detection</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {appState.isModelLoading && (
          <div className="text-center py-12">
            <Loader className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-semibold mb-2">Loading AI Model</h2>
            <p className="text-gray-400">Please wait while we load the object detection model...</p>
          </div>
        )}

        {/* Error State */}
        {appState.error && (
          <div className="bg-red-900 bg-opacity-20 border border-red-500 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="font-semibold text-red-400">Error</span>
            </div>
            <p className="text-red-300 mt-1">{appState.error}</p>
          </div>
        )}

        {/* App Interface */}
        {!appState.isModelLoading && model && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Video/Image Feed */}
            <div className="lg:col-span-2 space-y-6">
              <div className="relative" ref={containerRef}>
                {appState.mode === 'webcam' ? (
                  <WebcamFeed
                    onVideoReady={handleVideoReady}
                    isActive={appState.detectionSettings.isActive}
                    onError={handleWebcamError}
                  />
                ) : (
                  <ImageUpload
                    onImageSelected={handleImageSelected}
                    onClear={handleImageClear}
                  />
                )}
                
                {/* Detection Overlay */}
                {detections.length > 0 && (
                  <DetectionOverlay
                    detections={detections}
                    containerWidth={containerDimensions.width}
                    containerHeight={containerDimensions.height}
                    videoWidth={videoRef.current?.videoWidth || imageRef.current?.naturalWidth || 640}
                    videoHeight={videoRef.current?.videoHeight || imageRef.current?.naturalHeight || 480}
                  />
                )}
              </div>
            </div>

            {/* Controls and Results */}
            <div className="space-y-6">
              <DetectionControls
                mode={appState.mode}
                onModeChange={handleModeChange}
                isDetecting={isDetecting}
                onToggleDetection={handleToggleDetection}
                settings={appState.detectionSettings}
                onSettingsChange={handleSettingsChange}
                modelLoaded={!!model}
              />
              
              <DetectionResults
                detections={detections}
                isDetecting={isDetecting}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;