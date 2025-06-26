
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, CheckCircle, Camera } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import EnhancedFaceCapture from './EnhancedFaceCapture';

interface FaceRecognitionProps {
  onSuccess: (faceData: any) => void;
  onCancel: () => void;
  userData: any;
}

const FaceRecognition = ({ onSuccess, onCancel, userData }: FaceRecognitionProps) => {
  const [showCapture, setShowCapture] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCapture = async (imageData: string) => {
    setIsProcessing(true);
    setShowCapture(false);

    // Simular processamento de reconhecimento facial
    setTimeout(() => {
      const punchData = {
        userId: userData.username,
        name: userData.name,
        timestamp: new Date().toISOString(),
        hash: generateHash(),
        imageData: imageData
      };
      
      setIsProcessing(false);
      onSuccess(punchData);
      
      toast({
        title: "Reconhecimento realizado!",
        description: "Ponto registrado com sucesso",
      });
    }, 2000);
  };

  const handleCaptureCancel = () => {
    setShowCapture(false);
  };

  const generateHash = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  if (showCapture) {
    return (
      <EnhancedFaceCapture
        onCapture={handleCapture}
        onCancel={handleCaptureCancel}
        title="Reconhecimento Facial"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Reconhecimento Facial</h2>
            <Button onClick={onCancel} variant="ghost" size="sm">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="text-center space-y-6">
            <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <Camera className="w-12 h-12 text-white" />
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Olá, {userData.name}!
              </h3>
              <p className="text-gray-600">
                Clique no botão abaixo para iniciar o reconhecimento facial
              </p>
            </div>

            {isProcessing ? (
              <div className="space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-blue-600 font-medium">Processando reconhecimento...</p>
              </div>
            ) : (
              <Button
                onClick={() => setShowCapture(true)}
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium"
              >
                <Camera className="w-5 h-5 mr-2" />
                Iniciar Reconhecimento
              </Button>
            )}

            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-700 mb-2">
                <strong>Dicas para melhor reconhecimento:</strong>
              </p>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• Mantenha o rosto bem iluminado</li>
                <li>• Posicione o rosto dentro da área indicada</li>
                <li>• Evite movimentos durante a captura</li>
                <li>• Remova óculos escuros se possível</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FaceRecognition;
