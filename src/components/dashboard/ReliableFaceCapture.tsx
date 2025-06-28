
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Check, X, RotateCcw, AlertCircle } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface ReliableFaceCaptureProps {
  onCapture: (imageData: string) => void;
  onCancel: () => void;
  title?: string;
}

const ReliableFaceCapture = ({ onCapture, onCancel, title = "Captura Facial" }: ReliableFaceCaptureProps) => {
  const [step, setStep] = useState<'initial' | 'camera' | 'captured'>('initial');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const cleanup = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    return cleanup;
  }, [stream]);

  const startCamera = async () => {
    console.log('Tentando iniciar câmera...');
    setError(null);
    
    try {
      // Limpar qualquer stream anterior
      cleanup();
      
      // Tentar diferentes configurações até uma funcionar
      const configs = [
        { video: { facingMode: 'user', width: 640, height: 480 } },
        { video: { facingMode: 'user' } },
        { video: true }
      ];
      
      let mediaStream = null;
      
      for (const config of configs) {
        try {
          console.log('Tentando configuração:', config);
          mediaStream = await navigator.mediaDevices.getUserMedia(config);
          console.log('Sucesso com configuração:', config);
          break;
        } catch (err) {
          console.log('Falhou com configuração:', config, err);
          continue;
        }
      }
      
      if (!mediaStream) {
        throw new Error('Não foi possível acessar a câmera com nenhuma configuração');
      }

      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Aguardar o vídeo carregar e começar
        const video = videoRef.current;
        
        const handleVideoReady = () => {
          console.log('Vídeo pronto, mudando para step camera');
          setStep('camera');
        };
        
        // Múltiplos eventos para garantir que funcione
        video.onloadeddata = handleVideoReady;
        video.oncanplay = handleVideoReady;
        
        // Forçar play
        video.play().catch(err => {
          console.error('Erro ao reproduzir vídeo:', err);
        });
        
        // Timeout de segurança
        setTimeout(() => {
          if (step !== 'camera' && mediaStream) {
            console.log('Timeout - forçando mudança para camera');
            setStep('camera');
          }
        }, 1000);
      }
      
    } catch (error: any) {
      console.error('Erro ao iniciar câmera:', error);
      
      let errorMessage = 'Erro ao acessar câmera';
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Permissão negada. Permita o acesso à câmera.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'Câmera não encontrada.';
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
    if (!videoRef.current || !canvasRef.current) {
      console.error('Refs não disponíveis');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) {
      console.error('Context não disponível');
      return;
    }

    // Definir tamanho do canvas
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    // Desenhar imagem espelhada
    context.scale(-1, 1);
    context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
    setStep('captured');
    cleanup();
    
    console.log('Foto capturada');
  };

  const confirmCapture = () => {
    if (capturedImage) {
      onCapture(capturedImage);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setStep('initial');
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
          {step === 'initial' && !error && (
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
                <Button onClick={() => { setError(null); startCamera(); }} className="w-full">
                  Tentar Novamente
                </Button>
                <Button onClick={onCancel} variant="outline" className="w-full">
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Câmera ativa */}
          {step === 'camera' && (
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-64 object-cover"
                  playsInline
                  muted
                  autoPlay
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
          {step === 'captured' && capturedImage && (
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

export default ReliableFaceCapture;
