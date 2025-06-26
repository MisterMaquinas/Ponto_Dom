
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, X, Smartphone, Zap } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { useCapacitor } from '@/hooks/useCapacitor';
import SimpleFaceCapture from './SimpleFaceCapture';
import MLKitFaceCapture from './MLKitFaceCapture';

interface NativeFaceCaptureProps {
  onCapture: (imageData: string) => void;
  onCancel: () => void;
  title?: string;
}

const NativeFaceCapture = ({ onCapture, onCancel, title = "Captura Facial" }: NativeFaceCaptureProps) => {
  const [captureMode, setCaptureMode] = useState<'select' | 'mlkit' | 'web'>('select');
  const { isNative, platform } = useCapacitor();

  const handleMLKitCapture = () => {
    setCaptureMode('mlkit');
  };

  const handleWebCapture = () => {
    setCaptureMode('web');
  };

  const handleBackToSelect = () => {
    setCaptureMode('select');
  };

  if (captureMode === 'mlkit') {
    return (
      <MLKitFaceCapture
        onCapture={onCapture}
        onCancel={onCancel}
        title={title}
      />
    );
  }

  if (captureMode === 'web') {
    return (
      <SimpleFaceCapture
        onCapture={onCapture}
        onCancel={handleBackToSelect}
        title={title}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{title}</h2>
            <Button onClick={onCancel} variant="ghost" size="sm">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              {isNative ? (
                <Smartphone className="w-8 h-8 text-white" />
              ) : (
                <Camera className="w-8 h-8 text-white" />
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">
                Escolha o Método de Captura
              </h3>
              <p className="text-gray-600 text-sm">
                {isNative 
                  ? `Executando em ${platform} - recursos nativos disponíveis`
                  : 'Executando no navegador web'
                }
              </p>
            </div>

            <div className="space-y-3">
              <Button onClick={handleMLKitCapture} className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
                <Zap className="w-4 h-4 mr-2" />
                Google ML Kit
              </Button>
              
              <Button onClick={handleWebCapture} variant="outline" className="w-full">
                <Camera className="w-4 h-4 mr-2" />
                Captura Tradicional
              </Button>
            </div>

            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm text-blue-700 mb-2">
                <strong>Google ML Kit oferece:</strong>
              </p>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• Detecção facial em tempo real</li>
                <li>• Análise de qualidade da imagem</li>
                <li>• Detecção de landmarks faciais</li>
                <li>• {isNative ? 'Processamento nativo otimizado' : 'Funciona no navegador'}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NativeFaceCapture;
