
import React from 'react';
import BiometricFaceCapture from './BiometricFaceCapture';

interface NativeFaceCaptureProps {
  onCapture: (imageData: string, faceData?: any) => void;
  onCancel: () => void;
  title?: string;
  userData?: any;
  mode?: 'register' | 'verify';
}

const NativeFaceCapture = ({ 
  onCapture, 
  onCancel, 
  title = "Captura Facial", 
  userData,
  mode = 'verify'
}: NativeFaceCaptureProps) => {
  const handleCapture = (imageData: string, verificationResult?: any) => {
    // Processar resultado baseado no modo
    if (mode === 'register') {
      const faceData = {
        registered: true,
        timestamp: new Date().toISOString()
      };
      onCapture(imageData, faceData);
    } else {
      // Modo verify
      const faceData = {
        verified: verificationResult?.verified || false,
        confidence: verificationResult?.confidence || 0,
        verificationLogId: verificationResult?.verificationLogId,
        timestamp: new Date().toISOString()
      };
      onCapture(imageData, faceData);
    }
  };

  return (
    <BiometricFaceCapture
      onCapture={handleCapture}
      onCancel={onCancel}
      title={title}
      userData={userData}
      mode={mode}
    />
  );
};

export default NativeFaceCapture;
