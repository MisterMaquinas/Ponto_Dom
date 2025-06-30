
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Camera, Check, X } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import NativeFaceCapture from '../NativeFaceCapture';

interface BiometricCaptureProps {
  formData: { face_data?: string };
  setFormData: (data: any) => void;
}

const BiometricCapture = ({ formData, setFormData }: BiometricCaptureProps) => {
  const [showCapture, setShowCapture] = useState(false);
  const [hasFaceData, setHasFaceData] = useState(!!formData.face_data);

  const handleCapture = (imageData: string, faceData?: any) => {
    console.log('Biometria capturada:', { imageData: imageData.substring(0, 50) + '...', faceData });
    
    // Salvar a imagem nos dados do formulário
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

  const removeBiometric = () => {
    setHasFaceData(false);
    setFormData({ ...formData, face_data: undefined });
    toast({
      title: "Biometria removida",
      description: "A biometria facial foi removida",
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Biometria Facial</h3>
      
      <div className="flex flex-col items-center space-y-4">
        {!hasFaceData && !showCapture && (
          <div className="text-center space-y-4 p-6 border-2 border-dashed border-gray-300 rounded-lg w-full">
            <Camera className="w-12 h-12 text-gray-400 mx-auto" />
            <div>
              <p className="text-gray-600 mb-2">Registre ou atualize a biometria facial</p>
              <p className="text-sm text-gray-500">Esta será a foto de referência para autenticação</p>
            </div>
            <Button
              type="button"
              onClick={() => setShowCapture(true)}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Camera className="w-4 h-4 mr-2" />
              Capturar Biometria
            </Button>
          </div>
        )}

        {hasFaceData && (
          <div className="text-center space-y-4 p-6 bg-green-50 border border-green-200 rounded-lg w-full">
            <div className="flex items-center justify-center space-x-2">
              <Check className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-green-800 font-medium">Biometria registrada!</p>
                <p className="text-green-600 text-sm">Foto de referência disponível</p>
              </div>
            </div>
            {formData.face_data && (
              <div className="mt-4">
                <img 
                  src={formData.face_data} 
                  alt="Biometria registrada" 
                  className="w-32 h-32 object-cover rounded-lg border mx-auto"
                />
              </div>
            )}
            <div className="flex gap-2 justify-center">
              <Button
                type="button"
                onClick={recapture}
                variant="outline"
                size="sm"
              >
                Recapturar
              </Button>
              <Button
                type="button"
                onClick={removeBiometric}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4 mr-1" />
                Remover
              </Button>
            </div>
          </div>
        )}
      </div>

      {showCapture && (
        <NativeFaceCapture
          onCapture={handleCapture}
          onCancel={handleCancel}
          title="Registro de Biometria"
          mode="register"
        />
      )}
    </div>
  );
};

export default BiometricCapture;
