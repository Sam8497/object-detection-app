import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, CameraOff, AlertCircle } from 'lucide-react';
import type { WebcamConstraints } from '../types/index';

interface WebcamFeedProps {
  onVideoReady: (video: HTMLVideoElement) => void;
  isActive: boolean;
  onError: (error: string) => void;
}

export const WebcamFeed: React.FC<WebcamFeedProps> = ({
  onVideoReady,
  isActive,
  onError
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  const constraints: WebcamConstraints = {
    width: 640,
    height: 480,
    facingMode: 'environment'
  };

  const startWebcam = useCallback(async () => {
    if (!videoRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      // Check if we already have a stream
      if (streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        onVideoReady(videoRef.current);
        setIsLoading(false);
        return;
      }

      // Request webcam access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: constraints.width },
          height: { ideal: constraints.height },
          facingMode: constraints.facingMode
        },
        audio: false
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      
      // Wait for video to be ready
      videoRef.current.onloadedmetadata = () => {
        if (videoRef.current) {
          videoRef.current.play();
          onVideoReady(videoRef.current);
          setPermissions('granted');
        }
      };

    } catch (err) {
      console.error('Error accessing webcam:', err);
      let errorMessage = 'Failed to access webcam';
      
      if (err instanceof DOMException) {
        switch (err.name) {
          case 'NotAllowedError':
            errorMessage = 'Camera access denied. Please allow camera permissions and try again.';
            setPermissions('denied');
            break;
          case 'NotFoundError':
            errorMessage = 'No camera found. Please connect a camera and try again.';
            break;
          case 'NotReadableError':
            errorMessage = 'Camera is already in use by another application.';
            break;
          default:
            errorMessage = `Camera error: ${err.message}`;
        }
      }
      
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [onVideoReady, onError, constraints.width, constraints.height, constraints.facingMode]);

  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    if (isActive) {
      startWebcam();
    } else {
      stopWebcam();
    }

    return () => {
      stopWebcam();
    };
  }, [isActive, startWebcam, stopWebcam]);

  const handleRetry = () => {
    setError(null);
    setPermissions('prompt');
    startWebcam();
  };

  if (error || permissions === 'denied') {
    return (
      <div className="relative w-full aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
        <div className="text-center p-6">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Camera Access Required</h3>
          <p className="text-gray-300 mb-4 max-w-md">
            {error || 'Please allow camera access to use object detection'}
          </p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video bg-gray-800 rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center z-10">
          <div className="text-center">
            <Camera className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-pulse" />
            <p className="text-white">Starting camera...</p>
          </div>
        </div>
      )}
      
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        playsInline
        muted
      />
      
      {!isActive && !isLoading && (
        <div className="absolute inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
          <CameraOff className="w-12 h-12 text-gray-400" />
        </div>
      )}
    </div>
  );
};