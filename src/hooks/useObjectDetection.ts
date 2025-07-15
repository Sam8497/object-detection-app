import { useState, useEffect, useRef, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import type { Detection, DetectionResult, DetectionSettings } from '../types/index';

export const useObjectDetection = () => {
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastDetectionTime = useRef<number>(0);

  // Load the model
  useEffect(() => {
    const loadModel = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Ensure TensorFlow.js is ready
        await tf.ready();
        
        // Load the COCO-SSD model
        const loadedModel = await cocoSsd.load({
          base: 'mobilenet_v2'
        });
        
        setModel(loadedModel);
      } catch (err) {
        console.error('Error loading model:', err);
        setError('Failed to load object detection model. Please refresh and try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadModel();
  }, []);

  // Perform detection on a video element or image
  const detectObjects = useCallback(async (
    element: HTMLVideoElement | HTMLImageElement,
    settings: DetectionSettings
  ): Promise<DetectionResult | null> => {
    if (!model || !element) {
      return null;
    }

    try {
      const predictions = await model.detect(element, settings.maxDetections);
      
      const detections: Detection[] = predictions
        .filter(prediction => prediction.score >= settings.threshold)
        .map(prediction => ({
          bbox: prediction.bbox,
          class: prediction.class,
          score: prediction.score
        }));

      return {
        detections,
        timestamp: Date.now()
      };
    } catch (err) {
      console.error('Error during detection:', err);
      setError('Error during object detection');
      return null;
    }
  }, [model]);

  // Start continuous detection for video
  const startDetection = useCallback((
    videoElement: HTMLVideoElement,
    settings: DetectionSettings
  ) => {
    if (!model || isDetecting) return;

    setIsDetecting(true);
    setError(null);

    const detect = async () => {
      const now = Date.now();
      
      // Throttle detection to avoid overwhelming the UI
      if (now - lastDetectionTime.current < 100) return;
      
      const result = await detectObjects(videoElement, settings);
      if (result) {
        setDetections(result.detections);
        lastDetectionTime.current = now;
      }
    };

    // Start detection loop
    detectionIntervalRef.current = setInterval(detect, 100);
  }, [model, isDetecting, detectObjects]);

  // Stop detection
  const stopDetection = useCallback(() => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    setIsDetecting(false);
    setDetections([]);
  }, []);

  // Detect objects in a single image
  const detectInImage = useCallback(async (
    imageElement: HTMLImageElement,
    settings: DetectionSettings
  ) => {
    const result = await detectObjects(imageElement, settings);
    if (result) {
      setDetections(result.detections);
    }
    return result;
  }, [detectObjects]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, []);

  return {
    model,
    isLoading,
    error,
    detections,
    isDetecting,
    startDetection,
    stopDetection,
    detectInImage,
    setError
  };
};