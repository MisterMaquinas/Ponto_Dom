
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Check, X, RotateCcw } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface EnhancedFaceCaptureProps {
  onCapture: (imageData: string) => void;
  onCancel: () => void;
  title?: string;
}

const EnhancedFaceCapture = ({ onCapture, onCancel, title = "Captura Facial" }: EnhancedFaceCaptureProps) => {
  const [isActive, setIsActive] = useState(false);
  const [imageData, setImageData] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCapture = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640, min: 480 },
          height: { ideal: 480, min: 360 },
          aspectRatio: { ideal: 1.33 }
        },
        audio: false
      });

      setStream(mediaStream);
      setIsActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      toast({
        title: "Erro",
        description: "Não foi possível acessar a câmera. Verifique as permissões.",
        variant: "destructive",
      });
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Definir dimensões do canvas
    canvas.width = 400;
    canvas.height = 300;

    // Desenhar o vídeo no canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Converter para base64
    const dataURL = canvas.toDataURL('image/jpeg', 0.8);
    setImageData(dataURL);
  };

  const confirmCapture = () => {
    if (imageData) {
      onCapture(imageData);
      stopCapture();
    }
  };

  const retakePhoto = () => {
    setImageData(null);
  };

  const stopCapture = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsActive(false);
    setImageData(null);
  };

  const handleCancel = () => {
    stopCapture();
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">{title}</h2>
            <Button onClick={handleCancel} variant="ghost" size="sm">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {!isActive && !imageData && (
            <div className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                <Camera className="w-12 h-12 text-blue-600" />
              </div>
              <p className="text-gray-600">
                Clique no botão abaixo para iniciar a captura facial
              </p>
              <Button onClick={startCapture} className="w-full">
                <Camera className="w-4 h-4 mr-2" />
                Iniciar Captura
              </Button>
            </div>
          )}

          {isActive && !imageData && (
            <div className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full h-64 bg-black rounded-lg object-cover"
                  playsInline
                  muted
                  style={{ transform: 'scaleX(-1)' }}
                />
                
                {/* Guia de enquadramento */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-56 border-2 border-white rounded-lg opacity-70">
                    <div className="w-full h-full border-2 border-dashed border-white rounded-lg m-1"></div>
                  </div>
                </div>

                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
                  Posicione seu rosto na área indicada
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={capturePhoto} className="flex-1">
                  <Camera className="w-4 h-4 mr-2" />
                  Capturar
                </Button>
                <Button onClick={handleCancel} variant="outline" className="flex-1">
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {imageData && (
            <div className="space-y-4">
              <div className="text-center">
                <img
                  src={imageData}
                  alt="Foto capturada"
                  className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={confirmCapture} className="flex-1 bg-green-600 hover:bg-green-700">
                  <Check className="w-4 h-4 mr-2" />
                  Confirmar
                </Button>
                <Button onClick={retakePhoto} variant="outline" className="flex-1">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Refazer
                </Button>
              </div>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedFaceCapture;
