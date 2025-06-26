
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, X, Zap, CheckCircle } from 'lucide-react';
import { useMLKit } from '@/hooks/useMLKit';
import { useCapacitor } from '@/hooks/useCapacitor';

interface MLKitFaceCaptureProps {
  onCapture: (imageData: string) => void;
  onCancel: () => void;
  title?: string;
}

const MLKitFaceCapture = ({ onCapture, onCancel, title = "ML Kit - Reconhecimento Facial" }: MLKitFaceCaptureProps) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const { isProcessing, faces, captureWithFaceDetection, isNativeMLKit } = useMLKit();
  const { isNative, platform } = useCapacitor();

  const handleCapture = async () => {
    const result = await captureWithFaceDetection();
    
    if (result) {
      setCapturedImage(result.imageBase64);
    }
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

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

          {!capturedImage ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                <Zap className="w-8 h-8 text-white" />
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">
                  Google ML Kit
                </h3>
                <p className="text-gray-600 text-sm mb-1">
                  {isNativeMLKit 
                    ? `Detecção facial nativa ${platform}`
                    : 'Detecção facial web (fallback)'
                  }
                </p>
                {faces.length > 0 && (
                  <p className="text-green-600 text-sm">
                    {faces.length} rosto(s) detectado(s)
                  </p>
                )}
              </div>

              <Button 
                onClick={handleCapture} 
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processando...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4 mr-2" />
                    Capturar com ML Kit
                  </>
                )}
              </Button>

              {isNative && (
                <div className="bg-orange-50 rounded-lg p-3">
                  <p className="text-sm text-orange-700">
                    <strong>Google ML Kit Ativo:</strong>
                  </p>
                  <ul className="text-sm text-orange-600 mt-1">
                    <li>• Detecção facial em tempo real</li>
                    <li>• Análise de landmarks faciais</li>
                    <li>• Alta precisão e velocidade</li>
                    <li>• Processamento local (offline)</li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <img
                  src={`data:image/jpeg;base64,${capturedImage}`}
                  alt="Foto capturada"
                  className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
                />
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-medium">
                    Rosto detectado! Confiança: {faces[0] ? Math.round(faces[0].confidence * 100) : 0}%
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleConfirm} className="flex-1 bg-green-600 hover:bg-green-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirmar
                </Button>
                <Button onClick={handleRetake} variant="outline" className="flex-1">
                  <Camera className="w-4 h-4 mr-2" />
                  Capturar Novamente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MLKitFaceCapture;
