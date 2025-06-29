
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, X } from 'lucide-react';
import { useBiometricCapture } from './face-capture/useBiometricCapture';
import CameraView from './face-capture/CameraView';
import CapturePreview from './face-capture/CapturePreview';
import ErrorView from './face-capture/ErrorView';
import InitialView from './face-capture/InitialView';
import LoadingView from './face-capture/LoadingView';
import ProcessingView from './face-capture/ProcessingView';
import CapturedView from './face-capture/CapturedView';

interface BiometricFaceCaptureProps {
  onCapture: (imageData: string, verificationResult?: any) => void;
  onCancel: () => void;
  title?: string;
  userData?: any;
  mode?: 'register' | 'verify';
}

const BiometricFaceCapture = ({ 
  onCapture, 
  onCancel, 
  title = "Captura Facial", 
  userData,
  mode = 'register'
}: BiometricFaceCaptureProps) => {
  const {
    step,
    capturedImage,
    error,
    isVerifying,
    countdown,
    videoRef,
    canvasRef,
    startCamera,
    capturePhoto,
    processCapture,
    retakePhoto,
    setError,
    cleanup
  } = useBiometricCapture({ mode, userData, onCapture });

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const renderStepContent = () => {
    if (step === 'initial' && !error) {
      return <InitialView mode={mode} onStartCamera={startCamera} />;
    }

    if (error) {
      return (
        <ErrorView 
          error={error} 
          onRetry={() => { setError(null); startCamera(); }} 
          onCancel={onCancel} 
        />
      );
    }

    if (step === 'camera') {
      return (
        <CameraView 
          videoRef={videoRef}
          countdown={countdown}
          onCapture={capturePhoto}
          onCancel={onCancel}
        />
      );
    }

    if (step === 'captured' && capturedImage) {
      return (
        <CapturedView
          capturedImage={capturedImage}
          mode={mode}
          isVerifying={isVerifying}
          onConfirm={processCapture}
          onRetake={retakePhoto}
        />
      );
    }

    if (step === 'processing') {
      return <ProcessingView mode={mode} />;
    }

    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{title}</h2>
            <Button onClick={onCancel} variant="ghost" size="sm" disabled={isVerifying}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {renderStepContent()}

          <canvas ref={canvasRef} className="hidden" />
        </CardContent>
      </Card>
    </div>
  );
};

export default BiometricFaceCapture;
