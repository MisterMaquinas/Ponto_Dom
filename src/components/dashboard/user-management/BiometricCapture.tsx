
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Camera, Check, X } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import SimpleFaceCapture from '../SimpleFaceCapture';

interface BiometricCaptureProps {
  formData: { face_data?: string };
  setFormData: (data: any) => void;
}

const BiometricCapture = ({ formData, setFormData }: BiometricCaptureProps) => {
  const [showCapture, setShowCapture] = useState(false);
  const [hasFaceData, setHasFaceData] = useState(!!formData.face_data);

  const handleCapture = (imageData: string) => {
    setFormData({ ...formData, face_data: imageData });
    setHasFaceData(true);
    setShowCapture(false);
    
    toast({
      title: "Sucesso",
      description: "Biometria facial capturada com sucesso",
    });
  };

  const handleCancel = () => {
    setShowCapture(false);
  };

  const recapture = () => {
    setHasFaceData(false);
    setFormData({ ...formData, face_data: undefined });
    setShowCapture(true);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Biometria Facial</h3>
      
      <div className="flex flex-col items-center space-y-4">
        {!hasFaceData && !showCapture && (
          <Button
            type="button"
            onClick={() => setShowCapture(true)}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Camera className="w-4 h-4 mr-2" />
            Capturar Biometria Facial
          </Button>
        )}

        {hasFaceData && (
          <div className="text-center space-y-2">
            <Check className="w-8 h-8 text-green-500 mx-auto" />
            <p className="text-green-600 font-medium">Biometria facial capturada!</p>
            <Button
              type="button"
              onClick={recapture}
              variant="outline"
              size="sm"
            >
              Recapturar
            </Button>
          </div>
        )}
      </div>

      {showCapture && (
        <SimpleFaceCapture
          onCapture={handleCapture}
          onCancel={handleCancel}
          title="Captura de Biometria"
        />
      )}
    </div>
  );
};

export default BiometricCapture;
