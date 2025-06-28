
import React from 'react';
import ReliableFaceCapture from './ReliableFaceCapture';

interface NativeFaceCaptureProps {
  onCapture: (imageData: string, faceData?: any) => void;
  onCancel: () => void;
  title?: string;
  userData?: any;
}

const NativeFaceCapture = ({ onCapture, onCancel, title = "Captura Facial", userData }: NativeFaceCaptureProps) => {
  const handleCapture = (imageData: string) => {
    // Criar dados básicos de detecção facial simulados
    const faceData = {
      confidence: 0.9,
      position: { x: 0, y: 0, width: 100, height: 100 },
      timestamp: new Date().toISOString()
    };
    onCapture(imageData, faceData);
  };

  return (
    <ReliableFaceCapture
      onCapture={handleCapture}
      onCancel={onCancel}
      title={title}
    />
  );
};

export default NativeFaceCapture;
