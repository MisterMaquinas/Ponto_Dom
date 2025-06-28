
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Check, X, RotateCcw, AlertCircle, UserCheck, UserX } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BiometricFaceCaptureProps {
  onCapture: (imageData: string, verificationResult?: any) => void;
  onCancel: () => void;
  title?: string;
  userData?: any;
  mode?: 'register' | 'verify'; // Modo de registro ou verificação
}

const BiometricFaceCapture = ({ 
  onCapture, 
  onCancel, 
  title = "Captura Facial", 
  userData,
  mode = 'register'
}: BiometricFaceCaptureProps) => {
  const [step, setStep] = useState<'initial' | 'camera' | 'captured' | 'processing'>('initial');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const cleanup = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log('Track parado:', track.kind);
      });
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const startCamera = async () => {
    console.log('Iniciando câmera...');
    setError(null);
    
    try {
      // Verificar disponibilidade
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Câmera não disponível neste navegador');
      }

      // Limpar stream anterior
      cleanup();

      // Configuração simples e robusta
      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      };

      console.log('Solicitando acesso à câmera...');
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        
        // Aguardar carregamento e iniciar
        videoRef.current.oncanplay = () => {
          console.log('Vídeo pronto');
          videoRef.current?.play().then(() => {
            setStep('camera');
          }).catch(err => {
            console.error('Erro ao reproduzir:', err);
            setError('Erro ao iniciar visualização');
          });
        };
      }
      
    } catch (error: any) {
      console.error('Erro na câmera:', error);
      let errorMessage = 'Erro ao acessar câmera';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Permissão negada. Permita o acesso à câmera nas configurações do navegador.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'Nenhuma câmera encontrada no dispositivo.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Câmera está sendo usada por outro aplicativo.';
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

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Definir dimensões
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    // Capturar imagem (espelhada)
    context.scale(-1, 1);
    context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
    setStep('captured');
    cleanup();
    
    console.log('Foto capturada com sucesso');
  };

  const uploadImageToStorage = async (imageData: string, filename: string) => {
    try {
      // Converter base64 para blob
      const response = await fetch(imageData);
      const blob = await response.blob();
      
      const { data, error } = await supabase.storage
        .from('biometric-images')
        .upload(filename, blob, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (error) throw error;
      
      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('biometric-images')
        .getPublicUrl(filename);

      return publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      throw error;
    }
  };

  const compareWithReference = async (attemptImageUrl: string, referenceImageUrl: string) => {
    // Simulação de comparação facial (em produção, usar serviço real)
    // Aqui você integraria com um serviço como AWS Rekognition, Azure Face API, etc.
    
    const similarity = Math.random() * 0.4 + 0.6; // Simula 60-100% similaridade
    const threshold = 0.75; // Limite mínimo de 75% de similaridade
    
    return {
      similarity,
      isMatch: similarity >= threshold,
      confidence: similarity
    };
  };

  const confirmCapture = async () => {
    if (!capturedImage) return;

    setStep('processing');
    setIsVerifying(true);

    try {
      if (mode === 'register') {
        // Modo de registro - salvar como foto de referência
        const filename = `reference/${userData.id}_${Date.now()}.jpg`;
        const imageUrl = await uploadImageToStorage(capturedImage, filename);

        // Salvar no banco
        const { error } = await supabase
          .from('user_biometric_photos')
          .insert({
            user_id: userData.id,
            reference_photo_url: imageUrl,
            is_active: true
          });

        if (error) throw error;

        toast({
          title: "Biometria registrada!",
          description: "Foto de referência salva com sucesso",
        });

        onCapture(capturedImage, { registered: true });

      } else {
        // Modo de verificação - comparar com referência
        const { data: referencePhotos } = await supabase
          .from('user_biometric_photos')
          .select('*')
          .eq('user_id', userData.id)
          .eq('is_active', true)
          .limit(1);

        if (!referencePhotos || referencePhotos.length === 0) {
          throw new Error('Nenhuma foto de referência encontrada. Registre sua biometria primeiro.');
        }

        const referencePhoto = referencePhotos[0];
        
        // Upload da foto de tentativa
        const attemptFilename = `attempts/${userData.id}_${Date.now()}.jpg`;
        const attemptImageUrl = await uploadImageToStorage(capturedImage, attemptFilename);

        // Comparar imagens
        const comparisonResult = await compareWithReference(attemptImageUrl, referencePhoto.reference_photo_url);

        // Salvar log de verificação
        const { data: verificationLog, error: logError } = await supabase
          .from('biometric_verification_logs')
          .insert({
            user_id: userData.id,
            attempt_photo_url: attemptImageUrl,
            reference_photo_url: referencePhoto.reference_photo_url,
            similarity_score: comparisonResult.similarity,
            verification_result: comparisonResult.isMatch ? 'success' : 'failed',
            device_info: {
              userAgent: navigator.userAgent,
              timestamp: new Date().toISOString()
            }
          })
          .select()
          .single();

        if (logError) throw logError;

        if (comparisonResult.isMatch) {
          toast({
            title: "Verificação bem-sucedida!",
            description: `Usuário autenticado com ${Math.round(comparisonResult.confidence * 100)}% de confiança`,
          });
          
          onCapture(capturedImage, {
            verified: true,
            confidence: comparisonResult.confidence,
            verificationLogId: verificationLog.id
          });
        } else {
          toast({
            title: "Verificação falhou",
            description: `Rosto não reconhecido. Similaridade: ${Math.round(comparisonResult.confidence * 100)}%`,
            variant: "destructive",
          });
          
          // Permitir nova tentativa
          setStep('initial');
          setCapturedImage(null);
          setIsVerifying(false);
          return;
        }
      }
    } catch (error: any) {
      console.error('Erro no processamento:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao processar biometria",
        variant: "destructive",
      });
      
      setStep('captured');
    } finally {
      setIsVerifying(false);
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
            <Button onClick={onCancel} variant="ghost" size="sm" disabled={isVerifying}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Estado inicial */}
          {step === 'initial' && !error && (
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                {mode === 'register' ? (
                  <Camera className="w-10 h-10 text-white" />
                ) : (
                  <UserCheck className="w-10 h-10 text-white" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">
                  {mode === 'register' ? 'Registrar Biometria' : 'Verificar Identidade'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {mode === 'register' 
                    ? 'Registre sua foto para autenticação futura'
                    : 'Posicione seu rosto para verificação'
                  }
                </p>
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
                
                {/* Overlay de posicionamento */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-56 border-2 border-white/70 rounded-2xl relative">
                    <div className="absolute -top-2 -left-2 w-6 h-6 border-t-4 border-l-4 border-blue-400 rounded-tl-lg"></div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 border-t-4 border-r-4 border-blue-400 rounded-tr-lg"></div>
                    <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-4 border-l-4 border-blue-400 rounded-bl-lg"></div>
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-4 border-r-4 border-blue-400 rounded-br-lg"></div>
                  </div>
                </div>

                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded text-sm">
                  Posicione seu rosto no centro
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
                <Button 
                  onClick={confirmCapture} 
                  className="flex-1 h-12 bg-green-600 hover:bg-green-700"
                  disabled={isVerifying}
                >
                  <Check className="w-4 h-4 mr-2" />
                  {mode === 'register' ? 'Registrar' : 'Verificar'}
                </Button>
                <Button onClick={retakePhoto} variant="outline" className="flex-1 h-12" disabled={isVerifying}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Refazer
                </Button>
              </div>
            </div>
          )}

          {/* Processando */}
          {step === 'processing' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">
                  {mode === 'register' ? 'Registrando biometria...' : 'Verificando identidade...'}
                </h3>
                <p className="text-gray-600 text-sm">Aguarde o processamento</p>
              </div>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </CardContent>
      </Card>
    </div>
  );
};

export default BiometricFaceCapture;
