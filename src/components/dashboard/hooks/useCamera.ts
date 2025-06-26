
import { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from "@/hooks/use-toast";

export const useCamera = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);

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
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      if (videoDevices.length === 0) {
        throw new Error('Nenhuma câmera encontrada no dispositivo');
      }

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

  return {
    isInitializing,
    isCameraActive,
    error,
    stream,
    videoRef,
    stopCamera,
    initializeCamera
  };
};
