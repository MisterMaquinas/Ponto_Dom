import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, UserCheck, History, Settings } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import FacialBiometricCapture from './FacialBiometricCapture';

interface BiometricDemoProps {
  userData: any;
  onBack: () => void;
}

const FacialBiometricDemo = ({ userData, onBack }: BiometricDemoProps) => {
  const [showCapture, setShowCapture] = useState(false);
  const [captureMode, setCaptureMode] = useState<'register' | 'verify'>('register');
  const [lastCaptureResult, setLastCaptureResult] = useState<any>(null);

  const handleRegisterBiometric = () => {
    setCaptureMode('register');
    setShowCapture(true);
  };

  const handleVerifyBiometric = () => {
    setCaptureMode('verify');
    setShowCapture(true);
  };

  const handleCaptureSuccess = (imageData: string, verificationResult?: any) => {
    setShowCapture(false);
    
    if (captureMode === 'register') {
      setLastCaptureResult({
        type: 'register',
        imageData,
        timestamp: new Date().toLocaleString()
      });
      toast({
        title: "Biometria registrada!",
        description: "Sua foto de referência foi salva com sucesso.",
      });
    } else {
      setLastCaptureResult({
        type: 'verify',
        imageData,
        verificationResult,
        timestamp: new Date().toLocaleString()
      });
      
      if (verificationResult?.verified) {
        toast({
          title: "Verificação bem-sucedida!",
          description: `Confiança: ${Math.round(verificationResult.confidence * 100)}%`,
        });
      } else {
        toast({
          title: "Verificação falhou",
          description: "Não foi possível confirmar sua identidade.",
          variant: "destructive",
        });
      }
    }
  };

  const handleCaptureCancel = () => {
    setShowCapture(false);
  };

  if (showCapture) {
    return (
      <FacialBiometricCapture
        onCapture={handleCaptureSuccess}
        onCancel={handleCaptureCancel}
        title={captureMode === 'register' ? 'Registrar Biometria' : 'Verificação Facial'}
        userData={userData}
        mode={captureMode}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button onClick={onBack} variant="outline" className="mb-4">
            ← Voltar
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sistema de Biometria Facial
          </h1>
          <p className="text-gray-600">
            Demonstração do sistema de captura e verificação facial
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Card de Registro */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-600" />
                Registrar Biometria
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Capture uma foto de referência para o sistema de reconhecimento facial.
              </p>
              <Button 
                onClick={handleRegisterBiometric}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Camera className="w-4 h-4 mr-2" />
                Iniciar Registro
              </Button>
            </CardContent>
          </Card>

          {/* Card de Verificação */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-green-600" />
                Verificar Identidade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Compare sua face com a foto de referência registrada.
              </p>
              <Button 
                onClick={handleVerifyBiometric}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Iniciar Verificação
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Resultado da última captura */}
        {lastCaptureResult && (
          <Card className="border-0 shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-purple-600" />
                Último Resultado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <img 
                    src={lastCaptureResult.imageData} 
                    alt="Última captura" 
                    className="w-full max-w-sm rounded-lg shadow-md"
                  />
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="font-semibold">Tipo:</span> {' '}
                    <span className={`inline-block px-2 py-1 rounded text-sm ${
                      lastCaptureResult.type === 'register' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {lastCaptureResult.type === 'register' ? 'Registro' : 'Verificação'}
                    </span>
                  </div>
                  
                  <div>
                    <span className="font-semibold">Horário:</span> {lastCaptureResult.timestamp}
                  </div>

                  {lastCaptureResult.verificationResult && (
                    <>
                      <div>
                        <span className="font-semibold">Status:</span> {' '}
                        <span className={`inline-block px-2 py-1 rounded text-sm ${
                          lastCaptureResult.verificationResult.verified
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {lastCaptureResult.verificationResult.verified ? 'Verificado' : 'Falhou'}
                        </span>
                      </div>
                      
                      <div>
                        <span className="font-semibold">Confiança:</span> {' '}
                        {Math.round(lastCaptureResult.verificationResult.confidence * 100)}%
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Informações do sistema */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-600" />
              Informações do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-semibold block">Usuário:</span>
                <span className="text-gray-600">{userData?.name || 'N/A'}</span>
              </div>
              <div>
                <span className="font-semibold block">Empresa:</span>
                <span className="text-gray-600">{userData?.companyName || 'N/A'}</span>
              </div>
              <div>
                <span className="font-semibold block">Câmera:</span>
                <span className="text-gray-600">
                  {navigator.mediaDevices ? 'Disponível' : 'Indisponível'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FacialBiometricDemo;