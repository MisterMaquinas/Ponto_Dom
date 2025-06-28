import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Camera, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DynamicFaceCaptureProps {
  onCapture: (imageData: string, faceData: any) => void;
  onCancel: () => void;
  title?: string;
  userData?: any;
}

const DynamicFaceCapture = ({ onCapture, onCancel, title = "Reconhecimento Facial", userData }: DynamicFaceCaptureProps) => {
  const [isActive, setIsActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [facePosition, setFacePosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [confidence, setConfidence] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraLoading, setCameraLoading] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startCamera = async () => {
    console.log('Tentando iniciar câmera...');
    setCameraError(null);
    setCameraLoading(true);
    setIsActive(false);
    
    // Limpar timeout anterior se existir
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    
    try {
      // Verificar se getUserMedia está disponível
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia não é suportado neste navegador');
      }

      console.log('Solicitando permissão de câmera...');
      
      // Tentar primeiro com configurações básicas
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });
      
      console.log('Câmera inicializada com sucesso');
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Aguardar o vídeo carregar
        const video = videoRef.current;
        
        const handleVideoReady = () => {
          console.log('Vídeo pronto para reprodução');
          video.play().then(() => {
            console.log('Vídeo iniciado com sucesso');
            setIsActive(true);
            setCameraLoading(false);
            startFaceDetection();
            
            // Limpar o timeout de loading
            if (loadingTimeoutRef.current) {
              clearTimeout(loadingTimeoutRef.current);
            }
          }).catch(error => {
            console.error('Erro ao iniciar vídeo:', error);
            setCameraError('Erro ao iniciar visualização da câmera');
            setCameraLoading(false);
          });
        };

        // Múltiplos event listeners para garantir que funcione
        video.addEventListener('loadedmetadata', handleVideoReady);
        video.addEventListener('canplay', handleVideoReady);
        
        // Timeout para forçar início se necessário
        loadingTimeoutRef.current = setTimeout(() => {
          console.log('Timeout - tentando forçar início da câmera');
          if (video.readyState >= 2) { // HAVE_CURRENT_DATA
            handleVideoReady();
          } else {
            setCameraError('Timeout ao carregar câmera. Tente novamente.');
            setCameraLoading(false);
          }
        }, 3000);
        
        // Forçar load do vídeo
        video.load();
      }
    } catch (error: any) {
      console.error('Erro ao acessar câmera:', error);
      setCameraLoading(false);
      let errorMessage = 'Não foi possível acessar a câmera';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Permissão de câmera negada. Por favor, permita o acesso à câmera e tente novamente.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'Nenhuma câmera encontrada no dispositivo.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Câmera está sendo usada por outro aplicativo.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setCameraError(errorMessage);
      toast({
        title: "Erro na câmera",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    console.log('Parando câmera...');
    
    // Limpar timeout de loading
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('Track parado:', track.kind);
      });
      streamRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsActive(false);
    setFaceDetected(false);
    setCameraError(null);
    setCameraLoading(false);
  };

  const startFaceDetection = () => {
    if (intervalRef.current) return;
    
    console.log('Iniciando detecção facial...');
    intervalRef.current = setInterval(() => {
      detectFace();
    }, 200);
  };

  const detectFace = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx || video.videoWidth === 0) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    // Simulação de detecção facial (em produção, usar ML Kit ou API real)
    const mockDetection = simulateFaceDetection(canvas.width, canvas.height);
    
    if (mockDetection.detected) {
      setFaceDetected(true);
      setFacePosition(mockDetection.position);
      setConfidence(mockDetection.confidence);
    } else {
      setFaceDetected(false);
      setConfidence(0);
    }
  };

  const simulateFaceDetection = (width: number, height: number) => {
    // Simulação básica - em produção, integrar com ML Kit
    const centerX = width * 0.5;
    const centerY = height * 0.4;
    const faceWidth = width * 0.3;
    const faceHeight = height * 0.4;
    
    return {
      detected: Math.random() > 0.3, // 70% chance de detectar
      confidence: 0.85 + Math.random() * 0.1,
      position: {
        x: centerX - faceWidth / 2,
        y: centerY - faceHeight / 2,
        width: faceWidth,
        height: faceHeight
      }
    };
  };

  const startCapture = () => {
    if (!faceDetected || confidence < 0.8) {
      toast({
        title: "Posicionamento incorreto",
        description: "Posicione seu rosto dentro do círculo",
        variant: "destructive",
      });
      return;
    }

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

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsProcessing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0);

    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageData);
    stopCamera();

    // Salvar log de reconhecimento
    await saveFaceRecognitionLog(imageData);
    
    const faceData = {
      confidence,
      position: facePosition,
      timestamp: new Date().toISOString()
    };

    setIsProcessing(false);
    onCapture(imageData, faceData);
  };

  const saveFaceRecognitionLog = async (imageData: string) => {
    try {
      if (!userData?.id) return;

      // Upload da imagem para storage
      const fileName = `face_${userData.id}_${Date.now()}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('face-recognition')
        .upload(fileName, dataURLtoBlob(imageData), {
          contentType: 'image/jpeg'
        });

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        return;
      }

      // Salvar log no banco
      const { error: logError } = await supabase
        .from('face_recognition_logs')
        .insert({
          user_id: userData.id,
          confidence_score: confidence,
          face_image_url: uploadData.path,
          recognition_status: confidence >= 0.8 ? 'success' : 'low_confidence',
          device_info: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language
          },
          location: null // Em produção, capturar localização se necessário
        });

      if (logError) {
        console.error('Erro ao salvar log:', logError);
      }
    } catch (error) {
      console.error('Erro ao processar reconhecimento:', error);
    }
  };

  const dataURLtoBlob = (dataURL: string) => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  if (capturedImage) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{title}</h2>
              <Button onClick={onCancel} variant="ghost" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="text-center space-y-4">
              <div className="relative">
                <img 
                  src={capturedImage} 
                  alt="Foto capturada" 
                  className="w-full h-64 object-cover rounded-lg"
                />
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {Math.round(confidence * 100)}%
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={retakePhoto} variant="outline" className="flex-1">
                  Repetir
                </Button>
                <Button onClick={() => onCapture(capturedImage, { confidence })} className="flex-1 bg-green-600 hover:bg-green-700">
                  Confirmar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{title}</h2>
            <Button onClick={onCancel} variant="ghost" size="sm">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {!isActive && !cameraError && !cameraLoading ? (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Camera className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Reconhecimento Facial</h3>
                  <p className="text-gray-600 text-sm">
                    Posicione seu rosto dentro do círculo para captura
                  </p>
                </div>
                <Button onClick={startCamera} className="w-full bg-gradient-to-r from-blue-500 to-purple-600">
                  <Camera className="w-4 h-4 mr-2" />
                  Iniciar Câmera
                </Button>
              </div>
            ) : cameraLoading ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Carregando Câmera</h3>
                  <p className="text-gray-600 text-sm">
                    Iniciando câmera, aguarde...
                  </p>
                </div>
                <Button onClick={stopCamera} variant="outline" className="w-full">
                  Cancelar
                </Button>
              </div>
            ) : cameraError ? (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 mx-auto bg-red-500 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2 text-red-600">Erro na Câmera</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {cameraError}
                  </p>
                </div>
                <div className="space-y-2">
                  <Button onClick={startCamera} className="w-full bg-blue-600 hover:bg-blue-700">
                    <Camera className="w-4 h-4 mr-2" />
                    Tentar Novamente
                  </Button>
                  <Button onClick={onCancel} variant="outline" className="w-full">
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative bg-gray-900 rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-64 object-cover transform scale-x-[-1]"
                  />
                  
                  {/* Círculo de posicionamento */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div 
                      className={`w-48 h-48 rounded-full border-4 transition-colors duration-300 ${
                        faceDetected && confidence > 0.8 
                          ? 'border-green-400 shadow-lg shadow-green-400/50' 
                          : 'border-red-400 shadow-lg shadow-red-400/50'
                      }`}
                    />
                  </div>

                  {/* Indicador de detecção */}
                  <div className="absolute top-2 left-2 flex items-center gap-2">
                    {faceDetected ? (
                      <div className="bg-green-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Detectado ({Math.round(confidence * 100)}%)
                      </div>
                    ) : (
                      <div className="bg-red-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Posicione seu rosto
                      </div>
                    )}
                  </div>

                  {/* Countdown */}
                  {countdown && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-white text-6xl font-bold animate-pulse">
                        {countdown}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button onClick={stopCamera} variant="outline" className="flex-1">
                    Cancelar
                  </Button>
                  <Button 
                    onClick={startCapture} 
                    disabled={!faceDetected || confidence < 0.8 || countdown !== null}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600"
                  >
                    {isProcessing ? 'Processando...' : 'Capturar'}
                  </Button>
                </div>

                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm text-blue-700 text-center">
                    Mantenha seu rosto dentro do círculo até que fique verde
                  </p>
                </div>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />
        </CardContent>
      </Card>
    </div>
  );
};

export default DynamicFaceCapture;
