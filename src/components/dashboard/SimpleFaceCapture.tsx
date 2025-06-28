
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Check, X, RotateCcw, AlertCircle } from 'lucide-react';
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
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const stopCamera = useCallback(() => {
    console.log('Parando câmera...');
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('Track parado:', track.kind);
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

  const startCamera = async () => {
    console.log('Iniciando câmera simples...');
    setIsLoading(true);
    setError(null);
    
    try {
      // Verificar se getUserMedia está disponível
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('getUserMedia não é suportado neste navegador');
      }

      console.log('Solicitando acesso à câmera...');
      
      // Configurações básicas da câmera
      const constraints = {
        video: {
          facingMode: 'user',
          width: { ideal: 640, min: 320 },
          height: { ideal: 480, min: 240 }
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Câmera obtida com sucesso');

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Aguardar o vídeo estar pronto
        const video = videoRef.current;
        
        const onVideoReady = () => {
          console.log('Vídeo pronto, iniciando reprodução');
          video.play().then(() => {
            console.log('Vídeo reproduzindo');
            setIsCameraActive(true);
            setIsLoading(false);
            setStream(mediaStream);
          }).catch(playError => {
            console.error('Erro ao reproduzir vídeo:', playError);
            setError('Erro ao iniciar visualização da câmera');
            setIsLoading(false);
            // Para o stream se der erro
            mediaStream.getTracks().forEach(track => track.stop());
          });
        };

        // Event listeners para garantir que o vídeo carregue
        video.addEventListener('loadedmetadata', onVideoReady, { once: true });
        video.addEventListener('canplay', onVideoReady, { once: true });
        
        // Timeout de segurança
        setTimeout(() => {
          if (!isCameraActive && isLoading) {
            console.log('Timeout - tentando forçar início');
            if (video.readyState >= 2) {
              onVideoReady();
            }
          }
        }, 2000);
      }
    } catch (error: any) {
      console.error('Erro ao acessar câmera:', error);
      setIsLoading(false);
      
      let errorMessage = 'Não foi possível acessar a câmera';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Permissão de câmera negada. Permita o acesso e tente novamente.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'Nenhuma câmera encontrada.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Câmera em uso por outro aplicativo.';
      }
      
      setError(errorMessage);
      toast({
        title: "Erro na câmera",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    console.log('Capturando foto...');
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    // Espelhar a imagem horizontalmente
    context.scale(-1, 1);
    context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
    stopCamera();
    
    console.log('Foto capturada com sucesso');
  };

  const confirmCapture = () => {
    if (capturedImage) {
      console.log('Confirmando captura');
      onCapture(capturedImage);
    }
  };

  const retakePhoto = () => {
    console.log('Refazendo foto');
    setCapturedImage(null);
    startCamera();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{title}</h2>
            <Button onClick={onCancel} variant="ghost" size="sm">
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Estado inicial */}
          {!isCameraActive && !capturedImage && !isLoading && !error && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-blue-500 rounded-full flex items-center justify-center">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Captura Facial</h3>
                <p className="text-gray-600 text-sm">Clique para iniciar a câmera</p>
              </div>
              <Button onClick={startCamera} className="w-full h-12">
                <Camera className="w-4 h-4 mr-2" />
                Iniciar Câmera
              </Button>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 mx-auto">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              </div>
              <p className="text-gray-600">Inicializando câmera...</p>
              <Button onClick={() => { setIsLoading(false); setError(null); }} variant="outline" className="w-full">
                Cancelar
              </Button>
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
              <div className="space-y-2">
                <Button onClick={startCamera} className="w-full">
                  Tentar Novamente
                </Button>
                <Button onClick={onCancel} variant="outline" className="w-full">
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
                  className="w-full h-64 object-cover"
                  playsInline
                  muted
                  style={{ transform: 'scaleX(-1)' }}
                />
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded text-sm">
                  Posicione seu rosto
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={capturePhoto} className="flex-1 h-12">
                  <Camera className="w-4 h-4 mr-2" />
                  Capturar
                </Button>
                <Button onClick={onCancel} variant="outline" className="flex-1 h-12">
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Imagem capturada */}
          {capturedImage && (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={capturedImage}
                  alt="Foto capturada"
                  className="w-full h-64 object-cover rounded border"
                />
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Capturado
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={confirmCapture} className="flex-1 h-12 bg-green-600 hover:bg-green-700">
                  <Check className="w-4 h-4 mr-2" />
                  Confirmar
                </Button>
                <Button onClick={retakePhoto} variant="outline" className="flex-1 h-12">
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
