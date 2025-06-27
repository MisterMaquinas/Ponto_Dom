
import React from 'react';
import DynamicFaceCapture from './DynamicFaceCapture';

interface NativeFaceCaptureProps {
  onCapture: (imageData: string, faceData?: any) => void;
  onCancel: () => void;
  title?: string;
  userData?: any;
}

const NativeFaceCapture = ({ onCapture, onCancel, title = "Captura Facial", userData }: NativeFaceCaptureProps) => {
  const handleCapture = (imageData: string, faceData: any) => {
    onCapture(imageData, faceData);
  };

  return (
    <DynamicFaceCapture
      onCapture={handleCapture}
      onCancel={onCancel}
      title={title}
      userData={userData}
    />
  );
};

export default NativeFaceCapture;
