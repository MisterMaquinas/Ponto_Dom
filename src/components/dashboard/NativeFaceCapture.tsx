
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, X, Smartphone } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { useCapacitor } from '@/hooks/useCapacitor';
import SimpleFaceCapture from './SimpleFaceCapture';

interface NativeFaceCaptureProps {
  onCapture: (imageData: string) => void;
  onCancel: () => void;
  title?: string;
}

const NativeFaceCapture = ({ onCapture, onCancel, title = "Captura Facial" }: NativeFaceCaptureProps) => {
  const [showWebCapture, setShowWebCapture] = useState(false);
  const { isNative, platform } = useCapacitor();

  const handleNativeCapture = async () => {
    if (!isNative) {
      // Fallback para captura web
      setShowWebCapture(true);
      return;
    }

    try {
      // Aqui você pode implementar a captura nativa usando ML Kit
      // Por enquanto, vamos usar a captura web como fallback
      toast({
        title: "Recursos nativos detectados",
        description: `Rodando em ${platform}. Funcionalidade ML Kit será implementada em breve.`,
      });
      
      setShowWebCapture(true);
    } catch (error) {
      console.error('Erro na captura nativa:', error);
      toast({
        title: "Erro",
        description: "Erro na captura nativa. Usando captura web.",
        variant: "destructive",
      });
      setShowWebCapture(true);
    }
  };

  if (showWebCapture) {
    return (
      <SimpleFaceCapture
        onCapture={onCapture}
        onCancel={onCancel}
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
                {isNative ? 'Captura Nativa' : 'Captura Web'}
              </h3>
              <p className="text-gray-600 text-sm">
                {isNative 
                  ? `Usando recursos nativos do ${platform}`
                  : 'Usando câmera do navegador'
                }
              </p>
            </div>

            <Button onClick={handleNativeCapture} className="w-full">
              <Camera className="w-4 h-4 mr-2" />
              Iniciar Captura
            </Button>

            {isNative && (
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-sm text-blue-700">
                  <strong>Recursos nativos disponíveis:</strong>
                </p>
                <ul className="text-sm text-blue-600 mt-1">
                  <li>• Melhor qualidade de imagem</li>
                  <li>• Detecção facial aprimorada</li>
                  <li>• Processamento mais rápido</li>
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NativeFaceCapture;
