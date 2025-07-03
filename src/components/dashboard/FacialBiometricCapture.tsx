import React, { useRef, useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, X, RotateCcw, Check, AlertCircle } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface FacialBiometricCaptureProps {
  onCapture: (imageData: string, faceData?: any) => void;
  onCancel: () => void;
  title?: string;
  userData?: any;
  mode?: 'register' | 'verify';
}

const FacialBiometricCapture = ({ 
  onCapture, 
  onCancel, 
  title = "Captura Facial Biométrica", 
  userData,
  mode = 'register'
}: FacialBiometricCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [step, setStep] = useState<'init' | 'camera' | 'captured' | 'processing'>('init');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Inicializar câmera
  const startCamera = async () => {
    try {
      setError(null);
      setStep('camera');
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      
      setStream(mediaStream);
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      setError('Não foi possível acessar a câmera. Verifique as permissões.');
    }
  };

  // Parar câmera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Capturar foto
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Configurar canvas com as dimensões do vídeo
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Desenhar frame atual do vídeo no canvas
    context.drawImage(video, 0, 0);

    // Converter para base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
    setStep('captured');
    stopCamera();
  };

  // Iniciar countdown para captura automática
  const startCountdown = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          clearInterval(interval);
          setTimeout(capturePhoto, 100);
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);
  };

  // Refazer foto
  const retakePhoto = () => {
    setCapturedImage(null);
    setStep('init');
  };

  // Processar captura
  const processCapture = async () => {
    if (!capturedImage) return;

    setStep('processing');

    try {
      if (mode === 'register') {
        // Modo registro: salvar foto de referência
        await saveReferencePhoto(capturedImage);
        onCapture(capturedImage);
      } else {
        // Modo verificação: comparar com foto de referência
        const verificationResult = await verifyFace(capturedImage);
        onCapture(capturedImage, verificationResult);
      }
    } catch (error) {
      console.error('Erro ao processar captura:', error);
      setError('Erro ao processar a imagem. Tente novamente.');
      setStep('captured');
    }
  };

  // Salvar foto de referência
  const saveReferencePhoto = async (imageData: string) => {
    if (!userData?.id) throw new Error('ID do usuário não encontrado');

    // Converter base64 para blob
    const response = await fetch(imageData);
    const blob = await response.blob();

    // Upload para storage
    const fileName = `${userData.id}_reference_${Date.now()}.jpg`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('biometric-photos')
      .upload(fileName, blob);

    if (uploadError) throw uploadError;

    // Desativar fotos antigas
    await supabase
      .from('user_biometric_photos')
      .update({ is_active: false })
      .eq('user_id', userData.id);

    // Salvar nova foto de referência
    const { error: dbError } = await supabase
      .from('user_biometric_photos')
      .insert({
        user_id: userData.id,
        reference_photo_url: uploadData.path,
        is_active: true
      });

    if (dbError) throw dbError;

    toast({
      title: "Biometria registrada!",
      description: "Sua foto de referência foi salva com sucesso.",
    });
  };

  // Verificar face
  const verifyFace = async (imageData: string) => {
    if (!userData?.id) throw new Error('ID do usuário não encontrado');

    // Buscar foto de referência
    const { data: referenceData, error: refError } = await supabase
      .from('user_biometric_photos')
      .select('reference_photo_url')
      .eq('user_id', userData.id)
      .eq('is_active', true)
      .limit(1)
      .single();

    if (refError || !referenceData) {
      throw new Error('Foto de referência não encontrada');
    }

    // Simular verificação facial (em produção, usar serviço de AI)
    const confidence = Math.random() * 0.4 + 0.6; // 60-100%
    const verified = confidence > 0.75;

    // Converter base64 para blob para upload
    const response = await fetch(imageData);
    const blob = await response.blob();

    // Upload da tentativa
    const attemptFileName = `${userData.id}_attempt_${Date.now()}.jpg`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('biometric-photos')
      .upload(attemptFileName, blob);

    if (uploadError) throw uploadError;

    // Log da verificação
    const { data: logData, error: logError } = await supabase
      .from('biometric_verification_logs')
      .insert({
        user_id: userData.id,
        reference_photo_url: referenceData.reference_photo_url,
        attempt_photo_url: uploadData.path,
        verification_result: verified ? 'success' : 'failure',
        similarity_score: confidence,
        device_info: {
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (logError) throw logError;

    return {
      verified,
      confidence,
      verificationLogId: logData.id
    };
  };

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Render inicial
  if (step === 'init') {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">{title}</h2>
              <Button onClick={onCancel} variant="ghost" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="text-center space-y-6">
              <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <Camera className="w-12 h-12 text-white" />
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">
                  {mode === 'register' ? 'Registrar Biometria' : 'Verificação Facial'}
                </h3>
                <p className="text-gray-600">
                  {mode === 'register' 
                    ? 'Vamos capturar sua foto para registro biométrico'
                    : 'Posicione seu rosto para verificação de identidade'
                  }
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                </div>
              )}

              <Button onClick={startCamera} className="w-full" disabled={!!error}>
                <Camera className="w-4 h-4 mr-2" />
                Iniciar Câmera
              </Button>

              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-700 mb-2">
                  <strong>Instruções:</strong>
                </p>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>• Posicione seu rosto no centro da tela</li>
                  <li>• Mantenha boa iluminação</li>
                  <li>• Olhe diretamente para a câmera</li>
                  <li>• Evite movimentos bruscos</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render da câmera
  if (step === 'camera') {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="relative w-full max-w-md">
          <video
            ref={videoRef}
            className="w-full h-auto rounded-lg"
            autoPlay
            playsInline
            muted
          />
          
          {countdown && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl font-bold text-white bg-black/50 rounded-full w-24 h-24 flex items-center justify-center">
                {countdown}
              </div>
            </div>
          )}

          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
            <Button onClick={onCancel} variant="outline" size="sm">
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={capturePhoto} className="bg-blue-600 hover:bg-blue-700">
              <Camera className="w-4 h-4 mr-2" />
              Capturar
            </Button>
            <Button onClick={startCountdown} variant="outline">
              Auto (3s)
            </Button>
          </div>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  // Render da foto capturada
  if (step === 'captured' && capturedImage) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Foto Capturada</h2>
              <Button onClick={onCancel} variant="ghost" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <img 
                  src={capturedImage} 
                  alt="Foto capturada" 
                  className="w-full rounded-lg"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={retakePhoto} variant="outline" className="flex-1">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Refazer
                </Button>
                <Button onClick={processCapture} className="flex-1">
                  <Check className="w-4 h-4 mr-2" />
                  Confirmar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render do processamento
  if (step === 'processing') {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md bg-white">
          <CardContent className="p-6">
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Processando...</h3>
                <p className="text-gray-600">
                  {mode === 'register' 
                    ? 'Salvando sua biometria facial'
                    : 'Verificando sua identidade'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default FacialBiometricCapture;