
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Check, X, RotateCcw, AlertCircle } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface ModernFaceCaptureProps {
  onCapture: (imageData: string) => void;
  onCancel: () => void;
  title?: string;
}

const ModernFaceCapture = ({ onCapture, onCancel, title = "Captura Facial" }: ModernFaceCaptureProps) => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
      });
      setStream(null);
    }
    setIsCameraActive(false);
    setError(null);
  }, [stream]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const initializeCamera = async () => {
    setIsInitializing(true);
    setError(null);
    
    try {
      // Primeiro, verificar se há câmeras disponíveis
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      if (videoDevices.length === 0) {
        throw new Error('Nenhuma câmera encontrada no dispositivo');
      }

      // Tentar diferentes configurações de câmera
      const constraints = {
        video: {
          facingMode: 'user',
          width: { ideal: 640, min: 320, max: 1280 },
          height: { ideal: 480, min: 240, max: 720 },
          frameRate: { ideal: 30, min: 15 }
        },
        audio: false
      };

      let mediaStream;
      
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err) {
        // Se falhar, tentar configuração mais básica
        const basicConstraints = {
          video: true,
          audio: false
        };
        mediaStream = await navigator.mediaDevices.getUserMedia(basicConstraints);
      }

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsCameraActive(true);
          setIsInitializing(false);
        };
      }
      
      setStream(mediaStream);
    } catch (err: any) {
      console.error('Erro ao inicializar câmera:', err);
      let errorMessage = 'Erro desconhecido ao acessar a câmera';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Permissão de câmera negada. Por favor, permita o acesso à câmera.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'Nenhuma câmera encontrada no dispositivo.';
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Câmera está sendo usada por outro aplicativo.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setIsInitializing(false);
      
      toast({
        title: "Erro na Câmera",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const startCountdown = () => {
    setCountdown(3);
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval);
          capturePhoto();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !isCameraActive) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Configurar canvas com as dimensões do vídeo
    const videoWidth = video.videoWidth || 640;
    const videoHeight = video.videoHeight || 480;
    
    canvas.width = videoWidth;
    canvas.height = videoHeight;

    // Espelhar horizontalmente para parecer natural
    context.scale(-1, 1);
    context.drawImage(video, -videoWidth, 0, videoWidth, videoHeight);
    
    // Converter para base64 com boa qualidade
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
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
    initializeCamera();
  };

  const handleCancel = () => {
    stopCamera();
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg bg-white shadow-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <Button onClick={handleCancel} variant="ghost" size="sm">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Estado inicial */}
          {!isCameraActive && !capturedImage && !isInitializing && !error && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Camera className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Captura Facial
                </h3>
                <p className="text-gray-600 text-sm">
                  Clique no botão abaixo para iniciar a captura
                </p>
              </div>
              <Button onClick={initializeCamera} className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                <Camera className="w-5 h-5 mr-2" />
                Iniciar Câmera
              </Button>
            </div>
          )}

          {/* Loading */}
          {isInitializing && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
              </div>
              <p className="text-gray-600">Inicializando câmera...</p>
            </div>
          )}

          {/* Erro */}
          {error && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-red-900 mb-2">Erro na Câmera</h3>
                <p className="text-red-600 text-sm mb-4">{error}</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={initializeCamera} className="flex-1">
                  Tentar Novamente
                </Button>
                <Button onClick={handleCancel} variant="outline" className="flex-1">
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Câmera ativa */}
          {isCameraActive && !capturedImage && (
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-80 object-cover"
                  playsInline
                  muted
                  style={{ transform: 'scaleX(-1)' }}
                />
                
                {/* Overlay de enquadramento */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-72 border-2 border-white/70 rounded-2xl relative">
                    <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-blue-400 rounded-tl-lg"></div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-blue-400 rounded-tr-lg"></div>
                    <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-blue-400 rounded-bl-lg"></div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-blue-400 rounded-br-lg"></div>
                  </div>
                </div>

                {/* Contador */}
                {countdown && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                      <span className="text-4xl font-bold text-gray-900">{countdown}</span>
                    </div>
                  </div>
                )}

                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
                  Posicione seu rosto no centro
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={startCountdown} className="flex-1 h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                  <Camera className="w-5 h-5 mr-2" />
                  Capturar (3s)
                </Button>
                <Button onClick={handleCancel} variant="outline" className="flex-1 h-12">
                  <X className="w-5 h-5 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Imagem capturada */}
          {capturedImage && (
            <div className="space-y-4">
              <div className="text-center">
                <img
                  src={capturedImage}
                  alt="Foto capturada"
                  className="w-full h-80 object-cover rounded-lg border-2 border-gray-200"
                />
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-medium">Foto capturada com sucesso!</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={confirmCapture} className="flex-1 h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                  <Check className="w-5 h-5 mr-2" />
                  Confirmar
                </Button>
                <Button onClick={retakePhoto} variant="outline" className="flex-1 h-12">
                  <RotateCcw className="w-5 h-5 mr-2" />
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

export default ModernFaceCapture;
