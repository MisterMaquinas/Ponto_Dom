
import React, { useState, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X } from 'lucide-react';
import { useCamera } from './hooks/useCamera';
import CameraView from './face-capture/CameraView';
import CapturePreview from './face-capture/CapturePreview';
import ErrorView from './face-capture/ErrorView';
import InitialView from './face-capture/InitialView';
import LoadingView from './face-capture/LoadingView';

interface ModernFaceCaptureProps {
  onCapture: (imageData: string) => void;
  onCancel: () => void;
  title?: string;
}

const ModernFaceCapture = ({ onCapture, onCancel, title = "Captura Facial" }: ModernFaceCaptureProps) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { 
    isInitializing, 
    isCameraActive, 
    error, 
    videoRef, 
    stopCamera, 
    initializeCamera 
  } = useCamera();

  const startCountdown = () => {
    setCountdown(3);
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval);
          capturePhoto();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !isCameraActive) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    const videoWidth = video.videoWidth || 640;
    const videoHeight = video.videoHeight || 480;
    
    canvas.width = videoWidth;
    canvas.height = videoHeight;

    context.scale(-1, 1);
    context.drawImage(video, -videoWidth, 0, videoWidth, videoHeight);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageData);
    stopCamera();
  };

  const confirmCapture = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    initializeCamera();
  };

  const handleCancel = () => {
    stopCamera();
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg bg-white shadow-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <Button onClick={handleCancel} variant="ghost" size="sm">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Estado inicial */}
          {!isCameraActive && !capturedImage && !isInitializing && !error && (
            <InitialView 
              mode="register" 
              onStartCamera={initializeCamera} 
            />
          )}

          {/* Loading */}
          {isInitializing && <LoadingView />}

          {/* Erro */}
          {error && (
            <ErrorView 
              error={error} 
              onRetry={initializeCamera} 
              onCancel={handleCancel} 
            />
          )}

          {/* Câmera ativa */}
          {isCameraActive && !capturedImage && (
            <CameraView
              videoRef={videoRef}
              countdown={countdown}
              onCapture={startCountdown}
              onCancel={handleCancel}
            />
          )}

          {/* Imagem capturada */}
          {capturedImage && (
            <CapturePreview
              capturedImage={capturedImage}
              onConfirm={confirmCapture}
              onRetake={retakePhoto}
            />
          )}

          <canvas ref={canvasRef} className="hidden" />
        </CardContent>
      </Card>
    </div>
  );
};

export default ModernFaceCapture;
