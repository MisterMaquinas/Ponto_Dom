
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Camera, AlertTriangle } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import NativeFaceCapture from './NativeFaceCapture';

interface FaceRecognitionProps {
  onSuccess: (faceData: any) => void;
  onCancel: () => void;
  userData: any;
}

const FaceRecognition = ({ onSuccess, onCancel, userData }: FaceRecognitionProps) => {
  const [showCapture, setShowCapture] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasReferencePhoto, setHasReferencePhoto] = useState<boolean | null>(null);

  React.useEffect(() => {
    checkReferencePhoto();
  }, [userData.id]);

  const checkReferencePhoto = async () => {
    try {
      const { data, error } = await supabase
        .from('user_biometric_photos')
        .select('id')
        .eq('user_id', userData.id)
        .eq('is_active', true)
        .limit(1);

      if (error) throw error;
      
      setHasReferencePhoto(data && data.length > 0);
    } catch (error) {
      console.error('Erro ao verificar foto de referência:', error);
      setHasReferencePhoto(false);
    }
  };

  const handleCapture = async (imageData: string, faceData: any) => {
    setIsProcessing(true);
    setShowCapture(false);

    try {
      if (!faceData.verified) {
        toast({
          title: "Autenticação negada",
          description: "Usuário não reconhecido. Tente novamente.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      // Registrar ponto no banco de dados
      const punchData = {
        user_id: userData.id,
        punch_type: 'entry',
        confidence_score: faceData.confidence,
        verification_log_id: faceData.verificationLogId,
        device_info: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language
        },
        location: null
      };

      const { data: punchRecord, error } = await supabase
        .from('punch_records')
        .insert(punchData)
        .select()
        .single();

      if (error) throw error;

      const finalPunchData = {
        ...punchRecord,
        name: userData.name,
        timestamp: punchRecord.timestamp,
        hash: punchRecord.id,
        imageData: imageData,
        confidence: faceData.confidence
      };
      
      setIsProcessing(false);
      onSuccess(finalPunchData);
      
      toast({
        title: "Ponto registrado!",
        description: `Reconhecimento realizado com ${Math.round(faceData.confidence * 100)}% de confiança`,
      });
    } catch (error) {
      console.error('Erro ao processar:', error);
      setIsProcessing(false);
      toast({
        title: "Erro",
        description: "Erro ao registrar ponto",
        variant: "destructive",
      });
    }
  };

  const handleCaptureCancel = () => {
    setShowCapture(false);
  };

  if (hasReferencePhoto === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Biometria Necessária</h2>
              <Button onClick={onCancel} variant="ghost" size="sm">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="text-center space-y-6">
              <div className="mx-auto w-24 h-24 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-12 h-12 text-white" />
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Biometria não cadastrada
                </h3>
                <p className="text-gray-600">
                  Para usar o reconhecimento facial, você precisa primeiro registrar sua biometria com um administrador.
                </p>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <p className="text-sm text-orange-700">
                  <strong>Como resolver:</strong>
                </p>
                <ul className="text-sm text-orange-600 mt-2 space-y-1">
                  <li>• Procure um administrador do sistema</li>
                  <li>• Solicite o cadastro da sua biometria</li>
                  <li>• Após o registro, você poderá usar este recurso</li>
                </ul>
              </div>

              <Button onClick={onCancel} className="w-full" variant="outline">
                Voltar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showCapture) {
    return (
      <NativeFaceCapture
        onCapture={handleCapture}
        onCancel={handleCaptureCancel}
        title="Reconhecimento Facial - Registro de Ponto"
        userData={userData}
        mode="verify"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Reconhecimento Facial</h2>
            <Button onClick={onCancel} variant="ghost" size="sm">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="text-center space-y-6">
            <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <Camera className="w-12 h-12 text-white" />
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Olá, {userData.name}!
              </h3>
              <p className="text-gray-600">
                Posicione seu rosto para verificação de identidade e registro de ponto
              </p>
            </div>

            {isProcessing ? (
              <div className="space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-blue-600 font-medium">Processando registro...</p>
              </div>
            ) : (
              <Button
                onClick={() => setShowCapture(true)}
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium"
              >
                <Camera className="w-5 h-5 mr-2" />
                Iniciar Verificação
              </Button>
            )}

            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-700 mb-2">
                <strong>Sistema de verificação biométrica:</strong>
              </p>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• Comparação com foto de referência</li>
                <li>• Autenticação por reconhecimento facial</li>
                <li>• Registro seguro de ponto eletrônico</li>
                <li>• Histórico completo de verificações</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FaceRecognition;
