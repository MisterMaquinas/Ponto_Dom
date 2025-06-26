
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Check, X, RotateCcw } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface SimpleFaceCaptureProps {
  onCapture: (imageData: string) => void;
  onCancel: () => void;
  title?: string;
}

const SimpleFaceCapture = ({ onCapture, onCancel, title = "Captura Facial" }: SimpleFaceCaptureProps) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  }, [stream]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const startCamera = async () => {
    setIsLoading(true);
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
        setIsCameraActive(true);
        setStream(mediaStream);
      }
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      toast({
        title: "Erro",
        description: "Não foi possível acessar a câmera",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
    stopCamera();
  };

  const confirmCapture = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
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

          {!isCameraActive && !capturedImage && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-blue-500 rounded-full flex items-center justify-center">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <p className="text-gray-600">Clique para iniciar a câmera</p>
              <Button 
                onClick={startCamera} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Carregando..." : "Iniciar Câmera"}
              </Button>
            </div>
          )}

          {isCameraActive && !capturedImage && (
            <div className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full h-64 object-cover rounded border"
                  playsInline
                  muted
                />
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded text-sm">
                  Posicione seu rosto
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={capturePhoto} className="flex-1">
                  <Camera className="w-4 h-4 mr-2" />
                  Capturar
                </Button>
                <Button onClick={onCancel} variant="outline" className="flex-1">
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {capturedImage && (
            <div className="space-y-4">
              <img
                src={capturedImage}
                alt="Foto capturada"
                className="w-full h-64 object-cover rounded border"
              />
              <div className="flex items-center justify-center text-green-600 mb-2">
                <Check className="w-4 h-4 mr-2" />
                <span>Foto capturada!</span>
              </div>
              <div className="flex gap-2">
                <Button onClick={confirmCapture} className="flex-1">
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

export default SimpleFaceCapture;
