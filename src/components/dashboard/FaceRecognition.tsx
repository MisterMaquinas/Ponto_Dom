
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface FaceRecognitionProps {
  onSuccess: (faceData: any) => void;
  onCancel: () => void;
  userData: any;
}

const FaceRecognition = ({ onSuccess, onCancel, userData }: FaceRecognitionProps) => {
  const [status, setStatus] = useState<'starting' | 'detecting' | 'success' | 'error'>('starting');
  const [countdown, setCountdown] = useState(3);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (status === 'detecting' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (status === 'detecting' && countdown === 0) {
      // Simulate face recognition
      setTimeout(() => {
        setStatus('success');
        setTimeout(() => {
          const punchData = {
            userId: userData.username,
            name: userData.name,
            timestamp: new Date().toISOString(),
            hash: generateHash(),
          };
          onSuccess(punchData);
        }, 1500);
      }, 1000);
    }
  }, [status, countdown, userData, onSuccess]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' },
        audio: false 
      });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      setTimeout(() => {
        setStatus('detecting');
      }, 2000);
    } catch (error) {
      console.error('Error accessing camera:', error);
      setStatus('error');
      toast({
        title: "Erro na câmera",
        description: "Não foi possível acessar a câmera",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const generateHash = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'starting':
        return 'Iniciando câmera...';
      case 'detecting':
        return countdown > 0 ? `Detectando rosto... ${countdown}` : 'Processando...';
      case 'success':
        return 'Reconhecimento realizado com sucesso!';
      case 'error':
        return 'Erro no reconhecimento facial';
      default:
        return '';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'starting':
        return <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />;
      case 'detecting':
        return countdown > 0 ? (
          <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
            {countdown}
          </div>
        ) : <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-8 h-8 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Reconhecimento Facial</h2>
            <Button onClick={onCancel} variant="ghost" size="sm">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="relative bg-black rounded-lg overflow-hidden mb-6" style={{ aspectRatio: '4/3' }}>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            
            {/* Face detection overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={`
                w-64 h-64 border-4 rounded-full transition-all duration-1000 flex items-center justify-center
                ${status === 'detecting' ? 'border-blue-500 animate-pulse' : ''}
                ${status === 'success' ? 'border-green-500' : ''}
                ${status === 'error' ? 'border-red-500' : ''}
                ${status === 'starting' ? 'border-gray-400' : ''}
              `}>
                <div className="text-center">
                  <div className="mb-2">{getStatusIcon()}</div>
                  <div className="text-sm text-white bg-black/50 px-3 py-1 rounded">
                    Posicione seu rosto
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Camera className="w-6 h-6 text-blue-500 mr-2" />
              <span className="text-lg font-medium text-gray-900">
                {getStatusMessage()}
              </span>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                <strong>Funcionário:</strong> {userData.name}
              </p>
              <p className="text-sm text-blue-600 mt-1">
                Mantenha o rosto bem posicionado na área circular
              </p>
            </div>

            {status === 'error' && (
              <Button
                onClick={() => {
                  setStatus('starting');
                  startCamera();
                }}
                className="mt-4 bg-blue-500 hover:bg-blue-600"
              >
                Tentar Novamente
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FaceRecognition;
