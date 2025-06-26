
import React from 'react';
import { useCapacitor } from '@/hooks/useCapacitor';
import MLKitFaceCapture from './MLKitFaceCapture';

interface NativeFaceCaptureProps {
  onCapture: (imageData: string) => void;
  onCancel: () => void;
  title?: string;
}

const NativeFaceCapture = ({ onCapture, onCancel, title = "Captura Facial" }: NativeFaceCaptureProps) => {
  return (
    <MLKitFaceCapture
      onCapture={onCapture}
      onCancel={onCancel}
      title={title}
    />
  );
};

export default NativeFaceCapture;
